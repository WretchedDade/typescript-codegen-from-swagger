import { StringNullableChain, template } from 'lodash';
import Prettier from 'prettier';

export type StatusCode = '200' | '201' | '202' | '203' | '204' | '205' | '206';
export type SchemaType = 'string' | 'array';
export type ContentType = 'application/json';
export type ParameterLocation = 'query' | 'header' | 'path';
export type TypeDefinitionType = 'object';

export type KeyValueObject<TValue = string> = { [key: string]: TValue };
export interface Schema {
	description?: string;
	$ref?: string;
	pattern?: string;
	nullable?: boolean;
	type?: SchemaType;
	items?: Schema;
}

export type Content = {
	[contentType in ContentType]: {
		schema: Schema;
	};
};

export interface HttpMethodInfo {
	tags: string[];
	summary: string;
	operationId: string;
	parameters?: {
		name: string;
		schema: Schema;
		required: boolean;
		in: ParameterLocation;
	}[];
	requestBody?: {
		description: string;
		content: Content;
	};
	responses: {
		[key in StatusCode]: {
			description: string;
			content: Content;
		};
	};
}

export interface TypeDefinition {
	required: string[];
	type: 'object';
	properties: {
		[key: string]: Schema;
	};
	enum?: (string | number)[];
	additionalProperties: boolean;
}

export interface ParsedSchema {
	description?: string;
	type?: string;
	isTypeDefinition?: boolean;
}

export interface Parameter extends ParsedSchema {
	in: ParameterLocation;
	name: string;
	required: boolean;
}

export interface Method {
	name: string;
	fullPath: string;
	httpMethod: string;
	controller: string;
	tags?: string[];
	summary?: string;
	hasParameters: boolean;
	parameters: {
		all: Parameter[];
		path: Parameter[];
		query: Parameter[];
		headers: Parameter[];
	};
	requestBody?: ParsedSchema;
	successResponse?: ParsedSchema;
}

export interface Property extends ParsedSchema {
	name: string;
	required: boolean;
}

export interface Definition<T = string | number> {
	isEnum: boolean;
	isObject: boolean;
	name: string;
	enum?: T[];
	properties: Property[];
}

export interface ParsedOpenApi {
	info: {
		title: string;
		simplifiedTitle: string;
		version: string;
		openApiSpecVersion: string;
	};
	methods: Method[];
	definitions: Definition[];
}

export interface ParsedOpenApiGroupedByControllers {
	info: {
		title: string;
		version: string;
		openApiSpecVersion: string;
	};
	methods: { [controller: string]: Method[] };
	definitions: Definition[];
}

export type TemplateOptions = (
	| { type: 'Single File'; fileNameBuilder?: (api: ParsedOpenApi) => string }
	| { type: 'File per Method'; fileNameBuilder?: (method: Method) => string }
	| { type: 'File per Controller'; fileNameBuilder?: (controller: string) => string }
) & { template?: string; imports?: string[] };

export interface Options {
	swagger: string;

	/**
	 * The directory to output generated content.
	 * @default 'api'
	 */
	outputDirectory?: string;

	/**
	 * Templates used to generate content.
	 */
	templates: TemplateOptions[];

	controllerNameParser?: (path: string) => string;

	/**
	 * Name to use for the file containing types/models.
	 * @default 'Models'
	 */
	modelsFileName?: string;

	/**
	 * Used to filter the array of models to be generated.
	 */
	modelsFilter?: (model: Definition) => boolean;

	/**
	 * Used to map a type in Open API to a relevant typescript type. e.g. integer -> number
	 * @default
	 * {
	 * 	integer: 'number',
	 * 	DateTime: 'string',
	 * }
	 */
	typeMap?: KeyValueObject;

	/**
	 * Config to use when formatting with prettier.
	 */
	prettierConfig?: Prettier.Options;

	/**
	 * Additional models to include in models.d.ts. Useful when there is a generic type wrapping some of your other models.
	 * @default []
	 */
	additionalModels?: string[];
}

export type DefaultOptions = Required<Omit<Options, 'swagger' | 'templates' | 'controllerNameParser' | 'modelsFilter'>>;
export type DefaultedOptions = Options & DefaultOptions;

export type MustacheRender = (text: string) => string;

export interface FileGenerationOutput {
	type: 'Models' | TemplateOptions['type'];
	file: string;
	content: string;
}

export interface FileGenerationOptions {
	api: ParsedOpenApi;
	defaultedOptions: DefaultedOptions;
	templateOption: TemplateOptions;
}
