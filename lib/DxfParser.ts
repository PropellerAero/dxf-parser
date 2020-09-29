import log from 'loglevel';
import { Readable } from 'stream';
import DxfStreamScanner from './DxfStreamScanner';
import AUTO_CAD_COLOR_INDEX from './AutoCadColorIndex';
import {
    Block,
    DXF,
    Entity,
    Group,
    GroupValue,
    Header,
    Layer,
    LineType,
    Point,
    Table,
    Viewport,
} from './types';
import FaceEntityHandler from './entities/3dface';
import ArcEntityHandler from './entities/arc';
import AttDefEntityHandler from './entities/attdef';
import CircleEntityHandler from './entities/circle';
import DimensionEntityHandler from './entities/dimension';
import EllipseEntityHandler from './entities/ellipse';
import InsertEntityHandler from './entities/insert';
import LineEntityHandler from './entities/line';
import LWpolylineEntityHandler from './entities/lwpolyline';
import MTextEntityHandler from './entities/mtext';
import PointEntityHandler from './entities/point';
import PolylineEntityHandler from './entities/polyline';
import SolidEntityHandler from './entities/solid';
import SplineEntityHandler from './entities/spline';
import TextEntityHandler from './entities/text';
import MeshEntityHandler from './entities/mesh';
import EntityHandler, { IEntityHandler } from './EntityHandler';

//log.setLevel('trace');
//log.setLevel('debug');
//log.setLevel('info');
//log.setLevel('warn');
log.setLevel('error');
//log.setLevel('silent');

function registerDefaultEntityHandlers(dxfParser: DxfParser) {
    // Supported entities here (some entity code is still being refactored into this flow)
    dxfParser.registerEntityHandler(FaceEntityHandler);
    dxfParser.registerEntityHandler(ArcEntityHandler);
    dxfParser.registerEntityHandler(AttDefEntityHandler);
    dxfParser.registerEntityHandler(CircleEntityHandler);
    dxfParser.registerEntityHandler(DimensionEntityHandler);
    dxfParser.registerEntityHandler(EllipseEntityHandler);
    dxfParser.registerEntityHandler(InsertEntityHandler);
    dxfParser.registerEntityHandler(LineEntityHandler);
    dxfParser.registerEntityHandler(LWpolylineEntityHandler);
    dxfParser.registerEntityHandler(MTextEntityHandler);
    dxfParser.registerEntityHandler(PointEntityHandler);
    dxfParser.registerEntityHandler(PolylineEntityHandler);
    dxfParser.registerEntityHandler(SolidEntityHandler);
    dxfParser.registerEntityHandler(SplineEntityHandler);
    dxfParser.registerEntityHandler(TextEntityHandler);
    dxfParser.registerEntityHandler(MeshEntityHandler);
    //dxfParser.registerEntityHandler(require('./entities/vertex'));
}

function isPoint(value: unknown): value is Point {
    if (typeof value === 'object') {
        return true;
    }
}

type DoneCallback = (error?: Error, dxf?: DXF) => void;

export default class DxfParser {
    _entityHandlers: Record<string, any> = {};

    constructor() {
        registerDefaultEntityHandlers(this);
    }

    registerEntityHandler<T extends EntityHandler>(
        handlerType: IEntityHandler<T>
    ) {
        const instance = new handlerType();
        this._entityHandlers[handlerType.ForEntityName] = instance;
    }

    parseString(source: string, done: DoneCallback) {
        if (typeof source === 'string') {
            return this._parse(Readable.from(source.split(/\r?\n/)), done);
        } else {
            console.error('Cannot read dxf source of type `' + typeof source);
            return null;
        }
    }

    parseStream(stream: Readable, done: () => void) {
        this._parse(stream, done);
    }

    _parse(stream: Readable, done: DoneCallback) {
        const dxf: DXF = {};
        let curr: Group | null = null;
        let lastHandle = 0;
        const scanner = new DxfStreamScanner(stream);

        // if (!scanner.hasNext()) throw Error('Empty file');

        // const self = this;

        const parseAll = async () => {
            try {
                curr = await scanner.next();
                while (!scanner.isEOF()) {
                    if (curr.code === 0 && curr.value === 'SECTION') {
                        curr = await scanner.next();

                        // Be sure we are reading a section code
                        if (curr.code !== 2) {
                            console.error(
                                'Unexpected code %s after 0:SECTION',
                                debugCode(curr)
                            );
                            curr = await scanner.next();
                            continue;
                        }

                        if (curr.value === 'HEADER') {
                            log.debug('> HEADER');
                            dxf.header = await parseHeader();
                            log.debug('<');
                        } else if (curr.value === 'BLOCKS') {
                            log.debug('> BLOCKS');
                            dxf.blocks = await parseBlocks();
                            log.debug('<');
                        } else if (curr.value === 'ENTITIES') {
                            log.debug('> ENTITIES');
                            dxf.entities = await parseEntities(false);
                            log.debug('<');
                        } else if (curr.value === 'TABLES') {
                            log.debug('> TABLES');
                            dxf.tables = await parseTables();
                            log.debug('<');
                        } else if (curr.value === 'EOF') {
                            log.debug('EOF');
                        } else {
                            log.warn("Skipping section '%s'", curr.value);
                        }
                    } else {
                        curr = await scanner.next();
                    }
                    // If is a new section
                }
                done(null, dxf);
            } catch (e) {
                done(e);
            }
        };

        const groupIs = (code: number, value: GroupValue) => {
            return curr.code === code && curr.value === value;
        };

        const parseHeader = async () => {
            // interesting variables:
            //  $ACADVER, $VIEWDIR, $VIEWSIZE, $VIEWCTR, $TDCREATE, $TDUPDATE
            // http://www.autodesk.com/techpubs/autocad/acadr14/dxf/header_section_al_u05_c.htm
            // Also see VPORT table entries
            let currVarName: string | null = null;
            let currVarValue: Point | string | null = null;
            const header: Header = {};
            // loop through header variables
            curr = await scanner.next();

            while (true) {
                if (groupIs(0, 'ENDSEC')) {
                    if (currVarName) header[currVarName] = currVarValue;
                    break;
                } else if (curr.code === 9) {
                    if (currVarName) header[currVarName] = currVarValue;
                    currVarName = curr.value as string;
                    // Filter here for particular variables we are interested in
                } else {
                    if (curr.code === 10) {
                        currVarValue = { x: curr.value as number };
                    } else if (curr.code === 20 && isPoint(currVarValue)) {
                        currVarValue.y = curr.value as number;
                    } else if (curr.code === 30 && isPoint(currVarValue)) {
                        currVarValue.z = curr.value as number;
                    } else {
                        currVarValue = curr.value as string;
                    }
                }
                curr = await scanner.next();
            }
            // console.log(util.inspect(header, { colors: true, depth: null }));
            curr = await scanner.next(); // swallow up ENDSEC
            return header;
        };

        /**
         *
         */
        var parseBlocks = async function () {
            const blocks: Record<string, Block> = {};
            curr = await scanner.next();

            while (curr.value !== 'EOF') {
                if (groupIs(0, 'ENDSEC')) {
                    break;
                }

                if (groupIs(0, 'BLOCK')) {
                    log.debug('block {');
                    const block = await parseBlock();
                    log.debug('}');
                    ensureHandle(block);
                    if (!block.name)
                        log.error(
                            'block with handle "' +
                                block.handle +
                                '" is missing a name.'
                        );
                    else blocks[block.name] = block;
                } else {
                    logUnhandledGroup(curr);
                    curr = await scanner.next();
                }
            }
            return blocks;
        };

        var parseBlock = async () => {
            var block: Block = {};

            curr = await scanner.next();

            while (curr.value !== 'EOF') {
                switch (curr.code) {
                    case 1:
                        block.xrefPath = curr.value as string;
                        curr = await scanner.next();
                        break;
                    case 2:
                        block.name = curr.value as string;
                        curr = await scanner.next();
                        break;
                    case 3:
                        block.name2 = curr.value as string;
                        curr = await scanner.next();
                        break;
                    case 5:
                        block.handle = curr.value as string;
                        curr = await scanner.next();
                        break;
                    case 8:
                        block.layer = curr.value as string;
                        curr = await scanner.next();
                        break;
                    case 10:
                        block.position = await parsePoint();
                        curr = await scanner.next();
                        break;
                    case 67:
                        block.paperSpace =
                            curr.value && curr.value == 1 ? true : false;
                        curr = await scanner.next();
                        break;
                    case 70:
                        if (curr.value != 0) {
                            //if(curr.value & BLOCK_ANONYMOUS_FLAG) console.log('  Anonymous block');
                            //if(curr.value & BLOCK_NON_CONSTANT_FLAG) console.log('  Non-constant attributes');
                            //if(curr.value & BLOCK_XREF_FLAG) console.log('  Is xref');
                            //if(curr.value & BLOCK_XREF_OVERLAY_FLAG) console.log('  Is xref overlay');
                            //if(curr.value & BLOCK_EXTERNALLY_DEPENDENT_FLAG) console.log('  Is externally dependent');
                            //if(curr.value & BLOCK_RESOLVED_OR_DEPENDENT_FLAG) console.log('  Is resolved xref or dependent of an xref');
                            //if(curr.value & BLOCK_REFERENCED_XREF) console.log('  This definition is a referenced xref');
                            block.type = curr.value as string;
                        }
                        curr = await scanner.next();
                        break;
                    case 100:
                        // ignore class markers
                        curr = await scanner.next();
                        break;
                    case 330:
                        block.ownerHandle = curr.value as string;
                        curr = await scanner.next();
                        break;
                    case 0:
                        if (curr.value == 'ENDBLK') break;
                        block.entities = await parseEntities(true);
                        break;
                    default:
                        logUnhandledGroup(curr);
                        curr = await scanner.next();
                }

                if (groupIs(0, 'ENDBLK')) {
                    curr = await scanner.next();
                    break;
                }
            }
            return block;
        };

        /**
         * parseTables
         */
        const parseTables = async () => {
            const tables: Record<string, Table> = {};
            curr = await scanner.next();
            while (curr.value !== 'EOF') {
                if (groupIs(0, 'ENDSEC')) break;

                if (groupIs(0, 'TABLE')) {
                    curr = await scanner.next();

                    var tableDefinition =
                        tableDefinitions[curr.value as string];
                    if (tableDefinition) {
                        log.debug(curr.value + ' Table {');
                        tables[tableDefinition.tableName] = await parseTable();
                        log.debug('}');
                    } else {
                        log.debug('Unhandled Table ' + curr.value);
                    }
                } else {
                    // else ignored
                    curr = await scanner.next();
                }
            }

            curr = await scanner.next();
            return tables;
        };

        const END_OF_TABLE_VALUE = 'ENDTAB';

        var parseTable = async function () {
            const tableDefinition = tableDefinitions[curr.value as string];
            const table: Table = {};
            let expectedCount = 0;
            let actualCount = 0;

            curr = await scanner.next();
            while (!groupIs(0, END_OF_TABLE_VALUE)) {
                switch (curr.code) {
                    case 5:
                        table.handle = curr.value as string;
                        curr = await scanner.next();
                        break;
                    case 330:
                        table.ownerHandle = curr.value as string;
                        curr = await scanner.next();
                        break;
                    case 100:
                        if (curr.value === 'AcDbSymbolTable') {
                            // ignore
                        } else {
                            logUnhandledGroup(curr);
                        }
                        curr = await scanner.next();
                        break;
                    case 70:
                        expectedCount = curr.value as number;
                        curr = await scanner.next();
                        break;
                    case 0:
                        if (curr.value === tableDefinition.dxfSymbolName) {
                            table[
                                tableDefinition.tableRecordsProperty
                            ] = tableDefinition.parseTableRecords();
                        } else {
                            logUnhandledGroup(curr);
                            curr = await scanner.next();
                        }
                        break;
                    default:
                        logUnhandledGroup(curr);
                        curr = await scanner.next();
                }
            }
            var tableRecords = table[tableDefinition.tableRecordsProperty];
            if (tableRecords) {
                if (tableRecords.constructor === Array) {
                    actualCount = tableRecords.length;
                } else if (typeof tableRecords === 'object') {
                    actualCount = Object.keys(tableRecords).length;
                }
                if (expectedCount !== actualCount)
                    log.warn(
                        'Parsed ' +
                            actualCount +
                            ' ' +
                            tableDefinition.dxfSymbolName +
                            "'s but expected " +
                            expectedCount
                    );
            }
            curr = await scanner.next();
            return table;
        };

        const parseViewPortRecords = async () => {
            const viewPorts: Array<Viewport> = []; // Multiple table entries may have the same name indicating a multiple viewport configuration
            let viewPort: Viewport = {};

            log.debug('ViewPort {');
            curr = await scanner.next();
            while (!groupIs(0, END_OF_TABLE_VALUE)) {
                switch (curr.code) {
                    case 2: // layer name
                        viewPort.name = curr.value as string;
                        curr = await scanner.next();
                        break;
                    case 10:
                        viewPort.lowerLeftCorner = await parsePoint();
                        curr = await scanner.next();
                        break;
                    case 11:
                        viewPort.upperRightCorner = await parsePoint();
                        curr = await scanner.next();
                        break;
                    case 12:
                        viewPort.center = await parsePoint();
                        curr = await scanner.next();
                        break;
                    case 13:
                        viewPort.snapBasePoint = await parsePoint();
                        curr = await scanner.next();
                        break;
                    case 14:
                        viewPort.snapSpacing = await parsePoint();
                        curr = await scanner.next();
                        break;
                    case 15:
                        viewPort.gridSpacing = await parsePoint();
                        curr = await scanner.next();
                        break;
                    case 16:
                        viewPort.viewDirectionFromTarget = await parsePoint();
                        curr = await scanner.next();
                        break;
                    case 17:
                        viewPort.viewTarget = await parsePoint();
                        curr = await scanner.next();
                        break;
                    case 42:
                        viewPort.lensLength = curr.value as number;
                        curr = await scanner.next();
                        break;
                    case 43:
                        viewPort.frontClippingPlane = curr.value as number;
                        curr = await scanner.next();
                        break;
                    case 44:
                        viewPort.backClippingPlane = curr.value as number;
                        curr = await scanner.next();
                        break;
                    case 45:
                        viewPort.viewHeight = curr.value as number;
                        curr = await scanner.next();
                        break;
                    case 50:
                        viewPort.snapRotationAngle = curr.value as number;
                        curr = await scanner.next();
                        break;
                    case 51:
                        viewPort.viewTwistAngle = curr.value as number;
                        curr = await scanner.next();
                        break;
                    case 79:
                        viewPort.orthographicType = curr.value as string;
                        curr = await scanner.next();
                        break;
                    case 110:
                        viewPort.ucsOrigin = await parsePoint();
                        curr = await scanner.next();
                        break;
                    case 111:
                        viewPort.ucsXAxis = await parsePoint();
                        curr = await scanner.next();
                        break;
                    case 112:
                        viewPort.ucsYAxis = await parsePoint();
                        curr = await scanner.next();
                        break;
                    case 110:
                        viewPort.ucsOrigin = await parsePoint();
                        curr = await scanner.next();
                        break;
                    case 281:
                        viewPort.renderMode = curr.value as string;
                        curr = await scanner.next();
                        break;
                    case 281:
                        // 0 is one distant light, 1 is two distant lights
                        viewPort.defaultLightingType = curr.value as number;
                        curr = await scanner.next();
                        break;
                    case 292:
                        viewPort.defaultLightingOn = curr.value as string;
                        curr = await scanner.next();
                        break;
                    case 330:
                        viewPort.ownerHandle = curr.value as string;
                        curr = await scanner.next();
                        break;
                    case 63:
                    case 421:
                    case 431:
                        viewPort.ambientColor = curr.value as string;
                        curr = await scanner.next();
                        break;
                    case 0:
                        // New ViewPort
                        if (curr.value === 'VPORT') {
                            log.debug('}');
                            viewPorts.push(viewPort);
                            log.debug('ViewPort {');
                            viewPort = {};
                            curr = await scanner.next();
                        }
                        break;
                    default:
                        logUnhandledGroup(curr);
                        curr = await scanner.next();
                        break;
                }
            }
            // Note: do not call scanner.next() here,
            //  parseTable() needs the current group
            log.debug('}');
            viewPorts.push(viewPort);

            return viewPorts;
        };

        const parseLineTypes = async () => {
            const ltypes: Record<string, LineType> = {};
            let ltypeName: string;
            let ltype: LineType = {};
            let length: number;

            log.debug('LType {');
            curr = await scanner.next();
            while (!groupIs(0, 'ENDTAB')) {
                switch (curr.code) {
                    case 2:
                        ltype.name = curr.value as string;
                        ltypeName = curr.value as string;
                        curr = await scanner.next();
                        break;
                    case 3:
                        ltype.description = curr.value as string;
                        curr = await scanner.next();
                        break;
                    case 73: // Number of elements for this line type (dots, dashes, spaces);
                        length = curr.value as number;
                        if (length > 0) ltype.pattern = [];
                        curr = await scanner.next();
                        break;
                    case 40: // total pattern length
                        ltype.patternLength = curr.value as number;
                        curr = await scanner.next();
                        break;
                    case 49:
                        ltype.pattern.push(curr.value as number);
                        curr = await scanner.next();
                        break;
                    case 0:
                        log.debug('}');
                        if (length > 0 && length !== ltype.pattern.length)
                            log.warn('lengths do not match on LTYPE pattern');
                        ltypes[ltypeName] = ltype;
                        ltype = {};
                        log.debug('LType {');
                        curr = await scanner.next();
                        break;
                    default:
                        curr = await scanner.next();
                }
            }

            log.debug('}');
            ltypes[ltypeName] = ltype;
            return ltypes;
        };

        const parseLayers = async () => {
            const layers: Record<string, Layer> = {};
            let layerName: string;
            let layer: Layer = {};

            log.debug('Layer {');
            curr = await scanner.next();
            while (!groupIs(0, 'ENDTAB')) {
                switch (curr.code) {
                    case 2: // layer name
                        layer.name = curr.value as string;
                        layerName = curr.value as string;
                        curr = await scanner.next();
                        break;
                    case 62: // color, visibility
                        layer.visible = curr.value >= 0;
                        // TODO 0 and 256 are BYBLOCK and BYLAYER respectively. Need to handle these values for layers?.
                        layer.color = getAcadColor(
                            Math.abs(curr.value as number)
                        );
                        curr = await scanner.next();
                        break;
                    case 70: // frozen layer
                        const value = curr.value as number;
                        layer.frozen = (value & 1) != 0 || (value & 2) != 0;
                        curr = await scanner.next();
                        break;
                    case 0:
                        // New Layer
                        if (curr.value === 'LAYER') {
                            log.debug('}');
                            layers[layerName] = layer;
                            log.debug('Layer {');
                            layer = {};
                            layerName = undefined;
                            curr = await scanner.next();
                        }
                        break;
                    default:
                        logUnhandledGroup(curr);
                        curr = await scanner.next();
                        break;
                }
            }
            // Note: do not call scanner.next() here,
            //  parseLayerTable() needs the current group
            log.debug('}');
            layers[layerName] = layer;

            return layers;
        };

        const tableDefinitions = {
            VPORT: {
                tableRecordsProperty: 'viewPorts',
                tableName: 'viewPort',
                dxfSymbolName: 'VPORT',
                parseTableRecords: parseViewPortRecords,
            },
            LTYPE: {
                tableRecordsProperty: 'lineTypes',
                tableName: 'lineType',
                dxfSymbolName: 'LTYPE',
                parseTableRecords: parseLineTypes,
            },
            LAYER: {
                tableRecordsProperty: 'layers',
                tableName: 'layer',
                dxfSymbolName: 'LAYER',
                parseTableRecords: parseLayers,
            },
        };

        /**
         * Is called after the parser first reads the 0:ENTITIES group. The scanner
         * should be on the start of the first entity already.
         */
        const parseEntities = async (forBlock?: boolean) => {
            const entities: Array<Entity> = [];

            var endingOnValue = forBlock ? 'ENDBLK' : 'ENDSEC';

            if (!forBlock) {
                curr = await scanner.next();
            }
            while (true) {
                if (curr.code === 0) {
                    if (curr.value === endingOnValue) {
                        break;
                    }

                    let entity: Entity;
                    var handler = this._entityHandlers[curr.value as string];
                    if (handler != null) {
                        log.debug(curr.value + ' {');
                        entity = handler.parseEntity(scanner, curr);
                        curr = scanner.lastReadGroup;
                        log.debug('}');
                    } else {
                        log.warn('Unhandled entity ' + curr.value);
                        curr = await scanner.next();
                        continue;
                    }
                    ensureHandle(entity);
                    entities.push(entity);
                } else {
                    // ignored lines from unsupported entity
                    curr = await scanner.next();
                }
            }
            if (endingOnValue == 'ENDSEC') {
                curr = await scanner.next(); // swallow up ENDSEC, but not ENDBLK
            }
            return entities;
        };

        /**
         * Parses a 2D or 3D point, returning it as an object with x, y, and
         * (sometimes) z property if it is 3D. It is assumed the current group
         * is x of the point being read in, and scanner.next() will return the
         * y. The parser will determine if there is a z point automatically.
         */
        async function parsePoint(): Promise<Point> {
            const point: Point = {};
            let { code } = curr;

            point.x = curr.value as number;

            code += 10;
            curr = await scanner.next();
            if (curr.code != code)
                throw new Error(
                    'Expected code for point value to be ' +
                        code +
                        ' but got ' +
                        curr.code +
                        '.'
                );
            point.y = curr.value as number;

            code += 10;
            curr = await scanner.next();
            if (curr.code != code) {
                scanner.rewind();
                return point;
            }
            point.z = curr.value as number;
            return point;
        }

        var ensureHandle = function (entity) {
            if (!entity)
                throw new TypeError('entity cannot be undefined or null');

            if (!entity.handle) entity.handle = lastHandle++;
        };

        parseAll();
    }
}

function logUnhandledGroup(curr) {
    log.debug('unhandled group ' + debugCode(curr));
}

function debugCode(curr) {
    return curr.code + ':' + curr.value;
}

/**
 * Returns the truecolor value of the given AutoCad color index value
 */
function getAcadColor(index: number) {
    return AUTO_CAD_COLOR_INDEX[index];
}

const BLOCK_ANONYMOUS_FLAG = 1;
const BLOCK_NON_CONSTANT_FLAG = 2;
const BLOCK_XREF_FLAG = 4;
const BLOCK_XREF_OVERLAY_FLAG = 8;
const BLOCK_EXTERNALLY_DEPENDENT_FLAG = 16;
const BLOCK_RESOLVED_OR_DEPENDENT_FLAG = 32;
const BLOCK_REFERENCED_XREF = 64;

/* Notes */
// Code 6 of an entity indicates inheritance of properties (eg. color).
//   BYBLOCK means inherits from block
//   BYLAYER (default) mean inherits from layer
