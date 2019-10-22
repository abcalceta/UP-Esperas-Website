import m from 'mithril';
import navJson from '../navlinks.json';

export class NavBarView {
    view(vnode) {
        let mainMenuList = [];
        let sideNavList = [];
        let dropDownList = [];

        for(let navElms of navJson) {
            let mainNavProps = {}
            let sideNavProps = {}

            let ulId = "ul-nav-" + navElms.title.toLowerCase().replace(/\s+/g, "-");

            // For linked item
            if(navElms.link !== undefined && navElms.link !== null) {
                mainMenuList.push(
                    m("li", [
                        m("a", {href: navElms.link}, [
                            navElms.title
                        ])
                    ])
                )

                sideNavList.push(
                    m("li", [
                        m("a", {class: "waves-effect waves-green", href: navElms.link}, [
                            navElms.title
                        ])
                    ])
                )
            }
            else if(navElms.sublinks !== undefined && navElms.sublinks !== null) {
                // For item with sublinks
                let subNavList = [];

                for(let subElms of navElms.sublinks) {
                    subNavList.push(
                        m("li", [
                            m("a", {class: "black-text waves-effect waves-green", href: subElms.link}, [
                                subElms.title
                            ])
                        ])
                    )
                }

                // Create collapsible navBar item
                mainMenuList.push([
                    m("li", [
                        m("a", {class: "dropdown-trigger", href: "#", "data-target": ulId}, [
                            navElms.title,
                            m("i", {class: "material-icons right"}, [
                                "arrow_drop_down"
                            ])
                        ])
                    ])
                ])

                dropDownList.push([
                    m("ul", {id: ulId, class: "dropdown-content"}, subNavList)
                ])

                // Create collapsible sideNav item
                sideNavList.push(
                    m("li", {class: "no-padding"}, [
                        m("ul", {class: "collapsible collapsible-accordion"}, [
                            m("li", [
                                m("a", {class: "collapsible-header"}, [
                                    navElms.title,
                                    m("i", {class: "right material-icons"}, [
                                        "arrow_drop_down"
                                    ])
                                ]),
                                m("div", {class: "collapsible-body"}, [
                                    m("ul", subNavList)
                                ])
                            ])
                        ])
                    ])
                )
            }
        }

        let mainNavBar = m("nav", {class: "z-depth-0"}, [
            m("a", {"href": "#", "data-target": "mobile-demo", "class": "sidenav-trigger"}, [
                m("i", {class: "material-icons"}, "menu")
            ]),
            m("ul", {id: "nav-mobile", class: "right hide-on-med-and-down scrollspy"}, mainMenuList)
        ]);

        let sideNav = m("ul", {class: "sidenav", id: "mobile-demo"}, sideNavList);

        return [
            mainNavBar,
            dropDownList,
            sideNav
        ]
    }
}