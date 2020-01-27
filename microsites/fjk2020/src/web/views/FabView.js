import m from 'mithril';
import M from 'materialize-css';
import Cookies from 'js-cookie';

import {LoaderView} from './LoaderView';

export class FabView {
    oncreate(vnode) {
        const langList = document.querySelectorAll('#btn-i18n ul li a');
        this.translateModal = M.Modal.init(document.getElementById('modal-translate-loading'), {
            dismissible: false,
            startingTop: '15%',
            endingTop: '35%',
        });

        langList.forEach((eachItem) => {
            eachItem.addEventListener('click', (e) => {
                e.preventDefault();

                this.translateModal.open();

                const newLocale = eachItem.dataset.locale;
                Cookies.set('locale', newLocale);

                M.FloatingActionButton.getInstance(document.getElementById('btn-i18n')).close();

                if(vnode.attrs.onLocaleSelect && (typeof vnode.attrs.onLocaleSelect === 'function'|| vnode.attrs.onLocaleSelect instanceof Function)) {
                    vnode.attrs.onLocaleSelect();
                }

                m.redraw();
            });
        });
    }

    onupdate() {
        // Close translate loader
        this.translateModal.close();

        M.FloatingActionButton.init(document.getElementById('btn-i18n'), {
            direction: 'top',
            hoverEnabled: false,
        });

        const tapTarget = M.TapTarget.init(document.getElementById('div-i18n-hint'), {
            onClose: () => {
                Cookies.set('locale', 'en');
            }
        });

        let currentLocale = Cookies.get('locale');

        if(currentLocale === undefined) {
            //document.getElementById('div-i18n-hint').classList.remove('hide');
            tapTarget.open();

            currentLocale = 'en';
        }
        else {
            // Hide discovery
            tapTarget.close();
            //document.getElementById('div-i18n-hint').classList.add('hide');
        }

        // Disabled current locale button
        const langList = document.querySelectorAll('#btn-i18n ul li a');

        langList.forEach((eachItem) => {
            if(RegExp(`^btn-floating-select-${currentLocale}$`).test(eachItem.id)) {
                eachItem.classList.add('disabled');
            }
            else {
                eachItem.classList.remove('disabled');
            }
        });
    }

    view() {
        return [
            m('div', {id: 'btn-i18n', class: 'fixed-action-btn'}, [
                m('a', {
                    id: 'btn-i18n-main',
                    class: 'btn-floating btn-large pulse theme-green tooltipped',
                    'data-position': 'left',
                    'data-tooltip': 'Choose a language<br>Elektu lingvon'
                }, [
                    m('i', {class: 'material-icons'}, 'translate')
                ]),
                m('ul', [
                    m('li', m('a', {id: 'btn-floating-select-eo', class: 'btn-floating theme-yellow', 'data-locale': 'eo'}, 'EO')),
                    m('li', m('a', {id: 'btn-floating-select-en', class: 'btn-floating theme-yellow', 'data-locale': 'en'}, 'EN'))
                ])
            ]),
            m('div', {id: 'div-i18n-hint', class: 'tap-target theme-green', 'data-target': 'btn-i18n-main'}, [
                m('div', {class: 'tap-target-content'}, [
                    m('h5', {class: 'white-text'}, 'Traduku/Translate!'),
                    m('p', {class: 'grey-text text-lighten-3'}, [
                        'Choose a language by clicking here.',
                        m('br'),
                        'Elektu lingvon per klaki tien ĉi.'
                    ]),
                    m('p', {class: 'grey-text text-lighten-3', style: 'font-size: 0.5em'}, [
                        'Cookie Notice: A cookie will be used to save your selected language',
                        m('br'),
                        'Avizo pri Kuketo: Kuketo estos uzita por konservi vian elektitan lingvon'
                    ])
                ])
            ]),
            m('div', {id: 'modal-translate-loading', class: 'modal'}, [
                m('div', {class: 'modal-content translate-loader'}, [
                    m(LoaderView, {loadingText: 'Translating…\nTradukante…'}),
                ]),
            ]),
        ]
    }
}