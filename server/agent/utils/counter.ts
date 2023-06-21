
class Counter {
    private counter: number = 0;

    public getCounter () {
        return this.counter ++;
    }

}

export let globalCounter = new Counter();
