import { IDxfScanner } from '../DxfArrayScanner';
import EntityHandler from '../EntityHandler';
import * as helpers from '../ParseHelpers';
import { EntityTypes, FaceEntity, Group, Point } from '../types';

export default class EntityParser implements EntityHandler {
    static ForEntityName = EntityTypes.FACE;

    async parseEntity(scanner: IDxfScanner) {
        const entity: FaceEntity = { type: EntityTypes.FACE, vertices: [] };
        let curr = await scanner.next();
        while (curr.value !== 'EOF') {
            if (curr.code === 0) break;
            switch (curr.code) {
                case 70: // 1 = Closed shape, 128 = plinegen?, 0 = default
                    entity.shape = (curr.value as number & 1) === 1;
                    entity.hasContinuousLinetypePattern =
                        (curr.value as number & 128) === 128;
                    break;
                case 10: // X coordinate of point
                    entity.vertices = await parse3dFaceVertices(scanner, curr);
                    curr = scanner.lastReadGroup;
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

async function parse3dFaceVertices(scanner: IDxfScanner, curr: Group) {
    const vertices: Array<Point> = [];
    let vertexIsStarted = false;
    let vertexIsFinished = false;
    let verticesPer3dFace = 4; // there can be up to four vertices per face, although 3 is most used for TIN

    for (let i = 0; i <= verticesPer3dFace; i++) {
        const vertex: Point = {};
        while (curr.value !== 'EOF') {
            if (curr.code === 0 || vertexIsFinished) break;

            switch (curr.code) {
                case 10: // X0
                case 11: // X1
                case 12: // X2
                case 13: // X3
                    if (vertexIsStarted) {
                        vertexIsFinished = true;
                        continue;
                    }
                    vertex.x = curr.value as number;
                    vertexIsStarted = true;
                    break;
                case 20: // Y
                case 21:
                case 22:
                case 23:
                    vertex.y = curr.value as number;
                    break;
                case 30: // Z
                case 31:
                case 32:
                case 33:
                    vertex.z = curr.value as number;
                    break;
                default:
                    // it is possible to have entity codes after the vertices.
                    // So if code is not accounted for return to entity parser where it might be accounted for
                    return vertices;
                    continue;
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
