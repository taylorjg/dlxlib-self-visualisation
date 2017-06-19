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

const drawingArea = document.getElementById('canvas');
const daWidth = drawingArea.scrollWidth;
const daHeight = drawingArea.scrollHeight;
const ctx = drawingArea.getContext('2d');

// class DrawingArea {
//     constructor() {
//     }
// }

// class DrawingAreaCanvas extends DrawingArea {
//     constructor() {
//         super();
//         this.canvas = document.getElementById('canvas');
//         this.width = this.canvas.scrollWidth;
//         this.height  = this.canvas.scrollHeight;
//         this.ctx = this.canvas.getContext('2d');
//     }
// }

// class DrawingAreaSvg extends DrawingArea {
//     constructor() {
//         super();
//     }
// }

const drawStructure = (root, nodes, numCols, numRows) => {

    const nodeWidth = daWidth / (numCols + 1);
    const nodeHeight = daHeight / (numRows + 2);

    const RADIUS = 1;
    const START_ANGLE = 0;
    const END_ANGLE = Math.PI * 2;

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

    const drawBorders = () => {
        ctx.beginPath();
        ctx.strokeStyle = 'green';
        ctx.setLineDash([1, 4]);
        ctx.moveTo(0, 0);
        ctx.lineTo(daWidth, 0);
        ctx.lineTo(daWidth, daHeight);
        ctx.lineTo(0, daHeight);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
    };

    const drawDot = (x, y) => {
        ctx.beginPath();
        ctx.arc(x, y, RADIUS, START_ANGLE, END_ANGLE, false);
        ctx.fillStyle = 'green';
        ctx.fill;
        ctx.stroke();
    };

    const drawDots = node => {
        drawDot(node.nwx, node.nwy);
        drawDot(node.nex, node.ney);
        drawDot(node.swx, node.swy);
        drawDot(node.sex, node.sey);
    };

    const drawNodeRect = node => {
        ctx.strokeStyle = 'green';
        ctx.strokeRect(node.x, node.y, node.width, node.height);
    };

    const drawRoot = () => {
        drawNodeRect(root);
        drawDots(root);
    };

    const drawColumnHeader = colummHeader => {
        drawNodeRect(colummHeader);
        drawDots(colummHeader);
    };

    const drawHorizontalLinks = linkPropertyName => node => {
        const toNode = node[linkPropertyName];
        if (toNode.colIndex > node.colIndex) {
            ctx.beginPath();
            ctx.strokeStyle = 'green';
            ctx.moveTo(node.nex, node.ney);
            ctx.lineTo(toNode.x, node.ney);
            ctx.moveTo(toNode.swx, toNode.swy);
            ctx.lineTo(node.x + node.width, toNode.swy);
            ctx.stroke();
        }
        else {
            ctx.beginPath();
            ctx.strokeStyle = 'green';

            ctx.moveTo(node.nex, node.ney);
            ctx.lineTo(daWidth, node.ney);
            ctx.moveTo(daWidth, node.swy);
            ctx.lineTo(node.x + node.width, node.swy);

            ctx.moveTo(0, toNode.nwy);
            ctx.lineTo(toNode.x, toNode.nwy);
            ctx.moveTo(toNode.swx, toNode.swy);
            ctx.lineTo(0, node.swy);
            ctx.stroke();
        }
    };

    const drawVerticalLinks = node => {
        let toNode = node.down;
        if (toNode.rowIndex > node.rowIndex) {
            ctx.beginPath();
            ctx.strokeStyle = 'green';
            ctx.moveTo(node.sex, node.sey);
            ctx.lineTo(node.sex, toNode.y);
            ctx.moveTo(toNode.nwx, toNode.nwy);
            ctx.lineTo(toNode.nwx, node.y + node.height);
            ctx.stroke();
        }
        else {
            ctx.beginPath();
            ctx.strokeStyle = 'green';

            ctx.moveTo(node.sex, node.sey);
            ctx.lineTo(node.sex, daHeight);
            ctx.moveTo(toNode.nwx, daHeight);
            ctx.lineTo(toNode.nwx, node.y + node.height);

            ctx.moveTo(toNode.nex, 0);
            ctx.lineTo(toNode.nex, toNode.y);
            ctx.moveTo(toNode.nwx, toNode.nwy);
            ctx.lineTo(toNode.nwx, 0);

            ctx.stroke();
        }
    };

    const drawNode = node => {
        drawNodeRect(node);
        drawDots(node);
        drawHorizontalLinks('right')(node);
        drawVerticalLinks(node);
    };

    drawBorders();

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

let firstStep = true;
const onSearchStep = (xs, root) => {
    if (firstStep) {
        const { nodes, numCols, numRows } = rootToStructure(root);
        drawStructure(root, nodes, numCols, numRows);
        firstStep = false;
    }
};

const generator = solutionGenerator(matrix, onSearchStep);
generator.next();
