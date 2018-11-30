import { fetch } from '@ts-task/fetch';
import { Task } from '@ts-task/task';

interface RestifyEndpoints {
    get: any;
    post: any;
    put: any;
}

interface RestifyOptions {
    servers: string;
}

type Endpoint <Spec extends RestifyEndpoints, Method extends Methods>
    = <Route extends PossibleEndpoints<Spec, Method>> (url: Route, ...options: EndpointOptions<Spec, Method, Route>) => EndpointResponse<Spec, Method, Route>;

export function restify<Spec extends RestifyEndpoints> (restifyOptions: RestifyOptions) {
    function request (method: Methods) {
        return function (path: string, options: any) {
            // TODO: replace path
            const url = restifyOptions.servers + path;
            return fetch(url, {
                method
            }).chain(res => res.json());
        };

    }
    return {
        put: request('put') as Endpoint<Spec, 'put'>,
        get: request('get') as Endpoint<Spec, 'get'>,
        post: request('post') as Endpoint<Spec, 'post'>,
};
}

type Methods = 'get' | 'post' | 'put';

type EndpointResponse <
    Spec extends RestifyEndpoints,
    Method extends Methods,
    Route extends PossibleEndpoints<Spec, Method>
> = Task<Spec[Method][Route]['responses']['json'], TypeError>;

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
