import { ParmenidesOneOfError } from 'parmenides';
// PR: Relaxed the x constraint to be any. In newer TS versions the cli parser errors because an infer problem
/**
 * Takes literal values (strings, numbers or booleans) and returns a Contract to any of those values.
 * Example: `oneOf('yes', 'no')` will return a Contract that matches against "yes" and "no" values.
 * For contracts to single literal values, see `lit`.
 * @param validValues Expected literal values (it's a variadic function).
 * @returns Contract that matches against any of the expected literal values.
 */
export const oneOf = <T extends string | number | boolean> (...validValues: T[]) => {
	return (x: any) => {
		if (!validValues.includes(x)) {
			throw new ParmenidesOneOfError(validValues, x);
		}
		return x;
	};
};