import m from 'mithril';
import {BasePage} from './BasePage';
import htmlMain from '../templates/lkk-join.html';

export class LkkJoinPage extends BasePage {
    constructor() {
        super({
            imgAltText: "Cover Photo",
            imgBgPath: "/img/flag_in_backpack.jpg",
            headText: "Call for Organizers",
            subTexts: [
                "The First Philippine Esperanto Youth Congress"
            ]
        })


        this.componentHolder.main = htmlMain;
    }
}