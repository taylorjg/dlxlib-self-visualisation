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
    const dict = {};
    let maxRowIndex = 0;
    let colIndex = 0;
    root.loopNext(columnHeader => {
        columnHeader.loopDown(node => {
            const key = `${colIndex}-${node.rowIndex}`;
            dict[key] = node;
            if (node.rowIndex > maxRowIndex) maxRowIndex = node.rowIndex;
        });
        colIndex++;
    });

    return {
        dict,
        numCols: colIndex,
        numRows: maxRowIndex + 1
    };
};

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const drawStructure = (root, dict, numCols, numRows) => {

    const cw = canvas.scrollWidth;
    const ch = canvas.scrollHeight;
    const nodeWidth = cw / (numCols + 1);
    const nodeHeight = ch / (numRows + 2);

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
    };

    const drawNode = (col, row) => {
        const key = `${col}-${row}`;
        const node = dict[key];
        if (node) {
            ctx.strokeStyle = 'green';
            const xBase = nodeWidth * (col + 1);
            const yBase = nodeHeight * (row + 2);
            const side = Math.max(nodeWidth / 4, nodeHeight / 4);
            const x = xBase + ((nodeWidth - side) / 2);
            const y = yBase + ((nodeHeight - side) / 2);
            ctx.strokeRect(x, y, side, side);
        }
    };

    drawBorders();
    drawRoot();

    for (let col = 0; col < numCols; col++) {
        drawColumnHeader(col);
        for (let row = 0; row < numRows; row++) {
            drawNode(col, row);
        }
    }
};

let firstStep = true;
const onSearchStep = (xs, root) => {
    if (firstStep) {
        const { dict, numCols, numRows } = rootToStructure(root);
        console.log(`numRows: ${numRows}; numCols: ${numCols}`);
        drawStructure(root, dict, numCols, numRows);
        firstStep = false;
    }
};

const generator = solutionGenerator(matrix, onSearchStep);
generator.next();
