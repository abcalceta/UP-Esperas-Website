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
                    "The First Philippine Esperanto Youth Congress"
                ]
            }
        )


        this.componentHolder.main = htmlMain;
    }

    oninit() {
        m.request({
            method: 'GET',
            url: 'https://restcountries.eu/rest/v2/all?fields=name;alpha3Code'
        })
        .then((t) => {
            return t.map((eachCountry) => {
                eachCountry[0]
            });
        });

        super.oninit();
    }

    oncreate() {
        super.oncreate();
    }
}