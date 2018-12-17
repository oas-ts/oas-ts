import { restify, RestifyEndpoints } from "@oas-ts/rest";
export interface NewPet {
    name: string;
    tag?: string;
}
export interface Pet {
    id: number;
    name: string;
    tag?: string;
}
export interface UnknownResponseError {
    code: number;
    message: string;
}
export interface PetsEndpoints extends RestifyEndpoints {
    put: {};
    get: {
        "/pets": {
            options: {
                queryParams: {
                    /** How many items to return at one time (max 100) */
                    limit?: number;
                    /** Tags to filter by */
                    tags?: string[];
                };
            };
            responses: {};
        };
        "/pets/{petId}": {
            options: {
                pathParams: {
                    /** The id of the pet to retrieve */
                    petId: number;
                };
            };
            responses: {};
        };
        "/ping": {
            options: undefined;
            responses: {};
        };
    };
    post: {
        "/pets": {
            options: undefined;
            responses: {};
        };
    };
}
export default restify<PetsEndpoints>({ servers: "http://192.168.1.11:3000" });

