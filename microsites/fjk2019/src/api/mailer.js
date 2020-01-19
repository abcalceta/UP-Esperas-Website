import fs from 'fs';
import path from 'path';

import cheerio from 'cheerio';
import nodemailer from 'nodemailer';
import Polyglot from 'node-polyglot';
import {loggers} from 'winston';

async function sendConfirmationMail(formObj, registrantId, paymentId, locale='en') {
    const logger = loggers.get(process.env.SHARED_LOGGER_ID);
    const toMail = formObj['txt-email'];
    const foodAllergiesList = (formObj['cbx-food-allerg'] === undefined) ? [] : formObj['cbx-food-allerg'];

    logger.info(`Sending mail ${process.env.MAILER_USER} -> ${toMail}`);

    const mailObj = await buildConfirmationMail({
        to: toMail,
        firstName: formObj['txt-first-name'],
        lastName: formObj['txt-last-name'],
        countryCode: formObj['select-countries-list'],
        nickname: formObj['txt-nickname'],
        regCat: formObj['hdn-reg-category'],
        paymentMethod: formObj['rbx-payment-method'],
        regId: registrantId,
        paymentId: paymentId,
        foodRestrictions: (formObj['rbx-food-pref'] == 'other'),
        foodAllergies: foodAllergiesList.indexOf('other') != -1,
        lodging: (formObj['cbx-lodging-interest'] == 'on'),
        congressPhoto: (formObj['cbx-others-photo'] == 'on'),
        invitLetter: (formObj['cbx-others-invitletter'] == 'on'),
        program: (formObj['cbx-others-contrib'] == 'on'),
        comments: formObj['txt-others-suggest'].trim().length > 0,
    }, locale);

    /*
    const dummyAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
        host: dummyAccount.smtp.host,
        port: dummyAccount.smtp.port,
        secure: dummyAccount.smtp.secure,
        auth: {
            user: dummyAccount.user,
            pass: dummyAccount.pass,
        },
    });
    */

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
        from: `${mailObj.fromName} <${process.env.MAILER_USER}>`,
        to: `${formObj['txt-first-name']} ${formObj['txt-last-name']} <${toMail}>`,
        subject: mailObj.subject,
        text: mailObj.txt,
        html: mailObj.html,
    };

    const receiptMessage = {
        from: process.env.MAILER_USER,
        to: 'peyc2020@gmail.com',
        subject: 'Informo pri nova aliĝo de servilo',
        text: mailObj.receiptTxt,
    };

    await transporter.verify();

    const messageInfo = await transporter.sendMail(message);
    const receiptMessageInfo = await transporter.sendMail(receiptMessage);

    logger.info(`Email successfully sent with ID: ${messageInfo.messageId}`);
    logger.info(`Receipt mail successfully sent with ID: ${messageInfo.messageId}`);

    if(nodemailer.getTestMessageUrl(messageInfo)) {
        logger.info(`Test email successfully sent: ${nodemailer.getTestMessageUrl(messageInfo)}`);
    }

    if(nodemailer.getTestMessageUrl(receiptMessageInfo)) {
        logger.info(`Test receipt email successfully sent: ${nodemailer.getTestMessageUrl(receiptMessageInfo)}`);
    }

    return messageInfo.messageId;
}

async function buildConfirmationMail(formInfo, lang='en') {
    const propKeys = ['foodRestrictions', 'foodAllergies', 'lodging', 'congressPhoto', 'invitLetter', 'program', 'comments'];

    const mailHtmlTpl = await fs.promises.readFile(path.join(__dirname, '/mail/confirm.html'), 'utf-8');
    const mainTxtTpl = await fs.promises.readFile(path.join(__dirname, '/mail/confirm.txt'), 'utf-8');
    const receiptTxtTpl = await fs.promises.readFile(path.join(__dirname, '/mail/confirm_receipt.txt'), 'utf-8')

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

    const $ = cheerio.load(evalTemplate(mailHtmlTpl, {
        localeObj: localeObj,
        regInfo: regInfo,
    }));

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
                <!--[if (gte mso 9)|(IE)]>
                <table width="108" align="left" cellpadding="0" cellspacing="0" border="0">
                <tr>
                <td>
                <![endif]-->
                <table align="left" border="0" cellpadding="0" cellspacing="0" width="108" style="display: inline-block; vertical-align: top; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 0 20px 20px 0;">
                            <table border="0" cellpadding="0" cellspacing="0" width="48" style="border-collapse: collapse;">
                                <tr>
                                    <td bgcolor="#992226" height="48" style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; padding: 20px 20px 20px 20px;">
                                        <img border="0" alt="${localeObj.t(`${localeKeyPrefix}.header`)}" src="${localeObj.t(`${localeKeyPrefix}.icon`)}" width="48" height="48" style="display: block;" />
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->

                <!--[if (gte mso 9)|(IE)]>
                <table width="340" align="left" cellpadding="0" cellspacing="0" border="0">
                <tr>
                <td>
                <![endif]-->
                <table align="left" border="0" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 340px; display: inline-block; vertical-align: top; border-collapse: collapse;">
                    <tr>
                        <td style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; padding: 0 0 20px 0;">
                            <b>${localeObj.t(`${localeKeyPrefix}.header`)}</b> - ${localeObj.t(`${localeKeyPrefix}.desc`)}
                        </td>
                    </tr>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
            </td>
        </tr>
        `);

        otherInfoText += `${localeObj.t(`${localeKeyPrefix}.header`)}</b> - ${localeObj.t(`${localeKeyPrefix}.desc`)}\n\n`;
    }

    const transTxtTpl = cheerio.load(
        evalTemplate(mainTxtTpl, {
            localeObj: localeObj,
            regInfo: regInfo,
            otherInfoText: otherInfoText,
        })
    ).root().text();

    const transReceiptTxtTpl = evalTemplate(receiptTxtTpl, {
        regData: {
            firstName: formInfo.firstName,
            lastName: formInfo.lastName.toUpperCase(),
            countryCode: formInfo.countryCode,
            timestamp: new Date(Date.now()).toISOString(),
            registrationId: formInfo.regId,
            paymentId: formInfo.paymentId,
        },
    });

    return {
        fromName: localeObj.t('generalText.title'),
        subject: localeObj.t('confirm.subject'),
        html: $.html(),
        txt: transTxtTpl,
        receiptTxt: transReceiptTxtTpl,
    };
}

function evalTemplate(tpl, namespaces = {}) {
    return new Function(`return \`${tpl}\`;`).call(namespaces);
}

export const Mailer = {
    sendConfirmationMail: sendConfirmationMail,
};