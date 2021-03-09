
var helpers = require('../ParseHelpers');

module.exports = EntityParser;

function EntityParser() {}

EntityParser.ForEntityName = 'POINT';

EntityParser.prototype.parseEntity = function(scanner, curr) {
    var entity;
    entity = { type: curr.value };
    curr = scanner.next();
    while(curr !== 'EOF') {
        if(curr.code === 0) break;

        switch(curr.code) {
            case 10:
                entity.position = helpers.parsePoint(scanner);
                entity.extendedData = entity.extendedData || {};
                entity.extendedData.customStrings =
                entity.extendedData.customStrings || [];
                entity.extendedData.customStrings.push(
                        `${String(entity.position.x)}, ${String(
                            entity.position.y
                        )}, ${String(entity.position.z)}`);
                break;
            case 39:
                entity.thickness = curr.value;
                break;
            case 210:
                entity.extrusionDirection = helpers.parsePoint(scanner);
                break;
            case 100:
                break;
            default: // check common entity attributes
                helpers.checkCommonEntityProperties(entity, curr);
                break;
        }
        curr = scanner.next();
    }

    return entity;
};