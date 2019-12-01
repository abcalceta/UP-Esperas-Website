import m from 'mithril';
import Materialize from 'materialize-css';
import Cookies from 'js-cookie';

import {DomScripts} from '../util/dom';
import {RegForm} from '../util/register';

import {BasePage} from './BasePage';
import htmlMain from '../templates/register.html';
import heroPath from '../img/hero/ks_cards.jpg';

import '../styles/default.css';
import '../styles/datepicker.css';
import '../styles/steps.css';
import '../styles/regform.css';

import regFeesJson from '../regrates.json';

export class RegisterPage extends BasePage {
    constructor() {
        super(
            "Registration",
            {
                imgAltText: "Cover Photo",
                imgBgPath: heroPath,
                headText: "Registration",
                subTexts: [
                    "First Philippine Esperanto Youth Congress"
                ]
            }
        );

        this.countryList = [];
        this.currentPageState = 0;
        this.pageStatesList = [
            ['Basic', 'info', 'section-basic'],
            ['Registration', 'details', 'section-reg'],
            ['Lodging', 'hotel', 'section-lodging'],
            ['Excursion', 'emoji_nature', 'section-excursion'],
            ['Food', 'restaurant', 'section-food'],
            ['Others', 'star', 'section-others'],
            ['Payment', 'payment', 'section-payment'],
        ];
        this.regIdxToName = ['early', 'regular', 'late'];

        this.regCatLocalList = [
            ['A1', 'Senior high school students and younger'],
            ['A2', 'Undergraduate students or equivalent'],
            ['B1', 'Workers, graduate students, etc. ≤ 35 years old'],
            ['B2', 'Workers, graduate students, etc. > 35 years old'],
        ];
        this.regCatForeignList = [
            ['A', 'Undergraduate students and below'],
            ['B1', 'Workers, graduate students, etc. ≤ 35 years old'],
            ['B2', 'Workers, graduate students, etc. > 35 years old'],
        ];

        this.componentHolder.main = htmlMain;
    }

    oninit() {
        m.request({
            method: 'GET',
            url: 'https://restcountries.eu/rest/v2/all?fields=name;alpha3Code'
        })
        .then((t) => {
            this.countryList = t.map((eachCountry) => {
                return [eachCountry.name, eachCountry.alpha3Code];
            });
        });

        super.oninit();
    }

    oncreate() {
        this.attachRegOverview();
        this.attachRegisterEvent();
        this.attachOthersEvent();
        this.attachThanksEvent();
        this.attachNavBtnEvent();

        super.oncreate();
    }

    onupdate() {
        // Update step progress
        let stepContainerElm = document.querySelector('#div-steps');
        m.render(stepContainerElm, this.getStepsDom(this.currentPageState));

        // Populate country list
        let countrySelectElm = document.getElementById('select-countries-list');
        while (countrySelectElm.firstChild) {
            countrySelectElm.removeChild(countrySelectElm.firstChild);
        }

        let defaultOptElm = document.createElement('option');
        defaultOptElm.setAttribute('value', '');
        defaultOptElm.setAttribute('disabled', 'disabled');
        defaultOptElm.setAttribute('selected', 'selected');
        defaultOptElm.innerHTML = 'Country of Origin';
        countrySelectElm.appendChild(defaultOptElm);

        this.countryList.forEach((v) => {
            let optElm = document.createElement('option');
            optElm.setAttribute('value', v[1]);
            optElm.innerHTML = v[0];

            countrySelectElm.appendChild(optElm);
        });

        Materialize.FormSelect.init(countrySelectElm);

        // Populate lodging dates list
        let arriveSelectElm = document.getElementById('select-lodging-arrive');
        let departSelectElm = document.getElementById('select-lodging-depart');

        for(let i = 20200420; i <= 20200430; ++i) {
            let idxToDate = new Date(i / 10000, ((i / 100) % 100) - 1, i % 100);
            let optElm = document.createElement("option");
            optElm.setAttribute("value", i);
            optElm.innerHTML = idxToDate.toLocaleDateString('en-PH', {year: 'numeric', month: 'short', day: '2-digit', weekday: 'short'});

            arriveSelectElm.appendChild(optElm.cloneNode(true));
            departSelectElm.appendChild(optElm.cloneNode(true));
        }

        Materialize.FormSelect.init(arriveSelectElm);
        Materialize.FormSelect.init(departSelectElm);

        // Check registration date
        const regDateIdx = this.checkRegistrationDates();
        const cardPanelElm = document.getElementById('div-panel-reg-date-notice');
        const regPeriodName = this.regIdxToName[regDateIdx];

        document.querySelector('input[name=hdn-reg-period]').value = regDateIdx;
        cardPanelElm.querySelector('.card-title').innerHTML = `${regPeriodName[0].toUpperCase()}${regPeriodName.substr(1)} Registration`;
        cardPanelElm.querySelector('div.card-content p').innerHTML = `Today is within the period of <b>${regPeriodName}</b> registration!`;
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
            let guidelinesSubPage = document.querySelector('#section-guidelines');
            let basicInfoSubPage = document.querySelector('#section-basic');
            let stepsElm = document.querySelector('#div-steps');
            let navElm = document.querySelector('#section-nav-buttons')

            DomScripts.animateOnce('#section-guidelines', ['fadeOutLeft', 'faster'], () => {
                guidelinesSubPage.classList.add('hide');
                basicInfoSubPage.classList.remove('hide');
                stepsElm.classList.remove('hide');
                navElm.classList.remove('hide');

                DomScripts.animateOnce('#section-basic', ['fadeInRight', 'faster']);
                DomScripts.animateOnce('#div-steps', 'fadeInDown');
                DomScripts.animateOnce('#section-nav-buttons', 'fadeInUp');
            });
        });
    }

    attachRegisterEvent() {
        const regTypeRadioList = document.querySelectorAll('input[type=radio][name=rbx-reg-broad]');
        const regCategoryDiv = document.querySelector('#div-reg-category');
        const educInfoDiv = document.querySelector('#div-reg-educ-info');
        const workInfoDiv = document.querySelector('#div-reg-work-info');
        const occupationList = document.querySelector('#select-reg-occupation');

        occupationList.addEventListener('change', function(e) {
            switch(this.value) {
                case 'shs': {
                    const degreeTxt = educInfoDiv.querySelector('#txt-reg-degree');

                    degreeTxt.parentElement.querySelector('label').innerHTML = 'Strand/Vocation/Grade*';
                    degreeTxt.parentElement.querySelector('span').dataset.error = 'Please enter your strand/vocation/grade';

                    Materialize.updateTextFields();

                    document.querySelector('#txt-reg-educ').required = true
                    document.querySelector('#txt-reg-company').required = false;
                    document.querySelector('#txt-reg-position').required = false;

                    educInfoDiv.classList.remove('hide');
                    DomScripts.animateOnce(educInfoDiv, ['fadeIn', 'faster']);

                    if(!workInfoDiv.classList.contains('hide')) {
                        DomScripts.animateOnce(workInfoDiv, ['fadeOut', 'faster'], () => {
                            workInfoDiv.classList.add('hide');
                        });
                        break;
                    }
                }
                case 'undergrad':
                case 'grad': {
                    let degreeTxt = educInfoDiv.querySelector('#txt-reg-degree');

                    degreeTxt.parentElement.querySelector('label').innerHTML = 'Degree*';
                    degreeTxt.parentElement.querySelector('span').dataset.error = 'Please enter your degree';

                    Materialize.updateTextFields();

                    document.querySelector('#txt-reg-educ').required = true;
                    document.querySelector('#txt-reg-company').required = false;
                    document.querySelector('#txt-reg-position').required = false;

                    educInfoDiv.classList.remove('hide');
                    DomScripts.animateOnce(educInfoDiv, ['fadeIn', 'faster']);

                    if(!workInfoDiv.classList.contains('hide')) {
                        DomScripts.animateOnce(workInfoDiv, ['fadeOut', 'faster'], () => {
                            workInfoDiv.classList.add('hide');
                        });
                        break;
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
                        break;
                    }
                    break;
                }
                default:
                    document.querySelector('#txt-reg-degree').required = false;
                    document.querySelector('#txt-reg-educ').required = false;
                    document.querySelector('#txt-reg-company').required = false;
                    document.querySelector('#txt-reg-position').required = false;

                    if(!educInfoDiv.classList.contains('hide')) {
                        DomScripts.animateOnce(educInfoDiv, ['fadeOut', 'faster'], () => {
                            educInfoDiv.classList.add('hide');
                        });
                        break;
                    }

                    if(!workInfoDiv.classList.contains('hide')) {
                        DomScripts.animateOnce(workInfoDiv, ['fadeOut', 'faster'], () => {
                            workInfoDiv.classList.add('hide');
                        });
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
                            break;
                        }

                        if(!workInfoDiv.classList.contains('hide')) {
                            DomScripts.animateOnce(workInfoDiv, ['fadeOut', 'faster'], () => {
                                workInfoDiv.classList.add('hide');
                            });
                            break;
                        }

                        occupationList.required = false;

                        break;
                    }
                    default:
                        // Pass
                }
            });
        });
    }

    attachOthersEvent() {
        const invitLetterCbx = document.querySelector('input[name=cbx-others-invitletter][type=checkbox]');
        const invitLetterShipDiv = document.getElementById('div-others-invitletter-shipinfo');
        const shipToRbx = document.querySelectorAll('input[type=radio][name=rbx-others-invitletter-shipto]');
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

        shipToRbx.forEach((v) => {
            v.addEventListener('change', (e) => {
                const shippingLocality = v.value;
                const {currency, value} = this.computeInvitationLetterFee(shippingLocality, this.isLocalRates());

                m.render(shipToCard, [
                    m('p', [
                        'Note that getting an invitation letter will cost ',
                        m('b', `${currency}${value}`),
                        ' to cover the shipping fee.',
                    ])
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
                document.getElementById('form-register').reset();
                prevBtn.disabled = true;
                nextBtn.disabled = false;
                m.render(nextBtn, [
                    m('i', {class: 'material-icons right'}, 'navigate_next'),
                    'Next'
                ]);

                // Reset registration info
                document.querySelector('#div-reg-category').classList.remove('hide');
                document.querySelector('#select-reg-occupation').required = true;

                DomScripts.animateOnce('#section-guidelines', ['fadeInRight', 'fast']);
            });
        });
    }

    attachNavBtnEvent() {
        let prevBtn = document.querySelector('#btn-prev');
        let nextBtn = document.querySelector('#btn-next');

        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();

            this.swapFormSections(this.currentPageState, this.currentPageState - 1);
            this.scrollStepTimeline(this.currentPageState - 1);
            this.triggerSectionChanges(this.currentPageState - 1);
            m.render(document.querySelector('#div-steps'), this.getStepsDom(this.currentPageState - 1));

            this.currentPageState -= 1;
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

            this.swapFormSections(this.currentPageState, this.currentPageState + 1);
            this.scrollStepTimeline(this.currentPageState + 1);
            this.triggerSectionChanges(this.currentPageState + 1);
            m.render(document.querySelector('#div-steps'), this.getStepsDom(this.currentPageState + 1));

            this.currentPageState += 1;
        });
    }

    triggerSectionChanges(sectionIdx) {
        const countryList = document.querySelector('#select-countries-list');
        const sectionId = this.pageStatesList[sectionIdx][2];
        let sectionDiv = document.querySelector(`#${sectionId}`);

        const isLocalRates = this.isLocalRates();

        switch(sectionId) {
            case 'section-reg':
                let rateCard = document.querySelector('#div-reg-ratecard');

                // Init modal
                rateCard.querySelector('div.card-content p').innerHTML = `You originate from <b>${countryList[countryList.selectedIndex].innerHTML}</b> and <b>${isLocalRates ? 'local' : 'foreign'}</b> rates for registration apply.`;
                m.render(rateCard.querySelector('div.card-action'),
                    m('a', {class: 'btn-flat theme-green-text waves-effect modal-trigger', href: isLocalRates ? '#div-modal-ph-rates' : '#div-modal-foreign-rates'}, 'View Rates')
                );

                break;
            case 'section-others': {
                // Invitation letter card
                const rbxInvitLetterShipTo = document.querySelector('input[type=radio][name=rbx-others-invitletter-shipto]:checked');
                const shipToCard = document.getElementById('div-card-invitletter-price');
                const shippingLocality = rbxInvitLetterShipTo.value;
                const {currency, value} = this.computeInvitationLetterFee(shippingLocality, this.isLocalRates());

                m.render(shipToCard, [
                    m('p', [
                        'Note that getting an invitation letter will cost ',
                        m('b', `${currency}${value}`),
                        ' to cover the shipping fee.',
                    ])
                ]);

                // Donation card
                const donateCurrencyCard = document.getElementById('div-donate-currency');
                const currencyKey = isLocalRates ? 'Philippine Pesos' : 'Euros';

                m.render(donateCurrencyCard, [
                    'Note that you will be donating in ',
                    m('b', currencyKey)
                ]);
            }
            case 'section-payment': {
                // Compute total fees
                const cardPaymentDetails = document.querySelector('#div-card-payment-details');
                const feesObj = this.computeTotalRegFees(isLocalRates);

                // Build receipt rows
                let receiptRows = [
                    m('span', {class: 'card-title'}, `Payment Details (${feesObj.currency})`),
                    m('div', {class: 'row'}, [
                        m('div', {class: 'col s8'}, 'Registration Fee'),
                        m('div', {class: 'col s4 right-align'}, feesObj.regFee)
                    ]),
                ];

                if(feesObj.invitLetter > 0) {
                    receiptRows.push(
                        m('div', {class: 'row'}, [
                            m('span', {class: 'col s8'}, 'Invitation Letter Fee'),
                            m('span', {class: 'col s4 right-align'}, feesObj.invitLetter)
                        ])
                    );
                }

                if(feesObj.congressFund > 0) {
                    receiptRows.push(
                        m('div', {class: 'row'}, [
                            m('span', {class: 'col s8'}, 'Congress Fund'),
                            m('span', {class: 'col s4 right-align'}, feesObj.congressFund)
                        ])
                    );
                }

                if(feesObj.participantFund > 0) {
                    receiptRows.push(
                        m('div', {class: 'row'}, [
                            m('span', {class: 'col s8'}, 'Participant Fund'),
                            m('span', {class: 'col s4 right-align'}, feesObj.participantFund)
                        ])
                    );
                }

                if(feesObj.fejFund > 0) {
                    receiptRows.push(
                        m('div', {class: 'row'}, [
                            m('span', {class: 'col s8'}, 'Association Fund'),
                            m('span', {class: 'col s4 right-align'}, feesObj.fejFund)
                        ])
                    );
                }

                receiptRows.push([
                    m('hr'),
                    m('div', {class: 'row'}, [
                        m('span', {class: 'col s8'}, [
                            m('b', 'Grand Total')
                        ]),
                        m('span', {class: 'col s4 right-align'}, [
                            m('b', `${feesObj.currency}${feesObj.total}`)
                        ])
                    ])
                ]);

                // Render
                m.render(cardPaymentDetails.querySelector('.card-content'), receiptRows);

                // Set hidden fields
                document.querySelector('input[name=hdn-reg-fee]').value = feesObj.regFee;
                document.querySelector('input[name=hdn-invitletter-fee]').value = feesObj.invitLetter;
                document.querySelector('input[name=hdn-reg-category]').value = feesObj.regCategory;
                document.querySelector('input[name=hdn-reg-currency]').value = feesObj.currency;

                break;
            }
            default:
                // Pass
        }
    }

    checkRegistrationDates() {
        let earlyBirdDate = new Date('2019-12-31T11:59:59+08:00');
        let regDate = new Date('2020-03-23T11:59:59+08:00');
        let dateToday = new Date();

        if(dateToday <= earlyBirdDate) {
            return 0;
        }
        else if(dateToday <= regDate) {
            return 1;
        }
        else {
            return 2;
        }
    }

    async submitForm() {
        const prevBtn = document.getElementById('btn-prev');
        const submitBtn = document.getElementById('btn-next');

        const inProgressToast = Materialize.toast({
            html: 'Registering you. Please wait&#8230;',
            classes: 'theme-green white-text'
        });

        try {
            console.log('Form submitted!');
            prevBtn.disabled = true;
            submitBtn.disabled = true;

            const res = await fetch('//localhost:6002/api/register', {
                method: 'POST',
                body: new URLSearchParams(new FormData(document.forms[0])),
            });

            inProgressToast.dismiss();

            if(!res.ok) {
                console.error(`Not OK HTTP status on form submit: ${res.json()}`);
                prevBtn.disabled = false;
                submitBtn.disabled = false;

                Materialize.toast({
                    html: 'Form cannot be submitted. Please contact the organizers.',
                    classes: 'theme-yellow white-text'
                });
            }
            else {
                const jsonRes = await res.json();
                console.info('Form received by server!');

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
                });
            }
        }
        catch(err) {
            console.error(`Error on form submit: ${err}`);
            prevBtn.disabled = false;
            submitBtn.disabled = false;

            Materialize.toast({
                html: 'Form cannot be submitted. Please contact the organizers.',
                classes: 'theme-yellow'
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
                let toastMsg = `This section (${this.pageStatesList[this.currentPageState][0]}) has invalid fields!`;

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
                m('i', {class: 'material-icons right'}, 'send'),
                'Submit'
            ]);
        }
        else {
            m.render(nextBtn, [
                m('i', {class: 'material-icons right'}, 'navigate_next'),
                'Next'
            ]);
        }

        let transitionClass = ['fadeOutLeft', 'fadeInRight'];

        if(idxTo < idxFrom) {
            transitionClass = ['fadeOutRight', 'fadeInLeft'];
        }

        DomScripts.animateOnce(fromSectionId, [transitionClass[0], 'faster'], () => {
            document.querySelector(fromSectionId).classList.add('hide');
            document.querySelector(toSectionId).classList.remove('hide');

            DomScripts.animateOnce(toSectionId, [transitionClass[1], 'faster']);
        });
    }

    scrollStepTimeline(idx) {
        // Scroll to center of current step
        let stepsElm = document.querySelector('#div-steps');
        let currentStepElm = document.querySelector(`#div-steps li:nth-child(${idx + 1})`);

        stepsElm.scrollTo({
            left: currentStepElm.offsetLeft - currentStepElm.offsetWidth - (currentStepElm.querySelector('.steps-icon').offsetWidth / 2),
            behavior: 'smooth'
        });
    }

    getStepsDom(activeIdx = -1) {
        let stepItemsList = this.pageStatesList.map((v, k) => {
            let activeClass = k <= activeIdx ? 'active' : '';

            return m('li', {class: activeClass}, [
                m('i', {class: 'steps-icon material-icons'}, v[1]),
                m('span', v[0])
            ]);
        });

        return m('ul', {class: 'steps-bar browser-default'}, stepItemsList);
    }

    isLocalRates() {
        const countryList = document.querySelector('#select-countries-list');
        return countryList.value == 'PHL';
    }

    computeInvitationLetterFee(shipToLocality, isLocalRates) {
        return {
            currency: isLocalRates ? '₱' : '€',
            value: regFeesJson['invitletter'][shipToLocality][isLocalRates ? 0 : 1]
        };
    }

    computeTotalRegFees(isLocalRates) {
        // Compute registration cost
        const bdayField = document.querySelector('#txt-bday');
        const rbxCategory = document.querySelector('input[type=radio][name=rbx-reg-broad]:checked');
        const cbxInvitLetter = document.querySelector('input[type=checkbox][name=cbx-others-invitletter]');
        const rbxInvitLetterShipTo = document.querySelector('input[type=radio][name=rbx-others-invitletter-shipto]:checked');
        const selectList = document.querySelector('#select-reg-occupation');
        const regPeriodField = document.querySelector('input[name=hdn-reg-period]');

        const locKey = isLocalRates ? 'local' : 'foreign';
        const currencyKey = isLocalRates ? '₱' : '€';
        const regCatKey = RegForm.getRegTier(locKey, rbxCategory.value, selectList.value, bdayField.value);
        const regFeeCost = regFeesJson[locKey][regCatKey][regPeriodField.value];

        // Get inivitation letter cost
        const invitLetterCost = (cbxInvitLetter.checked) ? this.computeInvitationLetterFee(rbxInvitLetterShipTo.value, isLocalRates).value : 0;

        // Get donations cost
        const congressFundCost = Number(document.getElementById('txt-congress-fund').value);
        const participantFundCost = Number(document.getElementById('txt-participant-fund').value);
        const fejFundCost = Number(document.getElementById('txt-fej-fund').value);

        // Get total payable cost
        const totalPayableCost = regFeeCost + invitLetterCost + congressFundCost + participantFundCost + fejFundCost;

        return {
            regFee: regFeeCost,
            invitLetter: invitLetterCost,
            congressFund: congressFundCost,
            participantFund: participantFundCost,
            fejFund: fejFundCost,
            total: totalPayableCost,
            currency: currencyKey,
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