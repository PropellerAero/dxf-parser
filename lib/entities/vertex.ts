import { IDxfScanner } from '../DxfArrayScanner';
import EntityHandler from '../EntityHandler';
import * as helpers from '../ParseHelpers';
import { EntityTypes, VertexEntity } from '../types';

export default class EntityParser implements EntityHandler {
    static ForEntityName = EntityTypes.VERTEX;

    async parseEntity(scanner: IDxfScanner) {
        const entity: VertexEntity = { type: EntityTypes.VERTEX };
        let curr = await scanner.next();
        while (curr.value !== 'EOF') {
            if (curr.code === 0) break;

            switch (curr.code) {
                case 10: // X
                    entity.x = curr.value as number;
                    break;
                case 20: // Y
                    entity.y = curr.value as number;
                    break;
                case 30: // Z
                    entity.z = curr.value as number;
                    break;
                case 40: // start width
                case 41: // end width
                case 42: // bulge
                    if (curr.value != 0) entity.bulge = curr.value as number;
                    break;
                case 70: // flags
                    const flag = curr.value as number;
                    entity.curveFittingVertex = (flag & 1) !== 0;
                    entity.curveFitTangent = (flag & 2) !== 0;
                    entity.splineVertex = (flag & 8) !== 0;
                    entity.splineControlPoint = (flag & 16) !== 0;
                    entity.threeDPolylineVertex = (flag & 32) !== 0;
                    entity.threeDPolylineMesh = (flag & 64) !== 0;
                    entity.polyfaceMeshVertex = (flag & 128) !== 0;
                    break;
                case 50: // curve fit tangent direction
                case 71: // polyface mesh vertex index
                case 72: // polyface mesh vertex index
                case 73: // polyface mesh vertex index
                case 74: // polyface mesh vertex index
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
