import { Task } from '@ts-task/task';
import { map } from '@ts-task/task/dist/lib/src/operators';
import { arrOf } from 'parmenides';
import { NotFoundError } from './http-errors';
import { default as createRest, petContract } from './pet-spec';
import { tap } from './utils/task-utils/tap';


// TODO: experiment with also adding a get/post helpers that register
// the route for you (probably at the expense of knowing if you registered them all)
// Could also add that as a warning in runtime from having the spec
const {createValidatedEndpoint, registerAllRoutes} = createRest();

const ping = createValidatedEndpoint('get', '/ping', treq => treq.map(_ => 'pong'));

const pets = arrOf(petContract)([{
    id: 1,
    name: 'Bobby',
    tag: 'crazy'
}, {
    id: 2,
    name: 'Manuelita',
    tag: 'slow'
}]);

const listPets = createValidatedEndpoint('get', '/pets', treq =>
    treq.pipe(
        tap(req => console.log('listPets query', req.query)),
        tap(req => console.log('listPets body', req.body)),
        // tap(req => console.log('listPets settimeout', req.setTimeout)),
        map(req =>
            pets
                // If the query has a filter, show the pets who have a tag
                // in the list of tags
                .filter(pet =>
                    req.query.tags === undefined || pet.tag && req.query.tags.includes(pet.tag))
                .slice(0, req.query.limit)
        )
    )
);


const getPet = createValidatedEndpoint('get', '/pets/{petId}', treq =>
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

const createPet = createValidatedEndpoint('post', '/pets', treq =>
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

const getLastPetId = <T extends {id: number}>(pets: T[]) =>
    pets
        .map(pet => pet.id)
        .sort((a, b) => b - a)
        [0] || 0
;





registerAllRoutes([
    ping,
    listPets,
    createPet,
    getPet
]);

