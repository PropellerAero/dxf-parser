import AUTO_CAD_COLOR_INDEX from './AutoCadColorIndex';
import { IDxfScanner } from './DxfArrayScanner';
import { BaseEntity, Group, Point } from './types';

/**
 * Returns the truecolor value of the given AutoCad color index value
 */
export const getAcadColor = (index: number) => {
    return AUTO_CAD_COLOR_INDEX[index];
};

/**
 * Parses the 2D or 3D coordinate, vector, or point. When complete,
 * the scanner remains on the last group of the coordinate.
 */
export const parsePoint = async (scanner: IDxfScanner) => {
    const point: Point = {};

    // Reread group for the first coordinate
    scanner.rewind();
    var curr = await scanner.next();

    let code = curr.code;
    point.x = curr.value as number;

    code += 10;
    curr = await scanner.next();
    if (curr.code != code) {
        throw new Error(
            'Expected code for point value to be ' +
                code +
                ' but got ' +
                curr.code +
                '.'
        );
    }
    point.y = curr.value as number;

    code += 10;
    curr = await scanner.next();
    if (curr.code != code) {
        // Only the x and y are specified. Don't read z.
        scanner.rewind(); // Let the calling code advance off the point
        return point;
    }
    point.z = curr.value as number;

    return point;
};

/**
 * Parses the 2D or 3D coordinate, vector, or point. When complete,
 * the scanner remains on the last group of the coordinate.
 */
export const parseMeshFaceIndices = async (scanner: IDxfScanner) => {
    const faces: Array<Array<number>> = [];

    // Reread group for the face count
    scanner.rewind();
    let curr = await scanner.next();
    const faceCount = curr.value as number;

    for (let i = 0; i < faceCount; i++) {
        curr = await scanner.next();
        if (curr.code !== 90) break;

        const indexCount = curr.value;

        if (!indexCount) continue;

        const indices: Array<number> = [];
        for (let u = 0; u < indexCount; u++) {
            curr = await scanner.next();
            indices.push(curr.value as number);
        }
        faces.push(indices);
    }
    scanner.rewind();
    return faces;
};

/**
 * Attempts to parse codes common to all entities. Returns true if the group
 * was handled by this function.
 */
export const checkCommonEntityProperties = (
    entity: BaseEntity,
    curr: Group
) => {
    switch (curr.code) {
        case 0:
            entity.type = curr.value as string;
            break;
        case 5:
            entity.handle = curr.value as number;
            break;
        case 6:
            entity.lineType = curr.value as number;
            break;
        case 8: // Layer name
            entity.layer = curr.value as string;
            break;
        case 48:
            entity.lineTypeScale = curr.value as number;
            break;
        case 60:
            entity.visible = curr.value === 0;
            break;
        case 62: // Acad Index Color. 0 inherits ByBlock. 256 inherits ByLayer. Default is bylayer
            entity.colorIndex = curr.value as number;
            entity.color = getAcadColor(Math.abs(curr.value as number));
            break;
        case 67:
            entity.inPaperSpace = curr.value !== 0;
            break;
        case 100:
            //ignore
            break;
        case 330:
            entity.ownerHandle = curr.value as number;
            break;
        case 347:
            entity.materialObjectHandle = curr.value as number;
            break;
        case 370:
            //From https://www.woutware.com/Forum/Topic/955/lineweight?returnUrl=%2FForum%2FUserPosts%3FuserId%3D478262319
            // An integer representing 100th of mm, must be one of the following values:
            // 0, 5, 9, 13, 15, 18, 20, 25, 30, 35, 40, 50, 53, 60, 70, 80, 90, 100, 106, 120, 140, 158, 200, 211.
            // -3 = STANDARD, -2 = BYLAYER, -1 = BYBLOCK
            entity.lineweight = curr.value as number;
            break;
        case 420: // TrueColor Color
            entity.color = curr.value as number;
            break;
        case 1000:
            entity.extendedData = entity.extendedData || {};
            entity.extendedData.customStrings =
                entity.extendedData.customStrings || [];
            entity.extendedData.customStrings.push(curr.value);
            break;
        case 1001:
            entity.extendedData = entity.extendedData || {};
            entity.extendedData.applicationName = curr.value;
            break;
        default:
            return false;
    }
    return true;
};
