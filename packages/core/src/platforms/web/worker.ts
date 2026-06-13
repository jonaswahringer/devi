self.onmessage = async (event) => {
    let result: unknown;
    let success = false;
    try {
        switch (event.type) {
            case 'get':
                result = await get(event.key);
                success = true;
                break;
            case 'set':
                result = await set(event.key, event.value);
                success = true;
                break;
            case 'del':
                result = await del(event.key);
                success = true;
                break;
            default:
                success = false;
                result = new Error(`Unknown message type: ${event.type}`);
        }
    } catch (error) {
        success = false;
        result = error;
    }
    self.postMessage({ id: event.id, success, result });
}

function get(key: string): Promise<string | undefined> {
    // TODO
    console.log('get', key);
    return Promise.resolve(undefined);
}

function set(key: string, value: string): Promise<void> {
    // TODO
    console.log('set', key, value);
    return Promise.resolve();
}
function del(key: string): Promise<void> {
    // TODO
    console.log('del', key);
    return Promise.resolve();
}
