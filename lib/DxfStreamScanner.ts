/* eslint-disable no-underscore-dangle */
import es, { MapStream } from 'event-stream';
import { Readable } from 'stream';
import DxfArrayScanner, { IDxfScanner } from './DxfArrayScanner';

const LINE_DATA_EVENT = 'line-data';
const BUFFERED_EVENT = 'buffered';

export default class DxfStreamScanner
    extends DxfArrayScanner
    implements IDxfScanner {
    _data: Array<string>;
    _pointer: number;
    ended: boolean;
    bufferSize: number;
    upperBuffer: number;
    lowerBuffer: number;
    stream: Readable;
    mapStream: MapStream;

    constructor(stream: Readable, bufferSize: number = 110000) {
        super([]);
        this._data = [];
        this._pointer = 0;
        this.bufferSize = bufferSize;
        this.upperBuffer = 0.5 * bufferSize;
        this.lowerBuffer = 0.25 * bufferSize;
        this.stream = stream;
        this.mapStream = stream
            .pipe(es.split())
            .on('data', this.onData)
            .on('end', this.onEnd);
        this.mapStream.pause();
    }

    onData = (data: string) => {
        if (this._data.length >= this.bufferSize) {
            this._data.shift();
            this._pointer--;
        }
        this._data.push(data);
        console.log(data);
        if (this._data.length - this._pointer >= this.upperBuffer) {
            console.log('Pause stream');
            this.mapStream.pause();
            this.mapStream.emit(BUFFERED_EVENT);
        }
    };

    onEnd = () => {
        this.ended = true;
    };

    bufferToIndex(index: number) {
        console.log(`Buffer to ${index}`);
        return new Promise(resolve => {
            if (this.ended) {
                resolve();
                return;
            }

            const bufferedLines = this._data.length - index;

            if (bufferedLines > this.lowerBuffer) {
                resolve();
                return;
            }

            if (bufferedLines < this.lowerBuffer) {
                console.log('Resume Stream');
                this.mapStream.resume();
            }

            const onData = () => {
                console.log(`Buffered ${this._data.length} lines`);
                this.mapStream.off(BUFFERED_EVENT, onData);
                this.mapStream.off('end', onData);
                resolve();
            };

            this.mapStream.on(BUFFERED_EVENT, onData).on('end', onData);
        });
    }

    buffer() {
        return this.bufferToIndex(this._pointer);
    }

    async next() {
        await this.bufferToIndex(this._pointer);
        console.log('Next', this._pointer, this._data.length);
        return super.next();
    }

    async peek() {
        await this.bufferToIndex(this._pointer);
        console.log('Peek', this._pointer, this._data.length);
        return super.peek();
    }

    async hasNext() {
        return !this._eof;
    }
}
