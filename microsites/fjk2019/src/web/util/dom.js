import Materialize from 'materialize-css';

function animate(targetsQuery, animateClasses, getParents = false, threshold = 0.5) {
    const intersectHandler = function intersectHandler(prevTop) {
        return function(entries) {
            entries.forEach(eachEntry => {
                const classesList = ['animated'];
                classesList.push(...animateClasses.split(' '));

                const nowTop = eachEntry.boundingClientRect.top;
                const nowRatio = eachEntry.intersectionRatio;

                if (eachEntry.isIntersecting && nowTop < prevTop && nowRatio > 0.5) {
                    //console.log(`fadeIn: ${nowTop} ${prevTop} ${nowRatio}`)
                    eachEntry.target.classList.remove('fadeOut', 'faster');
                    eachEntry.target.classList.add(...classesList);
                }
                else if (!eachEntry.isIntersecting && nowTop > prevTop && nowRatio < 0.5) {
                    //console.log(`fadeOut: ${nowTop} ${prevTop} ${nowRatio}`)
                    eachEntry.target.classList.remove(...classesList);
                    eachEntry.target.classList.add('animated', 'fadeOut', 'faster');
                }

                prevTop = nowTop;
            });
        }
    }

    const elmTargets = document.querySelectorAll(targetsQuery);
    elmTargets.forEach(t => {
        const scrollObserver = new IntersectionObserver(
            intersectHandler(0),
            {
                //rootMargin: '0% 0% -50% 0%',
                threshold: [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]
            });

        if(getParents) {
            scrollObserver.observe(t.parentElement);
        }
        else {
            scrollObserver.observe(t);
        }
    })
}

function animateOnce(element, animationClasses, callback) {
    let node = element;
    let animationList = ['animated'];

    // Check if element is a selector or not
    if(typeof element === 'string' || element instanceof String) {
        node = document.querySelector(element);
    }

    // Check if there are multiple animation classes
    if(Array.isArray(animationClasses)) {
        animationList.push(...animationClasses);
    }
    else if(typeof animationClasses === 'string' || animationClasses instanceof String) {
        animationList.push(animationClasses);
    }

    node.classList.add(...animationList);

    const handleAnimationEnd = function() {
        node.classList.remove(...animationList);
        node.removeEventListener('animationend', handleAnimationEnd);

        if (typeof callback === 'function') {
            callback();
        }
    }

    node.addEventListener('animationend', handleAnimationEnd);
}

function removeAllChildren(parentElm) {
    while (parentElm.firstChild) {
        parentElm.removeChild(parentElm.firstChild);
    }
}

function initDomScripts() {
    Materialize.Modal.init(document.querySelectorAll('.modal'));
    Materialize.Parallax.init(document.querySelectorAll('.parallax'));
    Materialize.Sidenav.init(document.querySelectorAll('.sidenav'));
    Materialize.ScrollSpy.init(document.querySelectorAll('.scrollspy'));
    Materialize.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {hover: true});
    Materialize.Collapsible.init(document.querySelectorAll('.collapsible'), {});
    Materialize.FormSelect.init(document.querySelectorAll('select'));
    Materialize.Tooltip.init(document.querySelectorAll('.tooltipped'));
}

function evalTemplate(tpl, localeObj) {
    return new Function(`return \`${tpl}\`;`).call({localeObj: localeObj});
}

export let DomScripts = {
    initDomScripts: initDomScripts,
    animateOnce: animateOnce,
    animate: animate,
    evalTemplate: evalTemplate,
    removeAllChildren: removeAllChildren,
};