import {createLogger, format, transports} from 'winston';

const customFormat = format.printf(({
    level, message, label, timestamp
}) => {
    return `[${level}] [${label}] ${timestamp}: ${message}`;
});

const consoleTransport = new transports.Console({
    format: format.combine(
        format.colorize(),
        format.label({ label: 'FJKSite' }),
        format.timestamp(),
        customFormat,
    ),
});

function createNewLogger() {
    return createLogger({
        format: format.combine(
            format.label({ label: 'FJKSite' }),
            format.timestamp(),
            customFormat,
        ),
        transports: [
            new transports.File({filename: 'logs/error.log', level: 'error'}),
            new transports.File({filename: 'logs/all.log', level: 'info'}),
        ],
    });
}

export const Logger = {
    createNewLogger: createNewLogger,
    consoleTransport: consoleTransport,
};