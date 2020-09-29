import { IDxfScanner } from '../DxfArrayScanner';
import EntityHandler from '../EntityHandler';
import * as helpers from '../ParseHelpers';
import { EllipseEntity, EntityTypes } from '../types';

export default class EntityParser implements EntityHandler {
    static ForEntityName = EntityTypes.ELLIPSE;

    async parseEntity(scanner: IDxfScanner) {
        const entity: EllipseEntity = { type: EntityTypes.ELLIPSE };
        let curr = await scanner.next();
        while (curr.value !== 'EOF') {
            if (curr.code === 0) break;

            switch (curr.code) {
                case 10:
                    entity.center = await helpers.parsePoint(scanner);
                    break;
                case 11:
                    entity.majorAxisEndPoint = await helpers.parsePoint(
                        scanner
                    );
                    break;
                case 40:
                    entity.axisRatio = curr.value as number;
                    break;
                case 41:
                    entity.startAngle = curr.value as number;
                    break;
                case 42:
                    entity.endAngle = curr.value as number;
                    break;
                case 2:
                    entity.name = curr.value as string;
                    break;
                case 210:
                    entity.extrusionDirection = await helpers.parsePoint(
                        scanner
                    );
                    break;
                default:
                    // check common entity attributes
                    helpers.checkCommonEntityProperties(entity, curr);
                    break;
            }

            curr = await scanner.next();
        }

        return entity;
    }
}
