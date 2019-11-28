import m from 'mithril';

import {BasePage} from './BasePage';
import htmlMain from '../templates/not-found.html';
import heroPath from '../img/hero/eo_flags_banner.jpg';

import '../styles/default.css';

export class NotFoundPage extends BasePage {
    constructor() {
        super(
            "404",
            {
                imgAltText: "Cover Photo",
                imgBgPath: heroPath,
                headText: "404",
                subTexts: []
            }
        );

        this.componentHolder.main = htmlMain;
    }
}