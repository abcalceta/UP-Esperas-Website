import m from 'mithril';

export class HeroView {
    view(vnode) {
        let imgBgPath = vnode.attrs.imgBgPath;
        let imgAltText = vnode.attrs.imgAltText;
        let headText = vnode.attrs.headText;
        let subTexts = vnode.attrs.subTexts;

        let containerElm = [
            m("h1", {class: "white-text"}, headText)
        ];

        subTexts.forEach(element => {
            containerElm.push(
                m("h5", {class: "white-text"}, element)
            );
        });

        return m("header", {class: "parallax-container hero valign-wrapper"}, [
            m("div", {class: "parallax"}, [
                m("img", {alt: imgAltText, src: imgBgPath, width: "1024"})
            ]),
            m("div", {class: "container"}, containerElm),
            m("a", {id: "a-main-content", href: "#main-content", class: "material-icons hero-down-marker"}, "expand_more")
        ]);
    }
}