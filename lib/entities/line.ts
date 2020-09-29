import { IDxfScanner } from '../DxfArrayScanner';
import EntityHandler from '../EntityHandler';
import * as helpers from '../ParseHelpers';
import { EntityTypes, LineEntity } from '../types';

export default class EntityParser implements EntityHandler {
    static ForEntityName = EntityTypes.LINE;

    async parseEntity(scanner: IDxfScanner) {
        const entity: LineEntity = { type: EntityTypes.LINE, vertices: [] };
        let curr = await scanner.next();
        while (curr.value !== 'EOF') {
            if (curr.code === 0) break;

            switch (curr.code) {
                case 10: // X coordinate of point
                    entity.vertices.unshift(await helpers.parsePoint(scanner));
                    break;
                case 11:
                    entity.vertices.push(await helpers.parsePoint(scanner));
                    break;
                case 210:
                    entity.extrusionDirection = await helpers.parsePoint(
                        scanner
                    );
                    break;
                case 100:
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
