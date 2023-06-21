interface API {
    name: string
    params: APIParam,
    type: "SYNC" | "ASYNC"
}

interface APIParam {
    [key: string]: standardTypes | APIParam
}

type standardTypes = string | number | boolean | Function | Array<standardTypes | APIParam>;

export { API, APIParam, standardTypes }
