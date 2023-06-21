import {Context} from "../lib/context";
import {Middleware} from "../lib/generator";
import {APIParam, APIParamProperty, standardTypes, TransformedParam} from "../../model/API";
import {Constants} from "../constants";

export const parameterHandler = async (ctx: Context, next?: Middleware): Promise<Context> => {
    // async function, passing Object
    if (ctx.source.type === "ASYNC") {
        handleAsyncParameters(ctx);
    } else {
        handleSyncParameters(ctx);
    }

    if (next) await next(ctx);

    return ctx;
}

const handleAsyncParameters = (ctx: Context) => {
    const paramsObject = handleParameters(ctx.source.parameters);
    ctx.destination.append(JSON.stringify(paramsObject));
}

const handleSyncParameters = (ctx: Context) => {
    const paramRawList = new Array<APIParamProperty>();
    for (let key in ctx.source.parameters) {
        // ensure the property has position member
        if (ctx.source.parameters[key].position !== undefined) {
            paramRawList.push(ctx.source.parameters[key]);
        }
    }
    // sort the list by position
    paramRawList.sort((a, b) => {return <number> a.position - <number> b.position});

    const paramList = new Array<standardTypes>();
    for (let param of paramRawList) {
        paramList.push(transformParam(param));
    }
    const paramString = JSON.stringify(paramList);
    const finalString = paramString.slice(1, paramString.length - 1);
    ctx.destination.append(finalString);
}

const handleParameters = (params: APIParam) => {
    const paramsObject = {} as TransformedParam;
    for (let key in params) {
        if (!params[key].required && !["success", "fail", "complete"].includes(key)) {
            // if the parameter is not required,
            // do not generate value in case we
            // lose the meaningful output due to
            // random generated value.
            // Also, don't exclude callback
            // functions!!
            continue;
        }
        paramsObject[key] = transformParam(params[key]);
    }
    return paramsObject;
}

const transformParam = (paramProperty: APIParamProperty) => {
    let result;
    switch (paramProperty.type) {
        case "Function":
            result = `(e) => {globalThis.resultSet["::UUID::"] = e;}`;
            break;
        case "number":
            result = mutate(Constants.number);
            break;
        case "boolean":
            result = mutate(Constants.boolean);
            break;
        case "string":
            result = mutate(Constants.string);
            break;
        case "Array":
            result = handleArray(paramProperty);
            break;
        case "Object":
            if (paramProperty.nestObject !== undefined) {
                result = handleParameters(<APIParam> paramProperty.nestObject);
            }
            break;
        case "undefined":
            result = undefined;
            break;
        case "null":
            result = null;
            break;
        case "any":
            result = Object.create(null);
            break;
    }
    return result;
}

const handleArray = (property: APIParamProperty): Array<standardTypes|TransformedParam> => {
    if (property.arrayType === undefined) {
        return [undefined];
    }
    switch (property.arrayType) {
        // don't handle functions
        case "string":
        case "boolean":
        case "number":
        case "null":
        case "undefined":
        case "Function":
        case "Array":
            return [transformParam({type: property.arrayType, required: true})];
        case "Object":
            if (property.nestObject !== undefined) {
                return [handleParameters(<APIParam> property.nestObject)];
            }
            break;
        case "any":
            return [Object.create(null)];
    }
    return [undefined];
}

const mutate = (value: standardTypes) => {
    return value;
}
