export interface Position {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

export class WindowModel {
	public readonly id: number;
	public title: string;
	public position: Position;
	public size: Size;
	public collapsed: boolean;
	public zIndex: number;

	constructor(params: { id: number; title: string; width: number; height: number; x?: number; y?: number; zIndex?: number }) {
		this.id = params.id;
		this.title = params.title;
		this.position = {
			x: params.x ?? 50,
			y: params.y ?? 50,
		};
		this.size = {
			width: params.width,
			height: params.height,
		};
		this.collapsed = false;
		this.zIndex = params.zIndex ?? 1;
	}
}
