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
        line.setAttribute('stroke-width', 0.5);
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

    drawBorders() {
        const dasharray = [1, 4];
        this.createLine(0, 0, this.width, 0, 'green', dasharray);
        this.createLine(this.width, 0, this.width, this.height, 'green', dasharray);
        this.createLine(this.width, this.height, 0, this.height, 'green', dasharray);
        this.createLine(0, this.height, 0, 0, 'green', dasharray);
    }

    drawDot(x, y) {
        this.createCircle(x, y, 1, 'green');
    }

    nodeToCoordsString(n) {
        return `(${n.colIndex},${n.rowIndex})`;
    }

    drawNodeRect(node) {
        const rect = this.createRect(node.x, node.y, node.width, node.height, 'green');
        rect.setAttribute('data-coords', this.nodeToCoordsString(node));
    }

    drawTopGoingAroundLink(n1, n2) {

        const displacement = (n1.nex - n1.nwx) * 1.2;

        const a1 = n1.nex;
        const b1 = n1.ney;
        const g1 = n1.nwx + (n1.width * 2);
        const h1 = b1 - displacement;
        const e1 = (a1 + g1) / 2;
        const f1 = (b1 + h1) / 2;
        const c1 = e1;
        const d1 = b1;

        const a2 = n2.nex - (n2.width * 2);
        const b2 = h1;
        const g2 = n2.nwx - (n2.width / 2);
        const h2 = b1;
        const e2 = (a2 + g2) / 2;
        const f2 = (b2 + h2) / 2;
        const c2 = e2;
        const d2 = b2;

        const data = `M${a1} ${b1} Q ${c1} ${d1}, ${e1} ${f1} T ${g1} ${h1} L${a2} ${b2} Q ${c2} ${d2}, ${e2} ${f2} T ${g2} ${h2}`;
        this.createPath(data, 'red');
    }

    // TODO: we may need to "come in" after each covered node (like the "up" going around link does in figure 4, column D).
    drawBottomGoingRoundLink(n1, n2) {

        const displacement = (n1.nex - n1.nwx) * 1.2;

        const a1 = n1.swx;
        const b1 = n1.swy;
        const g1 = n1.sex - (n1.width * 2);
        const h1 = b1 + displacement;
        const e1 = (a1 + g1) / 2;
        const f1 = (b1 + h1) / 2;
        const c1 = e1;
        const d1 = b1;
        
        const a2 = n2.swx + (n2.width * 2);
        const b2 = h1;
        const g2 = n2.sex + (n2.width / 2);
        const h2 = b1;
        const e2 = (a2 + g2) / 2;
        const f2 = (b2 + h2) / 2;
        const c2 = e2;
        const d2 = b2;

        const data = `M${a1} ${b1} Q ${c1} ${d1}, ${e1} ${f1} T ${g1} ${h1} L${a2} ${b2} Q ${c2} ${d2}, ${e2} ${f2} T ${g2} ${h2}`;
        this.createPath(data, 'red');
    }

    drawRightGoingAroundLink(n1, coveredNodes) {

        const firstCoveredNode = coveredNodes[0];
        const lastCoveredNode = coveredNodes[coveredNodes.length - 1];
        const displacement = (firstCoveredNode.nex - firstCoveredNode.nwx) * 1.2;

        const a1 = firstCoveredNode.nex;
        const b1 = firstCoveredNode.ney - firstCoveredNode.width;
        const g1 = a1 + displacement;
        const h1 = firstCoveredNode.ney;
        const e1 = (a1 + g1) / 2;
        const f1 = (b1 + h1) / 2;
        const c1 = a1;
        const d1 = f1;

        const a2 = g1;
        const b2 = lastCoveredNode.sey;
        const g2 = a1;
        const h2 = lastCoveredNode.sey + lastCoveredNode.width;
        const e2 = (a2 + g2) / 2;
        const f2 = (b2 + h2) / 2;
        const c2 = a2;
        const d2 = f2;

        const data = `M${n1.sex} ${n1.sey} L${a1} ${b1} Q ${c1} ${d1}, ${e1} ${f1} T ${g1} ${h1} L${a2} ${b2} Q ${c2} ${d2}, ${e2} ${f2} T ${g2} ${h2}`;
        this.createPath(data, 'red');
    }

    // TODO: looks like we should "come in" after each covered node (see figure 4, column D).
    drawLeftGoingRoundLink(n2, coveredNodes) {

        const firstCoveredNode = coveredNodes[0];
        const lastCoveredNode = coveredNodes[coveredNodes.length - 1];
        const displacement = (firstCoveredNode.nex - firstCoveredNode.nwx) * 1.2;

        const a1 = lastCoveredNode.swx;
        const b1 = lastCoveredNode.swy + lastCoveredNode.width;
        const g1 = a1 - displacement;
        const h1 = lastCoveredNode.swy;
        const e1 = (a1 + g1) / 2;
        const f1 = (b1 + h1) / 2;
        const c1 = a1;
        const d1 = f1;
        
        const a2 = g1;
        const b2 = firstCoveredNode.nwy;
        const g2 = a1;
        const h2 = b2 - firstCoveredNode.width;
        const e2 = (a2 + g2) / 2;
        const f2 = (b2 + h2) / 2;
        const c2 = a2;
        const d2 = f2;

        const data = `M${n2.nwx} ${n2.nwy} L${a1} ${b1} Q ${c1} ${d1}, ${e1} ${f1} T ${g1} ${h1} L${a2} ${b2} Q ${c2} ${d2}, ${e2} ${f2} T ${g2} ${h2}`;
        this.createPath(data, 'red');
    }

    drawHorizontalGoingAroundLinks(n1, n2, coveredNodes) {
        this.drawTopGoingAroundLink(n1, coveredNodes);
        this.drawBottomGoingRoundLink(n2, coveredNodes);
    }

    drawVerticalGoingAroundLinks(n1, n2, coveredNodes) {
        this.drawRightGoingAroundLink(n1, coveredNodes);
        this.drawLeftGoingRoundLink(n2, coveredNodes);
    }

    drawNormalRightLink(n1, n2) {
        if (n2.colIndex > n1.colIndex) {
            this.createLine(n1.nex, n1.ney, n2.x, n1.ney, 'green', null, true);
        }
        else {
            this.createLine(n1.nex, n1.ney, this.width, n1.ney, 'green', null, true);
            this.createLine(0, n2.nwy, n2.x, n2.nwy, 'green', null, true);
        }
    }

    drawGoingAroundRightLink(n1, n2) {
        if (n2.colIndex > n1.colIndex) {
            this.drawTopGoingAroundLink(n1, n2);
        }
        else {
            // TODO
        }
    }

    drawNormalLeftLink(n1, n2) {
        if (n1.colIndex > n2.colIndex) {
            this.createLine(n1.swx, n1.swy, n2.x + n2.width, n1.swy, 'green', null, true);
        }
        else {
            this.createLine(n1.swx, n1.swy, 0, n1.swy, 'green', null, true);
            this.createLine(this.width, n2.sey, n2.x + n2.width, n2.sey, 'green', null, true);
        }
    }

    drawGoingAroundLeftLink(n1, n2) {
        if (n1.colIndex > n2.colIndex) {
            this.drawBottomGoingRoundLink(n1, n2);
        }
        else {
            // TODO
        }
    }

    drawNormalDownLink(n1, n2) {
        if (n2.rowIndex > n1.rowIndex) {
            this.createLine(n1.sex, n1.sey, n1.sex, n2.y, 'green', null, true);
        }
        else {
            this.createLine(n1.sex, n1.sey, n1.sex, this.height, 'green', null, true);
            this.createLine(n2.nex, 0, n2.nex, n2.y, 'green', null, true);
        }
    }

    drawGoingAroundDownLink(n1, n2, coveredNodes) {
        if (n2.rowIndex > n1.rowIndex) {
            this.drawRightGoingAroundLink(n1, coveredNodes);
        }
        else {
            // TODO
        }
    }

    drawNormalUpLink(n1, n2) {
        if (n1.rowIndex > n2.rowIndex) {
            this.createLine(n1.nwx, n1.nwy, n1.nwx, n2.y + n2.height, 'green', null, true);
        }
        else {
            this.createLine(n2.swx, this.height, n2.swx, n2.y + n2.height, 'green', null, true);
            this.createLine(n1.nwx, n1.nwy, n1.nwx, 0, 'green', null, true);
        }
    }

    drawGoingAroundUpLink(n1, n2, coveredNodes) {
        if (n1.rowIndex > n2.rowIndex) {
            this.drawLeftGoingRoundLink(n1, coveredNodes);
        }
        else {
            // TODO
        }
    }

    addCoveredNode(node) {
        this.coveredNodes.push(node);
    }

    removeLinks() {
        const links = document.getElementsByClassName('link');
        Array.from(links).forEach(link => link.remove());
    }

    resetCoveredNodes() {
        const elements = Array.from(document.querySelectorAll('[data-coords]'));
        elements.forEach(element => element.setAttribute('class', ''));
    }

    setCoveredNode(n) {
        const coordsString = this.nodeToCoordsString(n);
        const element = document.querySelector(`[data-coords='${coordsString}']`);
        if (element) {
            element.setAttribute('class', 'covered');
        }
    }

    setCoveredNodes() {
        this.coveredNodes.forEach(node => {
            const coordsString = this.nodeToCoordsString(node);
            const element = document.querySelector(`[data-coords='${coordsString}']`);
            if (element) {
                element.setAttribute('class', 'covered');
            }
        });
    }

    insertElementsIntoDOM() {
        this.elements.forEach(element => this.svg.appendChild(element));
    }
}
