/* eslint-disable no-underscore-dangle */
import { split, MapStream } from 'event-stream';
import { Readable } from 'stream';
import * as log from 'loglevel';
import DxfArrayScanner, { IDxfScanner } from './DxfArrayScanner';

// log.setLevel(log.levels.INFO);

const BUFFERED_EVENT = 'buffered';

export default class DxfStreamScanner
    extends DxfArrayScanner
    implements IDxfScanner {
    ended: boolean;
    bufferSize: number;
    upperBuffer: number;
    lowerBuffer: number;
    stream: Readable;
    mapStream: MapStream;

    constructor(stream: Readable, bufferSize: number = 1000) {
        super([]);
        this._data = [];
        this._pointer = 0;
        this.bufferSize = bufferSize;
        this.upperBuffer = 0.5 * bufferSize;
        this.lowerBuffer = 0.25 * bufferSize;
        this.stream = stream;
        this.mapStream = stream
            .pipe(split())
            .on('data', this.onData)
            .on('end', this.onEnd);
    }

    onData = (data: string) => {
        this._data.push(data);
        if (
            this._data.length >= this.bufferSize &&
            this._pointer > this.lowerBuffer
        ) {
            this._data.shift();
            this._pointer--;
        }

        const bufferedLines = this._data.length - this._pointer;
        if (bufferedLines > this.lowerBuffer) {
            this.mapStream.emit(BUFFERED_EVENT);
        }
    };

    onEnd = () => {
        this.ended = true;
    };

    bufferToIndex(index: number) {
        return new Promise(resolve => {
            if (this.ended) {
                resolve();
                return;
            }

            const bufferedLines = this._data.length - index;
            log.info('Buffer Size', index, this._data.length, bufferedLines);

            if (bufferedLines >= this.upperBuffer) {
                if (!this.stream.isPaused()) {
                    log.info('Pause stream', this._pointer, this._data.length);
                    this.stream.pause();
                }
                resolve();
                return;
            }

            if (bufferedLines > this.lowerBuffer) {
                if (this.stream.isPaused()) {
                    log.info('Resume Stream');
                    this.stream.resume();
                }
                resolve();
                return;
            }

            // if (bufferedLines < this.lowerBuffer) {
            //     log.info('Resume Stream');
            //     // this.stream.resume();
            //     this.resumeData();
            // }

            log.info(`Buffering to ${index} from ${this._data.length}`);
            const onData = () => {
                if (this._data.length > index) {
                    log.info(`Buffered to ${this._data.length} lines`);
                    this.mapStream.off(BUFFERED_EVENT, onData);
                    this.mapStream.off('end', onData);
                    resolve();
                }
            };

            this.mapStream.on(BUFFERED_EVENT, onData).on('end', onData);
        });
    }

    buffer() {
        return this.bufferToIndex(this._pointer);
    }

    async next() {
        log.info('Next', this._pointer, this._data.length, this.lastReadGroup);
        await this.bufferToIndex(this._pointer + 1);
        return super.next();
    }

    async peek() {
        log.info('Peek', this._pointer, this._data.length);
        await this.bufferToIndex(this._pointer + 1);
        return super.peek();
    }

    async hasNext() {
        return !this._eof;
    }
}
