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
        console.log("here!")
        let countrySelectElm = document.querySelector("#select-countries-list");

        this.countryList.forEach((v) => {
            let optElm = document.createElement("option");
            optElm.setAttribute("value", v[1]);
            optElm.innerHTML = v[0];

            countrySelectElm.appendChild(optElm);
        });


        super.oncreate();
    }

    checkRegistrationDates() {
        let earlyBirdDate = new Date('2019-12-31T11:59:59+08:00');
        let regDate = new Date('2020-02-29T11:59:59+08:00');
        let dateToday = new Date();

        if(dateToday <= earlyBirdDate) {
            console.log("Early bird reg!");
        }
        else if(dateToday <= regDate) {
            console.log("Regular reg!");
        }
        else {
            console.log("Late reg!");
        }
    }
}