import { json } from '@oas-ts/rest-client';
import { dependencies } from '@ts-task/fetch';
import { Task } from '@ts-task/task';
import rest from '../../src/pet-spec';

// Ping doesnt expect a second parameter
// $ExpectError
rest.get('/ping', {});

// /pets/{petId} needs to provide a petId
// $ExpectError
rest.get('/pets/{petId}');