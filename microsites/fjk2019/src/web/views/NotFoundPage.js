import m from 'mithril';

import {BasePage} from './BasePage';
import htmlMain from '../templates/not-found.html';
import heroPath from '../img/hero/lost_banner.jpg';

import '../styles/default.css';

export class NotFoundPage extends BasePage {
    constructor() {
        super(
            'en',
            'notFound',
            htmlMain,
            'NotFoundPage',
            heroPath
        );
    }

    onupdate() {
        super.onupdate();

        document.getElementById('btn-404-back').addEventListener('click', (e) => {
            history.back();
        });
    }
}