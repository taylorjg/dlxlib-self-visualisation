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

    createBezier(a, b, g, h, colour) {
        const e = (a + g) / 2;
        const f = (b + h) / 2;
        const c = e;
        const d = b;
        const data = `M${a} ${b} Q ${c} ${d}, ${e} ${f} T ${g} ${h}`;
        const path = this.createElement('path');
        path.setAttribute('d', data);
        path.setAttribute('stroke', colour);
        path.setAttribute('stroke-width', 0.5);
        path.setAttribute('fill-opacity', 0);
        path.setAttribute('class', 'link');
        this.svg.appendChild(path);
    }

    createPath(data, colour) {
        const path = this.createElement('path');
        path.setAttribute('d', data);
        path.setAttribute('stroke', colour);
        path.setAttribute('stroke-width', 0.5);
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
        const f = (m, coveredNodes) => m.oldLeft && m.oldLeft !== n ? f(m.oldLeft, [m.oldLeft, ...coveredNodes]) : coveredNodes;
        return n.oldRight ? f(n.oldRight, [n.oldRight]) : [];
    }

    getVerticalCoveredNodes(n) {
        const f = (m, coveredNodes) => m.oldUp && m.oldUp !== n ? f(m.oldUp, [m.oldUp, ...coveredNodes]) : coveredNodes;
        return n.oldDown ? f(n.oldDown, [n.oldDown]) : [];
    }

    n2s(n) {
        return `(${n.colIndex}, ${n.rowIndex})`;
    }

    // drawBezierTopLeft(n1, coveredNodes) {
    //     const displacement = (n1.nex - n1.nwx) * 1.2;
    //     const a = n1.nex;
    //     const b = n1.ney;
    //     const g = coveredNodes[0].nwx;
    //     const h = b - displacement;
    //     this.createBezier(a, b, g, h, 'red');
    // }

    // drawBezierTopRight(n2, coveredNodes) {
    //     const lastCoveredNode = coveredNodes[coveredNodes.length - 1];
    //     const displacement = (n2.nex - n2.nwx) * 1.2;
    //     const a = lastCoveredNode.nex;
    //     const b = lastCoveredNode.ney - displacement;
    //     const g = lastCoveredNode.nex + lastCoveredNode.width;
    //     const h = n2.nwy;
    //     this.createBezier(a, b, g, h, 'red');
    // }

    // drawBezierBottomRight(n2, coveredNodes) {
    //     const lastCoveredNode = coveredNodes[coveredNodes.length - 1];
    //     const displacement = (n2.nex - n2.nwx) * 1.2;
    //     const a = n2.swx;
    //     const b = n2.swy;
    //     const g = lastCoveredNode.sex;
    //     const h = b + displacement;
    //     this.createBezier(a, b, g, h, 'red');
    // }

    // drawBezierBottomLeft(n1, coveredNodes) {
    //     const displacement = (n1.nex - n1.nwx) * 1.2;
    //     const a = coveredNodes[0].swx;
    //     const b = coveredNodes[0].swy + displacement;
    //     const g = coveredNodes[0].swx - coveredNodes[0].width;
    //     const h = coveredNodes[0].swy;
    //     this.createBezier(a, b, g, h, 'red');
    // }

    drawTopGoingAroundLink(n1, n2, coveredNodes) {

        const displacement = (n1.nex - n1.nwx) * 1.2;
        const firstCoveredNode = coveredNodes[0];
        const lastCoveredNode = coveredNodes[coveredNodes.length - 1];

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

    drawBottomGoingRoundLink(n1, n2, coveredNodes) {

        const displacement = (n1.nex - n1.nwx) * 1.2;
        const firstCoveredNode = coveredNodes[0];
        const lastCoveredNode = coveredNodes[coveredNodes.length - 1];

        const a1 = n2.swx;
        const b1 = n2.swy;
        const g1 = lastCoveredNode.sex;
        const h1 = b1 + displacement;
        const e1 = (a1 + g1) / 2;
        const f1 = (b1 + h1) / 2;
        const c1 = e1;
        const d1 = b1;
        
        const a2 = firstCoveredNode.swx;
        const b2 = firstCoveredNode.swy + displacement;
        const g2 = a2 - firstCoveredNode.width;
        const h2 = firstCoveredNode.swy;
        const e2 = (a2 + g2) / 2;
        const f2 = (b2 + h2) / 2;
        const c2 = e2;
        const d2 = b2;

        const data = `M${a1} ${b1} Q ${c1} ${d1}, ${e1} ${f1} T ${g1} ${h1} L${a2} ${b2} Q ${c2} ${d2}, ${e2} ${f2} T ${g2} ${h2}`;
        this.createPath(data, 'red');
    }

    drawHorizontalGoingAroundLinks(n1, n2, coveredNodes) {
        this.drawTopGoingAroundLink(n1, n2, coveredNodes);
        this.drawBottomGoingRoundLink(n1, n2, coveredNodes);
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
            // this.drawBezierTopLeft(n, coveredNodes);
            // this.drawBezierTopRight(n, coveredNodes);
        }
        this.createLine(n.nex, n.ney, this.width, n.ney, 'green', null, true);
        this.createLine(this.width, n.swy, n.x + n.width, n.swy, 'green', null, true);
    }

    drawHorizontalLinksFromLeftEdge(n) {
        const coveredNodes = this.getHorizontalCoveredNodes(n);
        if (coveredNodes.length) {
            console.log(`[drawHorizontalLinksFromLeftEdge] n1: ${this.n2s(n)}; coveredNodes: ${coveredNodes.map(this.n2s).join(', ')}`);
        }
        this.createLine(0, n.nwy, n.x, n.nwy, 'green', null, true);
        this.createLine(n.swx, n.swy, 0, n.swy, 'green', null, true);
    }

    drawVerticalLinks(n1, n2) {
        const coveredNodes = this.getVerticalCoveredNodes(n1);
        if (coveredNodes.length) {
            console.log(`[drawVerticalLinks] n1: ${this.n2s(n1)}; n2: ${this.n2s(n2)}; coveredNodes: ${coveredNodes.map(this.n2s).join(', ')}`);
        }
        this.createLine(n1.sex, n1.sey, n1.sex, n2.y, 'green', null, true);
        this.createLine(n2.nwx, n2.nwy, n2.nwx, n1.y + n1.height, 'green', null, true);
    }

    drawVerticalLinksToBottomEdge(n) {
        const coveredNodes = this.getVerticalCoveredNodes(n);
        if (coveredNodes.length) {
            console.log(`[drawVerticalLinksToBottomEdge] n1: ${this.n2s(n)}; coveredNodes: ${coveredNodes.map(this.n2s).join(', ')}`);
        }
        this.createLine(n.sex, n.sey, n.sex, this.height, 'green', null, true);
        this.createLine(n.nwx, this.height, n.nwx, n.y + n.height, 'green', null, true);
    }

    drawVerticalLinksFromTopEdge(n) {
        const coveredNodes = this.getVerticalCoveredNodes(n);
        if (coveredNodes.length) {
            console.log(`[drawVerticalLinksFromTopEdge] n1: ${this.n2s(n)}; coveredNodes: ${coveredNodes.map(this.n2s).join(', ')}`);
        }
        this.createLine(n.nex, 0, n.nex, n.y, 'green', null, true);
        this.createLine(n.nwx, n.nwy, n.nwx, 0, 'green', null, true);
    }

    removeAllLinks() {
        const links = document.getElementsByClassName('link');
        Array.from(links).forEach(link => link.remove());
    }
}
