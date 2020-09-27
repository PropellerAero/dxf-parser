export type DXF = {
    header?: {};
    blocks?: Record<string, Block>;
    entities?: {};
    tables?: Record<string, Table>;
};

export type Point = {
    x?: number;
    y?: number;
    z?: number;
};

export type Table = {
    handle?: string;
    ownerHandle?: string;
};

export type Block = {
    xrefPath?: string;
    name?: string;
    name2?: string;
    handle?: string;
    layer?: string;
    position?: Point;
    paperSpace?: boolean;
    type?: string;
    ownerHandle?: string;
    entities?: Array<Entity>;
};

export type Viewport = {
    name?: string;
    lowerLeftCorner?: Point;
    upperRightCorner?: Point;
    center?: Point;
    snapBasePoint?: Point;
    snapSpacing?: Point;
    gridSpacing?: Point;
    viewDirectionFromTarget?: Point;
    viewTarget?: Point;
    lensLength?: number;
    frontClippingPlane?: number;
    backClippingPlane?: number;
    viewHeight?: number;
    snapRotationAngle?: number;
    viewTwistAngle?: number;
    orthographicType?: string;
    ucsOrigin?: Point;
    ucsXAxis?: Point;
    ucsYAxis?: Point;
    renderMode?: string;
    defaultLightingType?: number;
    defaultLightingOn?: string;
    ownerHandle?: string;
    ambientColor?: string;
};

export type LineType = {
    name?: string;
    description?: string;
    pattern?: Array<number>;
    patternLength?: number;
};

export type Layer = {
    name?: string;
    visible?: boolean;
    color?: number;
    frozen?: boolean;
};

export type Header = Record<string, string | Point>;

export type Entity = {};

export type GroupValue = string | number | boolean;

export type Group = {
    code: number;
    value?: string | number | boolean;
};
