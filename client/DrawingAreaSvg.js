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

    drawBezierLeft(n1, coveredNodes) {
        const displacement = (n1.nex - n1.nwx) * 1.2;
        const path = this.createElement('path');
        const a = n1.nex;
        const b = n1.ney;
        const g = coveredNodes[0].nwx;
        const h = b - displacement;
        const e = a + ((g - a) / 2);
        const f = b - (displacement / 2);
        const c = e;
        const d = b;
        const data = `M${a} ${b} Q ${c} ${d}, ${e} ${f} T ${g} ${h}`;
        path.setAttribute('d', data);
        path.setAttribute('stroke', 'red');
        path.setAttribute('stroke-width', 0.5);
        path.setAttribute('fill-opacity', 0);
        path.setAttribute('class', 'link');
        this.svg.appendChild(path);
    }

    drawBezierRight(n2, coveredNodes) {
        const lastCoveredNode = coveredNodes[coveredNodes.length - 1];
        const displacement = (n2.nex - n2.nwx) * 1.2;
        const path = this.createElement('path');
        const a = lastCoveredNode.nex;
        const b = lastCoveredNode.ney - displacement;
        const g = lastCoveredNode.nex + lastCoveredNode.width;
        const h = n2.nwy;
        const e = a + ((g - a) / 2);
        const f = b + (displacement / 2);
        const c = e;
        const d = b;
        const data = `M${a} ${b} Q ${c} ${d}, ${e} ${f} T ${g} ${h}`;
        path.setAttribute('d', data);
        path.setAttribute('stroke', 'red');
        path.setAttribute('stroke-width', 0.5);
        path.setAttribute('fill-opacity', 0);
        path.setAttribute('class', 'link');
        this.svg.appendChild(path);
    }

    drawHorizontalLinks(n1, n2) {
        const coveredNodes = this.getHorizontalCoveredNodes(n1);
        if (coveredNodes.length) {
            console.log(`[drawHorizontalLinks] n1: ${this.n2s(n1)}; n2: ${this.n2s(n2)}; coveredNodes: ${coveredNodes.map(this.n2s).join(', ')}`);
            this.drawBezierLeft(n1, coveredNodes);
            this.drawBezierRight(n2, coveredNodes);
        }
        this.createLine(n1.nex, n1.ney, n2.x, n1.ney, 'green', null, true);
        this.createLine(n2.swx, n2.swy, n1.x + n1.width, n2.swy, 'green', null, true);
    }

    drawHorizontalLinksToRightEdge(n) {
        const coveredNodes = this.getHorizontalCoveredNodes(n);
        if (coveredNodes.length) {
            console.log(`[drawHorizontalLinksToRightEdge] n1: ${this.n2s(n)}; coveredNodes: ${coveredNodes.map(this.n2s).join(', ')}`);
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
