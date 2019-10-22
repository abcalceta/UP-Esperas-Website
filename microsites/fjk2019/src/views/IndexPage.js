import m from 'mithril';
import {BasePage} from './BasePage';
import htmlMain from '../templates/main.html';

export class IndexPage extends BasePage {
    constructor() {
        super({
            imgAltText: "Cover Photo",
            imgBgPath: "/img/banderitas_home_banner.jpg",
            headText: "The First Philippine Esperanto Youth Congress",
            subTexts: [
                "April 23-26, 2020",
                "Manila, Philippines"
            ]
        })


        this.componentHolder.main = htmlMain;
    }
}