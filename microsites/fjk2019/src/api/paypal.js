import fs from 'fs';
import path from 'path';

import cheerio from 'cheerio';

async function createPaymentPage(clientId, localeObj, paymentObj) {
    const paymentPage = await fs.promises.readFile(path.join(__dirname, './paypal-payment.html'), 'utf-8');
    const $ = cheerio.load(paymentPage);
    const order = createOrder(localeObj, paymentObj);

    const scriptObj = `
        <script id="script-paypal-sdk" src="https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${paymentObj.currencyAbbrev}&debug=true" defer async></script>
    `;

    $('body').append(scriptObj);
    $('body').append(`
    <script>
        function awaitPaypalJs() {
            return new Promise((resolve, reject) => {
                const scriptObj = document.getElementById('script-paypal-sdk');

                scriptObj.onsuccess = resolve;
                scriptObj.onload = resolve;
                scriptObj.onreadystatechange = resolve;
                scriptObj.onerror = reject;
            });
        }

        awaitPaypalJs().then(() => {
            paypal.Buttons({
                style: {
                    tagline: false
                },
                createOrder: let orderFcn = (data, actions) => {
                    return actions.order.create(${order});
                },
                onError: (err) => {
                    Materialize.toast({
                        html: \`Failed to process payment: $\{err\}\`,
                        classes: 'white-text theme-red'
                    });

                    paypalModal.close();

                    console.error(err);
                },
                onApprove: (data, actions) => {
                    console.log('Successful payment!');
                }
            }).render('#div-payment-paypal');
        });
    </script>
    `);

    return $.html();

    /*
    return {
        regFee: regFeeCost,
        excursion: excursionCost,
        invitLetter: invitLetterCost,
        congressFund: congressFundCost,
        participantFund: participantFundCost,
        fejFund: fejFundCost,
        total: totalPayableCost,
        currency: currencyKey,
        currencyAbbrev: currencyAbbrevKey,
        regCategory: regCatKey,
        paypalItems: paypalItems,
    };
    */
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
        name: 'Registration Fee' /*localeObj.t('register.forms.payment.fees.registration')*/,
        unit_amount: {
            currency_code: paymentObj.currencyAbbrev,
            value: paymentObj.fees.regFee
        },
        quantity: 1
    });

    if(paymentObj.fees.excursion > 0) {
        paypalItems.push({
            name: 'Excursion' /*localeObj.t('register.forms.payment.fees.excursion')*/,
            unit_amount: {
                currency_code: paymentObj.currencyAbbrev,
                value: paymentObj.fees.excursion
            },
            quantity: 1
        });
    }

    if(paymentObj.fees.invitLetter > 0) {
        paypalItems.push({
            name: 'Invitation Letter' /*this.localeObj.t('register.forms.payment.fees.invitLetter')*/,
            unit_amount: {
                currency_code: paymentObj.currencyAbbrev,
                value: paymentObj.fees.invitLetter
            },
            quantity: 1
        });
    }

    if(paymentObj.fees.congressFund > 0) {
        paypalItems.push({
            name: 'Congress Fund' /* localeObj.t('register.forms.payment.fees.congressFund') */,
            unit_amount: {
                currency_code: paymentObj.currencyAbbrev,
                value: paymentObj.fees.congressFund
            },
            quantity: 1
        });
    }

    if(paymentObj.fees.participantFund > 0) {
        paypalItems.push({
            name: 'Participant Support' /* localeObj.t('register.forms.payment.fees.participantFund') */,
            unit_amount: {
                currency_code: paymentObj.currencyAbbrev,
                value: paymentObj.fees.participantFund
            },
            quantity: 1
        });
    }

    if(paymentObj.fees.fejFund > 0) {
        paypalItems.push({
            name: 'Association Fund' /* localeObj.t('register.forms.payment.fees.associationFund') */,
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