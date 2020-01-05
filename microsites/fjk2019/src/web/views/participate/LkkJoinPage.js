import m from 'mithril';
import {DomScripts} from '../../util/dom';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/participate/lkk-join.html';
import heroPath from '../../img/hero/flag_in_backpack.jpg';
import '../../styles/default.css';

export class LkkJoinPage extends BasePage {
    constructor() {
        super(
            'en',
            'lkkJoin',
            htmlMain,
            'participate/LkkJoinPage',
            heroPath
        );
    }

    onupdate() {
        super.onupdate();

        DomScripts.animate("#section-intro .responsive-img", "zoomIn");
        DomScripts.animate(".animate-row-img", "fadeInUp slow");
        DomScripts.animate("#section-vacant .collapsible > li", "zoomIn fast");
    }
}