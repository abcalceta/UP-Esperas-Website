import m from 'mithril';

import {DomScripts} from '../util/dom';

import htmlFooter from '../templates/footer.html';
import {NavBarView} from './NavBarView';
import {HeroView} from './HeroView';

export class BasePage {
    constructor(title, heroData) {
        this.componentHolder = {}
        this.data = {
            title: title,
            hero: heroData
        }
    }

    oninit() {
        this.componentHolder.nav = NavBarView;
        this.componentHolder.hero = HeroView;
        this.componentHolder.footer = htmlFooter;
    }

    oncreate() {
        document.title = this.data.title + " | Philippine Esperanto Youth Congress 2020";
        DomScripts.animate("header img", "fadeIn");
        DomScripts.initDomScripts();
    }

    view() {
        return [
            m(this.componentHolder.nav),
            m(this.componentHolder.hero, this.data.hero),
            m("main", {id: "main-content", class:"container"},
                m.trust(this.componentHolder.main)
            ),
            m("footer", {class: "page-footer theme-yellow"},
                m.trust(this.componentHolder.footer)
            )
        ]
    }
}