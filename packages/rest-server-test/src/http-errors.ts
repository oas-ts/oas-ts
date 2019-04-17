import { STATUS_CODES } from 'http';

// Uppercases first letter
// e.g.: capitalize('hello') --> 'Hello'
const capitalize = (str: string) =>
    str.slice(0, 1).toUpperCase() + str.slice(1);

// True if target ends with ending
// e.g.: endsWith('Foo', 'oo') --> true
// endsWith('Bar', 'oo') --> false
const endsWith = (target: string, ending: string) =>
    new RegExp(ending + '$').test(target);

// Takes an error description, split on spaces, camel case it correctly,
// then append 'Error' at the end of it.
// e.g., the passed in description is 'Internal Server Error'
//       the output is 'InternalServerError'
const getErrNameFromErrDescription = (errorDescription: string) => {
    const name = errorDescription
        .split(/\s+/)
        .map(aWord => capitalize(aWord.toLowerCase()))
        .join('');

    return endsWith(name, 'Error') ? name : name + 'Error';
};

// Gets the proper statusCode from an errName.
// e.g., getStatusCodeFromErrName('BadRequest') --> '401'
const getStatusCodeFromErrName = (errName: string) =>
    Object.keys(STATUS_CODES)
        .find(aStatusCode => getErrNameFromErrDescription(String(STATUS_CODES[aStatusCode])) === errName)
;


const getDescriptionFromErrName = (errName: string) =>
    Object.values(STATUS_CODES)
        .find(anErrDescription => getErrNameFromErrDescription(String(anErrDescription)) === errName)
;


export class HttpError extends Error {
    public statusCode: number;

    body: string;

    constructor (message?: string) {
        super(message);

        const errName = this.constructor.name;
        const errDescription = String(getDescriptionFromErrName(errName));
        const errStatusCode = getStatusCodeFromErrName(errName);

        // We try to get the status code or default to 500
        this.statusCode = Number(errStatusCode || 500);

        // Use errDescription if no message was supplied
        this.message = this.message || errDescription;

        // Make a body with:
        this.body = this.message;
    }
}

export class BadRequestError extends HttpError {
    BadRequestError = 1;
}

export class UnauthorizedError extends HttpError {
    UnauthorizedError = 1;
}

export class PaymentRequiredError extends HttpError {
    PaymentRequiredError = 1;
}

export class ForbiddenError extends HttpError {
    ForbiddenError = 1;
}

export class NotFoundError extends HttpError {
    NotFoundError = 1;
}

export class MethodNotAllowedError extends HttpError {
    MethodNotAllowedError = 1;
}

export class NotAcceptableError extends HttpError {
    NotAcceptableError = 1;
}

export class ProxyAuthenticationRequiredError extends HttpError {
    ProxyAuthenticationRequiredError = 1;
}

export class RequestTimeoutError extends HttpError {
    RequestTimeoutError = 1;
}

export class ConflictError extends HttpError {
    ConflictError = 1;
}

export class GoneError extends HttpError {
    GoneError = 1;
}

export class LengthRequiredError extends HttpError {
    LengthRequiredError = 1;
}

export class PreconditionFailedError extends HttpError {
    PreconditionFailedError = 1;
}

export class RequestEntityTooLargeError extends HttpError {
    RequestEntityTooLargeError = 1;
}

export class RequesturiTooLargeError extends HttpError {
    RequesturiTooLargeError = 1;
}

export class UnsupportedMediaTypeError extends HttpError {
    UnsupportedMediaTypeError = 1;
}

export class RangeNotSatisfiableError extends HttpError {
    RangeNotSatisfiableError = 1;
}

export class ExpectationFailedError extends HttpError {
    ExpectationFailedError = 1;
}

export class ImATeapotError extends HttpError {
    ImATeapotError = 1;
}

export class UnprocessableEntityError extends HttpError {
    UnprocessableEntityError = 1;
}

export class LockedError extends HttpError {
    LockedError = 1;
}

export class FailedDependencyError extends HttpError {
    FailedDependencyError = 1;
}

export class UnorderedCollectionError extends HttpError {
    UnorderedCollectionError = 1;
}

export class UpgradeRequiredError extends HttpError {
    UpgradeRequiredError = 1;
}

export class PreconditionRequiredError extends HttpError {
    PreconditionRequiredError = 1;
}

export class TooManyRequestsError extends HttpError {
    TooManyRequestsError = 1;
}

export class RequestHeaderFieldsTooLargeError extends HttpError {
    RequestHeaderFieldsTooLargeError = 1;
}

export class InternalServerError extends HttpError {
    InternalServerError = 1;
}

export class NotImplementedError extends HttpError {
    NotImplementedError = 1;
}

export class BadGatewayError extends HttpError {
    BadGatewayError = 1;
}

export class ServiceUnavailableError extends HttpError {
    ServiceUnavailableError = 1;
}

export class GatewayTimeoutError extends HttpError {
    GatewayTimeoutError = 1;
}

export class HttpVersionNotSupportedError extends HttpError {
    HttpVersionNotSupportedError = 1;
}

export class VariantAlsoNegotiatesError extends HttpError {
    VariantAlsoNegotiatesError = 1;
}

export class InsufficientStorageError extends HttpError {
    InsufficientStorageError = 1;
}

export class BandwidthLimitExceededError extends HttpError {
    BandwidthLimitExceededError = 1;
}

export class NotExtendedError extends HttpError {
    NotExtendedError = 1;
}

export class NetworkAuthenticationRequiredError extends HttpError {
    NetworkAuthenticationRequiredError = 1;
}

