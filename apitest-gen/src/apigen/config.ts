
import {join} from "path";

export class Config {
    public static outputDirectory = process.env.OUTPUT_DIR || join(process.cwd(), "testcases");
    public static inputDocument = process.env.INPUT_DOC || join(process.cwd(), "src/apigen/resources/result.json");
    public static generalApiPrefix = "wx.";
}
