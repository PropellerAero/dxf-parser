import { IDxfScanner } from '../DxfArrayScanner';
import EntityHandler from '../EntityHandler';
import * as helpers from '../ParseHelpers';
import { DimensionEntity, EntityTypes } from '../types';

export default class EntityParser implements EntityHandler {
    static ForEntityName = EntityTypes.DIMENSION;

    async parseEntity(scanner: IDxfScanner) {
        const entity: DimensionEntity = { type: EntityTypes.DIMENSION };
        let curr = await scanner.next();
        while (curr.value !== 'EOF') {
            if (curr.code === 0) break;

            switch (curr.code) {
                case 2: // Referenced block name
                    entity.block = curr.value as string;
                    break;
                case 10: // X coordinate of 'first alignment point'
                    entity.anchorPoint = await helpers.parsePoint(scanner);
                    break;
                case 11:
                    entity.middleOfText = await helpers.parsePoint(scanner);
                    break;
                case 71: // 5 = Middle center
                    entity.attachmentPoint = curr.value as number;
                    break;
                case 42: // Actual measurement
                    entity.actualMeasurement = curr.value as number;
                    break;
                case 1: // Text entered by user explicitly
                    entity.text = curr.value as string;
                    break;
                case 50: // Angle of rotated, horizontal, or vertical dimensions
                    entity.angle = curr.value as number;
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
