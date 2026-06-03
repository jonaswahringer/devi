export type PostedMessage = Record<string, unknown>;

export class MockWorker {
    readonly posted: PostedMessage[] = [];
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((event: ErrorEvent) => void) | null = null;

    postMessage(message: PostedMessage): void {
        this.posted.push(message);
    }

    terminate(): void {}

    /** Simulate an inbound message from the worker thread. */
    receive(message: PostedMessage): void {
        this.onmessage?.({ data: message } as MessageEvent);
    }
}
