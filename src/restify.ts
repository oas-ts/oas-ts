interface RestifyEndpoints {
    get: any;
    post: any;
    put: any;
}

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
