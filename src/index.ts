
interface RestifyEndpoints {
    get: any;
    post: any;
}

interface PetsEndpoints {
    get: {
        '/pets': {
            queryParams: {
                // How many items to return at one time (max 100)
                limit?: number
            }
        },
        '/pets/{petId}': {
            pathParams: {
                /** The id of the pet to retrieve */
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
        get: <Route extends PossibleEndpoints<T, 'get'>> (url: Route, options?: EnpointOptions<T, 'get', Route>): RestifyResponse => 'hola',
        post: (url: PossibleEndpoints<T, 'post'>, options?: any): RestifyResponse => 'hola',
    };
}

type Methods = 'get' | 'post';

type PossibleEndpoints <Spec extends RestifyEndpoints, Method extends Methods> =
    keyof Spec[Method];

type EnpointOptions <Spec extends RestifyEndpoints, Method extends Methods, Route extends PossibleEndpoints<Spec, Method>> =
    Spec[Method][Route];

// /pets
// /pets/{petId}
rest.get('/pets', {
    queryParams: {

    }
});
rest.get('/pets/{petId}', {
    pathParams: {
        petId: 28
    }
});

rest.post('/pets');

// rest.get('buu');