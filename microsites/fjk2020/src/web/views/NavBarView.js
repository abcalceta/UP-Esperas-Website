import m from 'mithril';
import Materialize from 'materialize-css';
import Polyglot from 'node-polyglot';


import {DomScripts} from '../util/dom';

import navJson from '../navlinks.json';

export class NavBarView {
    view(vnode) {
        let mainMenuList = [];
        let sideNavList = [];
        let dropDownList = [];

        for(let navElms of navJson) {
            const translatedTitle = DomScripts.evalTemplate(navElms.title, vnode.attrs.localeObj);
            let ulId = 'ul-nav-' + translatedTitle.toLowerCase().replace(/\s+/g, '-');

            // For linked item
            if(navElms.link !== undefined && navElms.link !== null) {
                mainMenuList.push(
                    m('li', {class: 'no-padding'}, [
                        m('a', {class: 'no-padding', href: navElms.link}, [
                            translatedTitle
                        ])
                    ])
                );

                sideNavList.push(
                    m('li', [
                        m('a', {class: 'sidenav-close waves-effect waves-green', href: navElms.link}, [
                            translatedTitle
                        ])
                    ])
                );
            }
            else if(navElms.sublinks !== undefined && navElms.sublinks !== null) {
                // Create collapsible navBar item
                mainMenuList.push([
                    m('li', [
                        m('a', {class: 'dropdown-trigger', href: '#', 'data-target': ulId}, [
                            translatedTitle,
                            m('i', {class: 'material-icons right'}, [
                                'arrow_drop_down'
                            ])
                        ])
                    ])
                ]);

                dropDownList.push([
                    m('ul', {id: ulId, class: 'dropdown-content'}, navElms.sublinks.map((subElms) => {
                        const translatedSubtitle = DomScripts.evalTemplate(subElms.title, vnode.attrs.localeObj);

                        return m('li', [
                            m('a', {class: 'black-text', href: subElms.link}, [
                                translatedSubtitle
                            ])
                        ]);
                    }))
                ]);

                // Create collapsible sideNav item
                sideNavList.push(
                    m('li', {class: 'no-padding'}, [
                        m('ul', {class: 'collapsible collapsible-accordion'}, [
                            m('li', [
                                m('a', {class: 'collapsible-header'}, [
                                    translatedTitle,
                                    m('i', {class: 'right material-icons'}, [
                                        'arrow_drop_down'
                                    ])
                                ]),
                                m('div', {class: 'collapsible-body'}, [
                                    m('ul', navElms.sublinks.map((subElms) => {
                                        const translatedSubtitle = DomScripts.evalTemplate(subElms.title, vnode.attrs.localeObj);

                                        return m('li', [
                                            m('a', {class: 'sidenav-close black-text waves-effect waves-green', href: subElms.link}, [
                                                translatedSubtitle
                                            ])
                                        ]);
                                    }))
                                ])
                            ])
                        ])
                    ])
                );
            }
        }

        let mainNavBar = m('nav', {class: 'z-depth-0'}, [
            m('a', {href: '#', 'data-target': 'nav-main', class: 'sidenav-trigger'}, [
                m('i', {class: 'material-icons'}, 'menu')
            ]),
            m('ul', {id: 'nav-mobile', class: 'right hide-on-med-and-down scrollspy'}, mainMenuList)
        ]);

        let sideNav = m('ul', {class: 'sidenav', id: 'nav-main'}, sideNavList);

        return [
            mainNavBar,
            dropDownList,
            sideNav
        ]
    }
}