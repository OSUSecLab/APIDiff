export interface API {
    name: string
    parameters: APIParam
    type: "SYNC" | "ASYNC"
    category: string
    subcategory?: string
    subsubcategory?: string
    url: string
    definition: string
    hint?: string
    description?: string
    samples?: string
    hasDependencies?: boolean
}

export interface APIParam {
    [key: string]: APIParamProperty
}

export interface APIParamProperty {
    type: APIParamType;
    required: boolean;
    defaultValue?: standardTypes;
    position?: number;
    nestObject?: APIParam;
    arrayType?: APIParamType;
}

export type APIParamType = "string" | "boolean" | "number" | "null" | "undefined" | "Object" | "Array" | "Function" | "any" ;

export interface TransformedParam {
    [key: string]: standardTypes | TransformedParam
}

export type standardTypes = string | number | boolean | Function | Array<standardTypes | APIParam> | TransformedParam | null | undefined;

