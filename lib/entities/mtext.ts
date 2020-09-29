import { IDxfScanner } from '../DxfArrayScanner';
import EntityHandler from '../EntityHandler';
import * as helpers from '../ParseHelpers';
import { EntityTypes, MTextEntity } from '../types';

export default class EntityParser implements EntityHandler {
    static ForEntityName = EntityTypes.MTEXT;

    async parseEntity(scanner: IDxfScanner) {
        const entity: MTextEntity = { type: EntityTypes.MTEXT };
        let curr = await scanner.next();
        while (curr.value !== 'EOF') {
            if (curr.code === 0) break;

            switch (curr.code) {
                case 1:
                    entity.text = curr.value as string;
                    break;
                case 3:
                    entity.text += curr.value as string;
                    break;
                case 10:
                    entity.position = await helpers.parsePoint(scanner);
                    break;
                case 40:
                    //Note: this is the text height
                    entity.height = curr.value as number;
                    break;
                case 41:
                    entity.width = curr.value as number;
                    break;
                case 50:
                    entity.rotation = curr.value as number;
                    break;
                case 71:
                    entity.attachmentPoint = curr.value as number;
                    break;
                case 72:
                    entity.drawingDirection = curr.value as number;
                    break;
                case 210:
                    entity.extrusionDirection = await helpers.parsePoint(
                        scanner
                    );
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
