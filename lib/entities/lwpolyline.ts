import { IDxfScanner } from '../DxfArrayScanner';
import EntityHandler from '../EntityHandler';
import * as helpers from '../ParseHelpers';
import {
    EntityTypes,
    LWPolylineEntity,
    Point,
    Vertex,
    VertexEntity,
} from '../types';

export default class EntityParser implements EntityHandler {
    static ForEntityName = EntityTypes.LWPOLYLINE;

    async parseEntity(scanner: IDxfScanner) {
        const entity: LWPolylineEntity = {
            type: EntityTypes.LWPOLYLINE,
            vertices: [],
        };
        let numberOfVertices = 0;
        let curr = await scanner.next();
        while (curr.value !== 'EOF') {
            if (curr.code === 0) break;

            switch (curr.code) {
                case 38:
                    entity.elevation = curr.value as number;
                    break;
                case 39:
                    entity.depth = curr.value as number;
                    break;
                case 70: // 1 = Closed shape, 128 = plinegen?, 0 = default
                    entity.shape = (curr.value as number & 1) === 1;
                    entity.hasContinuousLinetypePattern =
                        (curr.value as number & 128) === 128;
                    break;
                case 90:
                    numberOfVertices = curr.value as number;
                    break;
                case 10: // X coordinate of point
                    entity.vertices = await parseLWPolylineVertices(
                        numberOfVertices,
                        scanner
                    );
                    break;
                case 43:
                    if (curr.value !== 0) entity.width = curr.value as number;
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
        return entity;
    }
}

async function parseLWPolylineVertices(n: number, scanner: IDxfScanner) {
    if (!n || n <= 0) throw Error('n must be greater than 0 verticies');
    const vertices: Array<Vertex> = [];
    let vertexIsStarted = false;
    let vertexIsFinished = false;
    let curr = scanner.lastReadGroup;

    for (let i = 0; i < n; i++) {
        const vertex: Vertex = {};
        while (curr.value !== 'EOF') {
            if (curr.code === 0 || vertexIsFinished) break;

            switch (curr.code) {
                case 10: // X
                    if (vertexIsStarted) {
                        vertexIsFinished = true;
                        continue;
                    }
                    vertex.x = curr.value as number;
                    vertexIsStarted = true;
                    break;
                case 20: // Y
                    vertex.y = curr.value as number;
                    break;
                case 30: // Z
                    vertex.z = curr.value as number;
                    break;
                case 40: // start width
                    vertex.startWidth = curr.value as number;
                    break;
                case 41: // end width
                    vertex.endWidth = curr.value as number;
                    break;
                case 42: // bulge
                    if (curr.value != 0) vertex.bulge = curr.value as number;
                    break;
                default:
                    // if we do not hit known code return vertices.  Code might belong to entity
                    if (vertexIsStarted) {
                        vertices.push(vertex);
                    }
                    // Remind to allow upper switch to handle code on next step
                    scanner.rewind();
                    return vertices;
            }
            curr = await scanner.next();
        }
        // See https://groups.google.com/forum/#!topic/comp.cad.autocad/9gn8s5O_w6E
        vertices.push(vertex);
        vertexIsStarted = false;
        vertexIsFinished = false;
    }
    scanner.rewind();
    return vertices;
}
