import {Generator} from "./lib/generator";
import {nameHandler} from "./middleware/nameHandler";
import {wrapperHandler} from "./middleware/wrapperHandler";
import {parameterHandler} from "./middleware/parameterHandler";
import {postHandler} from "./middleware/postHandler";
import {bindAllApis} from "./middleware/bindAllApis";
import {dependencyHandler} from "./middleware/dependencyHandler";

const generator = new Generator();

// middleware sequence matters
generator
    .use(bindAllApis)
    .use(wrapperHandler)
    .use(nameHandler)
    .use(parameterHandler)
    .use(postHandler);

export {
    generator
}
