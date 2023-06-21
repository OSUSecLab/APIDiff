import {join} from "path";

export class Config {
    public static host = "127.0.0.1";
    public static port = 60088;

    public static testcases = process.env["TESTCASE_DIR"] || join(process.cwd(), "testcases");
    public static output = process.env["OUTPUT_FILE"] || join(process.cwd(), "results.csv");

    public static blackList = ["wx.setEnableDebug", "wx.exitMiniProgram"];
}
