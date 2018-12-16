import { dependencies } from '@ts-task/fetch';
import rest from './pet-spec';
import { json } from './restify';
// Set node-fetch as a way to fetch in task-fetch
dependencies.fetch = require('node-fetch');

rest.get('/pets/{petId}', {
    pathParams: {
        petId: 1
    }
}).fork(
    err => console.log('/pets/{petId} Oh noo', err.message),
    data => console.log('/pets/{petId} Ehhhh....', data)
);

const ping = rest.get('/ping');

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
        err => console.log('post and get error:', err.message),
        data => console.log('post and get success:', data)
);
