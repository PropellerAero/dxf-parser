import { IDxfScanner } from '../DxfArrayScanner';
import EntityHandler from '../EntityHandler';
import * as helpers from '../ParseHelpers';
import { EntityTypes, MeshEntity } from '../types';

export default class EntityParser implements EntityHandler {
    static ForEntityName = EntityTypes.MESH;

    async parseEntity(scanner: IDxfScanner) {
        const entity: MeshEntity = {
            type: EntityTypes.MESH,
            vertices: [],
            indices: [],
        };
        let curr = await scanner.next();
        while (curr.value !== 'EOF') {
            if (curr.code === 0) break;

            switch (curr.code) {
                case 10:
                    entity.vertices.push(await helpers.parsePoint(scanner));
                    break;
                case 93:
                    const indices = await helpers.parseMeshFaceIndices(scanner);
                    if (indices && indices.length) {
                        entity.indices = indices;
                    }
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
