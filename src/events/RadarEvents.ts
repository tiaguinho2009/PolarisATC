export type RadarEventMap = {
  beforeDraw: { ctx: CanvasRenderingContext2D, sectorFile: any, colorScheme: any, scale: number, offsetX: number, offsetY: number }
  afterDraw: { ctx: CanvasRenderingContext2D, sectorFile: any, colorScheme: any, scale: number, offsetX: number, offsetY: number }
  beforeRenderAirspaces: { ctx: CanvasRenderingContext2D, center: any, sectorFile: any }
  afterRenderAirspaces: { ctx: CanvasRenderingContext2D, center: any, sectorFile: any }
  mouseDown: { x: number, y: number }
  mouseMove: { offsetX: number, offsetY: number }
  mouseUp: void
  zoom: { scale: number, offsetX: number, offsetY: number }
  redraw: void
  setZoom: { newScale: number }
  setOffset: { x: number, y: number }
  sectorChanged: any
}