import type { DeviValue } from "./protocol";


export interface DeviOps {
    get(key: string): Promise<DeviValue | undefined>;
    set(key: string, value: DeviValue): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    size(): Promise<number>;
    keys(): Promise<string[]>;
}
