import { solutionGenerator } from '../dlxlib';

// const matrix = [
//     [1, 0, 0, 0],
//     [0, 1, 1, 0],
//     [1, 0, 0, 1],
//     [0, 0, 1, 1],
//     [0, 1, 0, 0],
//     [0, 0, 1, 0]
// ];

const matrix = [
    [0, 0, 1, 0, 1, 1, 0],
    [1, 0, 0, 1, 0, 0, 1],
    [0, 1, 1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 1],
    [0, 0, 0, 1, 1, 0, 1]      
];

const rootToStructure = root => {
    root.colIndex = -1;
    const nodes = [];
    let maxRowIndex = 0;
    let colIndex = 0;
    root.loopNext(columnHeader => {
        columnHeader.colIndex = colIndex;
        columnHeader.loopDown(node => {
            nodes.push(node);
            node.colIndex = colIndex;
            if (node.rowIndex > maxRowIndex) maxRowIndex = node.rowIndex;
        });
        colIndex++;
    });

    return {
        nodes,
        numCols: colIndex,
        numRows: maxRowIndex + 1
    };
};

class DrawingArea {
}

class DrawingAreaCanvas extends DrawingArea {

    constructor(id) {
        super();
        this.canvas = document.getElementById(id);
        this.width = this.canvas.scrollWidth;
        this.height  = this.canvas.scrollHeight;
        this.ctx = this.canvas.getContext('2d');
    }

    drawBorders() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'green';
        this.ctx.setLineDash([1, 4]);
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.width, 0);
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawDot(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 1, 0, Math.PI * 2, false);
        this.ctx.fillStyle = 'green';
        this.ctx.fill;
        this.ctx.stroke();
    }

    drawNodeRect(node) {
        this.ctx.strokeStyle = 'green';
        this.ctx.strokeRect(node.x, node.y, node.width, node.height);
    }

    drawHorizontalLinks(n1, n2) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'green';
        this.ctx.moveTo(n1.nex, n1.ney);
        this.ctx.lineTo(n2.x, n1.ney);
        this.ctx.moveTo(n2.swx, n2.swy);
        this.ctx.lineTo(n1.x + n1.width, n2.swy);
        this.ctx.stroke();
    }

    drawHorizontalLinksToRightEdge(n) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'green';
        this.ctx.moveTo(n.nex, n.ney);
        this.ctx.lineTo(this.width, n.ney);
        this.ctx.moveTo(this.width, n.swy);
        this.ctx.lineTo(n.x + n.width, n.swy);
        this.ctx.stroke();
    }

    drawHorizontalLinksFromLeftEdge(n) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'green';
        this.ctx.moveTo(0, n.nwy);
        this.ctx.lineTo(n.x, n.nwy);
        this.ctx.moveTo(n.swx, n.swy);
        this.ctx.lineTo(0, n.swy);
        this.ctx.stroke();
    }

    drawVerticalLinks(n1, n2) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'green';
        this.ctx.moveTo(n1.sex, n1.sey);
        this.ctx.lineTo(n1.sex, n2.y);
        this.ctx.moveTo(n2.nwx, n2.nwy);
        this.ctx.lineTo(n2.nwx, n1.y + n1.height);
        this.ctx.stroke();
    }

    drawVerticalLinksToBottomEdge(n) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'green';
        this.ctx.moveTo(n.sex, n.sey);
        this.ctx.lineTo(n.sex, this.height);
        this.ctx.moveTo(n.nwx, this.height);
        this.ctx.lineTo(n.nwx, n.y + n.height);
        this.ctx.stroke();
    }

    drawVerticalLinksFromTopEdge(n) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'green';
        this.ctx.moveTo(n.nex, 0);
        this.ctx.lineTo(n.nex, n.y);
        this.ctx.moveTo(n.nwx, n.nwy);
        this.ctx.lineTo(n.nwx, 0);
        this.ctx.stroke();
    }
}

// class DrawingAreaSvg extends DrawingArea {
//     constructor() {
//         super();
//     }
// }

const drawStructure = (root, nodes, numCols, numRows, drawingArea) => {

    const nodeWidth = drawingArea.width / (numCols + 1);
    const nodeHeight = drawingArea.height / (numRows + 2);

    const blessRoot = () => {
        const node = root;
        node.width = nodeWidth / 4;
        node.height = node.width * 2;
        node.x = (nodeWidth - node.width) / 2;
        node.y = ((2 * nodeHeight) - node.height) / 2;
        const inset = node.width / 4;
        node.nwx = node.x + inset;
        node.nwy = node.y + inset;
        node.nex = node.x + node.width - inset;
        node.ney = node.y + inset;
        node.swx = node.x + inset;
        node.sex = node.x + node.width - inset;
        node.swy = node.y + node.height - inset;
        node.sey = node.y + node.height - inset;
    };

    const blessColumnHeader = columnHeader => {
        const node = columnHeader;
        const xBase = nodeWidth * (node.colIndex + 1);
        node.width = nodeWidth / 4;
        node.height = node.width * 2;
        node.x = xBase + ((nodeWidth - node.width) / 2);
        node.y = ((2 * nodeHeight) - node.height) / 2;
        const inset = node.width / 4;
        node.nwx = node.x + inset;
        node.nwy = node.y + inset;
        node.nex = node.x + node.width - inset;
        node.ney = node.y + inset;
        node.swx = node.x + inset;
        node.sex = node.x + node.width - inset;
        node.swy = node.y + node.height - inset;
        node.sey = node.y + node.height - inset;
    };

    const blessColumnHeaders = () => root.loopNext(blessColumnHeader);

    const blessNode = node => {
        const xBase = nodeWidth * (node.colIndex + 1);
        const yBase = nodeHeight * (node.rowIndex + 2);
        const side = Math.max(nodeWidth / 4, nodeHeight / 4);
        node.x = xBase + ((nodeWidth - side) / 2);
        node.y = yBase + ((nodeHeight - side) / 2);
        node.width = side;
        node.height = side;
        const inset = side / 4;
        node.nwx = node.x + inset;
        node.nwy = node.y + inset;
        node.nex = node.x + node.width - inset;
        node.ney = node.y + inset;
        node.swx = node.x + inset;
        node.sex = node.x + node.width - inset;
        node.swy = node.y + node.height - inset;
        node.sey = node.y + node.height - inset;
    };

    const blessNodes = () => nodes.forEach(blessNode);

    const drawDots = node => {
        drawingArea.drawDot(node.nwx, node.nwy);
        drawingArea.drawDot(node.nex, node.ney);
        drawingArea.drawDot(node.swx, node.swy);
        drawingArea.drawDot(node.sex, node.sey);
    };

    const drawRoot = () => {
        drawingArea.drawNodeRect(root);
        drawDots(root);
    };

    const drawColumnHeader = colummHeader => {
        drawingArea.drawNodeRect(colummHeader);
        drawDots(colummHeader);
    };

    const drawHorizontalLinks = linkPropertyName => n1 => {
        const n2 = n1[linkPropertyName];
        if (n2.colIndex > n1.colIndex) {
            drawingArea.drawHorizontalLinks(n1, n2);
        }
        else {
            drawingArea.drawHorizontalLinksToRightEdge(n1);
            drawingArea.drawHorizontalLinksFromLeftEdge(n2);
        }
    };

    const drawVerticalLinks = n1 => {
        let n2 = n1.down;
        if (n2.rowIndex > n1.rowIndex) {
            drawingArea.drawVerticalLinks(n1, n2);
        }
        else {
            drawingArea.drawVerticalLinksToBottomEdge(n1);
            drawingArea.drawVerticalLinksFromTopEdge(n2);
        }
    };

    const drawNode = node => {
        drawingArea.drawNodeRect(node);
        drawDots(node);
        drawHorizontalLinks('right')(node);
        drawVerticalLinks(node);
    };

    drawingArea.drawBorders();

    blessRoot();
    blessColumnHeaders();
    blessNodes();

    drawRoot();
    root.loopNext(drawColumnHeader);
    nodes.forEach(drawNode);

    drawHorizontalLinks('nextColumnObject')(root);
    root.loopNext(drawHorizontalLinks('nextColumnObject'));
    root.loopNext(drawVerticalLinks);
    nodes.forEach(drawHorizontalLinks('right'));
    nodes.forEach(drawVerticalLinks);
};

const drawingArea = new DrawingAreaCanvas('canvas');

let firstStep = true;
const onSearchStep = (xs, root) => {
    if (firstStep) {
        const { nodes, numCols, numRows } = rootToStructure(root);
        drawStructure(root, nodes, numCols, numRows, drawingArea);
        firstStep = false;
    }
};

const generator = solutionGenerator(matrix, onSearchStep);
generator.next();
