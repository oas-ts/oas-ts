import { json } from '@oas-ts/rest-client';
import { dependencies } from '@ts-task/fetch';
import rest, { Pet } from './pet-spec';

// Set node-fetch as a provider to fetch in @ts-task/fetch
// this is only needed when using from node
dependencies.fetch = require('node-fetch');

const showPet = (pet: Pet) =>
    `Pet (id: ${pet.id}, name: ${pet.name}` + (pet.tag ? `, tag: ${pet.tag})` : ')');

rest.get('/pets/{petId}', {
    pathParams: {
        // TODO: fix NotFound
        petId: 10
    }
}).fork(
    err => console.log('/pets/{petId} Oh noo', err),
    data => console.log('/pets/{petId} Yuppie:', showPet(data))
);

const ping = rest.get('/ping');

const showPets = (pets: Pet[]) =>
    '[\n' +
    pets.reduce((str, pet) => `${str}\t${showPet(pet)}\n`, '') +
    ']';

rest.post('/pets', {
        body: json({
            name: 'vilma'
        })
    })
    .map(res => console.log('post', res))
    .chain(
        _ => rest.get('/pets', {
            queryParams: {
                limit: 20,
                tags: ['lazy']
            }
        })
    )
    .fork(
        err => console.log('post and get error:', err),
        data => console.log('post and get success:', showPets(data))
);
