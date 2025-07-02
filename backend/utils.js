const CALLER_REGEX = /at\s+(?:(\S+)\s+)?\(([^:]+):([0-9]+):[0-9]+\)/;
const DEFAULT_CALLER = { file: 'unknown', method: 'anonymous', line: undefined };

/**
 * Extracts caller info (file, line, method) from the stack trace.
 * @returns {Object} Caller info with file, method, and line properties
 */
export function getCallerInfo() {
    const obj = {};
    Error.captureStackTrace(obj, getCallerInfo);

    const callerLine = obj.stack.split('\n', 2)[1];
    if (!callerLine) return DEFAULT_CALLER;

    const match = CALLER_REGEX.exec(callerLine);
    if (!match) return DEFAULT_CALLER;

    const [, method = 'anonymous', file, line] = match;
    return { file, method: `${method} ${line}` };
}