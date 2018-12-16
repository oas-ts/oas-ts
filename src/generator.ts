import { undef } from 'parmenides';
import ts = require('typescript');

export interface Pet {
    id: number;
    name: string;
    tag?: string;
}

function createSchemas () {
    const interfaceName = 'Pet';

    const members = [
        ts.createPropertySignature(
            /*modifiers*/ undefined,
            'id',
            /*questionToken */undefined,
            ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            // ts.SyntaxKind.NumberKeyword,
            undefined
        ),
        ts.createPropertySignature(
            /*modifiers*/ undefined,
            'name',
            /*questionToken */undefined,
            ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            // ts.SyntaxKind.NumberKeyword,
            undefined
        ),
        ts.createPropertySignature(
            /*modifiers*/ undefined,
            'tag',
            ts.createToken(ts.SyntaxKind.QuestionToken),
            ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            // ts.SyntaxKind.NumberKeyword,
            undefined
        )
    ];
    return [
        ts.createInterfaceDeclaration(
        /*decorators*/ undefined,
        /*modifiers*/ [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        interfaceName,
        /*typeParameters*/ undefined,
        /*heritageClauses*/ undefined,
        members
    )];
}

function createImports () {
    return ts.createImportDeclaration(
        /*decorators*/ undefined,
        /*modifiers*/ undefined,
        ts.createImportClause(undefined, ts.createNamedImports([
            ts.createImportSpecifier(undefined, ts.createIdentifier('restify')),
            ts.createImportSpecifier(undefined, ts.createIdentifier('RestifyEndpoints'))

        ])),
        ts.createStringLiteral('./restify')
    );
}

function exportDefault () {
    const restifyOptions = ts.createObjectLiteral([
            ts.createPropertyAssignment('servers', ts.createStringLiteral('http://192.168.1.11:3000'))
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

function createRouteOptionsQueryParams (options: RouteOptionsDefinition) {
    const paramsDefinition = options.queryParams;
    if (typeof paramsDefinition === 'undefined') {
        return [];
    }

    const pathParams = Object.keys(paramsDefinition).map(param => {
        const definition = ts.createPropertySignature(
            /*modifiers*/ undefined,
            param,
            /*questionToken*/ paramsDefinition[param].optional ? ts.createToken(ts.SyntaxKind.QuestionToken) : undefined,
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
        path,
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

function createEndpoints () {
    const interfaceName = 'PetsEndpoints';

    const members = [
        createVerbEndpoints('put', {
        }),
        createVerbEndpoints('get', {
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
        }),
        createVerbEndpoints('post', {
            '/pets': {
                responses: []
            }
        })
    ];
    return ts.createInterfaceDeclaration(
        /*decorators*/ undefined,
        /*modifiers*/ [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        interfaceName,
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
// comments
// ts.addSyntheticLeadingComment(
//     NODE,
//     ts.SyntaxKind.MultiLineCommentTrivia,
//     'hello',
//     true
// )

function createProgram (source: ts.SourceFile) {
    return ts.updateSourceFileNode(
        source,
        [
            createImports(),
            ...createSchemas(),
            createEndpoints(),
            exportDefault()
        ],
        false
    );
}

const resultFile = ts.createSourceFile(
  'someFileName.ts',
  '',
  ts.ScriptTarget.Latest,
  /*setParentNodes*/ false,
  ts.ScriptKind.TS
);

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed
});
const result = printer.printNode(
  ts.EmitHint.Unspecified,
  createProgram(resultFile),
  resultFile
);

console.log(result);