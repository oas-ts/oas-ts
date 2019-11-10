import { Task } from '@ts-task/task';
import { map } from '@ts-task/task/dist/lib/src/operators';
import { arrOf, ContractOf } from 'parmenides';
import { NotFoundError } from './http-errors';
import { default as createRest, petContract } from './pet-spec';
import { tap } from './utils/task-utils/tap';


// TODO: maybe experiment with also adding a RegisterGet/RegisterPost helpers that register
// the route for you (probably at the expense of knowing if you registered them all)
// Could also add that as a warning in runtime from having the spec
const rest = createRest();

const ping = rest.get('/ping', treq => treq.map(_ => 'pong'));


const pets = arrOf(petContract)([{
    id: 1,
    name: 'Bobby',
    tag: 'crazy'
}, {
    id: 2,
    name: 'Manuelita',
    tag: 'slow'
}]);

type Pet = ContractOf<typeof petContract>;

// If the query has a filter, show the pets who have a tag
// in the list of tags
const byTag = (tags: string[] | undefined, pet: Pet) =>
    tags === undefined || pet.tag && tags.includes(pet.tag)
;

const listPets = rest.get('/pets', treq =>
    treq.pipe(
        tap(req => console.log('listPets query', req.query)),
        tap(req => console.log('listPets body', req.body)),
        // tap(req => console.log('listPets settimeout', req.setTimeout)),
        map(req =>
            pets
                // Filter and limit the request
                .filter(pet => byTag(req.query.tags, pet))
                .slice(0, req.query.limit)
        )
    )
);


const getPet = rest.get('/pets/{petId}', treq =>
    // TODO: refactor using pipe (tap, map, chain)
    treq.chain(req => {
        console.log('getPet {petId}', req.params.petId, typeof req.params.petId);

        const pet = pets.find(aPet => aPet.id === req.params.petId);

        if (!pet) {
            return Task.reject(new NotFoundError(`Pet with id ${req.params.petId} does not exist`));
        }
        return Task.resolve(pet);
    })
);
//     if (isNaN(req.params && req.params.petId)) {
//         return res.send(400, {
//             message: 'Invalid petId'
//         });
//     }
//
//     const pet = pets.find(aPet => aPet.id === Number(req.params.petId));
//
//     if (!pet) {
//         return res.send(404, {
//             message: `Pet with id ${req.params.id} does not exist`
//         });
//     }

//     res.send(pet);
// });

const createPet = rest.post('/pets', treq =>
    treq.pipe(
        // tap(req => console.log('createPet query', req.query)),
        // tap(req => console.log('createPet body', req.body)),
        // tap(req => console.log('createPet params', req.params)),
        map(req => ({...req.body, id: getLastPetId(pets) + 1})),
        tap(pet => pets.push(pet))
    )
);

// server.post('/pets', (req, res) => {
//     try {
//         const pet = {
//             ...newPetContract(req.body),
//             id: getLastPetId(pets) + 1
//         };
//         pets.push(pet);

//         res.send(pet);
//     }
//     catch (err) {
//         if (err instanceof ParmenidesError) {
//             res.send(400, {message: err.message});
//         }
//         else {
//             throw err;
//         }
//     }
// });

// Gets the head of an array or some default if there is no element
const safeHead = <T>(_default: T, arr: T[]) => arr[0] || _default;

const desc = (a: number, b: number) => b - a;

const getLastPetId = <T extends {id: number}>(pets: T[]) =>
    safeHead(
        0,
        pets
            .map(pet => pet.id)
            .sort(desc)
    )
;





rest.registerAllRoutes([
    ping,
    listPets,
    createPet,
    getPet
]);
