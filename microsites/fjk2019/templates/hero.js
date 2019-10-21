function heroTpl(imgAlt, imgSrcPath, containerElm) {
    return m("header", {class: "parallax-container hero valign-wrapper"}, [
        m("div", {class: "parallax"}, [
            m("img", {alt: imgAlt, src: imgSrcPath, width: "1024"})
        ]),
        m("div", {class: "container"}, containerElm),
        m("a", {id: "a-main-content", href: "#main-content", class: "material-icons hero-down-marker"}, "expand_more")
    ])
}