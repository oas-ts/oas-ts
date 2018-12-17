import ts = require('typescript');

// --------
// PROGRAM
// --------

interface ProgramDefinition {
    schemas: SchemaDefinitions;
    export: ExportOptions;
    endpoints: EndpointDefinitions;
}

function createProgram (source: ts.SourceFile, definition: ProgramDefinition) {
    return ts.updateSourceFileNode(
        source,
        [
            createImports(),
            ...createSchemas(definition.schemas),
            createEndpoints(definition.endpoints),
            exportDefault(definition.export)
        ],
        false
    );
}

export function generateProgram (programName: string, programDefinition: ProgramDefinition) {
    const resultFile = ts.createSourceFile(
        programName,
        '',
        ts.ScriptTarget.Latest,
        /*setParentNodes*/ false,
        ts.ScriptKind.TS
      );

      const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed
      });

      return printer.printNode(
        ts.EmitHint.Unspecified,
        createProgram(resultFile, programDefinition),
        resultFile
      );
}

// --------
// IMPORTS
// --------

function createImports () {
    return ts.createImportDeclaration(
        /*decorators*/ undefined,
        /*modifiers*/ undefined,
        ts.createImportClause(undefined, ts.createNamedImports([
            ts.createImportSpecifier(undefined, ts.createIdentifier('restify')),
            ts.createImportSpecifier(undefined, ts.createIdentifier('RestifyEndpoints'))

        ])),
        /*moduleSpecifier*/ ts.createStringLiteral('@oas-ts/rest')
    );
}

// --------
// SCHEMAS
// --------

interface SchemaDefinition {
    name: string;
    properties: Array<{
        name: string;
        // TODO: type shouldn't be string, it should be something closer to either schema or ts definitions
        type: string;
        optional: boolean;
        // description?

    }>;
}

type SchemaDefinitions = SchemaDefinition[];
function createSchemas (definitions: SchemaDefinitions) {
    return definitions.map(createSchema);
}

function createSchema (definition: SchemaDefinition) {

    const members = definition.properties.map(prop =>
        ts.createPropertySignature(
            /*modifiers*/ undefined,
            prop.name,
            optionalToken(prop.optional),
            /*type*/ mapTypes(prop.type),
            /*initializer*/ undefined
        )
    );

    return ts.createInterfaceDeclaration(
        /*decorators*/ undefined,
        /*modifiers*/ [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        definition.name,
        /*typeParameters*/ undefined,
        /*heritageClauses*/ undefined,
        members
    );
}

// ----------
// ENDPOINTS
// ----------

interface RouteOptionsDefinition {
    pathParams?: Record<string, {
        // TODO: type shouldn't be string, it should be something closer to either schema or ts definitions
        type: string;
        description?: string;
    }>;
    queryParams?: Record<string, {
        // TODO: type shouldn't be string, it should be something closer to either schema or ts definitions
        type: string;
        description?: string;
        optional: boolean;
    }>;
    body?: {

    };
}

interface RouteDefinition {
    options?: RouteOptionsDefinition;
    responses: ReadonlyArray<{
        code: number;
        json: unknown;
    }>;
}

function withTypeDocComment<T extends ts.Node> (node: T, comment?: string) {
    if (typeof comment === 'undefined') {
        return node;
    }

    return ts.addSyntheticLeadingComment(
        node,
        ts.SyntaxKind.MultiLineCommentTrivia,
        `* ${comment} `,
        true
    );
}

// TODO: This is hardcoded, should be something closer to the schema or the types definition
function mapTypes (type: string) {

    if (type === 'string') {
        return ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    }
    if (type === 'number') {
        return ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    }
    if (type === 'string[]') {
        return ts.createArrayTypeNode(
            ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
        );
    }

    throw `The type '${type}' is not mapped`;
}

function createRouteOptionsPathParams (options: RouteOptionsDefinition) {
    const paramsDefinition = options.pathParams;
    if (typeof paramsDefinition === 'undefined') {
        return [];
    }

    const pathParams = Object.keys(paramsDefinition).map(param => {
        const definition = ts.createPropertySignature(
            /*modifiers*/ undefined,
            param,
            /*questionToken*/ undefined,
            /*type*/ mapTypes(paramsDefinition[param].type),
            /*initializer*/ undefined
        );
        return withTypeDocComment(definition, paramsDefinition[param].description);
    });

    return [
        ts.createPropertySignature(
            /*modifiers*/ undefined,
            'pathParams',
            /*questionToken */undefined,
            /*type*/ ts.createTypeLiteralNode(pathParams),
            /*initializer*/ undefined
        )
    ];
}

function optionalToken (thrutly: boolean) {
    return thrutly ? ts.createToken(ts.SyntaxKind.QuestionToken) : undefined;
}

function createRouteOptionsQueryParams (options: RouteOptionsDefinition) {
    const paramsDefinition = options.queryParams;
    if (typeof paramsDefinition === 'undefined') {
        return [];
    }

    const pathParams = Object.keys(paramsDefinition).map(param => {
        const definition = ts.createPropertySignature(
            /*modifiers*/ undefined,
            param,
            optionalToken(paramsDefinition[param].optional),
            /*type*/ mapTypes(paramsDefinition[param].type),
            /*initializer*/ undefined
        );
        return withTypeDocComment(definition, paramsDefinition[param].description);
    });

    return [
        ts.createPropertySignature(
            /*modifiers*/ undefined,
            'queryParams',
            /*questionToken*/ undefined,
            /*type*/ ts.createTypeLiteralNode(pathParams),
            /*initializer*/ undefined
        )
    ];
}

function createRouteOptionsBody (options: RouteOptionsDefinition) {
    if (typeof options.body === 'undefined') {
        return [];
    }
    return [
        ts.createPropertySignature(
            /*modifiers*/ undefined,
            'body',
            /*questionToken*/ undefined,
            /*type*/ ts.createTypeLiteralNode(undefined),
            /*initializer*/ undefined
        )
    ];
}

function createRouteOptions (definition: RouteDefinition) {
    if (typeof definition.options === 'undefined') {
        return ts.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);
    }
    return ts.createTypeLiteralNode([
        ...createRouteOptionsPathParams(definition.options),
        ...createRouteOptionsQueryParams(definition.options),
        ...createRouteOptionsBody(definition.options)
    ]);
}

function createRouteResponses (definition: RouteDefinition) {
    return ts.createTypeLiteralNode(undefined);
}


function createRoute (path: string, definition: RouteDefinition) {
    return ts.createPropertySignature(
        /*modifiers*/ undefined,
        ts.createStringLiteral(path),
        /*questionToken*/ undefined,
        ts.createTypeLiteralNode([
            ts.createPropertySignature(
                /*modifiers*/ undefined,
                'options',
                /*questionToken*/ undefined,
                /*type*/ createRouteOptions(definition),
                /*initializer*/ undefined
            ),
            ts.createPropertySignature(
                /*modifiers*/ undefined,
                'responses',
                /*questionToken*/ undefined,
                /*type*/ createRouteResponses(definition),
                /*initializer*/ undefined
            )
        ]),
        /*initializer*/ undefined
    );
}


function createVerbEndpoints (verb: string, routes: Record<string, RouteDefinition>) {
    const nodeRoutes = Object.keys(routes).map(path => createRoute(path, routes[path]));
    return ts.createPropertySignature(
        /*modifiers*/ undefined,
        verb,
        /*questionToken */undefined,
        /*type*/ ts.createTypeLiteralNode(nodeRoutes),
        /*initializer*/ undefined
    );
}

interface EndpointDefinitions {
    name: string;
    routes: Record<string, Record<string, RouteDefinition>>;
}

function createEndpoints (definition: EndpointDefinitions) {
    const members =
        Object
            .keys(definition.routes)
            .map(verb => createVerbEndpoints(verb, definition.routes[verb]));

    return ts.createInterfaceDeclaration(
        /*decorators*/ undefined,
        /*modifiers*/ [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        definition.name,
        /*typeParameters*/ undefined,
        /*heritageClauses*/ [ts.createHeritageClause(
            ts.SyntaxKind.ExtendsKeyword,
            [
                ts.createExpressionWithTypeArguments(undefined, ts.createIdentifier('RestifyEndpoints'))
            ]
        )],
        members
    );
}

// --------------
// EXPORT DEFAULT
// --------------

interface ExportOptions {
    servers: string;
}

function exportDefault (options: ExportOptions) {
    const restifyOptions = ts.createObjectLiteral([
            ts.createPropertyAssignment('servers', ts.createStringLiteral(options.servers))
    ]);

    return ts.createExportAssignment(
        /*decorators*/ undefined,
        /*modifiers*/ undefined,
        /*isExportEquals*/false,
        ts.createCall(
            ts.createIdentifier('restify'),
            [ts.createTypeReferenceNode('PetsEndpoints', [])],
            [restifyOptions]
        )
    );
}


// ----
// TEST
// ----

const Pet: SchemaDefinition = {
    name: 'Pet',
    properties: [
        {
            name: 'id',
            type: 'number',
            optional: false
        },
        {
            name: 'name',
            type: 'string',
            optional: false
        },
        {
            name: 'tag',
            type: 'string',
            optional: true
        }
    ]
};

const UnknownResponseError: SchemaDefinition = {
    name: 'UnknownResponseError',
    properties: [
        {
            name: 'code',
            type: 'number',
            optional: false
        },
        {
            name: 'message',
            type: 'string',
            optional: false
        }
    ]
};

const newPets: SchemaDefinition = {
    name: 'NewPet',
    properties: [
        {
            name: 'name',
            type: 'string',
            optional: false
        },
        {
            name: 'tag',
            type: 'string',
            optional: true
        }
    ]
};

const endpointsDefinitions: EndpointDefinitions = {
    name: 'PetsEndpoints',
    routes: {
        'put': {

        },
        'get': {
            '/pets': {
                options: {
                    queryParams: {
                        limit: {
                            optional: true,
                            type: 'number',
                            description: 'How many items to return at one time (max 100)'
                        },
                        tags: {
                            optional: true,
                            type: 'string[]',
                            description: 'Tags to filter by'
                        }
                    }
                },
                responses: []
            },
            '/pets/{petId}': {
                options: {
                    pathParams: {
                        petId: {
                            description: 'The id of the pet to retrieve',
                            type: 'number'
                        }
                    }
                },
                responses: []
            },
            '/ping': {
                responses: []
            }
        },
        'post': {
            '/pets': {
                responses: []
            }
        }
    }
};

const result = generateProgram(
    'pet-spec.ts',
    {
        schemas: [newPets, Pet, UnknownResponseError],
        export: {
            servers: 'http://192.168.1.11:3000'
        },
        endpoints: endpointsDefinitions
    }
);

console.log(result);