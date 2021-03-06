import {createLogger, format, transports, loggers} from 'winston';
import uuidv4 from 'uuid/v4';

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
    const loggerId = uuidv4();

    const loggerTransports = [
        new transports.File({filename: 'logs/error.log', level: 'error'}),
        new transports.File({filename: 'logs/all.log', level: 'info'}),
    ];

    if (process.env.NODE_ENV !== 'production') {
        loggerTransports.push(Logger.consoleTransport);
    }

    const logger = loggers.add(loggerId, {
        format: format.combine(
            format.label({ label: 'FJKSite' }),
            format.timestamp(),
            customFormat,
        ),
        transports: loggerTransports,
    });

    return {
        id: loggerId,
        loggerObj: logger,
    };
}

export const Logger = {
    createNewLogger: createNewLogger,
    consoleTransport: consoleTransport,
};