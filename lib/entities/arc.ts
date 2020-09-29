import { ArcEntity, EntityTypes } from '../types';
import * as helpers from '../ParseHelpers';
import EntityHandler from '../EntityHandler';
import { IDxfScanner } from '../DxfArrayScanner';

export default class EntityParser implements EntityHandler {
    static ForEntityName = EntityTypes.ARC;

    async parseEntity(scanner: IDxfScanner) {
        const entity: ArcEntity = { type: EntityTypes.ARC };
        let curr = await scanner.next();
        while (curr.value !== 'EOF') {
            if (curr.code === 0) break;

            switch (curr.code) {
                case 10: // X coordinate of point
                    entity.center = await helpers.parsePoint(scanner);
                    break;
                case 40: // radius
                    entity.radius = curr.value as number;
                    break;
                case 50: // start angle
                    entity.startAngle =
                        (Math.PI / 180) * (curr.value as number);
                    break;
                case 51: // end angle
                    entity.endAngle = (Math.PI / 180) * (curr.value as number);
                    entity.angleLength = entity.endAngle - entity.startAngle; // angleLength is deprecated
                    break;
                case 210:
                    entity.extrusionDirection = await helpers.parsePoint(
                        scanner
                    );
                    break;
                default:
                    // ignored attribute
                    helpers.checkCommonEntityProperties(entity, curr);
                    break;
            }
            curr = await scanner.next();
        }
        return entity;
    }
}
