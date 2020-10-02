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

export type GroupValue = string | number | boolean;

export type Group = {
    code: number;
    value?: string | number | boolean;
};

export interface BaseEntity {
    type?: string;
    handle?: number;
    lineType?: number;
    layer?: string;
    lineTypeScale?: number;
    visible?: boolean;
    colorIndex?: number;
    color?: number;
    inPaperSpace?: boolean;
    ownerHandle?: number;
    materialObjectHandle?: number;
    lineweight?: number;
    extendedData?: any;
}

export interface FaceEntity extends BaseEntity {
    type: EntityTypes.FACE;
    shape?: boolean;
    hasContinuousLinetypePattern?: boolean;
    vertices?: Array<Point>;
}

export interface ArcEntity extends BaseEntity {
    type: EntityTypes.ARC;
    center?: Point;
    radius?: number;
    startAngle?: number;
    endAngle?: number;
    angleLength?: number;
    extrusionDirection?: Point;
}

export interface AttDefEntity extends BaseEntity {
    type: EntityTypes.ATTDEF;
    text?: string;
    tag?: string;
    prompt?: string;
    textStyle?: string;
    startPoint?: Point;
    endPoint?: Point;
    thickness?: number;
    textHeight?: number;
    scale?: number;
    rotation?: number;
    obliqueAngle?: number;
    invisible?: boolean;
    constant?: boolean;
    verificationRequired?: boolean;
    preset?: boolean;
    backwards?: boolean;
    mirrored?: boolean;
    horizontalJustification?: string;
    fieldLength?: number;
    verticalJustification?: string;
    extrusionDirection?: Point;
}

export interface CircleEntity extends BaseEntity {
    type: EntityTypes.CIRCLE;
    center?: Point;
    radius?: number;
    startAngle?: number;
    angleLength?: number;
    endAngle?: number;
    extrusionDirection?: Point;
}

export interface DimensionEntity extends BaseEntity {
    type: EntityTypes.DIMENSION;
    block?: string;
    anchorPoint?: Point;
    middleOfText?: Point;
    attachmentPoint?: number;
    actualMeasurement?: number;
    text?: string;
    angle?: number;
}

export interface EllipseEntity extends BaseEntity {
    type: EntityTypes.ELLIPSE;
    center?: Point;
    majorAxisEndPoint?: Point;
    axisRatio?: number;
    startAngle?: number;
    endAngle?: number;
    name?: string;
    extrusionDirection?: Point;
}

export interface InsertEntity extends BaseEntity {
    type: EntityTypes.INSERT;
    name?: string;
    xScale?: number;
    yScale?: number;
    zScale?: number;
    position?: Point;
    rotation?: number;
    columnCount?: number;
    rowCount?: number;
    columnSpacing?: number;
    rowSpacing?: number;
    extrusionDirection?: Point;
}

export interface LineEntity extends BaseEntity {
    type: EntityTypes.LINE;
    vertices?: Array<Point>;
    extrusionDirection?: Point;
}

export interface LWPolylineEntity extends BaseEntity {
    type: EntityTypes.LWPOLYLINE;
    elevation?: number;
    depth?: number;
    shape?: boolean;
    hasContinuousLinetypePattern?: boolean;
    numberOfVertices?: number;
    width?: number;
    vertices?: Array<Vertex>;
    extrusionDirection?: Point;
}

export interface MeshEntity extends BaseEntity {
    type: EntityTypes.MESH;
    vertices?: Array<Point>;
    indices?: Array<Array<number>>;
}

export interface MTextEntity extends BaseEntity {
    type: EntityTypes.MTEXT;
    text?: string;
    position?: Point;
    height?: number;
    width?: number;
    rotation?: number;
    attachmentPoint?: number;
    drawingDirection?: number;
    extrusionDirection?: Point;
}

export interface PointEntity extends BaseEntity {
    type: EntityTypes.POINT;
    position?: Point;
    thickness?: number;
    extrusionDirection?: Point;
}

export interface PolylineEntity extends BaseEntity {
    type: EntityTypes.POLYLINE;
    vertices?: Array<Point>;
    thickness?: number;
    shape?: boolean;
    includesCurveFitVertices?: boolean;
    includesSplineFitVertices?: boolean;
    is3dPolyline?: boolean;
    is3dPolygonMesh?: boolean;
    is3dPolygonMeshClosed?: boolean;
    isPolyfaceMesh?: boolean;
    hasContinuousLinetypePattern?: boolean;
    extrusionDirection?: Point;
}

export interface SolidEntity extends BaseEntity {
    type: EntityTypes.SOLID;
    points?: Array<Point>;
    extrusionDirection?: Point;
}

export interface SplineEntity extends BaseEntity {
    type: EntityTypes.SPLINE;
    controlPoints?: Array<Point>;
    fitPoints?: Array<Point>;
    startTangent?: Point;
    endTangent?: Point;
    knotValues?: Array<number>;
    closed?: boolean;
    periodic?: boolean;
    rational?: boolean;
    planar?: boolean;
    linear?: boolean;
    degreeOfSplineCurve?: number;
    numberOfKnots?: number;
    numberOfControlPoints?: number;
    numberOfFitPoints?: number;
    normalVector?: Point;
}

export interface TextEntity extends BaseEntity {
    type: EntityTypes.TEXT;
    startPoint?: Point;
    endPoint?: Point;
    textHeight?: number;
    xScale?: number;
    rotation?: number;
    text?: string;
    halign?: number;
    valign?: number;
    extrusionDirection?: Point;
}

export interface Vertex {
    x?: number;
    y?: number;
    z?: number;
    bulge?: number;
    curveFittingVertex?: boolean;
    curveFitTangent?: boolean;
    splineVertex?: boolean;
    splineControlPoint?: boolean;
    threeDPolylineVertex?: boolean;
    threeDPolylineMesh?: boolean;
    polyfaceMeshVertex?: boolean;
    startWidth?: number;
    endWidth?: number;
}

export interface VertexEntity extends BaseEntity, Vertex {
    type: EntityTypes.VERTEX;
}

export enum EntityTypes {
    ARC = 'ARC',
    ATTDEF = 'ATTDEF',
    CIRCLE = 'CIRCLE',
    DIMENSION = 'DIMENSION',
    ELLIPSE = 'ELLIPSE',
    FACE = '3DFACE',
    INSERT = 'INSERT',
    LINE = 'LINE',
    LWPOLYLINE = 'LWPOLYLINE',
    MESH = 'MESH',
    MTEXT = 'MTEXT',
    POINT = 'POINT',
    POLYLINE = 'POLYLINE',
    SOLID = 'SOLID',
    SPLINE = 'SPLINE',
    TEXT = 'TEXT',
    VERTEX = 'VERTEX',
}

export type Entity =
    | ArcEntity
    | AttDefEntity
    | CircleEntity
    | DimensionEntity
    | EllipseEntity
    | FaceEntity
    | InsertEntity
    | LineEntity
    | LWPolylineEntity
    | MeshEntity
    | MTextEntity
    | PointEntity
    | PolylineEntity
    | SolidEntity
    | SplineEntity
    | TextEntity
    | VertexEntity;
