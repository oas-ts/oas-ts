import { readFile } from '@ts-task/fs';
import { Task } from '@ts-task/task';
import { anything, arrOf, bool, ContractOf, dictionaryOf, lit, objOf, oneOf, optional, str, union } from 'parmenides';
import { join } from 'path';

class InvalidApiSpec {
    constructor (public err: Error) {

    }

    inspect () {
        return this.err.message;
    }
}

const parameterContract = objOf({
    name: str,
    in: oneOf('path', 'query', 'header', 'cookie'),
    description: optional(str),
    required: optional(bool), // TODO: the spec contains what it could be a discriminated union https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#parameterObject
    deprecated: optional(bool),
    allowEmptyValue: optional(bool),

    // TODO: should do discriminated union also for schema/style and content (cant have both defined)
    style: optional(str),
    explode: optional(bool),
    allowReserved: optional(bool),
    schema: anything, // TODO: Me quedé aca!!!!
    example: anything,
    examples: anything,

    content: anything
});

interface ParameterObject extends ContractOf<typeof parameterContract> {
}

const referenceObject = objOf({
    $ref: str
});

interface ReferenceObject extends ContractOf<typeof referenceObject> {
}


const operationContract = objOf({
    tags: optional(arrOf(str)),
    summary: optional(str),
    description: optional(str),
    // externalDocs: TODO
    operationId: optional(str),
    parameters: optional(arrOf(union(parameterContract, referenceObject))),
    requestBody: optional(objOf({
        description: str,
        required: bool,
        content: dictionaryOf(anything)
    })),
    responses: dictionaryOf(objOf({
        description: str,
        content: anything
    }))
});

interface OperationObject extends ContractOf<typeof operationContract> {
    parameters: Array<ParameterObject | ReferenceObject> | undefined;
}


// done
const contactContract = objOf({
    name: optional(str),
    email: optional(str),
    url: optional(str)
});

interface ContactObject extends ContractOf<typeof contactContract> {
}

// done
const licenseContract = objOf({
    name: str,
    url: optional(str)
});

interface LicenseObject extends ContractOf<typeof licenseContract> {
}

// done
const infoContract = objOf({
    version: str,
    title: str,
    description: optional(str),
    termsOfService: optional(str),
    contact: optional(contactContract),
    license: optional(licenseContract)
});

interface InfoObject extends ContractOf<typeof infoContract> {
    contact: ContactObject | undefined;
    license: LicenseObject | undefined;

}

// done
const serverVariableContract = objOf({
    enum: optional(arrOf(str)),
    default: str,
    description: optional(str)
});

interface ServerVariableObject extends ContractOf<typeof serverVariableContract> {
}

// done
const serverContract = objOf({
    url: str,
    description: optional(str),
    variables: optional(dictionaryOf(serverVariableContract))
});

interface ServerObject extends ContractOf<typeof serverContract> {
    variables: Record<string, ServerVariableObject> | undefined;
}

const pathItemContract = objOf({
    $ref: optional(str),
    summary: optional(str),
    description: optional(str),
    get: optional(operationContract),
    put: optional(operationContract),
    post: optional(operationContract),
    delete: optional(operationContract),
    options: optional(operationContract),
    head: optional(operationContract),
    patch: optional(operationContract),
    trace: optional(operationContract),
    servers: optional(arrOf(serverContract)),
    // parameters TODO
});
interface PathItemObject extends ContractOf<typeof pathItemContract> {
    get: OperationObject | undefined;
    put: OperationObject | undefined;
    post: OperationObject | undefined;
    delete: OperationObject | undefined;
    options: OperationObject | undefined;
    head: OperationObject | undefined;
    patch: OperationObject | undefined;
    trace: OperationObject | undefined;
    servers: ServerObject[] | undefined;
}

export const specContract = objOf({
    /**
     * Aca no pasa nada
     */
    openapi: lit('3.0.0'),
    info: infoContract,
    servers: optional(arrOf(serverContract)),
    paths: dictionaryOf(pathItemContract)
    // components
    // security
    // tags
    // externalDocs
});

/**
 * This is the root document object of the OpenAPI document.
 */
interface OpenAPI extends ContractOf<typeof specContract> {

    /**
     * This string MUST be the semantic version number of the OpenAPI Specification version that the OpenAPI document uses.
     * The openapi field SHOULD be used by tooling specifications and clients to interpret the OpenAPI document.
     * This is not related to the API info.version string.
     */
    openapi: '3.0.0';

    /**
     * Provides metadata about the API. The metadata MAY be used by tooling as required.
     */
    info: InfoObject;
    servers: ServerObject[] | undefined;
    paths: Record<string, PathItemObject>;
}

type Verb = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';
const verbs = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as Verb[];

/**
 * Calls each route of the spec with a callback and return an array of the result
 * @param spec An OpenAPI specification
 * @param cb A function to call with the route information
 */
export function mapEachRoute<T> (spec: OpenAPI, cb: (url: string, verb: Verb, op: OperationObject) => T): T[] {
    return Object.keys(spec.paths)
        // for each route
        .reduce((finalArray, url) => finalArray.concat(verbs
            // and each verb of the route
            .reduce((internalArray, verb) => {
                // Call the callback and append the result into an array
                const op = spec.paths[url][verb];
                if (typeof op === 'undefined') return internalArray;
                internalArray.push(cb(url, verb, op));
                return internalArray;
            }, [] as T[]))
        ,
        [] as T[]);
}


export function validateSpec (buffer: Buffer): Task<OpenAPI, InvalidApiSpec> {
    try {
        return Task.resolve(specContract(JSON.parse(buffer.toString())));
    } catch (err) {
        return Task.reject(err);
    }
}

const cwd = process.cwd();
const petSpecJson = join(cwd, './pet-spec.json');

readFile(petSpecJson)
    .chain(validateSpec)
    .map(spec => {
        // Does nothing, just here to see the types
        const get = spec.paths['/pets'].get;
        spec.openapi;
        spec.info;
        return spec;
    })
    .fork(
        err => console.log('Buu', err),
        val => {
            const get = val.paths['/pets'].get;
            const parameters = get ? get.parameters : null;
            if (parameters) {
                console.log('Wii', parameters.map(x => x));
            }
        }
    );


