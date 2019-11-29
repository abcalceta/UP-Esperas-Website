import m from 'mithril';
import Materialize from 'materialize-css';
import Cookies from 'js-cookie';

import {DomScripts} from '../util/dom';
import {RegForm} from '../util/register';

import {BasePage} from './BasePage';
import htmlMain from '../templates/register.html';
import heroPath from '../img/hero/banderitas_volcorp_banner.jpg';

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
        )

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
        this.attachNavBtnEvent();

        super.oncreate();
    }

    onupdate() {
        // Update step progress
        let stepContainerElm = document.querySelector('#div-steps');
        m.render(stepContainerElm, this.getStepsDom(this.currentPageState));

        // Populate country list
        let countrySelectElm = document.querySelector("#select-countries-list");

        this.countryList.forEach((v) => {
            let optElm = document.createElement("option");
            optElm.setAttribute("value", v[1]);
            optElm.innerHTML = v[0];

            countrySelectElm.appendChild(optElm);
        });

        Materialize.FormSelect.init(document.querySelector('#select-countries-list'));

        // Check registration date
        const regDateIdx = this.checkRegistrationDates();
        const cardPanelElm = document.querySelector('#div-panel-reg-date-notice');
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
        let sectionId = this.pageStatesList[sectionIdx][2];
        let sectionDiv = document.querySelector(`#${sectionId}`);

        switch(sectionId) {
            case 'section-reg':
                let rateCard = document.querySelector('#div-reg-ratecard');
                let countryList = document.querySelector('#select-countries-list');
                let isLocalRates = countryList.value == 'PHL';

                // Init modal
                rateCard.querySelector('div.card-content p').innerHTML = `You originate from <b>${countryList.value}</b> and <b>${isLocalRates ? 'local' : 'foreign'}</b> rates for registration apply.`;
                m.render(rateCard.querySelector('div.card-action'),
                    m('a', {class: 'btn-flat green-text text-darken-2 modal-trigger', href: isLocalRates ? '#div-modal-ph-rates' : '#div-modal-foreign-rates'}, 'View Rates')
                );

                break;
            case 'section-payment': {
                // Compute registration cost
                const bdayField = document.querySelector('#txt-bday');
                const countryList = document.querySelector('#select-countries-list');
                const rbxCategory = document.querySelector('input[type=radio][name=rbx-reg-broad]:checked');
                const selectList = document.querySelector('#select-reg-occupation');
                const regPeriodField = document.querySelector('input[name=hdn-reg-period]');
                const cardPaymentDetails = document.querySelector('#div-card-payment-details');

                const locKey = countryList.value === 'PHL' ? 'local' : 'foreign';
                const currencyKey = countryList.value === 'PHL' ? '₱' : '€';
                const regCatKey = RegForm.getRegTier(locKey, rbxCategory.value, selectList.value, bdayField.value);
                const regFeeCost = regFeesJson[locKey][regCatKey][regPeriodField.value];

                m.render(cardPaymentDetails.querySelector('.card-content'), [
                    m('span', {class: 'card-title'}, `Payment Details (${currencyKey})`),
                    m('div', {class: 'row'}, [
                        m('div', {class: 'col s8'}, 'Registration Fee'),
                        m('div', {class: 'col s4 right-align'}, regFeeCost)
                    ]),
                    m('div', {class: 'row'}, [
                        m('span', {class: 'col s8'}, 'Congress Donation'),
                        m('span', {class: 'col s4 right-align'}, 10)
                    ]),
                    m('div', {class: 'row'}, [
                        m('span', {class: 'col s8'}, 'FEJ Donation'),
                        m('span', {class: 'col s4 right-align'}, 1000)
                    ]),
                    m('hr'),
                    m('div', {class: 'row'}, [
                        m('span', {class: 'col s8'}, [
                            m('b', 'Grand Total')
                        ]),
                        m('span', {class: 'col s4 right-align'}, [
                            m('b', `${currencyKey}${regFeeCost + 1000 + 10}`)
                        ])
                    ]),
                ]);

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
        console.log('Form submitted!');

        try {
            const res = await fetch('//localhost:6002/api/register', {
                method: 'POST',
                body: new URLSearchParams(new FormData(document.forms[0])),
            });

            console.log(res);
        }
        catch(err) {
            console.error(`Error on form submit: ${err}`);
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
                    classes: 'red darken-3'
                });

                return false;
            }
        }

        return true;
    }

    swapFormSections(idxFrom, idxTo) {
        let fromSectionId = `#${this.pageStatesList[idxFrom][2]}`;
        let toSectionId = `#${this.pageStatesList[idxTo][2]}`;

        let prevBtn = document.querySelector('#btn-prev');
        let nextBtn = document.querySelector('#btn-next');

        if(idxTo <= 0) {
            prevBtn.classList.add('disabled')
        }
        else {
            prevBtn.classList.remove('disabled');
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
}