const BORDER_COLOUR = 'green';
const DOT_COLOUR = 'green';
const NODE_COLOUR = 'green';
const NORMAL_LINK_COLOUR = 'green';
const GOING_AROUND_LINK_COLOUR = 'red';
const NORMAL_ARROW_HEAD_COLOUR = 'green';
const GOING_AROUND_ARROW_HEAD_COLOUR = 'red';

export class DrawingAreaSvg {

    constructor(svg) {
        this.svg = svg;
        this.width = this.svg.scrollWidth;
        this.height  = this.svg.scrollHeight;
        this.elements = [];
        this.coveredNodes = [];
    }

    createElement(element) {
        return document.createElementNS('http://www.w3.org/2000/svg', element);
    }

    createLine(x1, y1, x2, y2, colour, dasharray, isLink) {
        const line = this.createElement('line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', colour);
        line.setAttribute('stroke-width', 1);
        if (dasharray) {
            line.setAttribute('stroke-dasharray', dasharray);
        }
        if (isLink) {
            line.setAttribute('class', 'link');
        }
        this.elements.push(line);
        return line;
    }

    createCircle(cx, cy, r, colour) {
        const circle = this.createElement('circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', colour);
        this.elements.push(circle);
        return circle;
    }

    createRect(x, y, width, height, colour) {
        const rect = this.createElement('rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('stroke', colour);
        rect.setAttribute('fill-opacity', 0);
        this.elements.push(rect);
        return rect;
    }

    createPath(data, colour) {
        const path = this.createElement('path');
        path.setAttribute('d', data);
        path.setAttribute('stroke', colour);
        path.setAttribute('stroke-width', 1);
        path.setAttribute('fill-opacity', 0);
        path.setAttribute('class', 'link');
        this.elements.push(path);
        return path;
    }

    createFilledPath(data, colour) {
        const path = this.createElement('path');
        path.setAttribute('d', data);
        path.setAttribute('stroke', colour);
        path.setAttribute('stroke-width', 1);
        path.setAttribute('fill', colour);
        path.setAttribute('class', 'link');
        this.elements.push(path);
        return path;
    }

    drawBorders() {
        const dasharray = [1, 4];
        this.createLine(0, 0, this.width, 0, BORDER_COLOUR, dasharray);
        this.createLine(this.width, 0, this.width, this.height, BORDER_COLOUR, dasharray);
        this.createLine(this.width, this.height, 0, this.height, BORDER_COLOUR, dasharray);
        this.createLine(0, this.height, 0, 0, BORDER_COLOUR, dasharray);
    }

    drawDot(x, y) {
        this.createCircle(x, y, 1, DOT_COLOUR);
    }

    nodeToCoordsString(n) {
        return `(${n.colIndex},${n.rowIndex})`;
    }

    nodeToElement(node) {
        const coordsString = this.nodeToCoordsString(node);
        return document.querySelector(`[data-coords='${coordsString}']`);
    }

    drawNodeRect(node) {
        const rect = this.createRect(node.x, node.y, node.width, node.height, NODE_COLOUR);
        rect.setAttribute('data-coords', this.nodeToCoordsString(node));
        rect.node = node;
    }

    drawRightArrowHead(apex, colour) {
        const data = `
            M ${apex.x} ${apex.y}
            L ${apex.x - 5} ${apex.y - 2}
            L ${apex.x - 5} ${apex.y + 2}
            Z`;
        this.createFilledPath(data, colour);
    }

    drawLeftArrowHead(apex, colour) {
        const data = `
            M ${apex.x} ${apex.y}
            L ${apex.x + 5} ${apex.y - 2}
            L ${apex.x + 5} ${apex.y + 2}
            Z`;
        this.createFilledPath(data, colour);
    }

    drawDownArrowHead(apex, colour) {
        const data = `
            M ${apex.x} ${apex.y}
            L ${apex.x - 2} ${apex.y - 5}
            L ${apex.x + 2} ${apex.y - 5}
            Z`;
        this.createFilledPath(data, colour);
    }

    drawUpArrowHead(apex, colour) {
        const data = `
            M ${apex.x} ${apex.y}
            L ${apex.x - 2} ${apex.y + 5}
            L ${apex.x + 2} ${apex.y + 5}
            Z`;
        this.createFilledPath(data, colour);
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
        this.createPath(data, GOING_AROUND_LINK_COLOUR);
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

        this.createPath(data, GOING_AROUND_LINK_COLOUR);
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

        this.createPath(data, GOING_AROUND_LINK_COLOUR);
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

        this.createPath(data, GOING_AROUND_LINK_COLOUR);
    }

    drawRightNormalLink(n1, n2) {
        if (n2.colIndex > n1.colIndex) {
            this.createLine(n1.nex, n1.ney, n2.x, n1.ney, NORMAL_LINK_COLOUR, null, true);
        }
        else {
            this.createLine(n1.nex, n1.ney, this.width, n1.ney, NORMAL_LINK_COLOUR, null, true);
            this.createLine(0, n2.nwy, n2.x, n2.nwy, NORMAL_LINK_COLOUR, null, true);
        }
        this.drawRightArrowHead({ x: n1.nex + (n1.width / 2) + 1, y: n1.ney }, NORMAL_ARROW_HEAD_COLOUR);
        this.drawRightArrowHead({ x: n2.x - 1, y: n1.ney }, NORMAL_ARROW_HEAD_COLOUR);
    }

    drawRightGoingAroundLink(n1, n2, tweeners) {
        this.drawRightGoingAroundLinkHelper(n1, n2, tweeners);
        this.drawRightArrowHead({ x: n1.nex + (n1.width / 2) + 1, y: n1.ney }, GOING_AROUND_ARROW_HEAD_COLOUR);
    }

    drawLeftNormalLink(n1, n2) {
        if (n1.colIndex > n2.colIndex) {
            this.createLine(n1.swx, n1.swy, n2.x + n2.width, n1.swy, NORMAL_LINK_COLOUR, null, true);
        }
        else {
            this.createLine(n1.swx, n1.swy, 0, n1.swy, NORMAL_LINK_COLOUR, null, true);
            this.createLine(this.width, n2.sey, n2.x + n2.width, n2.sey, NORMAL_LINK_COLOUR, null, true);
        }
        this.drawLeftArrowHead({ x: n1.swx - (n1.width / 2) - 1, y: n1.swy }, NORMAL_ARROW_HEAD_COLOUR);
        this.drawLeftArrowHead({ x: n2.x + n2.width + 1, y: n1.swy }, NORMAL_ARROW_HEAD_COLOUR);
    }

    drawLeftGoingAroundLink(n1, n2, tweeners) {
        if (n1.colIndex > n2.colIndex) {
            this.drawLeftGoingRoundLinkHelper(n1, n2, tweeners);
        }
        else {
            this.createLine(n1.swx, n1.swy, 0, n1.swy, GOING_AROUND_LINK_COLOUR, null, true);
            this.drawLeftGoingRoundLinkHelper(n1, n2, tweeners, true);
        }
        this.drawLeftArrowHead({ x: n1.swx - (n1.width / 2) - 1, y: n1.swy }, GOING_AROUND_ARROW_HEAD_COLOUR);
    }

    drawDownNormalLink(n1, n2) {
        if (n2.rowIndex > n1.rowIndex) {
            this.createLine(n1.sex, n1.sey, n1.sex, n2.y, NORMAL_LINK_COLOUR, null, true);
        }
        else {
            this.createLine(n1.sex, n1.sey, n1.sex, this.height, NORMAL_LINK_COLOUR, null, true);
            this.createLine(n2.nex, 0, n2.nex, n2.y, NORMAL_LINK_COLOUR, null, true);
        }
        this.drawDownArrowHead({ x: n1.sex, y: n1.sey + (n1.width / 2) + 1 }, NORMAL_ARROW_HEAD_COLOUR);
        this.drawDownArrowHead({ x: n1.nex, y: n2.y - 1 }, NORMAL_ARROW_HEAD_COLOUR);
    }

    drawDownGoingAroundLink(n1, n2, tweeners) {
        this.drawDownGoingAroundLinkHelper(n1, n2, tweeners);
        this.drawDownArrowHead({ x: n1.sex, y: n1.sey + (n1.width / 2) + 1 }, GOING_AROUND_ARROW_HEAD_COLOUR);
    }

    drawUpNormalLink(n1, n2) {
        if (n1.rowIndex > n2.rowIndex) {
            this.createLine(n1.nwx, n1.nwy, n1.nwx, n2.y + n2.height, NORMAL_LINK_COLOUR, null, true);
        }
        else {
            this.createLine(n2.swx, this.height, n2.swx, n2.y + n2.height, NORMAL_LINK_COLOUR, null, true);
            this.createLine(n1.nwx, n1.nwy, n1.nwx, 0, NORMAL_LINK_COLOUR, null, true);
        }
        this.drawUpArrowHead({ x: n1.nwx, y: n1.ney - (n1.width / 2) - 1 }, NORMAL_ARROW_HEAD_COLOUR);
        this.drawUpArrowHead({ x: n2.swx, y: n2.y + n2.height + 1 }, NORMAL_ARROW_HEAD_COLOUR);
    }

    drawUpGoingAroundLink(n1, n2, tweeners) {
        if (n1.rowIndex > n2.rowIndex) {
            this.drawUpGoingRoundLinkHelper(n1, n2, tweeners);
        }
        else {
            this.createLine(n1.nwx, n1.nwy, n1.nwx, 0, GOING_AROUND_LINK_COLOUR, null, true);
            this.drawUpGoingRoundLinkHelper(n1, n2, tweeners, true);
        }
        this.drawUpArrowHead({ x: n1.nwx, y: n1.ney - (n1.width / 2) - 1 }, GOING_AROUND_ARROW_HEAD_COLOUR);
    }

    removeLinks() {
        const links = document.getElementsByClassName('link');
        Array.from(links).forEach(link => link.remove());
    }

    resetCoveredNodes() {
        const elements = Array.from(document.querySelectorAll('[data-coords]'));
        elements.forEach(element => element.setAttribute('class', ''));
    }

    addCoveredNode(node) {
        this.coveredNodes.push(node);
    }

    setCoveredNodes() {
        this.coveredNodes.forEach(node => {
            const element = this.nodeToElement(node);
            if (element) {
                element.setAttribute('class', 'covered');
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
