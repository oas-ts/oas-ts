import { map } from "@ts-task/task/dist/lib/src/operators";

// If I want to implement tap this way there is a weird runtime error
// where the only implemented method is fork. I think the problem is with the prototype
// const tap = <T>(fn: (val: T) => any) =>
//     <E> (task: Task<T, E>) =>
//         task.map(val => {fn(val); return val;})

export const tap = <T>(fn: (val: T) => any) =>
    map((val: T) => {
        fn(val);
        return val;
    })
;