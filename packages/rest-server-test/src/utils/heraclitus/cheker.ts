export type IChecker <T> = (x: any) => T;

export type IMapOfCheckers <T> = {
    [P in keyof T]: IChecker<T[P]>;
};
