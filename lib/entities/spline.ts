import { IDxfScanner } from '../DxfArrayScanner';
import EntityHandler from '../EntityHandler';
import * as helpers from '../ParseHelpers';
import { EntityTypes, SplineEntity } from '../types';

export default class EntityParser implements EntityHandler {
    static ForEntityName = EntityTypes.SPLINE;

    async parseEntity(scanner: IDxfScanner) {
        const entity: SplineEntity = { type: EntityTypes.SPLINE };
        let curr = await scanner.next();
        while (curr.value !== 'EOF') {
            if (curr.code === 0) break;

            switch (curr.code) {
                case 10:
                    if (!entity.controlPoints) entity.controlPoints = [];
                    entity.controlPoints.push(
                        await helpers.parsePoint(scanner)
                    );
                    break;
                case 11:
                    if (!entity.fitPoints) entity.fitPoints = [];
                    entity.fitPoints.push(await helpers.parsePoint(scanner));
                    break;
                case 12:
                    entity.startTangent = await helpers.parsePoint(scanner);
                    break;
                case 13:
                    entity.endTangent = await helpers.parsePoint(scanner);
                    break;
                case 40:
                    if (!entity.knotValues) entity.knotValues = [];
                    entity.knotValues.push(curr.value as number);
                    break;
                case 70:
                    const flag = curr.value as number;
                    if ((flag & 1) != 0) entity.closed = true;
                    if ((flag & 2) != 0) entity.periodic = true;
                    if ((flag & 4) != 0) entity.rational = true;
                    if ((flag & 8) != 0) entity.planar = true;
                    if ((flag & 16) != 0) {
                        entity.planar = true;
                        entity.linear = true;
                    }
                    break;

                case 71:
                    entity.degreeOfSplineCurve = curr.value as number;
                    break;
                case 72:
                    entity.numberOfKnots = curr.value as number;
                    break;
                case 73:
                    entity.numberOfControlPoints = curr.value as number;
                    break;
                case 74:
                    entity.numberOfFitPoints = curr.value as number;
                    break;
                case 210:
                    entity.normalVector = await helpers.parsePoint(scanner);
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
