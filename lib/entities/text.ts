import { IDxfScanner } from '../DxfArrayScanner';
import EntityHandler from '../EntityHandler';
import * as helpers from '../ParseHelpers';
import { EntityTypes, TextEntity } from '../types';

export default class EntityParser implements EntityHandler {
    static ForEntityName = EntityTypes.TEXT;

    async parseEntity(scanner: IDxfScanner) {
        const entity: TextEntity = { type: EntityTypes.TEXT };
        let curr = await scanner.next();
        while (curr.value !== 'EOF') {
            if (curr.code === 0) break;
            switch (curr.code) {
                case 10: // X coordinate of 'first alignment point'
                    entity.startPoint = await helpers.parsePoint(scanner);
                    break;
                case 11: // X coordinate of 'second alignment point'
                    entity.endPoint = await helpers.parsePoint(scanner);
                    break;
                case 40: // Text height
                    entity.textHeight = curr.value as number;
                    break;
                case 41:
                    entity.xScale = curr.value as number;
                    break;
                case 50: // Rotation in degrees
                    entity.rotation = curr.value as number;
                    break;
                case 1: // Text
                    entity.text = curr.value as string;
                    break;
                // NOTE: 72 and 73 are meaningless without 11 (second alignment point)
                case 72: // Horizontal alignment
                    entity.halign = curr.value as number;
                    break;
                case 73: // Vertical alignment
                    entity.valign = curr.value as number;
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
