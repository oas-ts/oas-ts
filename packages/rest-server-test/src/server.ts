import { Task, UnknownError } from '@ts-task/task';
import { caseError, isInstanceOf } from '@ts-task/utils';
import { Contract } from 'parmenides';
import { Request, Response, Server } from 'restify';
import * as restify from 'restify';
import { BadRequestError, HttpError } from './http-errors';
import { tryCatch } from './utils/task-utils/try-catch';
export type Methods = 'get' | 'post' | 'put';


export interface ValidatedRequest<SpecOptions extends EndpointSpecOptions> extends Request {
    /**
     * The parsed and validated query parameters. The ones that goes after the "?"
     */
    query: QueryParamsFromSpec<SpecOptions>;

    /**
     * The parsed and validated body
     */
    body: BodyFromSpec<SpecOptions>;

    /**
     * The validated url params. For example, if your url is: /pets/{petId}, then you'd have a petId url
     * param.
     */
    params: ParamsFromSpec<SpecOptions>;
}

type EndpointResponse <
    Spec extends ServerSpec,
    Method extends Methods,
    Route extends PossibleEndpoints<Spec, Method>
> = Task<Spec[Method][Route]['responses']['success']['json'], Spec[Method][Route]['responses']['error']['json'] | UnknownError>;


export interface RouteDefinition
    < Spec extends ServerSpec
    , Verb extends Methods
    , Route extends PossibleEndpoints<Spec, Verb>
    > {
        verb: Verb;
        // TODO: Ver si llamar al ultimo Route o Path
        route: Route;
        handler: (req: Request) => EndpointResponse<Spec, Verb, Route>;
}




interface Stringable {
    toString (): string;
}

type QueryParamsFromSpec <SpecOptions extends EndpointSpecOptions> =
    SpecOptions['queryParams'] extends object
        ? SpecOptions['queryParams']
        : {}
;

type BodyFromSpec <SpecOptions extends EndpointSpecOptions> =
    SpecOptions['body'] extends object
        ? SpecOptions['body']['data']
        : {}
;

type ParamsFromSpec <SpecOptions extends EndpointSpecOptions> =
    SpecOptions['pathParams'] extends object
        ? SpecOptions['pathParams']
        : {}
;


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
};

export interface EndpointSpec {
    options: EndpointSpecOptions;

    responses: {
        success: {
            code: number;
            json: unknown;
        };
        error: {
            code: number;
            json: unknown;
        };
    };
}

interface EndpointSpecs {
    [path: string]: EndpointSpec;
}

interface ServerSpec {
    get: EndpointSpecs;
    post: EndpointSpecs;
    put: EndpointSpecs;
    delete: EndpointSpecs;
}


type PossibleEndpoints <
    Spec extends ServerSpec,
    Method extends Methods
> =
    keyof Spec[Method]
;


type Unbox<A extends any[]> = A extends Array<infer C> ? C : never;


export interface MissingRoutes<R> {
    You_are_missing_a_route_definition: R;
}

export interface ExtraRoutes<R> {
    You_have_extra_methods: R;
}

type ExpectAllRoutes<ProvidedRoutes, AllRoutes> =
    Exclude<ProvidedRoutes, AllRoutes> extends never
        ? Exclude<AllRoutes, ProvidedRoutes> extends never
            ? ProvidedRoutes
            : MissingRoutes<Exclude<AllRoutes, ProvidedRoutes>>
        : ExtraRoutes<Exclude <ProvidedRoutes, AllRoutes>>
;

type RouteContracts = {
    queryParams: Contract<any>;
    pathParams: Contract<any>;
    body: Contract<any>;
};

type ServerContracts = {
    get: {
        [route: string]: RouteContracts
    };
    post: {
        [route: string]: RouteContracts
    };
    put: {
        [route: string]: RouteContracts
    };
};

function configureDefaultServer () {
    const server = restify.createServer();
    server.use(restify.plugins.bodyParser());
    server.use(restify.plugins.queryParser());

    // TODO: SUPER HARDCODED
    console.log('Starting test server');
    server.listen(3000, function () {
        console.log('%s listening at %s', server.name, server.url);
    });
    return server;
}

function sanitizeRoute (route: string) {
    return route.replace(/\{\w+\}/g, (str: string) => ':' + str.slice(1, -1));
}

export function createServerSomething<Spec extends ServerSpec, AllRoutes extends RouteDefinition<any, any, any>> (validation: ServerContracts) {

    return function (_server?: Server) {
        const server = _server ? _server : configureDefaultServer();

        function registerRoute <Verb extends Methods, Route extends PossibleEndpoints<Spec, Verb> & string> (definition: RouteDefinition<Spec, Verb, Route>) {
            server[definition.verb].call(server, sanitizeRoute(definition.route), (req: Request, res: Response) => {
                definition.handler(req)
                    .catch(caseError(
                        isInstanceOf(HttpError),
                        err => Task.resolve(err)
                    ))
                    .fork(
                        err => {
                            console.error(err);
                            res.send(500, {
                                message: 'Oh snaps'
                            });
                        },
                        val => {
                            if (val instanceof HttpError) {
                                res.send(val.statusCode, val.body);
                            }
                            else {
                                res.send(val);
                            }
                        }
                    );
            });
        }


        // function registerAllRoutes <Endpoints extends RouteDefinition<any, any, any>> (routesDefinitions: Endpoints[], ...missingRoutes: CalculateMissingEndpoints<AllRoutes, Endpoints>) {
        function registerAllRoutes <Endpoints extends RouteDefinition<any, any, any>> (routesDefinitions: ExpectAllRoutes<Endpoints, AllRoutes>[]) {
            routesDefinitions.forEach(definition => registerRoute(definition as Endpoints));
        }

        function validateRequest <Spec extends EndpointSpec> (contracts: RouteContracts, req: Request): Task<ValidatedRequest<Spec['options']>, BadRequestError | UnknownError> {
            return Task.resolve(req).pipe(
                tryCatch(
                    req => Object.assign(
                        Object.create(Object.getPrototypeOf(req)),
                        req,
                        {
                            // TODO: improve error handling: How the error reads, having multiple errors
                            // at the same time, being able to say wheter is in the params, body or query
                            query: contracts.queryParams(req.query),
                            params: contracts.pathParams(req.params),
                            body: contracts.body(req.body)
                        }
                    ),
                    err => new BadRequestError(err.message)
                )
            );
        }

        type RequestHandler<
            Spec extends ServerSpec,
            Method extends Methods,
            Route extends PossibleEndpoints<Spec, Method>
        > =
            (req: Task<ValidatedRequest<Spec[Method][Route]['options']>, BadRequestError | UnknownError>) => EndpointResponse<Spec, Method, Route>
        ;
        function createValidatedEndpoint <M extends Methods, R extends PossibleEndpoints<Spec, M>> (method: M, route: R, cb: RequestHandler<Spec, M, R>): RouteDefinition<Spec, M, R> {
            return {
                verb: method,
                route,
                handler: (req: Request) => cb(validateRequest(validation[method][route as string], req))
            };
        }

        function get <R extends PossibleEndpoints<Spec, 'get'>> (route: R, handler: RequestHandler<Spec, 'get', R>): RouteDefinition<Spec, 'get', R> {
            return createValidatedEndpoint('get', route, handler);
        }

        function post <R extends PossibleEndpoints<Spec, 'post'>> (route: R, handler: RequestHandler<Spec, 'post', R>): RouteDefinition<Spec, 'post', R> {
            return createValidatedEndpoint('post', route, handler);
        }

        return {
            registerRoute,
            post,
            get,
            registerAllRoutes
        };
    };
}


