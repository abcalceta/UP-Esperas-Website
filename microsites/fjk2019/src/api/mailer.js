import fs from 'fs';
import path from 'path';

import cheerio from 'cheerio';
import nodemailer from 'nodemailer';
import Polyglot from 'node-polyglot';
import {loggers} from 'winston';

async function sendConfirmationMail(mailAttrs, locale='en') {
    const logger = loggers.get(process.env.SHARED_LOGGER_ID);

    //logger.info(`Sending mail ${process.env.MAILER_USER} -> ${toEmail}`);

    const dummyAccount = await nodemailer.createTestAccount();
    const mailObj = await buildConfirmationMail(mailAttrs, locale);

    const transporter = nodemailer.createTransport({
        host: dummyAccount.smtp.host,
        port: dummyAccount.smtp.port,
        secure: dummyAccount.smtp.secure,
        auth: {
            user: dummyAccount.user,
            pass: dummyAccount.pass,
        },
    });

    /*
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
    */

    const message = {
        //from: `${process.env.MAILER_NAME} <${process.env.MAILER_USER}>`,
        //to: `${toName} <${toEmail}>`,
        from: 'Philippine Esperanto Youth Congress <peyc2020@up-esperas.org>',
        to: 'DEF <def@ghi.xyz>',
        subject: 'Confirmation - First Philippine Esperanto Youth Congress',
        text: mailObj.txt,
        html: mailObj.html,
    };

    await transporter.verify();
    const messageInfo = await transporter.sendMail(message);

    //logger.info(`Email successfully sent to ${toEmail} with ID: ${messageInfo.messageId}`);
    logger.info(`Test email successfully sent: ${nodemailer.getTestMessageUrl(messageInfo)}`);

    return messageInfo.messageId;
}

async function buildConfirmationMail(formInfo, lang='en') {
    const propKeys = ['foodRestrictions', 'foodAllergies', 'lodging', 'congressPhoto', 'invitLetter', 'program', 'comments'];

    const mailHtmlTpl = await fs.promises.readFile(path.join(__dirname, '/mail/confirm.html'), 'utf-8');
    const mainTxtTpl = await fs.promises.readFile(path.join(__dirname, '/mail/confirm.txt'), 'utf-8');

    const newLocale = ['en', 'eo'].includes(lang) ? lang : 'en';
    const localeFile = await fs.promises.readFile(path.join(__dirname, `/mail/mail_${newLocale}.json`), 'utf-8');
    const localeObj = new Polyglot({});
    localeObj.extend(JSON.parse(localeFile));

    const regInfo = {
        nickname: formInfo.nickname,
        regCat: formInfo.regCat,
        paymentMethod: formInfo.paymentMethod,
        registrationId: formInfo.regId,
        paymentId: formInfo.paymentId,
    }

    const $ = cheerio.load(evalTemplate(mailHtmlTpl, localeObj, regInfo));
    let tagList = [];
    let otherInfoText = '';
    let firstKeyAdd = true;

    for(let eachKey of propKeys) {
        if(formInfo[eachKey] == undefined || formInfo[eachKey] === false) {
            continue;
        }

        if(firstKeyAdd) {
            $('#tdRefIds').append(`
            <tr>
                <td style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; padding: 20px 0 20px 0;">
                    ${localeObj.t('confirm.otherInfoPar')}
                </td>
            </tr>
            `);

            otherInfoText += `${localeObj.t('confirm.otherInfoPar')}\n\n`;

            firstKeyAdd = false;
        }

        const localeKeyPrefix = `confirm.otherInfo.${eachKey}`;

        $('#tdRefIds').append(`
        <tr>
            <td style="padding: 0 0 0 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                    <tr>
                        <td>
                            <table align="left" border="0" cellpadding="0" cellspacing="0" width="48" style="border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 0 20px 20px 0;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="48" style="border-collapse: collapse;">
                                            <tr>
                                                <td bgcolor="#992226" height="48" style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; padding: 20px 20px 20px 20px;">
                                                    <img alt="${localeObj.t(`${localeKeyPrefix}.header`)}" src="${localeObj.t(`${localeKeyPrefix}.icon`)}" width="48" height="48" style="display: block;" />
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <table align="left" border="0" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 340px; border-collapse: collapse;">
                                <tr>
                                    <td style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; padding: 0 0 20px 0;">
                                        <b>${localeObj.t(`${localeKeyPrefix}.header`)}</b> - ${localeObj.t(`${localeKeyPrefix}.desc`)}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        `);

        otherInfoText += `${localeObj.t(`${localeKeyPrefix}.header`)}</b> - ${localeObj.t(`${localeKeyPrefix}.desc`)}\n\n`;
    }

    const transTxtTpl = cheerio.load(evalTemplate(mainTxtTpl, localeObj, regInfo, otherInfoText)).root().text();

    return {
        html: $.html(),
        txt: transTxtTpl,
    }
}

function evalTemplate(tpl, localeObj, regInfo, otherInfoText='') {
    return new Function(`return \`${tpl}\`;`).call({
        localeObj: localeObj,
        regInfo: regInfo,
        otherInfoText: otherInfoText,
    });
}

export const Mailer = {
    sendConfirmationMail: sendConfirmationMail,
};