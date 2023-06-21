import {Job} from "./job";
import {JobExecutor} from "./jobExecutor";

interface IQueue<T> {
    enqueue(item: T): void;
    dequeue(): T | undefined;
    size(): number;
}

class Queue<T> implements IQueue<T> {
    private storage: T[] = [];

    constructor(private capacity: number = Infinity) {}

    enqueue(item: T): void {
        if (this.size() === this.capacity) {
            throw Error("queue has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    }
    dequeue(): T {
        const item = this.storage.shift();
        if (item === undefined) {
            throw new Error("queue has no more items");
        }
        return item;
    }
    size(): number {
        return this.storage.length;
    }
}

export const executorQueue = new Queue<JobExecutor>();
