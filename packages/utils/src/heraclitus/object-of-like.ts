import { obj } from 'parmenides';
import { IMapOfCheckers } from './cheker';


/**
 * It is similar to `objOf` from parmenides, but instead of returning
 * the same object that is validated, returns a mapped object (mapped with the checker
 * functions).
 */
export const objectOfLike = <T> (checkersMap: IMapOfCheckers<T>) => {
    // Assert the map checkers is an object.
    obj(checkersMap);

    return (target: any) => {
        const ret: any = {};
        // Assert the target is an object
        obj(target);

        // Validate each key, and store it's mapped value
        for (const aKey in checkersMap) {
            const aChecker = checkersMap[aKey];
            const aTargetValue = target[aKey];
            try {
                ret[aKey] = aChecker(aTargetValue);
            } catch (e) {
                if (e instanceof TypeError) {
                    throw new TypeError(`[${aKey}]: ${e.message}`);
                }
                throw e;
            }
        }
        // Return the object with all the mapped values
        return ret as T;
    };
};