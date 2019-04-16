import { fetch } from '@ts-task/fetch';
import { Task } from '@ts-task/task';

export interface Stringable {
    toString (): string;
}

export type EndpointSpecOptions = {
    queryParams?: {
        [prop: string]: unknown;
    };
    pathParams?: {
        [prop: string]: Stringable;
    };
    body?: {
        contentType: string;
        data: {
            [prop: string]: unknown;
        }
    };
} | undefined;

export interface EndpointSpec {
    options: EndpointSpecOptions;

    responses: {
        code: number;
        json: unknown;
    };
}

interface EndpointSpecs {
    [path: string]: EndpointSpec;
}

export interface RestifyEndpoints {
    get: EndpointSpecs;
    post: EndpointSpecs;
    put: EndpointSpecs;
    delete: EndpointSpecs;
}

interface RestifyOptions {
    servers: string;
}

type Endpoint <Spec extends RestifyEndpoints, Method extends Methods>
    = <Route extends PossibleEndpoints<Spec, Method>> (url: Route, ...options: EndpointOptions<Spec, Method, Route>) => EndpointResponse<Spec, Method, Route>
;


function replacePath (path: string, options: EndpointSpecOptions) {
    // If we don't have options or pathParams, return as is
    if (!options || !options.pathParams) return path;

    // Get the indexes to replace
    const params = options.pathParams;
    const indexes = Object.keys(options.pathParams);

    // Replace each index with it's value
    return indexes.reduce(
        (path, index) => path.replace(`{${index}}`, params[index].toString()),
        path
    );
}

function normalizeBody (options: EndpointSpecOptions): BodyInit | null {
    if (!options || !options.body) return null;
    if (options.body.contentType === 'application/json') {
        return JSON.stringify(options.body.data);
    } else {
        throw new Error(`content type ${options.body.contentType} not implemented`);
    }
}

export function json <T> (data: T) {
    return {
        contentType: 'application/json' as 'application/json',
        data
    };
}

function normalizeHeaders (options: EndpointSpecOptions): HeadersInit {
    if (!options) return {};

    const contentType: Record<string, string> =
        options.body ? {'Content-Type': options.body.contentType} : {};

    return {
        ...contentType
    };
}

export function restify<Spec extends RestifyEndpoints> (restifyOptions: RestifyOptions) {
    function request (method: Methods) {
        return function (path: string, options: EndpointSpecOptions) {
            const url = restifyOptions.servers + replacePath(path, options);
            return fetch(url, {
                method,
                body: normalizeBody(options),
                headers: normalizeHeaders(options)
            }).chain(res => res.json());
        };

    }
    return {
        put: request('put') as Endpoint<Spec, 'put'>,
        get: request('get') as Endpoint<Spec, 'get'>,
        post: request('post') as Endpoint<Spec, 'post'>,
        delete: request('delete') as Endpoint<Spec, 'delete'>,
};
}

type Methods = 'get' | 'post' | 'put' | 'delete';

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
