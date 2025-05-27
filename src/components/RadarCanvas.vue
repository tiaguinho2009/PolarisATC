<template>
<canvas ref="radar" class="radar-canvas" :style="{ background: colorScheme.background || 'var(--color-background)' }"></canvas>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'

const radar = ref(null)

let sectorFile
let colorScheme = {}

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
    if (typeof coord === 'number') return coord;

    const match = coord.match(/^([NSWE])(\d{2,3})\.(\d{2})\.(\d{2})(?:\.(\d{3}))?$/);
    if (!match) return NaN;

    const [, dir, deg, min, sec, milli = "0"] = match;

    let decimal = Number(deg) + Number(min) / 60 + (Number(sec) + Number(milli) / 1000) / 3600;

    if (dir === 'S' || dir === 'W') decimal *= -1;
    return decimal;
}

// Recebe lat/lon em graus, centro em graus, devolve x/y em NM (ou px se multiplicares por escala)
function auroraProjection(
    lat,
    lon,
    centerLat = 0,
    centerLon = 0,
    magVar = 0,
    verticalRatio = 1,
    horizontalRatio = 1
) {
    const toRad = deg => deg * Math.PI / 180
    const nmPerDegLat = 60
    const nmPerDegLon = 60 * Math.cos(toRad(centerLat))

    const dLat = lat - centerLat
    const dLon = lon - centerLon

    // Corrige longitude pelo cosseno da latitude central
    const x = dLon * nmPerDegLon * horizontalRatio
    const y = -dLat * nmPerDegLat * verticalRatio // y invertido para canvas

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

function resolveColor(val) {
    if (typeof val === 'string' && val.startsWith('@')) {
        const key = val.slice(1)
        return colorScheme[key] || val
    }
    return val
}

function renderPolygons(groups, center, sectorData) {
    if (!Array.isArray(groups)) return;

    // Ordena pelo zindex se existir
    groups = [...groups].sort((a, b) => (a.zindex ?? 0) - (b.zindex ?? 0));

    groups.forEach(group => {
        if (scale < group.minzoom) return;
        if (Array.isArray(group.data)) {
            group.data.forEach(area => {
                if (area.cords && Array.isArray(area.cords)) {
                    ctx.beginPath();
                    area.cords.forEach((cord, idx) => {
                        const { x, y } = auroraProjection(
                            hmsToDecimal(cord.lat),
                            hmsToDecimal(cord.lon),
                            hmsToDecimal(center.lat),
                            hmsToDecimal(center.lon),
                            sectorData["mag-var"],
                            sectorData["ratio"].lat,
                            sectorData["ratio"].lon
                        );
                        if (idx === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    });
                    // Fill
                    if (area["fill-color"]) {
                        ctx.save();
                        ctx.fillStyle = resolveColor(area["fill-color"]);
                        ctx.globalAlpha = area["fill-opacity"];
                        ctx.fill();
                        ctx.globalAlpha = 1;
                        ctx.restore();
                    }
                    // Stroke
                    ctx.save();
                    ctx.strokeStyle = resolveColor(area["line-color"]);
                    ctx.lineWidth = (area.width || 1) / scale;
                    ctx.stroke();
                    ctx.restore();
                }
            });
        }
    });
}

function draw() {
    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    ctx.clearRect(
        (-offsetX) / scale,
        (-offsetY) / scale,
        ctx.canvas.width / scale,
        ctx.canvas.height / scale
    );

    // Renderiza airspaces
    if (sectorFile && sectorFile.data && sectorFile.data.airspaces) {
        const center = sectorFile.data["center-cords"];
        renderPolygons(sectorFile.data.airspaces, center, sectorFile.data);
    }

    // Renderiza ground dos airports (se existir)
    if (sectorFile && sectorFile.data && sectorFile.data.airports) {
        const center = sectorFile.data["center-cords"];
        sectorFile.data.airports.forEach(airport => {
            if (airport.ground) {
                renderPolygons(airport.ground, center, sectorFile.data);
            }
        });
    }

    ctx.restore();
    if (needsRedraw) {
        needsRedraw = false;
        scheduleDraw();
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
    const rect = canvas.getBoundingClientRect()
    // Posição do mouse relativa ao canvas (em pixels)
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Posição do mouse no sistema de coordenadas do canvas antes do zoom
    const wx = (mouseX - offsetX) / scale
    const wy = (mouseY - offsetY) / scale

    // Zoom in/out
    const zoom = e.deltaY < 0 ? 1.1 : 0.9
    const newScale = scale * zoom

    // Atualiza o offset para manter o ponto sob o mouse fixo
    offsetX = mouseX - wx * newScale
    offsetY = mouseY - wy * newScale
    scale = newScale

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
        if (sectorFile) {
            colorScheme = sectorFile.data['colorscheme']

            // Centraliza o canvas no center-cords
            const center = sectorFile.data["center-cords"]
            if (center) {
                const { x, y } = auroraProjection(
                    hmsToDecimal(center.lat),
                    hmsToDecimal(center.lon),
                    hmsToDecimal(center.lat),
                    hmsToDecimal(center.lon)
                )
                offsetX = canvas.width / 2 - x * scale
                offsetY = canvas.height / 2 - y * scale
            }
        }
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