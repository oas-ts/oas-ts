import { dependencies } from '@ts-task/fetch';
import rest from './pet-spec';
// Set node-fetch as a way to fetch in task-fetch
dependencies.fetch = require('node-fetch');

const pets = rest.get('/pets', {
    queryParams: {
        limit: 20,
        tags: ['lazy']
    }
});

pets.fork(
    err => console.log('Oh noo', err.message),
    data => console.log('Ehhhh....', data)
);

rest.get('/pets/{petId}', {
    pathParams: {
        petId: 28
    }
});

const ping = rest.get('/ping');

rest.post('/pets', {
    requestBody: {
        name: 'vilma'
    }
});
