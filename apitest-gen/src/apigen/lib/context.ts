import {Generator} from "./generator";
import {API} from "../../model/API";
import {Script} from "../../model/Script";


export class Context {
    public generator: Generator;
    public source: API;
    public destination: Script;
    public allApis!: Array<API>;
    public subContext: boolean = false;

    constructor() {
    }

    bindAllApis (allApis: Array<API>) {
        this.allApis = allApis;
    }

    getAllApis () {
        return this.allApis;
    }

    getApisBySubCategory (category: string) {
        return this.allApis.filter(api => api.subcategory === category);
    }

    getApisBySubSubCategory (category: string) {
        return this.allApis.filter(api => api.subsubcategory === category);
    }

    isSubContext (): boolean {
        return this.subContext;
    }

    setSubContext (flag: boolean) {
        this.subContext = flag;
    }
}
