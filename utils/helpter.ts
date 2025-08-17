import * as Clipboard from 'expo-clipboard';

export const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    alert('Copied to clipboard!');
};


export const formatLogs = ({ source, file, method, message = '', command = '', data = '', error = '' }) => {
    console.log(source, file, method, command, message, data, error, '\x1b[1m\x1b[94mEnd\x1b[0m')
}