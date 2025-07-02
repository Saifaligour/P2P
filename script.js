const data = {
    "type": "Buffer",
    "data": []
}
// const topic = b4a.toString(new Uint8Array(data.data), 'hex')
// const topic = Buffer.from(data.data).toString('hex');
// console.log(topic);

const topicPeersMap = new Map([['test1', new Set([{ name: 'saif' }])], ['test2', new Set([{ name: 'saif' }])]])
const peer = []
for (const e of topicPeersMap.keys()) {
    const current = topicPeersMap.get(e).size
    peer.push([e, { current, }])
    console.log(current)
}


// console.log(new Map(JSON.parse(JSON.stringify(peer))));

const CALLER_REGEX = /at\s+(?:(\S+)\s+)?\(([^:]+):([0-9]+):[0-9]+\)/;
const DEFAULT_CALLER = { file: 'unknown', method: 'anonymous', line: undefined };

/**
 * Extracts caller info (file, line, method) from the stack trace.
 * @returns {Object} Caller info with file, method, and line properties
 */
function getCallerInfo() {
    const obj = {};
    Error.captureStackTrace(obj, getCallerInfo);

    const callerLine = obj.stack.split('\n', 2)[1];
    if (!callerLine) return DEFAULT_CALLER;

    const match = CALLER_REGEX.exec(callerLine);
    if (!match) return DEFAULT_CALLER;

    const [, method = 'anonymous', file, line] = match;
    return { file, method: `${method} ${line}` };
}

function print(params) {
    const { file, method } = getCallerInfo()
    console.log('app.js', file, method)
}

function teatPront(params) {
    print()
}

teatPront()