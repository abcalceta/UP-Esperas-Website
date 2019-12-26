import fs from 'fs';
import path from 'path';

import cheerio from 'cheerio';
import Polyglot from 'node-polyglot';

async function createPaymentPage(originUrl, clientId, paymentObj, lang = 'en') {
    const paymentPage = await fs.promises.readFile(path.join(__dirname, './paypal-payment.html'), 'utf-8');
    const $ = cheerio.load(paymentPage);

    const localeObj = new Polyglot();
    const newLocale = ['en', 'eo'].includes(lang) ? lang : 'en';
    const localeFile = await fs.promises.readFile(path.join(__dirname, `./i18n/${newLocale}/common.json`), 'utf-8');
    localeObj.extend(JSON.parse(localeFile));

    const order = createOrder(localeObj, paymentObj);

    $('#div-payment-paypal').after(`
        <script id="script-paypal-sdk" src="https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${paymentObj.currencyAbbrev}&debug=false" defer async></script>
        <script>
            const order = ${JSON.stringify(order)};
            const originUrl = '${!originUrl ? '*' : originUrl}';
        </script>
    `);

    return $.html();
}

function createOrder(localeObj, paymentObj) {
    const items = createItems(localeObj, paymentObj);

    return {
        intent: 'CAPTURE',
        purchase_units: [{
            soft_descriptor: 'FJK 2020',
            amount: {
                currency_code: paymentObj.currencyAbbrev,
                value: paymentObj.fees.total,
                breakdown: {
                    item_total: {
                        currency_code: paymentObj.currencyAbbrev,
                        value: paymentObj.fees.total
                    }
                }
            },
            items: items
        }]
    };
}

function createItems(localeObj, paymentObj) {
    let paypalItems = [];

    // Set PayPal Items
    paypalItems.push({
        name: localeObj.t('fees.registration'),
        unit_amount: {
            currency_code: paymentObj.currencyAbbrev,
            value: paymentObj.fees.reg
        },
        quantity: 1
    });

    if(paymentObj.fees.excursion > 0) {
        paypalItems.push({
            name: localeObj.t('fees.excursion'),
            unit_amount: {
                currency_code: paymentObj.currencyAbbrev,
                value: paymentObj.fees.excursion
            },
            quantity: 1
        });
    }

    if(paymentObj.fees.invitLetter > 0) {
        paypalItems.push({
            name: localeObj.t('fees.invitLetter'),
            unit_amount: {
                currency_code: paymentObj.currencyAbbrev,
                value: paymentObj.fees.invitLetter
            },
            quantity: 1
        });
    }

    if(paymentObj.fees.congressFund > 0) {
        paypalItems.push({
            name: localeObj.t('fees.congressFund'),
            unit_amount: {
                currency_code: paymentObj.currencyAbbrev,
                value: paymentObj.fees.congressFund
            },
            quantity: 1
        });
    }

    if(paymentObj.fees.participantFund > 0) {
        paypalItems.push({
            name: localeObj.t('fees.participantFund'),
            unit_amount: {
                currency_code: paymentObj.currencyAbbrev,
                value: paymentObj.fees.participantFund
            },
            quantity: 1
        });
    }

    if(paymentObj.fees.fejFund > 0) {
        paypalItems.push({
            name: localeObj.t('fees.fejFund'),
            unit_amount: {
                currency_code: paymentObj.currencyAbbrev,
                value: paymentObj.fees.fejFund
            },
            quantity: 1
        });
    }

    return paypalItems;
}

export const PaypalPage = {
    createPaymentPage: createPaymentPage
};