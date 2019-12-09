import m from 'mithril';

import '../styles/loadingoverlay.css';

export class LoadingOverlay {
    constructor() {
        this.numPoints = 18;
        this.duration = 600;
        this.delayPointsArray = [];
        this.delayPointsMax = 300;
        this.delayPerPath = 100;
        this.timeStart = Date.now();
        this.isOpened = false;
        this.isAnimating = false;

        this.easing = {
            cubicInOut: (t) => {
                return t < 0.5
                    ? 4.0 * t * t * t
                    : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
            }
        };
    }

    oncreate() {
        this.path = document.querySelectorAll('.shape-overlays .path');
        this.elm = document.querySelector('.shape-overlays');
    }

    view() {
        return m('svg', {class: 'shape-overlays', viewBox: '0 0 100 100', preserveAspectRatio: 'none'}, [
            m('path', {class: 'path'}, ''),
            m('path', {class: 'path'}, ''),
            m('path', {class: 'path'}, '')
        ]);
    }

    toggle() {
        this.isAnimating = true;
        const range = 4 * Math.random() + 6;

        for (var i = 0; i < this.numPoints; i++) {
            const radian = i / (this.numPoints - 1) * Math.PI;
            this.delayPointsArray[i] = (Math.sin(-radian) + Math.sin(-radian * range) + 2) / 4 * this.delayPointsMax;
        }

        if (this.isOpened === false) {
            this.open();
        }
        else {
            this.close();
        }
    }

    open() {
        this.isOpened = true;
        this.elm.classList.add('is-opened');
        this.timeStart = Date.now();
        this.renderLoop();
    }

    close() {
        this.isOpened = false;
        this.elm.classList.remove('is-opened');
        this.timeStart = Date.now();
        this.renderLoop();
    }

    updatePath(time) {
        const points = [];
        for (var i = 0; i < this.numPoints + 1; i++) {
            points[i] = this.easing.cubicInOut(Math.min(Math.max(time - this.delayPointsArray[i], 0) / this.duration, 1)) * 100
        }

        let str = '';
        str += (this.isOpened) ? `M 0 0 V ${points[0]} ` : `M 0 ${points[0]} `;
        for (var i = 0; i < this.numPoints - 1; i++) {
            const p = (i + 1) / (this.numPoints - 1) * 100;
            const cp = p - (1 / (this.numPoints - 1) * 100) / 2;
            str += `C ${cp} ${points[i]} ${cp} ${points[i + 1]} ${p} ${points[i + 1]} `;
        }

        str += (this.isOpened) ? `V 0 H 0` : `V 100 H 0`;

        return str;
    }

    render() {
        if (this.isOpened) {
            for (var i = 0; i < this.path.length; i++) {
                this.path[i].setAttribute('d', this.updatePath(Date.now() - (this.timeStart + this.delayPerPath * i)));
            }
        }
        else {
            for (var i = 0; i < this.path.length; i++) {
                this.path[i].setAttribute('d', this.updatePath(Date.now() - (this.timeStart + this.delayPerPath * (this.path.length - i - 1))));
            }
        }
    }

    renderLoop() {
        this.render();

        if (Date.now() - this.timeStart < this.duration + this.delayPerPath * (this.path.length - 1) + this.delayPointsMax) {
          requestAnimationFrame(() => {
            this.renderLoop();
          });
        }
        else {
          this.isAnimating = false;
        }
    }
}