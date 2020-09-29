import { IDxfScanner } from './DxfArrayScanner';
import DxfStreamScanner from './DxfStreamScanner';
import { Entity, Group } from './types';

export default abstract class EntityHandler {
    constructor() {}
    parseEntity: (scanner: IDxfScanner) => Promise<Entity>;
    static ForEntityName: string;
}

export interface IEntityHandler<T> {
    new (): T;
    ForEntityName: string;
}
