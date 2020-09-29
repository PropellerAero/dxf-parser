import { IDxfScanner } from '../DxfArrayScanner';
import EntityHandler from '../EntityHandler';
import * as helpers from '../ParseHelpers';
import { AttDefEntity, EntityTypes } from '../types';

export default class EntityParser implements EntityHandler {
    static ForEntityName = EntityTypes.ATTDEF;

    async parseEntity(scanner: IDxfScanner) {
        var entity: AttDefEntity = {
            type: EntityTypes.ATTDEF,
            scale: 1,
            textStyle: 'STANDARD',
        };
        let curr = await scanner.next();
        while (curr.value !== 'EOF') {
            if (curr.code === 0) {
                break;
            }
            switch (curr.code) {
                case 1:
                    entity.text = curr.value as string;
                    break;
                case 2:
                    entity.tag = curr.value as string;
                    break;
                case 3:
                    entity.prompt = curr.value as string;
                    break;
                case 7:
                    entity.textStyle = curr.value as string;
                    break;
                case 10: // X coordinate of 'first alignment point'
                    entity.startPoint = await helpers.parsePoint(scanner);
                    break;
                case 11: // X coordinate of 'second alignment point'
                    entity.endPoint = await helpers.parsePoint(scanner);
                    break;
                case 39:
                    entity.thickness = curr.value as number;
                    break;
                case 40:
                    entity.textHeight = curr.value as number;
                    break;
                case 41:
                    entity.scale = curr.value as number;
                    break;
                case 50:
                    entity.rotation = curr.value as number;
                    break;
                case 51:
                    entity.obliqueAngle = curr.value as number;
                    break;
                case 70:
                    entity.invisible = !!(curr.value as number & 0x01);
                    entity.constant = !!(curr.value as number & 0x02);
                    entity.verificationRequired = !!(curr.value as number &
                        0x04);
                    entity.preset = !!(curr.value as number & 0x08);
                    break;
                case 71:
                    entity.backwards = !!(curr.value as number & 0x02);
                    entity.mirrored = !!(curr.value as number & 0x04);
                    break;
                case 72:
                    // TODO: enum values?
                    entity.horizontalJustification = curr.value as string;
                    break;
                case 73:
                    entity.fieldLength = curr.value as number;
                    break;
                case 74:
                    // TODO: enum values?
                    entity.verticalJustification = curr.value as string;
                    break;
                case 100:
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
