import rest from './pet-spec';


const pets = rest.get('/pets', {
    queryParams: {
        limit: 20,
        tags: ['lazy']
    }
});

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
