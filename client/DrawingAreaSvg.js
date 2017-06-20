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

    drawHorizontalLinks(n1, n2) {
        this.createLine(n1.nex, n1.ney, n2.x, n1.ney, 'green', null, true);
        this.createLine(n2.swx, n2.swy, n1.x + n1.width, n2.swy, 'green', null, true);
    }

    drawHorizontalLinksToRightEdge(n) {
        this.createLine(n.nex, n.ney, this.width, n.ney, 'green', null, true);
        this.createLine(this.width, n.swy, n.x + n.width, n.swy, 'green', null, true);
    }

    drawHorizontalLinksFromLeftEdge(n) {
        this.createLine(0, n.nwy, n.x, n.nwy, 'green', null, true);
        this.createLine(n.swx, n.swy, 0, n.swy, 'green', null, true);
    }

    drawVerticalLinks(n1, n2) {
        this.createLine(n1.sex, n1.sey, n1.sex, n2.y, 'green', null, true);
        this.createLine(n2.nwx, n2.nwy, n2.nwx, n1.y + n1.height, 'green', null, true);
    }

    drawVerticalLinksToBottomEdge(n) {
        this.createLine(n.sex, n.sey, n.sex, this.height, 'green', null, true);
        this.createLine(n.nwx, this.height, n.nwx, n.y + n.height, 'green', null, true);
    }

    drawVerticalLinksFromTopEdge(n) {
        this.createLine(n.nex, 0, n.nex, n.y, 'green', null, true);
        this.createLine(n.nwx, n.nwy, n.nwx, 0, 'green', null, true);
    }

    removeAllLinks() {
        const links = document.getElementsByClassName('link');
        Array.from(links).forEach(link => link.remove());
    }
}
