import m from 'mithril';

import {BasePage} from './BasePage';
import htmlMain from '../templates/not-found.html';
import heroPath from '../img/hero/eo_flags_banner.jpg';

import '../styles/default.css';

export class NotFoundPage extends BasePage {
    constructor() {
        super(
            'en',
            'notFound',
            htmlMain,
            'IndexPage',
            heroPath
        );

        this.componentHolder.main = htmlMain;
    }
}