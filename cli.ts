import Parser from './lib/DxfParser';
import * as fs from 'fs';
import * as path from 'path';
import * as sourceMapSupport from 'source-map-support';

sourceMapSupport.install({
    hookRequire: true,
});

const parser = new Parser();

const stream = fs.createReadStream(path.join(__dirname, process.argv[2]));

parser.parseStream(stream).then(dxf => {
    console.log(dxf);
    console.log(process.memoryUsage());
});
