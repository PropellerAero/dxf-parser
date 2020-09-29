import { IDxfScanner } from '../DxfArrayScanner';
import EntityHandler from '../EntityHandler';
import * as helpers from '../ParseHelpers';
import { EntityTypes, InsertEntity } from '../types';

export default class EntityParser implements EntityHandler {
    static ForEntityName = EntityTypes.INSERT;

    async parseEntity(scanner: IDxfScanner) {
        const entity: InsertEntity = { type: EntityTypes.INSERT };
        let curr = await scanner.next();
        while (curr.value !== 'EOF') {
            if (curr.code === 0) break;

            switch (curr.code) {
                case 2:
                    entity.name = curr.value as string;
                    break;
                case 41:
                    entity.xScale = curr.value as number;
                    break;
                case 42:
                    entity.yScale = curr.value as number;
                    break;
                case 43:
                    entity.zScale = curr.value as number;
                    break;
                case 10:
                    entity.position = await helpers.parsePoint(scanner);
                    break;
                case 50:
                    entity.rotation = curr.value as number;
                    break;
                case 70:
                    entity.columnCount = curr.value as number;
                    break;
                case 71:
                    entity.rowCount = curr.value as number;
                    break;
                case 44:
                    entity.columnSpacing = curr.value as number;
                    break;
                case 45:
                    entity.rowSpacing = curr.value as number;
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
