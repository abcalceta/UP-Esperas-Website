import m from 'mithril';
import {DomScripts} from '../util/dom';

import {BasePage} from './BasePage';
import htmlMain from '../templates/register.html';
import heroPath from '../img/hero/banderitas_volcorp_banner.jpg';
import '../styles/default.css';
import '../styles/datepicker.css';

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

    onupdate() {
        // Populate country list
        let countrySelectElm = document.querySelector("#select-countries-list");

        this.countryList.forEach((v) => {
            let optElm = document.createElement("option");
            optElm.setAttribute("value", v[1]);
            optElm.innerHTML = v[0];

            countrySelectElm.appendChild(optElm);
        });

        // Check registration date
        let regDateIdx = this.checkRegistrationDates();
        let cardPanelElm = document.querySelector('#div-panel-reg-date-notice');

        m.render(cardPanelElm, [
            m('span', {class: 'white-text'}, [
                'You are eligible for ',
                m('b', `${this.regIdxToName[regDateIdx]}`),
                ' registration!'
            ])
        ])

        DomScripts.initDomScripts();
        this.attachRegEvent();
    }

    attachRegEvent() {
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
}