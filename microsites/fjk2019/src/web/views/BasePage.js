import m from 'mithril';
import Polyglot from 'node-polyglot';

import {DomScripts} from '../util/dom';

import htmlFooter from '../templates/footer.html';
import {NavBarView} from './NavBarView';
import {HeroView} from './HeroView';

export class BasePage {
    constructor(title, localeNamespace, contentFilePath, localePath, heroImg) {
        this.componentHolder = {};
        this.data = {
            title: title,
            localeNamespace: localeNamespace,
            contentFilePath: contentFilePath,
            localePath: localePath,
            hero: {
                imgAltText: 'Cover Photo',
                imgBgPath: heroImg,
                headText: 'First Philippine Esperanto Youth Congress',
                subTexts: [
                    ''
                ]
            }
        };
    }

    oninit() {
        this.localeObj = new Polyglot();

        m.request({
            method: 'GET',
            url: '../i18n/en/common.json',
            background: true,
        })
            .then((jsonObj) => {
                this.localeObj.extend(jsonObj);

                return m.request({
                    method: 'GET',
                    url: this.data.localePath,
                    background: true,
                });
            })
            .then((jsonObj) => {
                this.localeObj.extend(jsonObj);

                this.data.hero = Object.assign({}, this.data.hero, {
                    imgAltText: 'Cover Photo',
                    headText: this.localeObj.t('defaultTitle'),
                    subTexts: [
                        this.localeObj.t(`${this.data.localeNamespace}.subTitle`)
                    ]
                });

                return m.request({
                    method: 'GET',
                    url: this.data.contentFilePath,
                    extract: (xhr, opts) => {
                        return xhr.responseText;
                    }
                });
            })
            .then((htmlInterpolated) => {
                this.componentHolder.main = htmlInterpolated;
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
            m("main", {id: "main-content", class:"container"}, ''),
            m("footer", {class: "page-footer theme-yellow"},
                m.trust(this.componentHolder.footer)
            )
        ]
    }
}