
interface RestifyEndpoints {
    get: any;
    post: any;
}

interface PetsEndpoints {
    get: {
        '/pets': 'lista pets',
        '/pets/{petId}': {
            queryParams: {
                'petId': number
            }
        }
    };
    post: {
        '/pets': {
            body: {
                id: number;
                name: string;
            }
        }
    };
}
const rest = restify<PetsEndpoints>();

type RestifyResponse = unknown;

function restify<T extends RestifyEndpoints> () {
    return {
        get: (url: PossibleEndpoints<T, 'get'>, options?: any): RestifyResponse => 'hola',
        post: (url: PossibleEndpoints<T, 'post'>, options?: any): RestifyResponse => 'hola',
    };
}

type Methods = 'get' | 'post';

type PossibleEndpoints <Spec extends RestifyEndpoints, Method extends Methods> =
    keyof Spec[Method];


// /pets
// /pets/{petId}
rest.get('/pets');
rest.get('/pets/{petId}', {
    params: {
        petId: 28
    }
});

rest.post('/pets');

// rest.get('buu');