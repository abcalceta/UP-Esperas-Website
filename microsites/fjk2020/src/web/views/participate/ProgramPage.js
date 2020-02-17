import m from 'mithril';
import {DomScripts} from '../../util/dom';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/participate/program.html';
import heroPath from '../../img/hero/flag_in_backpack.jpg';
import '../../styles/default.css';

export class ProgramPage extends BasePage {
    constructor() {
        super(
            'en',
            'program',
            htmlMain,
            'participate/ProgramPage',
            heroPath
        );
    }

    onupdate() {
        super.onupdate();

        DomScripts.animate('#section-guidelines div.row div.col:first-child', 'zoomIn');
        DomScripts.animate('#section-guidelines div.row div.col:nth-child(2)', 'slideInRight');
    }
}