interface RestifyEndpoints {
    get: any;
    post: any;
    put: any;
}

interface NewPet {
    name: string;
    tag?: string;
}

interface Pet {
    id: number;
    name: string;
    tag?: string;
}

interface PetsEndpoints {
    put: {
        '/ping': {
            options: undefined
        }
    };
    get: {
        '/pets': {
            options: {
                queryParams: {
                    /** How many items to return at one time (max 100) */
                    limit?: number,
                    /** Tags to filter by */
                    tags?: string[];
                }
            }
        },
        '/pets/{petId}': {
            options: {
                pathParams: {
                    /** The id of the pet to retrieve */
                    'petId': number
                }
            }
        },
        '/ping': {
            options: undefined
        }

    };
    post: {
        '/pets': {
            options: {
                requestBody: NewPet
            }
        }
    };
}

const rest = restify<PetsEndpoints>();

type RestifyResponse = unknown;


function restify<T extends RestifyEndpoints> () {
    return {
        put: <Route extends PossibleEndpoints<T, 'put'>> (url: Route, ...options: EndpointOptions<T, 'put', Route>): RestifyResponse => 'hola',
        get : <Route extends PossibleEndpoints<T, 'get'>> (url: Route, ...options: EndpointOptions<T, 'get', Route>): RestifyResponse => 'hola',
        post : <Route extends PossibleEndpoints<T, 'post'>> (url: Route, ...options: EndpointOptions<T, 'post', Route>): RestifyResponse => 'hola'
    };
}

type Methods = 'get' | 'post' | 'put';

type PossibleEndpoints <
    Spec extends RestifyEndpoints,
    Method extends Methods
> =
    keyof Spec[Method]
;

type EndpointOptions <
    Spec extends RestifyEndpoints,
    Method extends Methods,
    Route extends PossibleEndpoints<Spec, Method>
> =
    Spec[Method][Route]['options'] extends undefined
        ? [undefined?]
        : [Spec[Method][Route]['options']]
;

// /pets
// /pets/{petId}

rest.get('/pets', {
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

rest.get('/ping');
rest.put('/ping');

rest.post('/pets', {
    requestBody: {
        name: 'vilma'
    }
});
