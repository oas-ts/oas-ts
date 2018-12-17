import { json } from '@oas-ts/rest';
import { dependencies } from '@ts-task/fetch';
import rest from '../../src/pet-spec';

rest.get('/ping').map(x => {
    // $ExpectType Pet | UnknownResponseError
    x;
});
