export type IColor = {
    darken(coefficient: number): void;
    lighten(coefficient: number): void;
    toString(): string;
    toHex(): string
}

export namespace IColor {
    export declare function fromHex(color: string): IColor;
    export declare function parse(color: string): IColor;
}
