
export class Script {
    script: string;

    constructor() {
        this.script = "";
    }

    prepend (snippet: string) {
        this.script = `${snippet}${this.script}`;
        return this;
    }

    append (snippet: string) {
        this.script = `${this.script}${snippet}`;
        return this;
    }

    getScript () {
        return this.script;
    }

    setScript (script: string) {
        this.script = script;
    }
}
