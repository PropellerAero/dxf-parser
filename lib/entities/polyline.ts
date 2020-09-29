import { IDxfScanner } from '../DxfArrayScanner';
import EntityHandler from '../EntityHandler';
import * as helpers from '../ParseHelpers';
import { BaseEntity, EntityTypes, Group, PolylineEntity } from '../types';
var VertexParser = require('./vertex');

export default class EntityParser implements EntityHandler {
    static ForEntityName = EntityTypes.POLYLINE;

    async parseEntity(scanner: IDxfScanner) {
        const entity: PolylineEntity = {
            type: EntityTypes.POLYLINE,
            vertices: [],
        };
        let curr = await scanner.next();
        while (curr.value !== 'EOF') {
            if (curr.code === 0) break;

            switch (curr.code) {
                case 10: // always 0
                case 20: // always 0
                case 30: // elevation
                case 39: // thickness
                    entity.thickness = curr.value as number;
                    break;
                case 40: // start width
                case 41: // end width
                    break;
                case 70:
                    const flag = curr.value as number;
                    entity.shape = (flag & 1) !== 0;
                    entity.includesCurveFitVertices = (flag & 2) !== 0;
                    entity.includesSplineFitVertices = (flag & 4) !== 0;
                    entity.is3dPolyline = (flag & 8) !== 0;
                    entity.is3dPolygonMesh = (flag & 16) !== 0;
                    entity.is3dPolygonMeshClosed = (flag & 32) !== 0; // 32 = The polygon mesh is closed in the N direction
                    entity.isPolyfaceMesh = (flag & 64) !== 0;
                    entity.hasContinuousLinetypePattern = (flag & 128) !== 0;
                    break;
                case 71: // Polygon mesh M vertex count
                case 72: // Polygon mesh N vertex count
                case 73: // Smooth surface M density
                case 74: // Smooth surface N density
                case 75: // Curves and smooth surface type
                    break;
                case 210:
                    entity.extrusionDirection = await helpers.parsePoint(
                        scanner
                    );
                    break;
                default:
                    helpers.checkCommonEntityProperties(entity, curr);
                    break;
            }
            curr = await scanner.next();
        }

        entity.vertices = await parsePolylineVertices(scanner, curr);

        return entity;
    }
}

async function parsePolylineVertices(scanner: IDxfScanner, curr: Group) {
    const vertexParser = new VertexParser();

    var vertices = [];
    while (!scanner.isEOF()) {
        if (curr.code === 0) {
            if (curr.value === EntityTypes.VERTEX) {
                vertices.push(await vertexParser.parseEntity(scanner, curr));
                curr = scanner.lastReadGroup;
            } else if (curr.value === 'SEQEND') {
                parseSeqEnd(scanner, curr);
                break;
            }
        }
    }
    return vertices;
}

async function parseSeqEnd(scanner: IDxfScanner, curr: Group) {
    const entity: BaseEntity = { type: curr.value as string };
    curr = await scanner.next();
    while (curr.value != 'EOF') {
        if (curr.code == 0) break;
        helpers.checkCommonEntityProperties(entity, curr);
        curr = await scanner.next();
    }

    return entity;
}
