var DxfParser = require('../dist/DxfParser');
var fs = require('fs');
var should = require('should');
var path = require('path');
approvals = require('approvals');

describe('Parser', function() {
    // it('should parse the dxf header variables into an object', function(done) {
    //     var file = fs.createReadStream(__dirname + '/data/header.dxf', {
    //         encoding: 'utf8',
    //     });
    //     var parser = new DxfParser();

    //     parser.parseStream(file, function(err, result) {
    //         should.not.exist(err);
    //         var expected = fs.readFileSync(
    //             __dirname + '/data/header.parser.out',
    //             { encoding: 'utf8' }
    //         );
    //         result.should.eql(JSON.parse(expected));
    //         done();
    //     });
    // });

    // it('should parse the dxf extrusions correctly', function(done) {
    //     var file = fs.createReadStream(__dirname + '/data/extrusion.dxf', {
    //         encoding: 'utf8',
    //     });
    //     var parser = new DxfParser();

    //     parser.parseStream(file, function(err, result) {
    //         should.not.exist(err);
    //         var expected = fs.readFileSync(
    //             __dirname + '/data/extrusion.parser.out',
    //             { encoding: 'utf8' }
    //         );
    //         result.should.eql(JSON.parse(expected));
    //         done();
    //     });
    // });

    // var tables;

    // it('should parse the tables section without error', function(done) {
    //     var file = fs.createReadStream(__dirname + '/data/tables.dxf', {
    //         encoding: 'utf8',
    //     });
    //     var parser = new DxfParser();

    //     parser.parseStream(file, function(err, result) {
    //         var errMsg = err ? err.stack : undefined;
    //         should.not.exist(err, errMsg);
    //         tables = result.tables;
    //         fs.writeFileSync(
    //             path.join(__dirname, 'data', 'layer-table.actual.json'),
    //             JSON.stringify(tables.layer, null, 2)
    //         );
    //         fs.writeFileSync(
    //             path.join(__dirname, 'data', 'ltype-table.actual.json'),
    //             JSON.stringify(tables.lineType, null, 2)
    //         );
    //         fs.writeFileSync(
    //             path.join(__dirname, 'data', 'viewport-table.actual.json'),
    //             JSON.stringify(tables.viewPort, null, 2)
    //         );
    //         done();
    //     });
    // });

    // it('should parse the dxf layers', function() {
    //     should.exist(tables);
    //     tables.should.have.property('layer');

    //     var expectedOutputFilePath = path.join(
    //         __dirname,
    //         'data',
    //         'layer-table.expected.json'
    //     );

    //     var expected = fs.readFileSync(expectedOutputFilePath, {
    //         encoding: 'utf8',
    //     });
    //     tables.layer.should.eql(JSON.parse(expected));
    // });

    // it('should parse the dxf ltype table', function() {
    //     should.exist(tables);
    //     tables.should.have.property('lineType');

    //     var expectedOutputFilePath = path.join(
    //         __dirname,
    //         'data',
    //         'ltype-table.expected.json'
    //     );

    //     var expected = fs.readFileSync(expectedOutputFilePath, {
    //         encoding: 'utf8',
    //     });
    //     tables.lineType.should.eql(JSON.parse(expected));
    // });

    // it('should parse the dxf viewPort table', function() {
    //     should.exist(tables);
    //     tables.should.have.property('viewPort');

    //     var expectedOutputFilePath = path.join(
    //         __dirname,
    //         'data',
    //         'viewport-table.expected.json'
    //     );

    //     var expected = fs.readFileSync(expectedOutputFilePath, {
    //         encoding: 'utf8',
    //     });
    //     tables.viewPort.should.eql(JSON.parse(expected));
    // });

    it('should parse a complex BLOCKS section', function(done) {
        verifyDxf(path.join(__dirname, 'data', 'blocks.dxf'), done);
    });

    it('should parse a simple BLOCKS section', function(done) {
        var file = fs.createReadStream(
            path.join(__dirname, 'data', 'blocks2.dxf'),
            { encoding: 'utf8' }
        );

        var parser = new DxfParser();

        parser.parseStream(file, (err, result) => {
            try {
                fs.writeFileSync(
                    path.join(__dirname, 'data', 'blocks2.actual.json'),
                    JSON.stringify(result, null, 2)
                );
                should.exist(result);

                var expected = fs.readFileSync(
                    path.join(__dirname, 'data', 'blocks2.expected.json'),
                    { encoding: 'utf8' }
                );
                result.should.eql(JSON.parse(expected));
                done();
            } catch (err) {
                should.not.exist(err);
            }
        });
    });

    it('should parse POLYLINES', function(done) {
        var file = fs.createReadStream(
            path.join(__dirname, 'data', 'polylines.dxf'),
            'utf8'
        );

        var parser = new DxfParser();
        parser.parseStream(file, (err, result) => {
            fs.writeFileSync(
                path.join(__dirname, 'data', 'polylines.actual.json'),
                JSON.stringify(result, null, 2)
            );
            should.exist(result);

            var expected = fs.readFileSync(
                path.join(__dirname, 'data', 'polylines.expected.json'),
                { encoding: 'utf8' }
            );
            result.should.eql(JSON.parse(expected));
            should.not.exist(err);
        });
    });

    it('should parse ELLIPSE entities', function() {
        var file = fs.readFileSync(
            path.join(__dirname, 'data', 'ellipse.dxf'),
            'utf8'
        );

        var parser = new DxfParser();
        var dxf;
        try {
            dxf = parser.parseSync(file);
            fs.writeFileSync(
                path.join(__dirname, 'data', 'ellipse.actual.json'),
                JSON.stringify(dxf, null, 2)
            );
        } catch (err) {
            should.not.exist(err);
        }
        should.exist(dxf);

        var expected = fs.readFileSync(
            path.join(__dirname, 'data', 'ellipse.expected.json'),
            { encoding: 'utf8' }
        );
        dxf.should.eql(JSON.parse(expected));
    });

    it('should parse SPLINE entities', function() {
        var file = fs.readFileSync(
            path.join(__dirname, 'data', 'splines.dxf'),
            'utf8'
        );

        var parser = new DxfParser();
        var dxf;
        try {
            dxf = parser.parseSync(file);
            fs.writeFileSync(
                path.join(__dirname, 'data', 'splines.actual.json'),
                JSON.stringify(dxf, null, 2)
            );
        } catch (err) {
            should.not.exist(err);
        }
        should.exist(dxf);

        var expected = fs.readFileSync(
            path.join(__dirname, 'data', 'splines.expected.json'),
            { encoding: 'utf8' }
        );
        dxf.should.eql(JSON.parse(expected));
    });

    it('should parse EXTENDED DATA', function() {
        var file = fs.readFileSync(
            path.join(__dirname, 'data', 'extendeddata.dxf'),
            'utf8'
        );

        var parser = new DxfParser();
        var dxf;
        try {
            dxf = parser.parseSync(file);
            fs.writeFileSync(
                path.join(__dirname, 'data', 'extendeddata.actual.json'),
                JSON.stringify(dxf, null, 2)
            );
        } catch (err) {
            should.not.exist(err);
        }
        should.exist(dxf);

        var expected = fs.readFileSync(
            path.join(__dirname, 'data', 'extendeddata.expected.json'),
            { encoding: 'utf8' }
        );
        dxf.should.eql(JSON.parse(expected));
    });

    it('should parse SPLINE entities that are like arcs and circles', function() {
        verifyDxf(path.join(__dirname, 'data', 'arcs-as-splines.dxf'));
    });

    it('should parse ARC entities (1)', function() {
        verifyDxf(path.join(__dirname, 'data', 'arc1.dxf'));
    });

    it('should parse MESH entities', function() {
        verifyDxf(path.join(__dirname, 'data', 'mesh.dxf'));
        verifyDxf(path.join(__dirname, 'data', 'mesh2.dxf'));
    });
});

function verifyDxf(sourceFilePath, done) {
    var baseName = path.basename(sourceFilePath, '.dxf');
    var sourceDirectory = path.dirname(sourceFilePath);

    var parser = new DxfParser();
    var file = fs.createReadStream(sourceFilePath, 'utf8');

    parser.parseStream(file, (err, result) => {
        approvals.verifyAsJSON(sourceDirectory, baseName, result);
        done();
    });
}
