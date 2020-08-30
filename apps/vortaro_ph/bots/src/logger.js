import {createLogger, format, transports, loggers} from 'winston';
import {v4 as uuidv4} from 'uuid';

const customFormat = format.printf(({
    level, message, label, timestamp
}) => {
    return `[${level}] [${label}] ${timestamp}: ${message}`;
});

function createNewLogger(tag = 'common') {
    const loggerId = uuidv4();

    const loggerTransports = [
        new transports.File({filename: `logs/${tag}_error.log`, level: 'error'}),
        new transports.File({filename: `logs/${tag}_all.log`, level: 'info'}),
    ];

    if (process.env.NODE_ENV !== 'production') {
        const consoleTransport = new transports.Console({
            format: format.combine(
                format.colorize(),
                format.label({ label: `VortaroPH_${tag}` }),
                format.timestamp(),
                customFormat,
            ),
        });

        loggerTransports.push(consoleTransport);
    }

    const logger = loggers.add(loggerId, {
        format: format.combine(
            format.label({ label: `VortaroPH_${tag}` }),
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
    createNewLogger: createNewLogger
};