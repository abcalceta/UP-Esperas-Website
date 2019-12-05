import m from 'mithril';
import Polyglot from 'node-polyglot';

import {DomScripts} from '../util/dom';

import htmlFooter from '../templates/footer.html';
import {NavBarView} from './NavBarView';
import {HeroView} from './HeroView';

export class BasePage {
    constructor(locale, localeNamespace, htmlFile, localeFilename, heroImg) {
        this.componentHolder = {
            main: htmlFile,
        };

        this.data = {
            title: '',
            locale: ['en', 'eo'].includes(locale) ? locale : 'en',
            localeNamespace: localeNamespace,
            localePath: `../i18n/${locale}/${localeFilename}.json`,
            hero: {
                imgAltText: '',
                imgBgPath: heroImg,
                headText: '',
                subText: ''
            },
        };
    }

    oninit(vnode) {
        this.localeObj = new Polyglot();

        m.request({
            method: 'GET',
            url: `../i18n/${this.data.locale}/common.json`,
            background: true,
        })
        .then((jsonObj) => {
            this.localeObj.extend(jsonObj);

            return m.request({
                method: 'GET',
                url: this.data.localePath,
                background: false,
            });
        })
        .then((jsonObj) => {
            this.localeObj.extend(jsonObj);

            this.data.hero = Object.assign({}, this.data.hero, {
                imgAltText: 'Cover Photo',
                headText: this.localeObj.t(`${this.data.localeNamespace}.title`),
                subText: this.localeObj.t(`${this.data.localeNamespace}.subTitle`)
            });

            this.data.title = this.localeObj.t(`${this.data.localeNamespace}.topSubTitle`)
            this.componentHolder.main = this.evalTemplate(this.componentHolder.main, this.localeObj);

            vnode.attrs.isTranslated = true;
        })
        .catch(console.error);

        this.componentHolder.nav = NavBarView;
        this.componentHolder.hero = HeroView;
        this.componentHolder.footer = htmlFooter;
    }

    oncreate() {
        DomScripts.animate("header img", "fadeIn");
        DomScripts.initDomScripts();
    }

    onupdate() {
        document.title = this.localeObj.t('titleSpecific', {pageName: this.data.title});

        m.render(document.getElementById('main-content'), [
            m.trust(this.componentHolder.main)
        ]);
    }

    view() {
        return [
            m(this.componentHolder.nav),
            m(this.componentHolder.hero, this.data.hero),
            m("main", {id: "main-content", class:"container"}, [
                m.trust(this.componentHolder.main)
            ]),
            m("footer", {class: "page-footer theme-yellow"},
                m.trust(this.componentHolder.footer)
            )
        ]
    }

    evalTemplate(tpl, localeObj) {
        return new Function(`return \`${tpl}\`;`).call({localeObj: localeObj});
    }
}