
import axios, {AxiosError, AxiosResponse} from "axios";
import {IResponseBase, RequestModelBase} from "./models";

export const fetch = async (requestModel: RequestModelBase): Promise<IResponseBase> => {
    let res: AxiosResponse | undefined;
    try {
        switch (requestModel.method) {
            case "GET":
                res = await axios.get(requestModel.getUrl())
                break;
            case "POST":
                res = await axios.post(requestModel.getUrl(), requestModel.body)
                break;
        }
    } catch (e) {
        if (e instanceof AxiosError && e.response && e.response.status === 418) {
            return e.response.data;
        }
        throw new Error(`[fetch] error in fetch resource: ${requestModel.getUrl()} with error: ${e}`);
    }

    if (res === undefined) {
        throw new Error(`[fetch] error in fetch resource: ${requestModel.getUrl()}, expecting request response`);
    }
    return res.data;
};
