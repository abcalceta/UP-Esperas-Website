import m from 'mithril';
import Cookies from 'js-cookie';
import Polyglot from 'node-polyglot';

import {DomScripts} from '../util/dom';

import htmlFooter from '../templates/footer.html';
import {FabView} from './FabView';
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
            localeFilename: localeFilename,
            hero: {
                imgAltText: '',
                imgBgPath: heroImg,
                headText: '',
                subText: ''
            },
        };
    }

    oninit() {
        const locale = Cookies.get('locale') || 'en';
        const localePath = `../i18n/${locale}/${this.data.localeFilename}.json`;

        this.localeObj = new Polyglot();

        console.log(`Found locale ${locale}`);

        m.request({
            method: 'GET',
            url: `../i18n/${locale}/common.json`,
            background: true,
        })
        .then((jsonObj) => {
            this.localeObj.extend(jsonObj);

            return m.request({
                method: 'GET',
                url: localePath,
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

            this.isTranslated = true;
        })
        .catch((err) => {
            console.error('Error in fetching translations');
            console.error(err);
        });

        this.componentHolder.nav = NavBarView;
        this.componentHolder.hero = HeroView;
        this.componentHolder.fab = FabView;
        this.componentHolder.footer = htmlFooter;
    }

    onupdate() {
        document.title = this.localeObj.t('titleSpecific', {pageName: this.data.title});

        m.render(document.getElementById('main-content'), [
            m.trust(this.componentHolder.main)
        ]);

        DomScripts.animate("header img", "fadeIn");
        DomScripts.initDomScripts();
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
            ),
            m(this.componentHolder.fab)
        ]
    }

    evalTemplate(tpl, localeObj) {
        return new Function(`return \`${tpl}\`;`).call({localeObj: localeObj});
    }
}