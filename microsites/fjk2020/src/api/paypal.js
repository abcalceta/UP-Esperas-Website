import fs from 'fs';
import path from 'path';

import cheerio from 'cheerio';
import Polyglot from 'node-polyglot';

function roundToPlaces(value, precision) {
    // https://stackoverflow.com/a/7343013
    var multiplier = Math.pow(10, precision || 0);

    return Math.round(value * multiplier) / multiplier;
}

async function createPaymentPage(originUrl, clientId, paymentObj, lang = 'en') {
    const paymentPage = await fs.promises.readFile(path.join(__dirname, '/templates/paypal-payment.html'), 'utf-8');
    const $ = cheerio.load(paymentPage);

    const localeObj = new Polyglot();
    const newLocale = ['en', 'eo'].includes(lang) ? lang : 'en';
    const localeFile = await fs.promises.readFile(path.join(__dirname, `/i18n/${newLocale}/common.json`), 'utf-8');
    localeObj.extend(JSON.parse(localeFile));

    const order = createOrder(localeObj, paymentObj);

    // Append loading text
    $('#div-loader').append(`<p>${localeObj.t('loading')}</p>`);

    // Append iframe, order info, and origin url
    $('#div-payment-paypal').after(`
        <script>
            window.iFrameResizer = {
                targetOrigin: '${!originUrl ? '*' : originUrl}',
            };

            const order = ${JSON.stringify(order)};
            const originUrl = '${!originUrl ? '*' : originUrl}';
        </script>
        <script id="script-paypal-sdk" src="https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${paymentObj.currencyAbbrev}&debug=false" defer async></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.2.8/iframeResizer.contentWindow.min.js"></script>
    `);

    return $.html();
}

function createOrder(localeObj, paymentObj) {
    const items = createItems(localeObj, paymentObj);
    const totalFees = roundToPlaces(paymentObj.fees.total + (paymentObj.fees.total * 0.05), 2);

    return {
        intent: 'CAPTURE',
        purchase_units: [{
            soft_descriptor: 'FJK 2020',
            amount: {
                currency_code: paymentObj.currencyAbbrev,
                value: totalFees,
                breakdown: {
                    item_total: {
                        currency_code: paymentObj.currencyAbbrev,
                        value: totalFees
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
        category: 'DIGITAL_GOODS',
        unit_amount: {
            currency_code: paymentObj.currencyAbbrev,
            value: roundToPlaces(paymentObj.fees.reg, 2)
        },
        quantity: 1
    });

    if(paymentObj.fees.excursion > 0) {
        paypalItems.push({
            name: localeObj.t('fees.excursion'),
            category: 'DIGITAL_GOODS',
            unit_amount: {
                currency_code: paymentObj.currencyAbbrev,
                value: roundToPlaces(paymentObj.fees.excursion, 2)
            },
            quantity: 1
        });
    }

    if(paymentObj.fees.invitLetter > 0) {
        paypalItems.push({
            name: localeObj.t('fees.invitLetter'),
            category: 'DIGITAL_GOODS',
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
            category: 'DIGITAL_GOODS',
            unit_amount: {
                currency_code: paymentObj.currencyAbbrev,
                value: roundToPlaces(paymentObj.fees.congressFund, 2)
            },
            quantity: 1
        });
    }

    if(paymentObj.fees.participantFund > 0) {
        paypalItems.push({
            name: localeObj.t('fees.participantFund'),
            category: 'DIGITAL_GOODS',
            unit_amount: {
                currency_code: paymentObj.currencyAbbrev,
                value: roundToPlaces(paymentObj.fees.participantFund, 2)
            },
            quantity: 1
        });
    }

    if(paymentObj.fees.fejFund > 0) {
        paypalItems.push({
            name: localeObj.t('fees.fejFund'),
            category: 'DIGITAL_GOODS',
            unit_amount: {
                currency_code: paymentObj.currencyAbbrev,
                value: roundToPlaces(paymentObj.fees.fejFund, 2)
            },
            quantity: 1
        });
    }

    // Add PayPal fee
    paypalItems.push({
        name: localeObj.t('fees.adminFee'),
        category: 'DIGITAL_GOODS',
        unit_amount: {
            currency_code: paymentObj.currencyAbbrev,
            value: roundToPlaces(paymentObj.fees.total * 0.05, 2)
        },
        quantity: 1
    })

    return paypalItems;
}

export const PaypalPage = {
    createPaymentPage: createPaymentPage
};