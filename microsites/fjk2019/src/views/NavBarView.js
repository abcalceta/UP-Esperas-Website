import m from 'mithril';
import navJson from '../navlinks.json';

export class NavBarView {
    view(vnode) {
        let mainMenuList = [];
        let sideNavList = [];
        let dropDownList = [];

        console.log(navJson);

        navJson.forEach(elm => {
            let mainMenuProps = {};
            let sideNavProps = {};

            if(elm.link !== undefined && elm.link !== null) {
                mainMenuProps.href = elm.link;

                sideNavProps.href = elm.link;
                sideNavProps.class = "sidenav-close waves-effect waves-green";
            }

            if(elm.sublinks !== undefined && elm.sublinks !== null) {
                let submenuList = [];
                let subNavMenuList = [];
                let ulId = "ul-nav-" + elm.title.toLowerCase().replace(/\s+/g, "-");

                mainMenuProps.href = "#";
                mainMenuProps.class = "dropdown-trigger";
                mainMenuProps["data-target"] = ulId;

                // One-layer sublinks only
                elm.sublinks.forEach(elm2 => {
                    let subMainMenuProps = {};
                    let subNavMenuProps = {};

                    if(elm2.link !== undefined && elm2.link !== null) {
                        subMainMenuProps.href = elm2.link;
                        subMainMenuProps.class = "green-text waves-effect waves-light";

                        subNavMenuProps.href = elm2.link;
                        subNavMenuProps.class = "sidenav-close waves-effect waves-green";
                    }

                    submenuList.push(
                        m("li", [
                            m("a", subMainMenuProps, elm2.title)
                        ])
                    );

                    subNavMenuList.push(
                        m("li", [
                            m("a", subNavMenuProps, elm2.title)
                        ])
                    );
                });

                dropDownList.push([
                    m("ul", {id: ulId, class: "dropdown-content"}, submenuList)
                ])

                sideNavList.push([
                    m("ul", subNavMenuList)
                ])

                /*
                elm.title = [
                    elm.title,
                    m("i", {class: "material-icons right"}, "arrow_drop_down")
                ];
                */
            }

            mainMenuList.push(
                m("li", [
                    m("a", mainMenuProps, elm.title)
                ])
            );

            sideNavList.push(
                m("li", [
                    m("a", sideNavProps, elm.title)
                ])
            );
        });

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