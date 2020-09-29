import { IDxfScanner } from '../DxfArrayScanner';
import EntityHandler from '../EntityHandler';
import * as helpers from '../ParseHelpers';
import { EntityTypes, PointEntity } from '../types';

export default class EntityParser implements EntityHandler {
    static ForEntityName = EntityTypes.POINT;

    async parseEntity(scanner: IDxfScanner) {
        const entity: PointEntity = { type: EntityTypes.POINT };
        let curr = await scanner.next();
        while (curr.value !== 'EOF') {
            if (curr.code === 0) break;

            switch (curr.code) {
                case 10:
                    entity.position = await helpers.parsePoint(scanner);
                    break;
                case 39:
                    entity.thickness = curr.value as number;
                    break;
                case 210:
                    entity.extrusionDirection = await helpers.parsePoint(
                        scanner
                    );
                    break;
                case 100:
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
