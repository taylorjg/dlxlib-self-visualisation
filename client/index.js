import { solutionGenerator } from '../dlxlib';

const matrix = [
    [1, 0, 0, 0],
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 0, 1, 1],
    [0, 1, 0, 0],
    [0, 0, 1, 0]
];

const rootToStructure = root => {
    const nodes = [];
    let maxRowIndex = 0;
    let colIndex = 0;
    root.loopNext(columnHeader => {
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

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const drawStructure = (root, nodes, numCols, numRows) => {

    const cw = canvas.scrollWidth;
    const ch = canvas.scrollHeight;
    const nodeWidth = cw / (numCols + 1);
    const nodeHeight = ch / (numRows + 2);

    const RADIUS = 1;
    const START_ANGLE = 0;
    const END_ANGLE = Math.PI * 2;

    const drawDot = (x, y) => {
        ctx.beginPath();
        ctx.arc(x, y, RADIUS, START_ANGLE, END_ANGLE, false);
        ctx.fillStyle = 'green';
        ctx.fill;
        ctx.stroke();
    };

    const drawBorders = () => {
        ctx.beginPath();
        ctx.strokeStyle = 'green';
        ctx.setLineDash([1, 4]);
        ctx.moveTo(0, 0);
        ctx.lineTo(cw, 0);
        ctx.lineTo(cw, ch);
        ctx.lineTo(0, ch);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
    };

    const drawRoot = () => {
        ctx.strokeStyle = 'green';
        const width = nodeWidth / 4;
        const height = width * 2;
        const x = (nodeWidth - width) / 2;
        const y = ((2 * nodeHeight) - height) / 2;
        ctx.strokeRect(x, y, width, height);
        const inset = width / 4;
        drawDot(x + inset, y + inset);
        drawDot(x + width - inset, y + inset);
        drawDot(x + inset, y + height - inset);
        drawDot(x + width - inset, y + height - inset);
    };

    const drawColumnHeader = col => {
        ctx.strokeStyle = 'green';
        const xBase = nodeWidth * (col + 1);
        const yBase = 0;
        const width = nodeWidth / 4;
        const height = width * 2;
        const x = xBase + ((nodeWidth - width) / 2);
        const y = yBase + (((2 * nodeHeight) - height) / 2);
        ctx.strokeRect(x, y, width, height);
        const inset = width / 4;
        drawDot(x + inset, y + inset);
        drawDot(x + width - inset, y + inset);
        drawDot(x + inset, y + height - inset);
        drawDot(x + width - inset, y + height - inset);
    };

    const drawRightLink = node => {
        const toNode = node.right;
        if (toNode.colIndex > node.colIndex) {
            const x1Base = nodeWidth * (node.colIndex + 1);
            const x2Base = nodeWidth * (toNode.colIndex + 1);
            const yBase = nodeHeight * (node.rowIndex + 2);
            const side = Math.max(nodeWidth / 4, nodeHeight / 4);
            const x1 = x1Base + ((nodeWidth - side) / 2);
            const x2 = x2Base + ((nodeWidth - side) / 2);
            const y = yBase + ((nodeHeight - side) / 2);
            const inset = side / 4;
            ctx.beginPath();
            ctx.strokeStyle = 'green';
            ctx.moveTo(x1 + side - inset, y + inset);
            ctx.lineTo(x2, y + inset);
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = 'green';
            ctx.moveTo(x2 + inset, y + side - inset);
            ctx.lineTo(x1 + side, y + side - inset);
            ctx.stroke();
        }
        else {
            // TODO: draw a wrapping link.
        }
    };

    const drawDownLink = node => {
        let toNode = node.down;
        if (toNode.rowIndex > node.rowIndex) {
            const xBase = nodeWidth * (node.colIndex + 1);
            const y1Base = nodeHeight * (node.rowIndex + 2);
            const y2Base = nodeHeight * (toNode.rowIndex + 2);
            const side = Math.max(nodeWidth / 4, nodeHeight / 4);
            const x = xBase + ((nodeWidth - side) / 2);
            const y1 = y1Base + ((nodeHeight - side) / 2);
            const y2 = y2Base + ((nodeHeight - side) / 2);
            const inset = side / 4;
            ctx.beginPath();
            ctx.strokeStyle = 'green';
            ctx.moveTo(x + side - inset, y1 + side - inset);
            ctx.lineTo(x + side - inset, y2);
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = 'green';
            ctx.moveTo(x + inset, y2 + inset);
            ctx.lineTo(x + inset, y1 + side);
            ctx.stroke();
        }
        else {
            // TODO: draw a wrapping link.
        }
    };

    const drawNode = node => {
        const col = node.colIndex;
        const row = node.rowIndex;
        if (node) {
            ctx.strokeStyle = 'green';
            const xBase = nodeWidth * (col + 1);
            const yBase = nodeHeight * (row + 2);
            const side = Math.max(nodeWidth / 4, nodeHeight / 4);
            const x = xBase + ((nodeWidth - side) / 2);
            const y = yBase + ((nodeHeight - side) / 2);
            ctx.strokeRect(x, y, side, side);
            const inset = side / 4;
            drawDot(x + inset, y + inset);
            drawDot(x + side - inset, y + inset);
            drawDot(x + inset, y + side - inset);
            drawDot(x + side - inset, y + side - inset);
            drawRightLink(node);
            drawDownLink(node);
        }
    };

    drawBorders();
    drawRoot();

    for (let col = 0; col < numCols; col++) {
        drawColumnHeader(col);
    }

    nodes.forEach(drawNode);
};

let firstStep = true;
const onSearchStep = (xs, root) => {
    if (firstStep) {
        const { nodes, numCols, numRows } = rootToStructure(root);
        console.log(`numRows: ${numRows}; numCols: ${numCols}`);
        drawStructure(root, nodes, numCols, numRows);
        firstStep = false;
    }
};

const generator = solutionGenerator(matrix, onSearchStep);
generator.next();
