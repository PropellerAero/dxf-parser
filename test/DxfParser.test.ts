import * as fs from 'fs';
import * as path from 'path';
import * as approvals from 'approvals';
import DxfParser from '../lib/DxfParser';

describe('Parser', () => {
    // it('should parse the dxf header constiables into an object', function(done) {
    //     const file = fs.createReadStream(__dirname + '/data/header.dxf', {
    //         encoding: 'utf8',
    //     });
    //     const parser = new DxfParser();

    //     parser.parseStream(file, function(err, result) {
    //         should.not.exist(err);
    //         const expected = fs.readFileSync(
    //             __dirname + '/data/header.parser.out',
    //             { encoding: 'utf8' }
    //         );
    //         result.should.eql(JSON.parse(expected));
    //         done();
    //     });
    // });

    // it('should parse the dxf extrusions correctly', function(done) {
    //     const file = fs.createReadStream(__dirname + '/data/extrusion.dxf', {
    //         encoding: 'utf8',
    //     });
    //     const parser = new DxfParser();

    //     parser.parseStream(file, function(err, result) {
    //         should.not.exist(err);
    //         const expected = fs.readFileSync(
    //             __dirname + '/data/extrusion.parser.out',
    //             { encoding: 'utf8' }
    //         );
    //         result.should.eql(JSON.parse(expected));
    //         done();
    //     });
    // });

    // const tables;

    // it('should parse the tables section without error', function(done) {
    //     const file = fs.createReadStream(__dirname + '/data/tables.dxf', {
    //         encoding: 'utf8',
    //     });
    //     const parser = new DxfParser();

    //     parser.parseStream(file, function(err, result) {
    //         const errMsg = err ? err.stack : undefined;
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

    //     const expectedOutputFilePath = path.join(
    //         __dirname,
    //         'data',
    //         'layer-table.expected.json'
    //     );

    //     const expected = fs.readFileSync(expectedOutputFilePath, {
    //         encoding: 'utf8',
    //     });
    //     tables.layer.should.eql(JSON.parse(expected));
    // });

    // it('should parse the dxf ltype table', function() {
    //     should.exist(tables);
    //     tables.should.have.property('lineType');

    //     const expectedOutputFilePath = path.join(
    //         __dirname,
    //         'data',
    //         'ltype-table.expected.json'
    //     );

    //     const expected = fs.readFileSync(expectedOutputFilePath, {
    //         encoding: 'utf8',
    //     });
    //     tables.lineType.should.eql(JSON.parse(expected));
    // });

    // it('should parse the dxf viewPort table', function() {
    //     should.exist(tables);
    //     tables.should.have.property('viewPort');

    //     const expectedOutputFilePath = path.join(
    //         __dirname,
    //         'data',
    //         'viewport-table.expected.json'
    //     );

    //     const expected = fs.readFileSync(expectedOutputFilePath, {
    //         encoding: 'utf8',
    //     });
    //     tables.viewPort.should.eql(JSON.parse(expected));
    // });

    it('should parse a complex BLOCKS section', async () => {
        await verifyDxf(path.join(__dirname, 'data', 'blocks.dxf'));
    });

    it('should parse a simple BLOCKS section', async () => {
        const file = fs.createReadStream(
            path.join(__dirname, 'data', 'blocks2.dxf'),
            { encoding: 'utf8' }
        );

        const parser = new DxfParser();

        try {
            const result = await parser.parseStream(file);
            fs.writeFileSync(
                path.join(__dirname, 'data', 'blocks2.actual.json'),
                JSON.stringify(result, null, 2)
            );
            expect(result).toBeDefined();

            const expected = fs.readFileSync(
                path.join(__dirname, 'data', 'blocks2.expected.json'),
                { encoding: 'utf8' }
            );
            expect(result).toEqual(JSON.parse(expected));
        } catch (err) {
            expect(err).toBeUndefined();
        }
    });

    it('should parse POLYLINES', async () => {
        const file = fs.createReadStream(
            path.join(__dirname, 'data', 'polylines.dxf'),
            'utf8'
        );

        const parser = new DxfParser();
        try {
            const result = await parser.parseStream(file);
            fs.writeFileSync(
                path.join(__dirname, 'data', 'polylines.actual.json'),
                JSON.stringify(result, null, 2)
            );
            expect(result).toBeDefined();

            const expected = fs.readFileSync(
                path.join(__dirname, 'data', 'polylines.expected.json'),
                { encoding: 'utf8' }
            );
            expect(result).toEqual(JSON.parse(expected));
        } catch (err) {
            expect(err).toBeUndefined();
        }
    });

    it('should parse ELLIPSE entities', async () => {
        const file = fs.createReadStream(
            path.join(__dirname, 'data', 'ellipse.dxf'),
            'utf8'
        );

        const parser = new DxfParser();
        try {
            const dxf = await parser.parseStream(file);
            fs.writeFileSync(
                path.join(__dirname, 'data', 'ellipse.actual.json'),
                JSON.stringify(dxf, null, 2)
            );
            expect(dxf).toBeDefined();

            const expected = fs.readFileSync(
                path.join(__dirname, 'data', 'ellipse.expected.json'),
                { encoding: 'utf8' }
            );
            expect(dxf).toEqual(JSON.parse(expected));
        } catch (err) {
            expect(err).toBeUndefined();
        }
    });

    it('should parse SPLINE entities', async () => {
        const file = fs.createReadStream(
            path.join(__dirname, 'data', 'splines.dxf'),
            'utf8'
        );

        const parser = new DxfParser();
        try {
            const dxf = await parser.parseStream(file);
            fs.writeFileSync(
                path.join(__dirname, 'data', 'splines.actual.json'),
                JSON.stringify(dxf, null, 2)
            );
            expect(dxf).toBeDefined();
            const expected = fs.readFileSync(
                path.join(__dirname, 'data', 'splines.expected.json'),
                { encoding: 'utf8' }
            );
            expect(dxf).toEqual(JSON.parse(expected));
        } catch (err) {
            expect(err).toBeUndefined();
        }
    });

    it('should parse EXTENDED DATA', async () => {
        const file = fs.createReadStream(
            path.join(__dirname, 'data', 'extendeddata.dxf'),
            'utf8'
        );

        const parser = new DxfParser();
        try {
            const dxf = await parser.parseStream(file);
            fs.writeFileSync(
                path.join(__dirname, 'data', 'extendeddata.actual.json'),
                JSON.stringify(dxf, null, 2)
            );

            expect(dxf).toBeDefined();

            const expected = fs.readFileSync(
                path.join(__dirname, 'data', 'extendeddata.expected.json'),
                { encoding: 'utf8' }
            );
            expect(dxf).toEqual(JSON.parse(expected));
        } catch (err) {
            expect(err).toBeUndefined();
        }
    });

    it('should parse SPLINE entities that are like arcs and circles', async () => {
        await verifyDxf(path.join(__dirname, 'data', 'arcs-as-splines.dxf'));
    });

    it('should parse ARC entities (1)', async () => {
        await verifyDxf(path.join(__dirname, 'data', 'arc1.dxf'));
    });

    it('should parse MESH entities', async () => {
        await verifyDxf(path.join(__dirname, 'data', 'mesh.dxf'));
        await verifyDxf(path.join(__dirname, 'data', 'mesh2.dxf'));
    });
});

async function verifyDxf(sourceFilePath: string) {
    const baseName = path.basename(sourceFilePath, '.dxf');
    const sourceDirectory = path.dirname(sourceFilePath);

    const parser = new DxfParser();
    const file = fs.createReadStream(sourceFilePath, 'utf8');

    const result = await parser.parseStream(file);
    approvals.verifyAsJSON(sourceDirectory, baseName, result);
}
