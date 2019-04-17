import { arrOf, Contract } from "parmenides";

export const arrOrSingleObjectOf = <T>(contract: Contract<T>) =>
    (val: T | T[]): T[] => {
        if (Array.isArray(val)) {
            return arrOf(contract)(val);
        } else {
            return [contract(val)]
        }
    }
;