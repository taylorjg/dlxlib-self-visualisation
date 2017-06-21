export class DrawingAreaSvg {

    constructor(id) {
        this.svg = document.getElementById(id);
        this.width = this.svg.scrollWidth;
        this.height  = this.svg.scrollHeight;
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
        this.svg.appendChild(line);
    }

    createCircle(cx, cy, r, colour) {
        const circle = this.createElement('circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', colour);
        this.svg.appendChild(circle);
    }

    createRect(x, y, width, height, colour) {
        const rect = this.createElement('rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('stroke', colour);
        rect.setAttribute('fill-opacity', 0);
        this.svg.appendChild(rect);
    }

    createPath(data, colour) {
        const path = this.createElement('path');
        path.setAttribute('d', data);
        path.setAttribute('stroke', colour);
        path.setAttribute('stroke-width', 1);
        path.setAttribute('fill-opacity', 0);
        path.setAttribute('class', 'link');
        this.svg.appendChild(path);
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

    drawNodeRect(node) {
        this.createRect(node.x, node.y, node.width, node.height, 'green');
    }

    getHorizontalCoveredNodes(n) {
        const xs = n.oldRights.slice().reverse();
        return xs.length ? xs.concat(this.getHorizontalCoveredNodes(xs[xs.length - 1])) : xs;
    }

    getVerticalCoveredNodes(n) {
        const xs = n.oldDowns.slice().reverse();
        return xs.length ? xs.concat(this.getVerticalCoveredNodes(xs[xs.length - 1])) : xs;
    }

    n2s(n) {
        return `(${n.colIndex}, ${n.rowIndex})`;
    }

    drawTopGoingAroundLink(n1, coveredNodes) {

        const firstCoveredNode = coveredNodes[0];
        const lastCoveredNode = coveredNodes[coveredNodes.length - 1];
        const displacement = (firstCoveredNode.nex - firstCoveredNode.nwx) * 1.2;

        const a1 = n1.nex;
        const b1 = n1.ney;
        const g1 = firstCoveredNode.nwx;
        const h1 = b1 - displacement;
        const e1 = (a1 + g1) / 2;
        const f1 = (b1 + h1) / 2;
        const c1 = e1;
        const d1 = b1;

        const a2 = lastCoveredNode.nex;
        const b2 = h1;
        const g2 = a2 + lastCoveredNode.width;
        const h2 = b1;
        const e2 = (a2 + g2) / 2;
        const f2 = (b2 + h2) / 2;
        const c2 = e2;
        const d2 = b2;

        const data = `M${a1} ${b1} Q ${c1} ${d1}, ${e1} ${f1} T ${g1} ${h1} L${a2} ${b2} Q ${c2} ${d2}, ${e2} ${f2} T ${g2} ${h2}`;
        this.createPath(data, 'red');
    }

    // TODO: we may need to "come in" after each covered node (like the "up" going around link does in figure 4, column D).
    drawBottomGoingRoundLink(n2, coveredNodes) {

        const firstCoveredNode = coveredNodes[0];
        const lastCoveredNode = coveredNodes[coveredNodes.length - 1];
        const displacement = (firstCoveredNode.nex - firstCoveredNode.nwx) * 1.2;

        const a1 = n2.swx;
        const b1 = n2.swy;
        const g1 = lastCoveredNode.sex;
        const h1 = b1 + displacement;
        const e1 = (a1 + g1) / 2;
        const f1 = (b1 + h1) / 2;
        const c1 = e1;
        const d1 = b1;
        
        const a2 = firstCoveredNode.swx;
        const b2 = h1;
        const g2 = a2 - firstCoveredNode.width;
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

    drawHorizontalLinks(n1, n2) {
        const coveredNodes = this.getHorizontalCoveredNodes(n1);
        if (coveredNodes.length) {
            console.log(`[drawHorizontalLinks] n1: ${this.n2s(n1)}; n2: ${this.n2s(n2)}; coveredNodes: ${coveredNodes.map(this.n2s).join(', ')}`);
            this.drawHorizontalGoingAroundLinks(n1, n2, coveredNodes);
        }
        this.createLine(n1.nex, n1.ney, n2.x, n1.ney, 'green', null, true);
        this.createLine(n2.swx, n2.swy, n1.x + n1.width, n2.swy, 'green', null, true);
    }

    drawHorizontalLinksToRightEdge(n) {
        const coveredNodes = this.getHorizontalCoveredNodes(n);
        if (coveredNodes.length) {
            console.log(`[drawHorizontalLinksToRightEdge] n1: ${this.n2s(n)}; coveredNodes: ${coveredNodes.map(this.n2s).join(', ')}`);
            this.drawHorizontalGoingAroundLinks(n, { swx: this.width, swy: n.swy }, coveredNodes);
        }
        this.createLine(n.nex, n.ney, this.width, n.ney, 'green', null, true);
        this.createLine(this.width, n.swy, n.x + n.width, n.swy, 'green', null, true);
    }

    drawHorizontalLinksFromLeftEdge(n) {
        const lastColCovered = !!n.left.oldRights.length;
        const bottomLineColour = lastColCovered ? 'red' : 'green';
        this.createLine(0, n.nwy, n.x, n.nwy, 'green', null, true);
        this.createLine(n.swx, n.swy, 0, n.swy, bottomLineColour, null, true);
    }

    drawVerticalLinks(n1, n2) {
        const coveredNodes = this.getVerticalCoveredNodes(n1);
        if (coveredNodes.length) {
            console.log(`[drawVerticalLinks] n1: ${this.n2s(n1)}; n2: ${this.n2s(n2)}; coveredNodes: ${coveredNodes.map(this.n2s).join(', ')}`);
            this.drawVerticalGoingAroundLinks(n1, n2, coveredNodes);
        }
        this.createLine(n1.sex, n1.sey, n1.sex, n2.y, 'green', null, true);
        this.createLine(n2.nwx, n2.nwy, n2.nwx, n1.y + n1.height, 'green', null, true);
    }

    drawVerticalLinksToBottomEdge(n) {
        const coveredNodes = this.getVerticalCoveredNodes(n);
        if (coveredNodes.length) {
            console.log(`[drawVerticalLinksToBottomEdge] n1: ${this.n2s(n)}; coveredNodes: ${coveredNodes.map(this.n2s).join(', ')}`);
            this.drawVerticalGoingAroundLinks(n, { nwx: n.nwx, nwy: this.height }, coveredNodes);
        }
        this.createLine(n.sex, n.sey, n.sex, this.height, 'green', null, true);
        this.createLine(n.nwx, this.height, n.nwx, n.y + n.height, 'green', null, true);
    }

    drawVerticalLinksFromTopEdge(n) {
        const lastRowCovered = !!n.up.oldDowns.length;
        const leftLineColour = lastRowCovered ? 'red' : 'green';
        this.createLine(n.nex, 0, n.nex, n.y, 'green', null, true);
        this.createLine(n.nwx, n.nwy, n.nwx, 0, leftLineColour, null, true);
    }

    removeAllLinks() {
        const links = document.getElementsByClassName('link');
        Array.from(links).forEach(link => link.remove());
    }
}
