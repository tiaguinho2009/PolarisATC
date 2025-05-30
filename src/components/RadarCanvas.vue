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

function findFixCoordsByNameInIsDataGroups(fixName, sectorData) {
    if (!sectorData?.navaids?.Fixs) return null;
    for (const group of sectorData.navaids.Fixs) {
        if (!group['is-data']) continue;
        if (!Array.isArray(group.data)) continue;
        const fix = group.data.find(f => f.name === fixName);
        if (fix) {
            return {
                lat: typeof fix.lat === 'string' ? hmsToDecimal(fix.lat) : fix.lat,
                lon: typeof fix.lon === 'string' ? hmsToDecimal(fix.lon) : fix.lon
            };
        }
    }
    return null;
}

function renderPolygons(groups, center, sectorData) {
    if (!Array.isArray(groups)) return;

    // Ordena pelo zindex se existir
    groups = [...groups].sort((a, b) => (a.zindex ?? 0) - (b.zindex ?? 0));

    groups.forEach(group => {
        if (scale < group.minzoom) return;
        if (!Array.isArray(group.data)) return;

        group.data.forEach(area => {
            // --- SUPORTE AO FORMATO MRVA (lines) ---
            if (Array.isArray(area.lines)) {
                area.lines.forEach(line => {
                    if (!Array.isArray(line.points)) return;
                    drawPath(line.points, area, center, sectorData);
                });
                return; // Não processa como polygon normal
            }
            // --- FIM SUPORTE AO FORMATO MRVA ---

            // Polígono normal (cords)
            if (Array.isArray(area.cords)) {
                drawPath(area.cords, area, center, sectorData);
            }
        });
    });

    // Função auxiliar para desenhar paths (cords ou lines)
    function drawPath(points, area, center, sectorData) {
        ctx.beginPath();
        points.forEach((pt, idx) => {
            let lat, lon;
            // Suporte a referência por nome (MRVA e cords)
            if (typeof pt.name === 'string') {
                if (pt.name.startsWith('#')) {
                    // Busca o fix pelo nome (sem o #) em todos os grupos is-data
                    const fixName = pt.name.slice(1);
                    const fixCoords = findFixCoordsByNameInIsDataGroups(fixName, sectorData);
                    if (fixCoords) {
                        lat = fixCoords.lat;
                        lon = fixCoords.lon;
                    } else {
                        return;
                    }
                } else {
                    // Busca o fix pelo nome em todos os grupos is-data
                    const fixCoords = findFixCoordsByNameInIsDataGroups(pt.name, sectorData);
                    if (fixCoords) {
                        lat = fixCoords.lat;
                        lon = fixCoords.lon;
                    } else {
                        return;
                    }
                }
            } else if (pt.lat && pt.lon) {
                lat = hmsToDecimal(pt.lat);
                lon = hmsToDecimal(pt.lon);
            } else {
                return;
            }
            const { x, y } = auroraProjection(
                lat,
                lon,
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
            ctx.globalAlpha = area["fill-opacity"] ?? 1;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.restore();
        }
        // Stroke (duplo para evitar merge de cores)
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = colorScheme.background ? resolveColor(colorScheme.background) : '#000';
        ctx.lineWidth = ((area.width || 1) / scale) + (0.5 / scale);
        ctx.stroke();
        ctx.strokeStyle = resolveColor(area["line-color"]);
        ctx.lineWidth = (area.width || 1) / scale;
        ctx.stroke();
        ctx.restore();
    }
}

function renderFixsLikeGroups(groups, center, sectorData) {
    if (!Array.isArray(groups)) return;

    groups.forEach(group => {
        if (group.visible === false) return;
        if (scale < (group.minzoom ?? 0)) return;
        if (!Array.isArray(group.data)) return;

        group.data.forEach(item => {
            if (item.visible === false) return;
            const name = item.name || item.id || '';
            const lat = typeof item.lat === 'string' ? hmsToDecimal(item.lat) : item.lat;
            const lon = typeof item.lon === 'string' ? hmsToDecimal(item.lon) : item.lon;
            const { x, y } = auroraProjection(
                lat,
                lon,
                hmsToDecimal(center.lat),
                hmsToDecimal(center.lon),
                sectorData["mag-var"],
                sectorData["ratio"].lat,
                sectorData["ratio"].lon
            );

            // Transforma para coordenadas de tela
            const screenX = x * scale + offsetX;
            const screenY = y * scale + offsetY;

            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform para desenhar em pixels
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = resolveColor(group.color?.Fixs_symbol) || '#FFF';
            ctx.strokeStyle = resolveColor(group.color?.Fixs_symbol) || '#FFF';

            // Símbolos diferentes para cada tipo
            if (group.symbol === 'circle') {
                ctx.beginPath();
                ctx.arc(screenX, screenY, 4, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            } else if (group.symbol === 'square') {
                ctx.beginPath();
                ctx.rect(screenX - 4, screenY - 4, 8, 8);
                ctx.fill();
                ctx.stroke();
            } else if (group.symbol === 'pentagon') {
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = ((Math.PI * 2) / 5) * i - Math.PI / 2;
                    const px = screenX + 5 * Math.cos(angle);
                    const py = screenY + 5 * Math.sin(angle);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (group.symbol === 'triangle') {
                ctx.beginPath();
                ctx.moveTo(screenX, screenY - 5);
                ctx.lineTo(screenX - 4.33, screenY + 2.5);
                ctx.lineTo(screenX + 4.33, screenY + 2.5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (group.symbol === 'cross') {
                ctx.beginPath();
                ctx.moveTo(screenX - 4, screenY);
                ctx.lineTo(screenX + 4, screenY);
                ctx.moveTo(screenX, screenY - 4);
                ctx.lineTo(screenX, screenY + 4);
                ctx.stroke();
            }
            // Outros símbolos podem ser adicionados aqui

            // Label principal
            if (group["visible-labels"] && name) {
                ctx.font = '11px Segoe UI Semibold';
                ctx.textBaseline = 'middle';
                ctx.lineWidth = 1;
                ctx.fillStyle = resolveColor(group.color?.Fixs_labels_font) || '#FFF';
                ctx.fillText(name, screenX + 8, screenY);
            }
            // Label de frequência (se existir e ativado)
            if (group["visible-labels-frequency"] && item.frequency) {
                ctx.font = '10px Segoe UI';
                ctx.textBaseline = 'top';
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#000';
                ctx.strokeText(item.frequency, screenX + 8, screenY + 8);
                ctx.fillStyle = resolveColor(group.color?.Fixs_labels_font) || '#FFF';
                ctx.fillText(item.frequency, screenX + 8, screenY + 8);
            }
            ctx.restore();
        });
    });
}

function renderAirways(groups, center, sectorData) {
    if (!Array.isArray(groups)) return;

    groups.forEach(group => {
        if (group.visible === false) return;
        if (scale < (group.minzoom ?? 0)) return;
        if (!Array.isArray(group.data)) return;

        group.data.forEach(airway => {
            if (!Array.isArray(airway.cords) || airway.cords.length < 2) return;

            ctx.save();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';

            // Aplica transform para obedecer ao scale e offset
            ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);

            // Linha
            ctx.beginPath();
            airway.cords.forEach((pt, idx) => {
                const lat = typeof pt.lat === 'string' ? hmsToDecimal(pt.lat) : pt.lat;
                const lon = typeof pt.lon === 'string' ? hmsToDecimal(pt.lon) : pt.lon;
                const { x, y } = auroraProjection(
                    lat,
                    lon,
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

            // Estilo da linha
            ctx.strokeStyle = resolveColor(group.color?.Line_color) || '#0ff';
            ctx.lineWidth = (Number(resolveColor(group.color?.Line_width)) || 2) / scale;
            const dash = resolveColor(group.color?.Line_dasharray);
            if (dash && typeof dash === 'string') {
                ctx.setLineDash(dash.split(',').map(Number));
            } else {
                ctx.setLineDash([]);
            }
            ctx.stroke();

            // Label (nome da airway)
            if (group["visible-labels"] && airway.name && airway.cords.length > 0) {
                const midIdx = Math.floor(airway.cords.length / 2);
                const midPt = airway.cords[midIdx];
                const lat = typeof midPt.lat === 'string' ? hmsToDecimal(midPt.lat) : midPt.lat;
                const lon = typeof midPt.lon === 'string' ? hmsToDecimal(midPt.lon) : midPt.lon;
                const { x, y } = auroraProjection(
                    lat,
                    lon,
                    hmsToDecimal(center.lat),
                    hmsToDecimal(center.lon),
                    sectorData["mag-var"],
                    sectorData["ratio"].lat,
                    sectorData["ratio"].lon
                );
                ctx.save();
                // Tamanho da fonte fixo em px na tela, igual aos fixs
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.font = '11px Segoe UI Semibold';
                ctx.textBaseline = 'middle';
                ctx.lineWidth = 1;
                ctx.fillStyle = resolveColor(group.color?.Label_color) || '#fff';
                // Calcula coordenada de tela
                const screenX = x * scale + offsetX;
                const screenY = y * scale + offsetY;
                ctx.fillText(airway.name, screenX + 5, screenY);
                ctx.restore();
            }

            ctx.restore();
        });
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

    if (sectorFile && sectorFile.data && sectorFile.data.navaids) {
    const center = sectorFile.data["center-cords"];
    if (sectorFile.data.navaids.Fixs)
        renderFixsLikeGroups(sectorFile.data.navaids.Fixs, center, sectorFile.data);
    if (sectorFile.data.navaids.VOR)
        renderFixsLikeGroups(sectorFile.data.navaids.VOR, center, sectorFile.data);
    if (sectorFile.data.navaids.NDB)
        renderFixsLikeGroups(sectorFile.data.navaids.NDB, center, sectorFile.data);
    }
    if (sectorFile && sectorFile.data && sectorFile.data.navaids && sectorFile.data.navaids.Airways) {
        const center = sectorFile.data["center-cords"];
        renderAirways(sectorFile.data.navaids.Airways, center, sectorFile.data);
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
    radar.value.style.cursor = 'grabbing'
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
    radar.value.style.cursor = 'grab'
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
    let newScale = scale * zoom

    newScale = Math.max(0.5, Math.min(16000, newScale))

    // Ajusta precisão conforme faixa
    if (newScale < 10) {
        newScale = Math.round(newScale * 100) / 100 // 2 casas decimais
    } else {
        newScale = Math.round(newScale) // inteiro
    }

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
        sectorFile = await loadSectorFile('/SectorFiles/LPPO/', 'main.json')
        if (sectorFile) {
            colorScheme = sectorFile.data['colorscheme']

            if (colorScheme['background']) {
                canvas.style.background = resolveColor(colorScheme['background'])
            }

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