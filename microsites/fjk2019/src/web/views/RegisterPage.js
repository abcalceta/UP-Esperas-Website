import m from 'mithril';
import Materialize from 'materialize-css';
import Cookies from 'js-cookie';
import { iframeResizer } from 'iframe-resizer';

import {DomScripts} from '../util/dom';
import {RegFormUtils} from '../util/RegFormUtils';

import {BasePage} from './BasePage';
import htmlMain from '../templates/register.html';
import heroPath from '../img/hero/ks_cards.jpg';

import '../styles/steps.css';
import '../styles/regform.css';

import regFeesJson from '../regrates.json';

export class RegisterPage extends BasePage {
    constructor() {
        super(
            'eo',
            'register',
            htmlMain,
            'RegisterPage',
            heroPath
        );

        //this.apiDomain = 'https://fjk.up-esperas.org/api';
        this.apiDomain = '//localhost:6002/api';

        this.countryList = [];
        this.currentPageState = 0;
        this.pageStatesList = [
            ['Basic', 'info', 'section-basic'],
            ['Registration', 'details', 'section-reg'],
            ['Lodging', 'hotel', 'section-lodging'],
            ['Excursion', 'emoji_nature', 'section-excursion'],
            ['Food', 'restaurant', 'section-food'],
            ['Others', 'star', 'section-others'],
            ['Summary', 'how_to_reg', 'section-summary'],
            ['Payment', 'payment', 'section-payment'],
        ];

        this.monthsWords = {
            full: [],
            short: []
        };
        this.daysWords = {
            short: [],
            abbrev: []
        };
    }

    onupdate(vnode) {
        super.onupdate();

        if(this.isCountryListUpdated || this.isTranslated) {
            // Populate country list
            const countrySelectElm = document.getElementById('select-countries-list');
            let countryElmList = [];

            this.countryList.forEach((v) => {
                if(v[1] == 'PHL') {
                    return;
                }

                countryElmList.push(m('option', {value: v[1]}, v[0]));
            });

            m.render(countrySelectElm, [
                m('option', {selected: true, disabled: true}, this.localeObj.t('register.forms.basic.fields.countryOfOrigin')),
                m('optgroup', {label: this.localeObj.t('locality.localPlural')}, [
                    m('option', {value: 'PHL'}, this.localeObj.t('locality.ph'))
                ]),
                m('optgroup', {label: this.localeObj.t('locality.foreignPlural')}, countryElmList),
            ]);

            Materialize.FormSelect.init(countrySelectElm);

            this.isCountryListUpdated = false;
        }

        if(this.isTranslated) {
            // Reinit dropdowns
            Materialize.FormSelect.init(document.querySelectorAll('select'));

            this.attachRegOverview();
            this.attachRegisterEvent();
            this.attachExcursionEvent();
            this.attachOthersEvent();
            this.attachThanksEvent();
            this.attachNavBtnEvent();

            this.updateRegDatesUi();
            this.populateLodgingDatesList();

            // Translate regform sections
            this.pageStatesList[0][0] = this.localeObj.t('register.steps.basic');
            this.pageStatesList[1][0] = this.localeObj.t('register.steps.register');
            this.pageStatesList[2][0] = this.localeObj.t('register.steps.lodging');
            this.pageStatesList[3][0] = this.localeObj.t('register.steps.excursion');
            this.pageStatesList[4][0] = this.localeObj.t('register.steps.food');
            this.pageStatesList[5][0] = this.localeObj.t('register.steps.others');
            this.pageStatesList[6][0] = this.localeObj.t('register.steps.summary');
            this.pageStatesList[7][0] = this.localeObj.t('register.steps.payment');

            // Init date widget
            RegFormUtils.initDatePicker('#txt-bday');

            // Set messaging event (for PayPal iframe)
            window.addEventListener('message', (e) => {
                const allowedDomains = [
                    'http://localhost:6161',
                    'https://fjk.up-esperas.org',
                ];

                if(allowedDomains.indexOf(e.origin) === -1) {
                    return;
                }

                if(e.data.type != 'payment') {
                    return;
                }

                console.info(`Received payent message from ${e.origin}!`);

                switch(e.data.error_code) {
                    case 'PMT201': {
                        Materialize.toast({
                            html: this.localeObj.t('register.generalText.paypalProcessing'),
                            classes: 'theme-green white-text',
                        });

                        break;
                    }
                    case 'PMT200': {
                        Materialize.toast({
                            html: this.localeObj.t('register.generalText.paypalSuccess'),
                            classes: 'theme-green white-text',
                        });

                        document.querySelector('input[type=hidden][name=hdn-paypal-order-id]').value = e.data.order_id;
                        this.submitForm();

                        break;
                    }
                    case 'PMTCXD': {
                        Materialize.toast({
                            html: this.localeObj.t('register.generalErrors.paymentCancelled'),
                            classes: 'white-text theme-yellow',
                        });

                        break;
                    }
                    default:
                        Materialize.toast({
                            html: this.localeObj.t('register.generalErrors.genericPayment', {errorMsg: e.data.detail}),
                            classes: 'white-text theme-red',
                        });
                }
            });

            document.querySelector('input[type=hidden][name=hdn-locale]').value = this.data.locale.lang;

            this.isTranslated = false;
        }

        const pageIdxFromHistory = vnode.attrs.lastPageIdx;
        console.log(`this: ${this.currentPageState}, new: ${pageIdxFromHistory}`);

        if(this.currentPageState == 0 && (typeof pageIdxFromHistory !== 'number' && !(pageIdxFromHistory instanceof Number))) {
            // Overview screen
            console.log('In overview screen');
            return;
        }
        else if(this.currentPageState == this.pageStatesList.length - 1 && (typeof pageIdxFromHistory !== 'number' && !(pageIdxFromHistory instanceof Number))) {
            // Overview screen
            console.log('In thanks screen');
            return;
        }

        // Update step progress
        const stepContainerElm = document.querySelector('#div-steps');
        m.render(stepContainerElm, this.getStepsDom(pageIdxFromHistory));

        if(pageIdxFromHistory == this.currentPageState) {
            if(pageIdxFromHistory == 0) {
                console.log('Clicked from overview page.');
            }
            else {
                console.log('Clicked translation fab.');

                this.hideOverviewSection(this.pageStatesList[pageIdxFromHistory][2]);

                // Hacks to recreate current state
                this.swapFormSections(pageIdxFromHistory, pageIdxFromHistory);

                for(let i = 0; i <= pageIdxFromHistory; ++i) {
                    RegFormUtils.loadFormElements(`#${this.pageStatesList[i][2]}`);
                    this.triggerSectionChanges(i);
                }

                Materialize.updateTextFields();

                Materialize.FormSelect.init(
                    document.querySelectorAll(
                        `#select-countries-list,
                         #select-sex-list,
                         #select-reg-occupation,
                         #select-lodging-arrive,
                         #select-lodging-depart`
                    )
                );
            }

            return;
        }
        else if(pageIdxFromHistory - this.currentPageState > 1) {
            console.log('Screen skipped!');

            return;
        }

        if(typeof pageIdxFromHistory == 'number' || pageIdxFromHistory instanceof Number) {
            console.info(`Moving to page from history: ${this.pageStatesList[pageIdxFromHistory][0]}`);

            stepContainerElm.scrollIntoView({
                behavior: 'smooth',
            });


            this.swapFormSections(this.currentPageState, pageIdxFromHistory);
            this.scrollStepTimeline(pageIdxFromHistory);
            this.triggerSectionChanges(pageIdxFromHistory);

            this.currentPageState = pageIdxFromHistory;
        }
    }

    onLocaleChanged() {
        super.onLocaleChanged();

        // Load country list
        m.request({
            method: 'GET',
            url: `/i18n/${this.data.locale.lang}/countryList.json`,
            background: true,
        })
        .then((t) => {
            this.countryList = t.map((eachCountry) => {
                return [eachCountry.name, eachCountry.alpha3Code];
            }).sort((a, b) => {
                const nameA = a[0].toLowerCase();
                const nameB = b[0].toLowerCase();

                return nameA.localeCompare(nameB, this.data.locale.lang);
            });

            this.isCountryListUpdated = true;
        })
        .catch((err) => {
            Materialize.toast({
                html: `Failed to load translation: ${err}`,
                classes: 'theme-red white-text',
            });
        });
    }

    attachRegOverview() {
        let startRegLink = document.querySelector('#a-start-reg');

        startRegLink.addEventListener('click', (e) => {
            e.preventDefault();

            let isConsented = Cookies.get('cookie_consent');

            if(!isConsented) {
                Cookies.set('cookie_consent', true);
            }

            // Reveal basic info form
            this.pageIdxFromHistory = 0;

            this.hideOverviewSection('section-basic', () => {
                m.route.set(
                    `/register/${this.pageStatesList[0][2]}`,
                    null,
                    {
                        replace: false,
                        state: {
                            lastPageIdx: 0,
                        }
                    }
                );
            });
        });
    }

    attachRegisterEvent() {
        const regTypeRadioList = document.querySelectorAll('input[type=radio][name=rbx-reg-broad]');
        const regCategoryDiv = document.querySelector('#div-reg-category');
        const educInfoDiv = document.querySelector('#div-reg-educ-info');
        const workInfoDiv = document.querySelector('#div-reg-work-info');
        const occupationList = document.querySelector('#select-reg-occupation');

        occupationList.addEventListener('change', (e) => {
            // Show or hide discount notice
            if(occupationList.value == 'shs' || occupationList.value == 'undergrad') {
                document.getElementById('div-card-reg-discount').classList.remove('hide');
            }
            else {
                document.getElementById('div-card-reg-discount').classList.add('hide');
            }

            // Show or hide divs
            switch(occupationList.value) {
                case 'shs': {
                    const degreeTxt = educInfoDiv.querySelector('#txt-reg-degree');

                    degreeTxt.parentElement.querySelector('label[for=txt-reg-degree]').innerHTML = this.localeObj.t('register.forms.register.fields.strand');
                    degreeTxt.parentElement.querySelector('span').dataset.error = this.localeObj.t('register.forms.register.errors.strand');

                    Materialize.updateTextFields();

                    document.querySelector('#txt-reg-educ').required = true;
                    degreeTxt.required = true;
                    document.querySelector('#txt-reg-company').required = false;
                    document.querySelector('#txt-reg-position').required = false;

                    educInfoDiv.classList.remove('hide');
                    DomScripts.animateOnce(educInfoDiv, ['fadeIn', 'faster']);

                    if(!workInfoDiv.classList.contains('hide')) {
                        DomScripts.animateOnce(workInfoDiv, ['fadeOut', 'faster'], () => {
                            workInfoDiv.classList.add('hide');
                        });
                    }

                    break;
                }
                case 'undergrad':
                case 'grad': {
                    let degreeTxt = educInfoDiv.querySelector('#txt-reg-degree');

                    degreeTxt.parentElement.querySelector('label').innerHTML = this.localeObj.t('register.forms.register.fields.degree');
                    degreeTxt.parentElement.querySelector('span').dataset.error = this.localeObj.t('register.forms.register.errors.degree');

                    Materialize.updateTextFields();

                    document.querySelector('#txt-reg-educ').required = true;
                    degreeTxt.required = true;
                    document.querySelector('#txt-reg-company').required = false;
                    document.querySelector('#txt-reg-position').required = false;

                    educInfoDiv.classList.remove('hide');
                    DomScripts.animateOnce(educInfoDiv, ['fadeIn', 'faster']);

                    if(!workInfoDiv.classList.contains('hide')) {
                        DomScripts.animateOnce(workInfoDiv, ['fadeOut', 'faster'], () => {
                            workInfoDiv.classList.add('hide');
                        });
                    }

                    break;
                }
                case 'working': {
                    document.querySelector('#txt-reg-degree').required = false;
                    document.querySelector('#txt-reg-educ').required = false;
                    document.querySelector('#txt-reg-company').required = true;
                    document.querySelector('#txt-reg-position').required = true;

                    workInfoDiv.classList.remove('hide');
                    DomScripts.animateOnce(educInfoDiv, ['fadeIn', 'faster']);

                    if(!educInfoDiv.classList.contains('hide')) {
                        DomScripts.animateOnce(educInfoDiv, ['fadeOut', 'faster'], () => {
                            educInfoDiv.classList.add('hide');
                        });
                    }

                    break;
                }
                default: {
                    document.querySelector('#txt-reg-degree').required = false;
                    document.querySelector('#txt-reg-educ').required = false;
                    document.querySelector('#txt-reg-company').required = false;
                    document.querySelector('#txt-reg-position').required = false;

                    if(!educInfoDiv.classList.contains('hide')) {
                        DomScripts.animateOnce(educInfoDiv, ['fadeOut', 'faster'], () => {
                            educInfoDiv.classList.add('hide');
                        });
                    }

                    if(!workInfoDiv.classList.contains('hide')) {
                        DomScripts.animateOnce(workInfoDiv, ['fadeOut', 'faster'], () => {
                            workInfoDiv.classList.add('hide');
                        });
                    }

                    break;
                }
            }
        });

        regTypeRadioList.forEach((v) => {
            v.addEventListener('change', (e) => {
                let changedValue = v.value;

                if(!v.checked) {
                    return;
                }

                switch(changedValue) {
                    case 'regular': {
                        regCategoryDiv.classList.remove('hide');
                        DomScripts.animateOnce(regCategoryDiv, ['fadeIn', 'faster']);

                        occupationList.required = true;

                        break;
                    }
                    case 'moral':
                    case 'patron': {
                        if(!regCategoryDiv.classList.contains('hide')) {
                            DomScripts.animateOnce(regCategoryDiv, ['fadeOut', 'faster'], () => {
                                regCategoryDiv.classList.add('hide');
                            });
                        }

                        if(!educInfoDiv.classList.contains('hide')) {
                            DomScripts.animateOnce(educInfoDiv, ['fadeOut', 'faster'], () => {
                                educInfoDiv.classList.add('hide');
                            });
                        }

                        if(!workInfoDiv.classList.contains('hide')) {
                            DomScripts.animateOnce(workInfoDiv, ['fadeOut', 'faster'], () => {
                                workInfoDiv.classList.add('hide');
                            });
                        }

                        occupationList.required = false;
                        document.querySelector('#txt-reg-degree').required = false;
                        document.querySelector('#txt-reg-educ').required = false;
                        document.querySelector('#txt-reg-company').required = false;
                        document.querySelector('#txt-reg-position').required = false;

                        break;
                    }
                    default:
                        // Pass
                }
            });
        });
    }

    attachExcursionEvent() {
        const fareNoticeCard = document.getElementById('div-excursion-fare-notice');
        const excursionCbx = document.querySelector('input[type=checkbox][name=cbx-excursion-interest]');

        excursionCbx.addEventListener('change', (e) => {
            if(!excursionCbx.checked) {
                DomScripts.animateOnce(fareNoticeCard, ['fadeOut', 'fast'], () => {
                    fareNoticeCard.classList.add('hide');
                });

                return;
            }

            const excursionCost = this.computeExcursionFee(this.isLocalRates());

            fareNoticeCard.innerHTML = this.localeObj.t('register.forms.excursion.fareNotice', {currencySymbol: excursionCost.currency, price: excursionCost.value});
            fareNoticeCard.classList.remove('hide');

            DomScripts.animateOnce(fareNoticeCard, ['fadeIn', 'fast']);
        });
    }

    attachOthersEvent() {
        const invitLetterCbx = document.querySelector('input[name=cbx-others-invitletter][type=checkbox]');
        const invitLetterShipDiv = document.getElementById('div-others-invitletter-shipinfo');
        const shipViaRbx = document.querySelectorAll('input[type=radio][name=rbx-others-invitletter-shipvia]');
        const shipToCard = document.getElementById('div-card-invitletter-price');

        invitLetterCbx.addEventListener('change', (e) => {
            if(invitLetterCbx.checked) {
                invitLetterShipDiv.classList.remove('hide');
            }

            DomScripts.animateOnce(invitLetterShipDiv, [(invitLetterCbx.checked) ? 'fadeIn' : 'fadeOut', 'fast'], () => {
                if(!invitLetterCbx.checked) {
                    invitLetterShipDiv.classList.add('hide');
                }
            });
        });

        shipViaRbx.forEach((v) => {
            v.addEventListener('change', (e) => {
                let cardCostNotice = '';

                if(v.value == 'express') {
                    cardCostNotice = this.localeObj.t('register.forms.others.invitLetter.expressMailCostNotice');
                }
                else {
                    const {currency, value} = this.computeInvitationLetterFee(this.isLocalRates());
                    cardCostNotice = this.localeObj.t('register.forms.others.invitLetter.regularMailCostNotice', {currencySymbol: currency, price: value});
                }

                m.render(shipToCard, [
                    m('p', m.trust(cardCostNotice))
                ]);
            });
        });
    }

    attachThanksEvent() {
        const registerAgainBtn = document.getElementById('btn-register-again');
        let prevBtn = document.getElementById('btn-prev');
        let nextBtn = document.getElementById('btn-next');

        registerAgainBtn.addEventListener('click', (e) => {
            e.preventDefault();

            DomScripts.animateOnce('#section-thanks', ['fadeOutLeft', 'fast'], () => {
                document.getElementById('section-thanks').classList.add('hide');
                document.getElementById('section-guidelines').classList.remove('hide');

                // Reset button state
                this.currentPageState = 0;
                prevBtn.disabled = true;
                nextBtn.disabled = false;
                m.render(nextBtn, [
                    m('i', {class: 'material-icons right'}, 'navigate_next'),
                    this.localeObj.t('buttons.next')
                ]);

                // Reset registration info
                document.getElementById('form-register').reset();
                document.querySelector('#div-reg-category').classList.remove('hide');
                document.querySelector('#select-reg-occupation').required = true;
                document.getElementById('div-excursion-fare-notice').classList.add('hide');
                document.getElementById('div-others-invitletter-shipinfo').classList.add('hide');

                DomScripts.animateOnce('#section-guidelines', ['fadeInRight', 'fast']);

                m.route.set(
                    '/register',
                    null,
                    {
                        replace: false,
                        state: {
                            lastPageIdx: 0,
                        },
                    }
                );
            });
        });
    }

    attachNavBtnEvent() {
        let prevBtn = document.querySelector('#btn-prev');
        let nextBtn = document.querySelector('#btn-next');

        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // Go back one page
            history.back();
        });

        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();

            let fromSectionId = `#${this.pageStatesList[this.currentPageState][2]}`;

            if(!this.checkValidSubForm(fromSectionId)) {
                console.log('Section has invalid fields!');
                return;
            }

            // Submit form if on last page
            if(this.currentPageState >= this.pageStatesList.length - 1) {
                this.submitForm();
                return;
            }

            // Save form details onto session storage
            RegFormUtils.saveFormElements(fromSectionId);

            // Add new history route
            m.route.set(
                `/register/${this.pageStatesList[this.currentPageState + 1][2]}`,
                null,
                {
                    replace: false,
                    state: {lastPageIdx: this.currentPageState + 1}
                }
            );

            //this.currentPageState += 1;
        });
    }

    triggerSectionChanges(sectionIdx) {
        const countryList = document.getElementById('select-countries-list');
        const sectionId = this.pageStatesList[sectionIdx][2];
        let sectionDiv = document.querySelector(`#${sectionId}`);

        const isLocalRates = this.isLocalRates();

        switch(sectionId) {
            case 'section-reg':
                let rateCard = document.querySelector('#div-reg-ratecard');
                const localityStr = this.localeObj.t(`locality.${isLocalRates ? 'local' : 'foreign'}Plural`);

                // Init rate card
                rateCard.querySelector('div.card-content p').innerHTML = this.localeObj.t(`${this.data.locale.namespace}.forms.register.countryNotice`, {countryWord: countryList.options[countryList.selectedIndex].innerHTML, locality: localityStr.toLowerCase()});
                m.render(rateCard.querySelector('div.card-action'),
                    m('a', {class: 'btn-flat theme-green-text waves-effect modal-trigger', href: isLocalRates ? '#div-modal-ph-rates' : '#div-modal-foreign-rates'}, this.localeObj.t(`buttons.viewRates`))
                );

                break;
            case 'section-others': {
                // Set-up invitation letter card
                const rbxInvitLetterShipVia = document.querySelector('input[type=radio][name=rbx-others-invitletter-shipvia]:checked');
                const shipToCard = document.getElementById('div-card-invitletter-price');
                const shipVia = rbxInvitLetterShipVia.value;
                let cardCostNotice = '';

                if(shipVia == 'express') {
                    cardCostNotice = this.localeObj.t('register.forms.others.invitLetter.expressMailCostNotice');
                }
                else {
                    const {currency, value} = this.computeInvitationLetterFee(this.isLocalRates());
                    cardCostNotice = this.localeObj.t('register.forms.others.invitLetter.regularMailCostNotice', {currencySymbol: currency, price: value});
                }

                m.render(shipToCard, [
                    m('p', m.trust(cardCostNotice))
                ]);

                // Donation card
                const donateCurrencyCard = document.getElementById('div-donate-currency');
                const currencyKey = this.localeObj.t(`locality.${isLocalRates ? 'currencyWordsPh' : 'currencyWordsEu'}`);

                m.render(donateCurrencyCard, m.trust(this.localeObj.t('register.forms.others.donate.currencyNotice', {currencyWord: currencyKey})));

                // FEJ membership
                const cbxFej = document.querySelector('input[type=checkbox][name=cbx-others-fej]').parentElement.parentElement;

                if(this.isLocalRates()) {
                    cbxFej.classList.remove('hide');
                }
                else {
                    cbxFej.classList.add('hide');
                }

                break;
            }
            case 'section-summary': {
                // Set late payment notice
                const lateFee = this.computeLatePenaltyFee(isLocalRates);
                document.getElementById('div-payment-downpay-notice').innerHTML = this.localeObj.t('register.forms.summary.downpayNotice', {currencySymbol: lateFee.currency, value: lateFee.value});

                // Toggle online bank transfer
                const rbxOnlineBank = document.querySelectorAll('#div-card-payment-details + div p')[1];

                // Reset disabled next button from PayPal
                document.getElementById('btn-next').disabled = false;

                if(this.isLocalRates()) {
                    rbxOnlineBank.classList.remove('hide');
                }
                else {
                    rbxOnlineBank.classList.add('hide');
                }

                // Compute total fees
                const cardPaymentDetails = document.querySelector('#div-card-payment-details');
                const feesObj = this.computeTotalRegFees(isLocalRates);

                // Build receipt rows
                let receiptRows = [
                    m('span', {class: 'card-title'}, `${this.localeObj.t('register.forms.summary.details')} (${feesObj.currency})`),
                    m('div', {class: 'row'}, [
                        m('div', {class: 'col s8'}, this.localeObj.t('register.forms.summary.fees.registration')),
                        m('div', {class: 'col s4 right-align'}, feesObj.fees.reg.toFixed(2))
                    ]),
                ];

                if(feesObj.fees.excursion > 0) {
                    receiptRows.push(
                        m('div', {class: 'row'}, [
                            m('span', {class: 'col s8'}, this.localeObj.t('register.forms.summary.fees.excursion')),
                            m('span', {class: 'col s4 right-align'}, feesObj.fees.excursion.toFixed(2))
                        ])
                    );
                }

                if(feesObj.fees.invitLetter > 0) {
                    receiptRows.push(
                        m('div', {class: 'row'}, [
                            m('span', {class: 'col s8'}, this.localeObj.t('register.forms.summary.fees.invitLetter')),
                            m('span', {class: 'col s4 right-align'}, feesObj.fees.invitLetter.toFixed(2))
                        ])
                    );
                }

                if(feesObj.fees.congressFund > 0) {
                    receiptRows.push(
                        m('div', {class: 'row'}, [
                            m('span', {class: 'col s8'}, this.localeObj.t('register.forms.summary.fees.congressFund')),
                            m('span', {class: 'col s4 right-align'}, feesObj.fees.congressFund.toFixed(2))
                        ])
                    );
                }

                if(feesObj.fees.participantFund > 0) {
                    receiptRows.push(
                        m('div', {class: 'row'}, [
                            m('span', {class: 'col s8'}, this.localeObj.t('register.forms.summary.fees.participantFund')),
                            m('span', {class: 'col s4 right-align'}, feesObj.fees.participantFund.toFixed(2))
                        ])
                    );
                }

                if(feesObj.fees.fejFund > 0) {
                    receiptRows.push(
                        m('div', {class: 'row'}, [
                            m('span', {class: 'col s8'}, this.localeObj.t('register.forms.summary.fees.associationFund')),
                            m('span', {class: 'col s4 right-align'}, feesObj.fees.fejFund.toFixed(2))
                        ])
                    );
                }

                receiptRows.push([
                    m('hr'),
                    m('div', {class: 'row'}, [
                        m('span', {class: 'col s8'}, [
                            m('b', this.localeObj.t('register.forms.summary.grandTotal'))
                        ]),
                        m('span', {class: 'col s4 right-align'}, [
                            m('b', `${feesObj.currency}${feesObj.fees.total.toFixed(2)}`)
                        ])
                    ])
                ]);

                // Render receipt rows
                m.render(cardPaymentDetails.querySelector('.card-content'), receiptRows);

                // Set hidden fields
                document.querySelector('input[name=hdn-excursion-fee]').value = feesObj.fees.excursion;
                document.querySelector('input[name=hdn-invitletter-fee]').value = feesObj.fees.invitLetter;

                document.querySelector('input[name=hdn-reg-fee]').value = feesObj.fees.reg;
                document.querySelector('input[name=hdn-reg-category]').value = feesObj.regCategory;
                document.querySelector('input[name=hdn-reg-currency]').value = feesObj.currency;

                break;
            }
            case 'section-payment': {
                const paymentRbx = document.querySelector('input[type=radio][name=rbx-payment-method]:checked');

                this.showPaymentMethod(paymentRbx.value);

                break;
            }
            default:
                // Pass
        }
    }

    populateLodgingDatesList() {
        let arriveSelectElm = document.getElementById('select-lodging-arrive');
        let departSelectElm = document.getElementById('select-lodging-depart');

        // Add idk option
        let idkOptElm = document.createElement('option');
        idkOptElm.setAttribute('value', 0);
        idkOptElm.innerHTML = this.localeObj.t('register.forms.lodging.fields.unknownDate');

        arriveSelectElm.appendChild(idkOptElm.cloneNode(true));
        departSelectElm.appendChild(idkOptElm.cloneNode(true));

        for(let i = 20200420; i <= 20200430; ++i) {
            let idxToDate = new Date(i / 10000, ((i / 100) % 100) - 1, i % 100);
            let optElm = document.createElement('option');
            optElm.setAttribute('value', i);

            const dateStr = this.localeObj.t('date', {
                weekdayWord: this.localeObj.t(`calendar.weekdays.${idxToDate.getDay()}`),
                day: idxToDate.getDate(),
                month: this.localeObj.t(`calendar.months.${idxToDate.getMonth()}`),
                year: idxToDate.getFullYear(),
            });

            optElm.innerHTML = dateStr;

            arriveSelectElm.appendChild(optElm.cloneNode(true));
            departSelectElm.appendChild(optElm.cloneNode(true));
        }

        Materialize.FormSelect.init(arriveSelectElm);
        Materialize.FormSelect.init(departSelectElm);
    }

    updateRegDatesUi() {
        // Check registration date
        const regIdxToName = ['earlyBird', 'regular', 'lateBird'];

        const regDateIdx = RegFormUtils.checkRegistrationPeriod();
        const cardPanelElm = document.getElementById('div-panel-reg-date-notice');
        const regPeriodName = this.localeObj.t(`register.generalText.${regIdxToName[regDateIdx]}`);

        document.querySelector('input[name=hdn-reg-period]').value = regDateIdx;
        cardPanelElm.querySelector('.card-title').innerHTML = this.localeObj.t('register.generalText.regPeriodText', {regPeriod: `${regPeriodName[0].toUpperCase()}${regPeriodName.substr(1)}`});
        cardPanelElm.querySelector('div.card-content p').innerHTML = this.localeObj.t('register.forms.summary.registerNotice', {registerType: regPeriodName});
    }

    showPaymentMethod(method) {
        console.log(`Showing payment method ${method}`);

        const localKeyword = this.isLocalRates() ? 'local' : 'foreign';
        let paymentHeader = '';
        let paymentDetails = '';

        document.getElementById('btn-next').disabled = false;
        document.getElementById('div-payment-iframe-wrapper').classList.add('hide');

        switch(method) {
            case 'bank': {
                paymentHeader = this.localeObj.t('register.forms.payment.bankAccount.header');
                paymentDetails = this.localeObj.t(`register.forms.payment.bankAccount.details.${localKeyword}`);
                break;
            }
            case 'online-bank': {
                paymentHeader = this.localeObj.t('register.forms.payment.onlineBank.header');
                paymentDetails = this.localeObj.t(`register.forms.payment.onlineBank.details.${localKeyword}`);
                break;
            }
            case 'remittance': {
                paymentHeader = this.localeObj.t('register.forms.payment.remittance.header');
                paymentDetails = this.localeObj.t(`register.forms.payment.remittance.details.${localKeyword}`);
                break;
            }
            case 'paypal': {
                paymentHeader = this.localeObj.t('register.forms.payment.paypal.header');
                paymentDetails = this.localeObj.t(`register.forms.payment.paypal.details.${localKeyword}`);

                // Additional processing for PayPal method
                document.getElementById('btn-next').disabled = true;

                const feesObj = this.computeTotalRegFees(this.isLocalRates());
                this.initPaypalDiv(feesObj);

                break;
            }
        }

        const paymentArticle = document.getElementById('article-payment-details');

        m.render(paymentArticle, [
            m('h4', paymentHeader),
            m.trust(paymentDetails),
        ]);
    }

    async initPaypalDiv(paymentObj) {
        // Initialize PayPal div
        // Attach PayPal iframe
        const iframeDiv = document.getElementById('div-payment-iframe-wrapper');
        iframeDiv.classList.remove('hide');

        // Remove existing PayPal iframe
        DomScripts.removeAllChildren(iframeDiv);

        try {
            const paymentPageRes = await fetch(`${this.apiDomain}/payment?lang=${this.data.locale.lang}`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentObj),
            });

            const htmlRes = await paymentPageRes.text();

            const iframeObj = document.createElement('iframe');
            //iframeObj.setAttribute('scrolling', 'no');
            iframeDiv.append(iframeObj);

            iframeObj.contentWindow.document.open();
            iframeObj.contentWindow.document.write(htmlRes);
            iframeObj.contentWindow.document.close();

            iframeResizer({
                log: false,
                checkOrigin: false,
            }, iframeObj);
        }
        catch(err) {
            Materialize.toast({
                html: this.localeObj.t('register.generalErrors.paypalError', {errorMsg: err}),
                classes: 'white-text theme-red'
            });

            console.error(`Cannot open PayPal modal: ${err}`);
        }
    }

    async submitForm() {
        const prevBtn = document.getElementById('btn-prev');
        const submitBtn = document.getElementById('btn-next');

        const inProgressToast = Materialize.toast({
            html: this.localeObj.t('register.generalText.registerInProgress'),
            classes: 'theme-green white-text',
        });

        try {
            console.log('Form submitted!');
            prevBtn.disabled = true;
            submitBtn.disabled = true;

            const res = await fetch(`${this.apiDomain}/register`, {
                method: 'POST',
                body: new URLSearchParams(new FormData(document.forms[0])),
            });

            if(!res.ok) {
                console.error(`Not OK HTTP status on form submit: ${res.json()}`);
                throw err;
            }

            const jsonRes = await res.json();
            console.info('Form received by server!');

            inProgressToast.dismiss();

            Materialize.toast({
                html: this.localeObj.t('register.generalText.registerSuccess'),
                classes: 'theme-green white-text',
            })

            // Clear stored form details
            Cookies.remove('cookie_consent');
            RegFormUtils.clearStoredFormElements();

            DomScripts.animateOnce('#div-steps', ['fadeOutUp', 'fast'], () => {
                document.getElementById('div-steps').classList.add('hide');
            });

            DomScripts.animateOnce('#section-nav-buttons', ['fadeOutDown', 'fast'], () => {
                document.getElementById('section-nav-buttons').classList.add('hide');
            });

            DomScripts.animateOnce('#section-payment', ['fadeOutLeft', 'fast'], () => {
                const thanksSection = document.getElementById('section-thanks');

                document.getElementById('section-payment').classList.add('hide');
                thanksSection.classList.remove('hide');

                DomScripts.animateOnce(thanksSection, ['fadeInRight', 'fast']);

                document.getElementById('span-register-id').innerHTML = jsonRes.registerId;
                document.getElementById('span-payment-id').innerHTML = jsonRes.paymentId;

                console.log(`RegId: ${jsonRes.registerId}; PaymentId: ${jsonRes.paymentId}`);

                m.route.set(
                    '/register/section-thanks',
                    null,
                    {
                        replace: false
                    }
                );
            });
        }
        catch(err) {
            console.error(`Error on form submit: ${err}`);
            prevBtn.disabled = false;
            submitBtn.disabled = false;

            Materialize.toast({
                html: this.localeObj.t('register.generalErrors.genericSubmit'),
                classes: 'theme-red white-text'
            });
        }
    }

    checkValidSubForm(sectionId) {
        // Validate input elements
        let inputList = document.querySelector(sectionId).querySelectorAll('input, select');

        // Validate fields
        for(let eachInputElm of inputList) {
            if(!eachInputElm.name) {
                continue;
            }

            if(!eachInputElm.checkValidity()) {
                let toastMsg = this.localeObj.t('register.generalErrors.invalidField', {sectionTitle: this.pageStatesList[this.currentPageState][0]});

                if(eachInputElm.tagName == 'SELECT' && eachInputElm.parentElement.parentElement.querySelector('.helper-text')) {
                    toastMsg = eachInputElm.parentElement.parentElement.querySelector('.helper-text').dataset.error;
                }
                else if(eachInputElm.parentElement.querySelector('.helper-text')) {
                    toastMsg = eachInputElm.parentElement.querySelector('.helper-text').dataset.error;
                }

                eachInputElm.classList.add('invalid');

                // Shake element
                if(eachInputElm.type == 'checkbox' || eachInputElm.type == 'radio') {
                    DomScripts.animateOnce(eachInputElm.parentElement.querySelector('span'), ['shake', 'faster']);
                }
                else {
                    DomScripts.animateOnce(eachInputElm.parentElement, ['shake', 'faster']);
                }

                Materialize.toast({
                    html: toastMsg,
                    displayLength: 1750,
                    classes: 'theme-red'
                });

                return false;
            }
        }

        return true;
    }

    hideOverviewSection(toSectionId, callback) {
        const guidelinesSubPage = document.querySelector('#section-guidelines');

        DomScripts.animateOnce('#section-guidelines', ['fadeOutLeft', 'faster'], () => {
            const basicInfoSubPage = document.getElementById(toSectionId);
            const stepsElm = document.querySelector('#div-steps');
            const navElm = document.querySelector('#section-nav-buttons');

            guidelinesSubPage.classList.add('hide');

            basicInfoSubPage.classList.remove('hide');
            stepsElm.classList.remove('hide');
            navElm.classList.remove('hide');

            DomScripts.animateOnce(basicInfoSubPage, ['fadeInRight', 'faster']);
            DomScripts.animateOnce('#div-steps', 'fadeInDown');
            DomScripts.animateOnce('#section-nav-buttons', 'fadeInUp');

            if(typeof callback === 'function') {
                callback();
            }
        });
    }

    swapFormSections(idxFrom, idxTo) {
        let fromSectionId = `#${this.pageStatesList[idxFrom][2]}`;
        let toSectionId = `#${this.pageStatesList[idxTo][2]}`;

        let prevBtn = document.getElementById('btn-prev');
        let nextBtn = document.getElementById('btn-next');

        if(idxTo <= 0) {
            prevBtn.disabled = true;
        }
        else {
            prevBtn.disabled = false;
        }

        if(idxTo >= this.pageStatesList.length - 1) {
            m.render(nextBtn, [
                m('i', {class: 'material-icons right'}, 'payment'),
                this.localeObj.t('buttons.payNow')
            ]);
        }
        else {
            m.render(nextBtn, [
                m('i', {class: 'material-icons right'}, 'navigate_next'),
                this.localeObj.t('buttons.next')
            ]);
        }

        let transitionClass = ['fadeOutLeft', 'fadeInRight'];

        if(idxTo < idxFrom) {
            transitionClass = ['fadeOutRight', 'fadeInLeft'];
        }

        DomScripts.animateOnce(fromSectionId, [transitionClass[0], 'faster'], () => {
            const toSection = document.querySelector(toSectionId);

            console.log(`animate ${fromSectionId} to ${toSectionId}`);

            document.querySelector(fromSectionId).classList.add('hide');
            toSection.classList.remove('hide');

            DomScripts.animateOnce(toSectionId, [transitionClass[1], 'faster']);
        });
    }

    scrollStepTimeline(idx) {
        // Scroll to center of current step
        let stepsElm = document.querySelector('#div-steps');
        let currentStepElm = document.querySelector(`#div-steps li:nth-child(${idx + 1})`);

        stepsElm.scrollTo({
            left: currentStepElm.offsetLeft - (stepsElm.offsetWidth / 2) + (currentStepElm.offsetWidth / 2) - (currentStepElm.querySelector('.steps-icon').offsetWidth / 2),
            behavior: 'smooth'
        });
    }

    getStepsDom(activeIdx = -1) {
        let stepItemsList = this.pageStatesList.map((v, k) => {
            let activeClass = (k <= activeIdx) ? 'active' : '';

            return m('li', {class: activeClass}, [
                m('i', {class: 'steps-icon material-icons'}, v[1]),
                m('span', v[0])
            ]);
        });

        return m('ul', {class: 'steps-bar browser-default'}, stepItemsList);
    }

    isLocalRates() {
        const countryList = document.getElementById('select-countries-list');
        return countryList.options[countryList.selectedIndex].value == 'PHL';
    }

    computeExcursionFee(isLocalRates) {
        return {
            currency: isLocalRates ? '₱' : '€',
            value: regFeesJson['excursion'][isLocalRates ? 'local' : 'foreign']
        }
    }

    computeInvitationLetterFee(isLocalRates, isExpress = false) {
        return {
            currency: isLocalRates ? '₱' : '€',
            value: isExpress ? 0 : regFeesJson['invitletterRegular'][isLocalRates ? 'local' : 'foreign']
        };
    }

    computeLatePenaltyFee(isLocalRates) {
        return {
            currency: isLocalRates ? '₱' : '€',
            value: regFeesJson['latePayment'][isLocalRates ? 'local' : 'foreign']
        }
    }

    computeTotalRegFees(isLocalRates) {
        // Compute registration cost
        const bdayField = document.querySelector('#txt-bday');
        const rbxCategory = document.querySelector('input[type=radio][name=rbx-reg-broad]:checked');
        const cbxInvitLetter = document.querySelector('input[type=checkbox][name=cbx-others-invitletter]');
        const cbxExcursion = document.querySelector('input[type=checkbox][name=cbx-excursion-interest]');
        const rbxInvitLetterShipVia = document.querySelector('input[type=radio][name=rbx-others-invitletter-shipvia]:checked');
        const selectList = document.querySelector('#select-reg-occupation');
        const regPeriodField = document.querySelector('input[name=hdn-reg-period]');

        const locKey = isLocalRates ? 'local' : 'foreign';
        const currencyKey = isLocalRates ? '₱' : '€';
        const currencyAbbrevKey = isLocalRates ? 'PHP' : 'EUR';
        const regCatKey = RegFormUtils.getRegTier(locKey, rbxCategory.value, selectList.value, bdayField.value);
        const regFeeCost = regFeesJson[locKey][regCatKey][regPeriodField.value];

        // Get excursion cost
        const excursionCost = (cbxExcursion.checked) ? regFeesJson['excursion'][locKey] : 0;

        // Get inivitation letter cost
        const invitLetterCost = (cbxInvitLetter.checked) ? this.computeInvitationLetterFee(isLocalRates, rbxInvitLetterShipVia.value == 'express').value : 0;

        // Get donations cost
        const congressFundCost = Number(document.getElementById('txt-congress-fund').value);
        const participantFundCost = Number(document.getElementById('txt-participant-fund').value);
        const fejFundCost = Number(document.getElementById('txt-fej-fund').value);

        // Get total payable cost
        const totalPayableCost = regFeeCost + excursionCost + invitLetterCost + congressFundCost + participantFundCost + fejFundCost;

        return {
            fees: {
                reg: regFeeCost,
                excursion: excursionCost,
                invitLetter: invitLetterCost,
                congressFund: congressFundCost,
                participantFund: participantFundCost,
                fejFund: fejFundCost,
                total: totalPayableCost,
            },
            currency: currencyKey,
            currencyAbbrev: currencyAbbrevKey,
            regCategory: regCatKey,
        };
    }

    /*
    generateBg() {
        // Generate SVG background
        const svgRegBg = document.getElementById('svg-reg-bg');

        // Populate top and bottom patterns
        for(let i = 0; ; ++i) {
            let wasSet = false;

            if((50 + i * 26) < document.body.scrollWidth - 26) {
                let useTagYellowBar = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                useTagYellowBar.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#yellow-bar');
                useTagYellowBar.setAttribute('x', 50 + i * 26);
                useTagYellowBar.setAttribute('y', 0);

                svgRegBg.append(useTagYellowBar);

                wasSet = true;
            }

            if((-20 + i * 80) < document.body.scrollWidth - 80) {
                let useTagRedBar = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                useTagRedBar.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#red-bar');
                useTagRedBar.setAttribute('x', -20 + i * 80);
                useTagRedBar.setAttribute('y', document.body.scrollHeight - 400);

                svgRegBg.append(useTagRedBar);

                wasSet = true;
            }

            if(!wasSet) {
                break;
            }
        }

        // Populate left and right patterns
        for(let i = 0; ; ++i) {
            let wasSet = false;

            if((60 + i * 30) < document.body.scrollHeight - 30) {
                let useTag = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                useTag.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#green-bar-pattern');
                useTag.setAttribute('x', 0);
                useTag.setAttribute('y', 60 + i * 30);
                useTag.setAttribute('height', 30);

                svgRegBg.append(useTag);

                wasSet = true;
            }

            if((50 + i * 25) < document.body.scrollHeight - 25) {
                let useTag = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                useTag.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#green-bar-squares');
                useTag.setAttribute('x', document.body.scrollWidth - 35);
                useTag.setAttribute('y', 50 + i * 25);

                svgRegBg.append(useTag);

                wasSet = true;
            }

            if(!wasSet) {
                break;
            }
        }

        // Populate triangles
        const triUlTag = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        triUlTag.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#tri-ul');
        triUlTag.setAttribute('x', 0);
        triUlTag.setAttribute('y', 0);
        svgRegBg.append(triUlTag);

        const triUrTag = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        triUrTag.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#tri-ur');
        triUrTag.setAttribute('x', document.body.scrollWidth - 100);
        triUrTag.setAttribute('y', 0);
        svgRegBg.append(triUrTag);

        const triLrTag = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        triLrTag.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#tri-lr');
        triLrTag.setAttribute('x', document.body.scrollWidth - 100);
        triLrTag.setAttribute('y', document.body.scrollHeight - 100);
        svgRegBg.append(triLrTag);
    }
    */
}