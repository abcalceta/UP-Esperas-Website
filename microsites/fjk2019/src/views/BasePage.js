import m from 'mithril';
import Materialize from 'materialize-css';

import htmlFooter from '../templates/footer.html';
import {NavBarView} from './NavBarView';
import {HeroView} from './HeroView';

export class BasePage {
    constructor(heroData) {
        this.componentHolder = {}
        this.data = {
            hero: heroData
        }
    }

    initDomScripts() {
        Materialize.Parallax.init(document.querySelectorAll(".parallax"))
        Materialize.Sidenav.init(document.querySelectorAll(".sidenav"))
        Materialize.Dropdown.init(document.querySelectorAll(".dropdown-trigger"), {hover: true})
        Materialize.Collapsible.init(document.querySelectorAll(".collapsible"), {});

        document.getElementById('a-main-content').addEventListener('click', e => {
            e.preventDefault()

            document.getElementById('main-content').scrollIntoView({behavior: 'smooth'})
        })
    }

    oninit() {
        this.componentHolder.nav = NavBarView;
        this.componentHolder.hero = HeroView;
        this.componentHolder.footer = htmlFooter;
    }

    oncreate() {
        this.initDomScripts();
    }

    view() {
        return [
            m(this.componentHolder.nav),
            m(this.componentHolder.hero, this.data.hero),
            m("main", {id: "main-content", class:"container"},
                m.trust(this.componentHolder.main)
            ),
            m("footer", {class: "page-footer yellow accent-2"},
                m.trust(this.componentHolder.footer)
            )
        ]
    }
}