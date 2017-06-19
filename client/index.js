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

    const blessRoot = node => {
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

    const blessColumnHeader = node => {
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
        ctx.strokeRect(root.x, root.y, root.width, root.height);
        drawDot(root.nwx, root.nwy);
        drawDot(root.nex, root.ney);
        drawDot(root.swx, root.swy);
        drawDot(root.sex, root.sey);
    };

    const drawColumnHeader = colummHeader => {
        ctx.strokeStyle = 'green';
        ctx.strokeRect(colummHeader.x, colummHeader.y, colummHeader.width, colummHeader.height);
        drawDot(colummHeader.nwx, colummHeader.nwy);
        drawDot(colummHeader.nex, colummHeader.ney);
        drawDot(colummHeader.swx, colummHeader.swy);
        drawDot(colummHeader.sex, colummHeader.sey);
    };

    const drawRightLink = (node, linkPropertyName) => {
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
            ctx.lineTo(cw, node.ney);
            ctx.moveTo(cw, node.swy);
            ctx.lineTo(node.x + node.width, node.swy);

            ctx.moveTo(0, toNode.nwy);
            ctx.lineTo(toNode.x, toNode.nwy);
            ctx.moveTo(toNode.swx, toNode.swy);
            ctx.lineTo(0, node.swy);
            ctx.stroke();
        }
    };

    const drawDownLink = node => {
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
            ctx.lineTo(node.sex, ch);
            ctx.moveTo(toNode.nwx, ch);
            ctx.lineTo(toNode.nwx, node.y + node.height);

            ctx.moveTo(toNode.nex, 0);
            ctx.lineTo(toNode.nex, toNode.y);
            ctx.moveTo(toNode.nwx, toNode.nwy);
            ctx.lineTo(toNode.nwx, 0);

            ctx.stroke();
        }
    };

    const drawNode = node => {
        ctx.strokeStyle = 'green';
        ctx.strokeRect(node.x, node.y, node.width, node.height);
        drawDot(node.nwx, node.nwy);
        drawDot(node.nex, node.ney);
        drawDot(node.swx, node.swy);
        drawDot(node.sex, node.sey);
        drawRightLink(node, 'right');
        drawDownLink(node);
    };

    drawBorders();

    blessRoot(root);
    nodes.forEach(blessNode);
    root.loopNext(blessColumnHeader);

    drawRoot();

    root.loopNext(drawColumnHeader);
    root.loopNext(columnHeader => drawRightLink(columnHeader, 'nextColumnObject'));
    root.loopNext(drawDownLink);
    drawRightLink(root, 'nextColumnObject');

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
