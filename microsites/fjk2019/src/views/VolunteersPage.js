import m from 'mithril';
import {BasePage} from './BasePage';
import htmlMain from '../templates/volunteers.html';

export class VolunteersPage extends BasePage {
    constructor() {
        super({
            imgAltText: "Cover Photo",
            imgBgPath: "/img/banderitas_volcorp_banner.jpg",
            headText: "Call for Volunteers",
            subTexts: [
                "The First Philippine Esperanto Youth Congress"
            ]
        })


        this.componentHolder.main = htmlMain;
    }
}