import { ParmenidesError } from "parmenides";

export const numberLike = (ret: number | boolean | string | Date) => {
    if (isNaN(ret as number) || Array.isArray(ret) || ret === null) {
        throw new ParmenidesLike(
            `The value is not numeric (has "${(
                ret
            )}" value)`
        );
    }
    return Number(ret);
};

export class ParmenidesLike extends ParmenidesError {
    /**
     * @constructor
     * @param expectedType the expected type.
     * @param actualValue the unexpected value that was received.
     */
    constructor(public message: string) {
        super(message);
    };
}
