import Scanner from '../lib/DxfArrayScanner';

describe('Scanner', () => {
    describe('.hasNext()', () => {
        it('should return false when the array is empty', async () => {
            const scanner = new Scanner([]);
            await expect(scanner.hasNext()).resolves.toEqual(false);
        });

        it('should return false when the array has length 1', async () => {
            const scanner = new Scanner(['1']);
            await expect(scanner.hasNext()).resolves.toEqual(false);
        });

        it('should return true when the array has length 2', async () => {
            const scanner = new Scanner(['1', '2']);
            await expect(scanner.hasNext()).resolves.toEqual(true);
        });

        it('should return false when the array has length 4 and pointer is on the last element', async () => {
            const scanner = new Scanner(['1', '2', '3', '4']);
            scanner._pointer = scanner._data.length - 1;
            await expect(scanner.hasNext()).resolves.toEqual(false);
        });

        it('should return true when the array has length 4 and pointer is on the second-to-last element', async () => {
            const scanner = new Scanner(['1', '2', '3', '4']);
            scanner._pointer = scanner._data.length - 2;
            await expect(scanner.hasNext()).resolves.toEqual(true);
        });
    });

    describe('.next()', () => {
        it('should throw an error when the array is empty', () => {
            const scanner = new Scanner([]);
            expect(scanner.next()).rejects.toMatchObject({
                message: expect.stringMatching(/Unexpected end of input/),
            });
        });
        it('should throw an error when the array has only 1 element', () => {
            const scanner = new Scanner(['1']);
            expect(scanner.next()).rejects.toMatchObject({
                message: expect.stringMatching(/Unexpected end of input/),
            });
        });
        it('should throw an error when next is called and eof has already been read', () => {
            const scanner = new Scanner(['1', '2']);
            scanner._eof = true;
            expect(scanner.next()).rejects.toMatchObject({
                message: expect.stringMatching(
                    /Cannot call \'next\' after EOF/
                ),
            });
        });
        it('should return the 1st and 2nd index as the code and value respectively', async () => {
            const scanner = new Scanner(['1', '2']);
            const result = await scanner.next();
            expect(result).toEqual({ code: 1, value: '2' });
        });
        it('should set _eof to true when EOF code-value pair is read', async () => {
            const scanner = new Scanner(['0', 'EOF']);
            await scanner.next();
            expect(scanner._eof).toEqual(true);
        });
        it('should increment the pointer by 2', async () => {
            const scanner = new Scanner(['1', '2']);
            await scanner.next();
            expect(scanner._pointer).toEqual(2);
        });
    });
    describe('.isEOF()', () => {
        it('should be true when _eof is true', async () => {
            const scanner = new Scanner(['0', 'EOF']);
            scanner._eof = true;
            expect(scanner.isEOF()).toEqual(true);
        });
    });
});
