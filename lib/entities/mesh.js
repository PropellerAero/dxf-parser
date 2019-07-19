
var helpers = require('../ParseHelpers');

module.exports = EntityParser;

function EntityParser() {}

EntityParser.ForEntityName = 'MESH';

EntityParser.prototype.parseEntity = function(scanner, curr) {
    var entity;
    entity = { type: curr.value, vertices: [], indices: [] };
    curr = scanner.next();
    while(curr !== 'EOF') {
        if(curr.code === 0) break;

        switch(curr.code) {
            case 10:
                entity.vertices.push(helpers.parsePoint(scanner));
                break;
            case 90:
                entity.indices.push(helpers.parseMeshFaceIndices(scanner));
                break;
            default: // check common entity attributes
                helpers.checkCommonEntityProperties(entity, curr);
                break;
        }
        curr = scanner.next();
    }

    console.log(entity.vertices, entity.vertices.length);
    console.log(entity.indices);
    return entity;
};