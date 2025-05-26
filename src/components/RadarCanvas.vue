<template>
<canvas ref="radar" class="radar-canvas"></canvas>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'

const radar = ref(null)

let sectorFile

let needsRedraw = false
let drawing = false

let ctx
let dragging = false
let lastX = 0
let lastY = 0
let offsetX = 0
let offsetY = 0
let scale = 1

function hmsToDecimal(coord) {
    if (typeof coord === 'number') return coord

    let match = coord.match(/^([NSWE])(\d{3})\.(\d{2})\.(\d{2})(?:\.(\d{2,3}))?(?:\.(\d{3}))?$/)
    if (!match) return NaN
    const [, dir, deg, min, sec, dec, mil] = match
    let decimal = Number(deg) + Number(min) / 60 + Number(sec) / 3600 +
        (dec ? Number(dec) / 360000 : 0) +
        (mil ? Number(mil) / 3600000 : 0)

    if (dir === 'S' || dir === 'W') decimal *= -1
    return decimal
}

// Recebe lat/lon em graus, centro em graus, devolve x/y em NM (ou px se multiplicares por escala)
function auroraProjection(
    lat,
    lon,
    centerLat,
    centerLon,
    magVar = 0,
    verticalRatio = 1,
    horizontalRatio = 1
) {
    const toRad = deg => deg * Math.PI / 180
    // 1 NM ≈ 1/60 grau latitude
    const nmPerDeg = 60

    // Diferença em graus
    const dLat = lat - centerLat
    const dLon = lon - centerLon

    // Corrige longitude pelo cosseno da latitude central
    const x = dLon * Math.cos(toRad(centerLat)) * nmPerDeg * horizontalRatio
    const y = -dLat * nmPerDeg * verticalRatio // y invertido para canvas

    // Aplica rotação pela variação magnética (magVar em graus)
    if (magVar && magVar !== 0) {
        const theta = toRad(magVar)
        const xRot = x * Math.cos(theta) - y * Math.sin(theta)
        const yRot = x * Math.sin(theta) + y * Math.cos(theta)
        return { x: xRot, y: yRot }
    }

    return { x, y }
}

async function loadSectorFile(basePath, file) {
    const url = `${basePath}${file}`.replace(/\\/g, '/')
    try {
        const res = await fetch(url)
        if (!res.ok) {
        // Só faz log se não for 404 (ficheiro não encontrado)
        if (res.status !== 404) {
            console.warn(`Não foi possível carregar ${url}: HTTP ${res.status}`)
        }
        return null
        }
        try {
        const data = await res.json()
        // Função recursiva para resolver referências
        async function resolveRefs(obj, currentPath) {
            if (Array.isArray(obj)) {
            return Promise.all(obj.map(item => resolveRefs(item, currentPath)))
            } else if (obj && typeof obj === 'object') {
            const entries = await Promise.all(
                Object.entries(obj).map(async ([key, value]) => {
                if (typeof value === 'string' && value.endsWith('.json')) {
                    const nextPath = value.startsWith('data/') ? value : `${currentPath}${value}`
                    try {
                    const loaded = await loadSectorFile(basePath, nextPath)
                    return [key, loaded]
                    } catch {
                    return [key, null]
                    }
                } else {
                    return [key, await resolveRefs(value, currentPath)]
                }
                })
            )
            return Object.fromEntries(entries)
            } else {
            return obj
            }
        }
        return resolveRefs(data, basePath)
        } catch {
        // Erro ao fazer parsing do JSON (provavelmente HTML 404)
        return null
        }
    } catch (e) {
        // Erro de rede ou fetch
        return null
    }
}

function draw() {
    ctx.save()
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY)
    ctx.clearRect(
        (-offsetX) / scale,
        (-offsetY) / scale,
        ctx.canvas.width / scale,
        ctx.canvas.height / scale
    )

    // Renderiza airspaces se sectorFile estiver carregado
    if (sectorFile && sectorFile.data && sectorFile.data.airspaces) {
        const center = sectorFile.data["center-cords"]
        const airspaces = sectorFile.data.airspaces
        airspaces.forEach(airspaceGroup => {
            // airspaceGroup.data é agora um array de áreas
            if (Array.isArray(airspaceGroup.data)) {
                airspaceGroup.data.forEach(area => {
                    if (area.cords && Array.isArray(area.cords)) {
                        ctx.beginPath()
                        area.cords.forEach((cord, idx) => {
                            const { x, y } = auroraProjection(
                                hmsToDecimal(cord.lat),
                                hmsToDecimal(cord.lon),
                                hmsToDecimal(center.lat),
                                hmsToDecimal(center.lon),
                                sectorFile.data["mag-var"],
                                sectorFile.data["ratio"].lat,
                                sectorFile.data["ratio"].lon
                            )
                            if (idx === 0) {
                                ctx.moveTo(x, y)
                            } else {
                                ctx.lineTo(x, y)
                            }
                        })
                        // Suporta cor e largura por área
                        ctx.strokeStyle = area["line-color"] || "#00f"
                        ctx.lineWidth = area.width || 1
                        ctx.stroke()
                        // Se quiseres preencher a área:
                        if (area["fill-color"]) {
                            ctx.fillStyle = area["fill-color"]
                            ctx.globalAlpha = 0.2
                            ctx.fill()
                            ctx.globalAlpha = 1
                        }
                    }
                })
            }
        })
    }

    ctx.restore()
    if (needsRedraw) {
        needsRedraw = false
        scheduleDraw()
    }
}

function scheduleDraw() {
    if (!drawing) {
        drawing = true
        requestAnimationFrame(() => {
            draw()
            drawing = false
            needsRedraw = false
        })
    } else {
        needsRedraw = true
    }
}

function resizeCanvas() {
    const canvas = radar.value
    canvas.width = canvas.parentElement.clientWidth
    canvas.height = canvas.parentElement.clientHeight
    scheduleDraw()
}

function onMouseDown(e) {
    dragging = true
    lastX = e.clientX
    lastY = e.clientY
}

function onMouseMove(e) {
    if (!dragging) return
    offsetX += e.clientX - lastX
    offsetY += e.clientY - lastY
    lastX = e.clientX
    lastY = e.clientY
    scheduleDraw()
}

function onMouseUp() {
    dragging = false
}

function onWheel(e) {
    e.preventDefault()
    const canvas = radar.value
    // Posição do mouse relativa ao canvas
    const rect = canvas.getBoundingClientRect()
    const mouseX = (e.clientX - rect.left - offsetX) / scale
    const mouseY = (e.clientY - rect.top - offsetY) / scale

    // Zoom in/out
    const zoom = e.deltaY < 0 ? 1.1 : 0.9
    scale *= zoom

    // Ajusta o offset para manter o ponto sob o mouse fixo
    offsetX -= (mouseX * zoom - mouseX) * scale
    offsetY -= (mouseY * zoom - mouseY) * scale

    scheduleDraw()
}

onMounted(async () => {
    const canvas = radar.value
    ctx = canvas.getContext('2d')
    resizeCanvas()

    window.addEventListener('resize', resizeCanvas)
    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })

    try {
        sectorFile = await loadSectorFile('/SectorFiles/LPPC/', 'main.json')
        resizeCanvas()
        console.log(sectorFile)
    } catch (e) {
        console.error('Erro ao carregar sector LPPC:', e)
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeCanvas)
    if (radar.value) {
        radar.value.removeEventListener('mousedown', onMouseDown)
        radar.value.removeEventListener('wheel', onWheel)
    }
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
})
</script>

<style scoped>
.radar-canvas {
    display: block;
    width: 100%;
    height: 100%;
    background: var(--color-background);
    cursor: grab;
    user-select: none;
}
</style>