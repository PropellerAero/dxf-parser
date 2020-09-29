import { IDxfScanner } from '../DxfArrayScanner';
import EntityHandler from '../EntityHandler';
import * as helpers from '../ParseHelpers';
import { CircleEntity, EntityTypes } from '../types';

export default class EntityParser implements EntityHandler {
    static ForEntityName = EntityTypes.CIRCLE;

    async parseEntity(scanner: IDxfScanner) {
        const entity: CircleEntity = { type: EntityTypes.CIRCLE };
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
                    const endAngle = (Math.PI / 180) * (curr.value as number);
                    if (endAngle < entity.startAngle)
                        entity.angleLength =
                            endAngle + 2 * Math.PI - entity.startAngle;
                    else entity.angleLength = endAngle - entity.startAngle;
                    entity.endAngle = endAngle;
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
