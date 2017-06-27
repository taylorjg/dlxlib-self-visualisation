const BORDER_CSS_CLASS = 'border';
const NORMAL_NODE_CSS_CLASS = 'normal-node';
const COVERED_NODE_CSS_CLASS = 'covered-node';
const DOT_CSS_CLASS = 'dot';
const NORMAL_LINK_CSS_CLASS = 'link normal-link';
const GOING_AROUND_LINK_CSS_CLASS = 'link going-around-link';
const NORMAL_ARROW_HEAD_CSS_CLASS = 'link normal-arrow-head';
const GOING_AROUND_ARROW_HEAD_CSS_CLASS = 'link going-around-arrow-head';

export class DrawingAreaSvg {

    constructor(svg) {
        this.svg = svg;
        this.width = this.svg.scrollWidth;
        this.svg.style.height = this.width;
        this.height = this.width;
        this.elements = [];
        this.coveredNodes = [];
    }

    createElement(element) {
        return document.createElementNS('http://www.w3.org/2000/svg', element);
    }

    createLine(x1, y1, x2, y2, cssClass) {
        const line = this.createElement('line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', cssClass);
        this.elements.push(line);
    }

    createCircle(cx, cy, r, cssClass) {
        const circle = this.createElement('circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('class', cssClass);
        this.elements.push(circle);
    }

    createRect(x, y, width, height, cssClass, additionalAttributes) {
        const rect = this.createElement('rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('class', cssClass);
        if (additionalAttributes) {
            Object.keys(additionalAttributes).forEach(k =>
                rect.setAttribute(k, additionalAttributes[k]));
        }
        this.elements.push(rect);
    }

    createPath(data, cssClass) {
        const path = this.createElement('path');
        path.setAttribute('d', data);
        path.setAttribute('class', cssClass);
        this.elements.push(path);
    }

    drawBorders() {
        this.createLine(0, 0, this.width, 0, BORDER_CSS_CLASS);
        this.createLine(this.width, 0, this.width, this.height, BORDER_CSS_CLASS);
        this.createLine(this.width, this.height, 0, this.height, BORDER_CSS_CLASS);
        this.createLine(0, this.height, 0, 0, BORDER_CSS_CLASS);
    }

    drawDot(x, y) {
        this.createCircle(x, y, 1, DOT_CSS_CLASS);
    }

    nodeToCoordsString(n) {
        return `(${n.colIndex},${n.rowIndex})`;
    }

    nodeToElement(node) {
        const coordsString = this.nodeToCoordsString(node);
        return document.querySelector(`[data-coords='${coordsString}']`);
    }

    drawNodeRect(node) {

        const additionalAttributes = {
            ['data-coords']: this.nodeToCoordsString(node),
            ['data-col-index']: node.colIndex,
            ['data-row-index']: node.rowIndex
        };

        this.createRect(
            node.x,
            node.y,
            node.width,
            node.height,
            NORMAL_NODE_CSS_CLASS,
            additionalAttributes);
    }

    drawRightArrowHead(apex, cssClass) {
        const data = `
            M ${apex.x} ${apex.y}
            L ${apex.x - 5} ${apex.y - 2}
            L ${apex.x - 5} ${apex.y + 2}
            Z`;
        this.createPath(data, cssClass);
    }

    drawLeftArrowHead(apex, cssClass) {
        const data = `
            M ${apex.x} ${apex.y}
            L ${apex.x + 5} ${apex.y - 2}
            L ${apex.x + 5} ${apex.y + 2}
            Z`;
        this.createPath(data, cssClass);
    }

    drawDownArrowHead(apex, cssClass) {
        const data = `
            M ${apex.x} ${apex.y}
            L ${apex.x - 2} ${apex.y - 5}
            L ${apex.x + 2} ${apex.y - 5}
            Z`;
        this.createPath(data, cssClass);
    }

    drawUpArrowHead(apex, cssClass) {
        const data = `
            M ${apex.x} ${apex.y}
            L ${apex.x - 2} ${apex.y + 5}
            L ${apex.x + 2} ${apex.y + 5}
            Z`;
        this.createPath(data, cssClass);
    }

    drawRightGoingAroundLinkHelper(n1, n2, tweeners) {

        const firstTweener = tweeners[0];
        const lastTweener = tweeners[tweeners.length - 1];
        const displacement = (n1.nex - n1.nwx) * 1.2;

        const a1 = firstTweener.nwx - firstTweener.width;
        const b1 = firstTweener.ney;
        const g1 = firstTweener.nwx;
        const h1 = b1 - displacement;
        const e1 = (a1 + g1) / 2;
        const f1 = (b1 + h1) / 2;
        const c1 = e1;
        const d1 = b1;

        const a2 = lastTweener.nex;
        const b2 = h1;
        const g2 = a2 + lastTweener.width;
        const h2 = b1;
        const e2 = (a2 + g2) / 2;
        const f2 = (b2 + h2) / 2;
        const c2 = e2;
        const d2 = b2;

        const data = `
            M ${n1.nex} ${n1.ney}
            L ${a1} ${b1}
            Q ${c1} ${d1}, ${e1} ${f1} T ${g1} ${h1}
            L ${a2} ${b2}
            Q ${c2} ${d2}, ${e2} ${f2} T ${g2} ${h2}`;

        this.createPath(data, GOING_AROUND_LINK_CSS_CLASS);
    }

    drawLeftGoingRoundLinkHelper(n1, n2, tweeners, fromEdge) {

        const lastTweener = tweeners[tweeners.length - 1];
        const displacement = (n1.nex - n1.nwx) * 1.2;

        const a1 = lastTweener.sex + lastTweener.width;
        const b1 = lastTweener.sey;
        const g1 = lastTweener.sex;
        const h1 = b1 + displacement;
        const e1 = (a1 + g1) / 2;
        const f1 = (b1 + h1) / 2;
        const c1 = e1;
        const d1 = b1;

        const a2 = lastTweener.swx;
        const b2 = h1;
        const g2 = a2 - lastTweener.width;
        const h2 = b1;
        const e2 = (a2 + g2) / 2;
        const f2 = (b2 + h2) / 2;
        const c2 = e2;
        const d2 = b2;

        const data = `
            M ${fromEdge ? this.width : n1.swx} ${n1.swy}
            L ${a1} ${b1}
            Q ${c1} ${d1}, ${e1} ${f1} T ${g1} ${h1}
            L ${a2} ${b2}
            Q ${c2} ${d2}, ${e2} ${f2} T ${g2} ${h2}`;

        this.createPath(data, GOING_AROUND_LINK_CSS_CLASS);
    }

    drawDownGoingAroundLinkHelper(n1, n2, tweeners) {

        const firstTweener = tweeners[0];
        const lastTweener = tweeners[tweeners.length - 1];
        const displacement = (n1.nex - n2.nwx) * 1.2;

        const a1 = firstTweener.nex;
        const b1 = firstTweener.ney - firstTweener.width;
        const g1 = a1 + displacement;
        const h1 = firstTweener.ney;
        const e1 = (a1 + g1) / 2;
        const f1 = (b1 + h1) / 2;
        const c1 = a1;
        const d1 = f1;

        const a2 = g1;
        const b2 = lastTweener.sey;
        const g2 = a1;
        const h2 = lastTweener.sey + lastTweener.width;
        const e2 = (a2 + g2) / 2;
        const f2 = (b2 + h2) / 2;
        const c2 = a2;
        const d2 = f2;

        const data = `
            M ${n1.sex} ${n1.sey}
            L ${a1} ${b1}
            Q ${c1} ${d1}, ${e1} ${f1} T ${g1} ${h1}
            L ${a2} ${b2}
            Q ${c2} ${d2}, ${e2} ${f2} T ${g2} ${h2}`;

        this.createPath(data, GOING_AROUND_LINK_CSS_CLASS);
    }

    drawUpGoingRoundLinkHelper(n1, n2, tweeners, fromEdge) {

        const lastTweener = tweeners[tweeners.length - 1];
        const displacement = (n1.nex - n1.nwx) * 1.2;

        const a1 = lastTweener.swx;
        const b1 = lastTweener.swy + lastTweener.width;
        const g1 = a1 - displacement;
        const h1 = lastTweener.swy;
        const e1 = (a1 + g1) / 2;
        const f1 = (b1 + h1) / 2;
        const c1 = a1;
        const d1 = f1;

        const a2 = g1;
        const b2 = lastTweener.nwy;
        const g2 = a1;
        const h2 = b2 - lastTweener.width;
        const e2 = (a2 + g2) / 2;
        const f2 = (b2 + h2) / 2;
        const c2 = a2;
        const d2 = f2;

        const data = `
            M ${n1.nwx} ${fromEdge ? this.height : n1.nwy}
            L ${a1} ${b1}
            Q ${c1} ${d1}, ${e1} ${f1} T ${g1} ${h1}
            L ${a2} ${b2}
            Q ${c2} ${d2}, ${e2} ${f2} T ${g2} ${h2}`;

        this.createPath(data, GOING_AROUND_LINK_CSS_CLASS);
    }

    drawRightNormalLink(n1, n2) {
        if (n2.colIndex > n1.colIndex) {
            this.createLine(n1.nex, n1.ney, n2.x, n1.ney, NORMAL_LINK_CSS_CLASS);
        }
        else {
            this.createLine(n1.nex, n1.ney, this.width, n1.ney, NORMAL_LINK_CSS_CLASS);
            this.createLine(0, n2.nwy, n2.x, n2.nwy, NORMAL_LINK_CSS_CLASS);
        }
        this.drawRightArrowHead({ x: n1.nex + (n1.width / 2) + 1, y: n1.ney }, NORMAL_ARROW_HEAD_CSS_CLASS);
        this.drawRightArrowHead({ x: n2.x - 1, y: n1.ney }, NORMAL_ARROW_HEAD_CSS_CLASS);
    }

    drawRightGoingAroundLink(n1, n2, tweeners) {
        this.drawRightGoingAroundLinkHelper(n1, n2, tweeners);
        this.drawRightArrowHead({ x: n1.nex + (n1.width / 2) + 1, y: n1.ney }, GOING_AROUND_ARROW_HEAD_CSS_CLASS);
    }

    drawLeftNormalLink(n1, n2) {
        if (n1.colIndex > n2.colIndex) {
            this.createLine(n1.swx, n1.swy, n2.x + n2.width, n1.swy, NORMAL_LINK_CSS_CLASS);
        }
        else {
            this.createLine(n1.swx, n1.swy, 0, n1.swy, NORMAL_LINK_CSS_CLASS);
            this.createLine(this.width, n2.sey, n2.x + n2.width, n2.sey, NORMAL_LINK_CSS_CLASS);
        }
        this.drawLeftArrowHead({ x: n1.swx - (n1.width / 2) - 1, y: n1.swy }, NORMAL_ARROW_HEAD_CSS_CLASS);
        this.drawLeftArrowHead({ x: n2.x + n2.width + 1, y: n1.swy }, NORMAL_ARROW_HEAD_CSS_CLASS);
    }

    drawLeftGoingAroundLink(n1, n2, tweeners) {
        if (n1.colIndex > n2.colIndex) {
            this.drawLeftGoingRoundLinkHelper(n1, n2, tweeners);
        }
        else {
            this.createLine(n1.swx, n1.swy, 0, n1.swy, GOING_AROUND_LINK_CSS_CLASS);
            this.drawLeftGoingRoundLinkHelper(n1, n2, tweeners, true);
        }
        this.drawLeftArrowHead({ x: n1.swx - (n1.width / 2) - 1, y: n1.swy }, GOING_AROUND_ARROW_HEAD_CSS_CLASS);
    }

    drawDownNormalLink(n1, n2) {
        if (n2.rowIndex > n1.rowIndex) {
            this.createLine(n1.sex, n1.sey, n1.sex, n2.y, NORMAL_LINK_CSS_CLASS);
        }
        else {
            this.createLine(n1.sex, n1.sey, n1.sex, this.height, NORMAL_LINK_CSS_CLASS);
            this.createLine(n2.nex, 0, n2.nex, n2.y, NORMAL_LINK_CSS_CLASS);
        }
        this.drawDownArrowHead({ x: n1.sex, y: n1.sey + (n1.width / 2) + 1 }, NORMAL_ARROW_HEAD_CSS_CLASS);
        this.drawDownArrowHead({ x: n1.nex, y: n2.y - 1 }, NORMAL_ARROW_HEAD_CSS_CLASS);
    }

    drawDownGoingAroundLink(n1, n2, tweeners) {
        this.drawDownGoingAroundLinkHelper(n1, n2, tweeners);
        this.drawDownArrowHead({ x: n1.sex, y: n1.sey + (n1.width / 2) + 1 }, GOING_AROUND_ARROW_HEAD_CSS_CLASS);
    }

    drawUpNormalLink(n1, n2) {
        if (n1.rowIndex > n2.rowIndex) {
            this.createLine(n1.nwx, n1.nwy, n1.nwx, n2.y + n2.height, NORMAL_LINK_CSS_CLASS);
        }
        else {
            this.createLine(n2.swx, this.height, n2.swx, n2.y + n2.height, NORMAL_LINK_CSS_CLASS);
            this.createLine(n1.nwx, n1.nwy, n1.nwx, 0, NORMAL_LINK_CSS_CLASS);
        }
        this.drawUpArrowHead({ x: n1.nwx, y: n1.ney - (n1.width / 2) - 1 }, NORMAL_ARROW_HEAD_CSS_CLASS);
        this.drawUpArrowHead({ x: n2.swx, y: n2.y + n2.height + 1 }, NORMAL_ARROW_HEAD_CSS_CLASS);
    }

    drawUpGoingAroundLink(n1, n2, tweeners) {
        if (n1.rowIndex > n2.rowIndex) {
            this.drawUpGoingRoundLinkHelper(n1, n2, tweeners);
        }
        else {
            this.createLine(n1.nwx, n1.nwy, n1.nwx, 0, GOING_AROUND_LINK_CSS_CLASS);
            this.drawUpGoingRoundLinkHelper(n1, n2, tweeners, true);
        }
        this.drawUpArrowHead({ x: n1.nwx, y: n1.ney - (n1.width / 2) - 1 }, GOING_AROUND_ARROW_HEAD_CSS_CLASS);
    }

    removeLinks() {
        const links = document.getElementsByClassName('link');
        Array.from(links).forEach(link => link.remove());
    }

    resetCoveredNodes() {
        const elements = Array.from(document.querySelectorAll('[data-coords]'));
        elements.forEach(element => element.setAttribute('class', NORMAL_NODE_CSS_CLASS));
    }

    addCoveredNode(node) {
        this.coveredNodes.push(node);
    }

    setCoveredNodes() {
        this.coveredNodes.forEach(node => {
            const element = this.nodeToElement(node);
            if (element) {
                element.setAttribute('class', COVERED_NODE_CSS_CLASS);
            }
        });
    }

    insertElementsIntoDOM() {
        this.elements.forEach(element => this.svg.appendChild(element));
    }

    removeClickHandler(node) {
        const element = this.nodeToElement(node);
        if (element) {
            const onNodeClick = element.onNodeClick;
            if (onNodeClick) {
                element.removeEventListener('click', onNodeClick);
            }
        }
    }

    addClickHandler(node, onNodeClick) {
        const element = this.nodeToElement(node);
        if (element) {

            // TODO: this is a bit nasty! try to find a better way!
            // - we save 'onNodeClick' on 'element' so that we can remove
            //   it in 'this.removeClickHandler'.
            element.onNodeClick = onNodeClick;

            element.addEventListener('click', onNodeClick);
        }
    }
}
