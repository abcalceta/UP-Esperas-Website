import m from 'mithril';
import Materialize from 'materialize-css';
import Cookies from 'js-cookie';

import {DomScripts} from '../util/dom';

import {BasePage} from './BasePage';
import htmlMain from '../templates/register.html';
import heroPath from '../img/hero/banderitas_volcorp_banner.jpg';

import '../styles/default.css';
import '../styles/datepicker.css';
import '../styles/steps.css';

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
        this.componentHolder.main = htmlMain;
        this.countryList = [];
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
        let regDateIdx = this.checkRegistrationDates();
        let cardPanelElm = document.querySelector('#div-panel-reg-date-notice');

        m.render(cardPanelElm, [
            m('span', {class: 'white-text'}, [
                'You are eligible for ',
                m('b', `${this.regIdxToName[regDateIdx]}`),
                ' registration!'
            ])
        ]);
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

            DomScripts.animateOnce('#section-guidelines', 'fadeOutLeft', () => {
                guidelinesSubPage.classList.add('hide');
                basicInfoSubPage.classList.remove('hide');
                stepsElm.classList.remove('hide');
                navElm.classList.remove('hide');

                DomScripts.animateOnce('#section-basic', 'fadeInRight');
                DomScripts.animateOnce('#div-steps', 'fadeInDown');
                DomScripts.animateOnce('#section-nav-buttons', 'fadeInUp');
            });
        });
    }

    attachRegisterEvent() {
        let regTypeRadioList = document.querySelectorAll('input[type=radio][name=reg-broad-category]');

        regTypeRadioList.forEach((v) => {
            v.addEventListener('change', (e) => {
                let changedValue = v.getAttribute('value');

                if(!v.checked) {
                    return;
                }

                console.log(`checked ${changedValue}`);

                switch(changedValue) {
                    case 'reg-broad-regular': {
                        break;
                    }
                    case 'reg-broad-moral': {
                        v.parentElement.parentElement.append("Moral participants are who will not participate in the congress itself, but want to support the congress financially. They shall be given due acknowledgment in the congress booklet.")
                        break;
                    }
                    case 'reg-broad-patron': {
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
            m.render(document.querySelector('#div-steps'), this.getStepsDom(this.currentPageState - 1));

            this.currentPageState -= 1;
        });

        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();

            let fromSectionId = `#${this.pageStatesList[this.currentPageState][2]}`;

            if(this.currentPageState >= this.pageStatesList.length - 1) {
                this.submitForm();
                return;
            }

            if(!this.checkValidSubForm(fromSectionId)) {
                console.log('Section has invalid fields!');

                Materialize.toast({
                    html: `This section (${this.pageStatesList[this.currentPageState][0]}) has invalid fields!`,
                    displayLength: 1750,
                    classes: 'red darken-3'
                });

                //return;
            }

            this.swapFormSections(this.currentPageState, this.currentPageState + 1);
            this.scrollStepTimeline(this.currentPageState + 1);
            m.render(document.querySelector('#div-steps'), this.getStepsDom(this.currentPageState + 1));

            this.currentPageState += 1;
        });
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
            console.log("Late reg!");
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
        let inputList = document.querySelector(sectionId).querySelectorAll('input');

        for(let eachInputElm of inputList) {
            if(!eachInputElm.checkValidity()) {
                console.log(`Field ${eachInputElm.getAttribute('name')} has invalid input!`);
                
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

        DomScripts.animateOnce(fromSectionId, transitionClass[0], () => {
            document.querySelector(fromSectionId).classList.add('hide');
            document.querySelector(toSectionId).classList.remove('hide');

            DomScripts.animateOnce(toSectionId, transitionClass[1]);
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