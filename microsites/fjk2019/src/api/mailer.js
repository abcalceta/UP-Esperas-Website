import nodemailer from 'nodemailer';
import {loggers} from 'winston';

async function sendMail(toName = process.env.ETHEREAL_NAME, toEmail = process.env.ETHEREAL_USER) {
    const logger = loggers.get(process.env.SHARED_LOGGER_ID);

    logger.info(`Sending mail ${process.env.MAILER_USER} -> ${toEmail}`);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILER_HOST,
        port: process.env.MAILER_PORT,
        secure: false,
        name: 'up-esperas.org',
        auth: {
            user: process.env.MAILER_USER,
            pass: process.env.MAILER_PASS,
        },
    });

    const message = {
        from: `${process.env.MAILER_NAME} <${process.env.MAILER_USER}>`,
        to: `${toName} <${toEmail}>`,
        subject: 'Hello!',
        text: 'Sample Text',
        html: '<p>Sample Text</p>',
    };

    await transporter.verify();
    const messageInfo = await transporter.sendMail(message);

    logger.info(`Email successfully sent to ${toEmail} with ID: ${messageInfo.messageId}`);

    return messageInfo.messageId;
}

export const Mailer = {
    sendMail: sendMail,
};