import m from 'mithril';
import Cookies from 'js-cookie';
import Polyglot from 'node-polyglot';

import {DomScripts} from '../util/dom';

import htmlFooter from '../templates/footer.html';
import {FabView} from './FabView';
import {NavBarView} from './NavBarView';
import {HeroView} from './HeroView';
import {LoadingOverlay} from './LoadingOverlay';

export class BasePage {
    constructor(locale, localeNamespace, htmlTemplateFile, localeFilename, heroImg) {
        this.componentHolder = {
            mainTpl: htmlTemplateFile,
            footerTpl: htmlFooter,
            main: '',
        };

        this.data = {
            title: '',
            locale: {
                lang: ['en', 'eo'].includes(locale) ? locale : 'en',
                namespace: localeNamespace,
                filename: localeFilename,
            },
            hero: {
                imgAltText: '',
                imgBgPath: heroImg,
                headText: '',
                subText: ''
            },
        };

        this.initOnce = true;
        this.localeObj = new Polyglot({
            allowMissing: true
        });

        this.apiDomain = process.env.API_DOMAIN;
    }

    oninit() {
        this.onLocaleChanged();

        this.componentHolder.nav = NavBarView;
        this.componentHolder.hero = HeroView;
        this.componentHolder.fab = FabView;
        this.componentHolder.loadingOverlay = LoadingOverlay;
    }

    onupdate() {
        // Init once
        if(this.initOnce) {
            document.title = this.localeObj.t('titleSpecific', {pageName: this.data.title});

            DomScripts.animate("header img", "fadeIn");
            DomScripts.initDomScripts();

            this.initOnce = false;
        }
    }

    view() {
        return [
            m(this.componentHolder.nav, {localeObj: this.localeObj}),
            m(this.componentHolder.hero, this.data.hero),
            m('main', {id: 'main-content', class: 'container'}, [
                m.trust(this.componentHolder.main)
            ]),
            m('footer', {class: 'page-footer theme-yellow'},
                m.trust(this.componentHolder.footer)
            ),
            m(this.componentHolder.fab, {onLocaleSelect: this.onLocaleChanged.bind(this), isChangedTranslation: this.isTranslated}),
            m(this.componentHolder.loadingOverlay, {loadingText: this.localeObj.t('loading', {_: '...'})})
        ];
    }

    onLocaleChanged() {
        const locale = Cookies.get('locale') || 'en';
        const localePath = `/i18n/${locale}/${this.data.locale.filename}.json`;

        console.log(`Found locale ${locale}`);
        this.data.locale.lang = locale;
        this.localeObj.locale(locale);
        this.isTranslated = false;

        m.request({
            method: 'GET',
            url: `/i18n/${locale}/common.json`,
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
                headText: this.localeObj.t(`${this.data.locale.namespace}.title`),
                subText: this.localeObj.t(`${this.data.locale.namespace}.subTitle`)
            });

            this.data.title = this.localeObj.t(`${this.data.locale.namespace}.topSubTitle`)
            this.componentHolder.main = DomScripts.evalTemplate(this.componentHolder.mainTpl, this.localeObj);
            this.componentHolder.footer = DomScripts.evalTemplate(this.componentHolder.footerTpl, this.localeObj);

            this.isTranslated = true;
        })
        .catch((err) => {
            console.error('Error in fetching translations');
            console.error(err);
        });
    }
}