import { arrOf, Contract, num, optional, ParmenidesError, str, strictObjOf } from 'parmenides';
import { createServer, plugins } from 'restify';

const petContract = strictObjOf({
    id: num,
    name: str,
    tag: optional(str)
});

const newPetContract = strictObjOf({
    name: str,
    tag: optional(str)
});

const server = createServer();
server.use(plugins.bodyParser());

server.get('/pets', (_req, res) => {
    res.send(pets);
});

server.get('/pets/:petId', (req, res) => {
    if (isNaN(req.params && req.params.petId)) {
        return res.send(400, {
            message: 'Invalid petId'
        });
    }

    const pet = pets.find(aPet => aPet.id === Number(req.params.petId));

    if (!pet) {
        return res.send(404, {
            message: `Pet with id ${req.params.id} does not exist`
        });
    }

    res.send(pet);
});

server.get('/ping', (_req, res) => {
    res.send({});
});

server.post('/pets', (req, res) => {
    try {
        const pet = {
            ...newPetContract(req.body),
            id: getLastPetId(pets) + 1
        };
        pets.push(pet);

        res.send(pet);
    }
    catch (err) {
        if (err instanceof ParmenidesError) {
            res.send(400, {message: err.message});
        }
        else {
            throw err;
        }
    }
});

const getLastPetId = <T extends {id: number}>(pets: T[]) =>
    pets
        .map(pet => pet.id)
        .sort((a, b) => b - a)
        [0] || 0
;

const pets = arrOf(petContract)([{
    id: 1,
    name: 'Bobby',
    tag: 'crazy'
}, {
    id: 2,
    name: 'Manuelita',
    tag: 'slow'
}]);

console.log('Starting test server');

server.listen(3000, function () {
  console.log('%s listening at %s', server.name, server.url);
});