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

interface UnknownResponseError {
    code: number;
    message: string;
}

interface PetsEndpoints {
    put: {

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
            },
            responses: {
                code: 200;
                json: Pet[];
            } | {
                code: number;
                json: UnknownResponseError
            }
        },
        '/pets/{petId}': {
            options: {
                pathParams: {
                    /** The id of the pet to retrieve */
                    'petId': number
                }
            },
            responses: {
                code: 200;
                json: Pet;
            } | {
                code: number;
                json: UnknownResponseError
            }
        },
        '/ping': {
            options: undefined,
            responses: {
                code: 200;
                json: Pet;
            } | {
                code: number;
                json: UnknownResponseError
            }

        }

    };
    post: {
        '/pets': {
            options: {
                requestBody: NewPet
            },
            responses: {
                code: 200;
                json: Pet;
            } | {
                code: number;
                json: UnknownResponseError
            }
        }
    };
}

const rest = restify<PetsEndpoints>();

function restify<Spec extends RestifyEndpoints> () {
    return {
        put: <Route extends PossibleEndpoints<Spec, 'put'>> (url: Route, ...options: EndpointOptions<Spec, 'put', Route>): EndpointResponse<Spec, 'put', Route> => 'hola',
        get: <Route extends PossibleEndpoints<Spec, 'get'>> (url: Route, ...options: EndpointOptions<Spec, 'get', Route>): EndpointResponse<Spec, 'get', Route> => 'hola',
        post: <Route extends PossibleEndpoints<Spec, 'post'>> (url: Route, ...options: EndpointOptions<Spec, 'post', Route>): EndpointResponse<Spec, 'post', Route> => 'hola'
    };
}

type Methods = 'get' | 'post' | 'put';

type EndpointResponse <
    Spec extends RestifyEndpoints,
    Method extends Methods,
    Route extends PossibleEndpoints<Spec, Method>
> = Spec[Method][Route]['responses'];

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
