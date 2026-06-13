/**
 * Worker communication protocol.
*/

export type DeviAction = 'get' | 'set' | 'delete' | 'clear' | 'size' | 'keys';

export interface DeviRequest {
    id?: string;
    action: DeviAction;
    payload: DeviValue;
    error?: string;
    resolved: boolean;
}

export interface DeviValue {
    key: string;
    value?: string | Uint8Array;
    expiresAt?: number;
    lastAccessed: number;
    metadata: Record<string, unknown>;
}

export type DeviWorkerMessage = { request: DeviRequest }

export type DeviWorkerReply = {
    id: string;
    success: boolean;
    payload?: unknown;
    error?: string;
}

/**
 * Worker adapter interfaces.
*/
export type DeviWorkerType = 'web' | 'mobile' | 'desktop' | 'browser';

export interface DeviWorker {
    postMessage(message: DeviWorkerMessage, transfer?: Transferable[]): void;
    set onmessage(handler: ((data: DeviWorkerReply) => void) | null);
    terminate(): void;
}

export interface DeviWorkerHost {
    spawn(id: string, scriptUrl: string | URL): DeviWorker;
}
