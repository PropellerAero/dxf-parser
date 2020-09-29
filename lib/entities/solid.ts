import { IDxfScanner } from '../DxfArrayScanner';
import EntityHandler from '../EntityHandler';
import * as helpers from '../ParseHelpers';
import { EntityTypes, SolidEntity } from '../types';

export default class EntityParser implements EntityHandler {
    static ForEntityName = EntityTypes.SOLID;

    async parseEntity(scanner: IDxfScanner) {
        const entity: SolidEntity = { type: EntityTypes.SOLID, points: [] };
        let curr = await scanner.next();
        while (curr.value !== 'EOF') {
            if (curr.code === 0) break;

            switch (curr.code) {
                case 10:
                    entity.points[0] = await helpers.parsePoint(scanner);
                    break;
                case 11:
                    entity.points[1] = await helpers.parsePoint(scanner);
                    break;
                case 12:
                    entity.points[2] = await helpers.parsePoint(scanner);
                    break;
                case 13:
                    entity.points[3] = await helpers.parsePoint(scanner);
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
