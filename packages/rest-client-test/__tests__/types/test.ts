import { json } from '@oas-ts/rest-client';
import { dependencies } from '@ts-task/fetch';
import { Task } from '@ts-task/task';
import rest from '../../src/pet-spec';

rest.get('/ping').map(x => {
    // TODO: this should be an object closer to fetch response, with header information and whatnot
    // The error should only be present in the catch
    // $ExpectType Pet | UnknownResponseError
    x;
}).catch(err => {
    // TypeError | UnknownError :/
    err;
    return Task.reject(err);
});

rest.get('/pets/{petId}', {
    pathParams: {
        petId: 2
    }
}).map(x => {
    // TODO: this should be an object closer to fetch response, with header information and whatnot
    // The error should only be present in the catch
    // $ExpectType Pet | UnknownResponseError
    x;
});