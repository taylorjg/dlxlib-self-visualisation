import { solutionGenerator } from '../dlxlib';
import { DrawingAreaSvg } from './DrawingAreaSvg';

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
    const nodes = [];
    let maxRowIndex = 0;
    let colIndex = 0;
    root.loopRight(columnHeader => {
        columnHeader.loopDown(node => {
            nodes.push(node);
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

const blessRoot = (nodeWidth, nodeHeight) => root => {
    if (root.colIndex !== -1 || root.rowIndex !== -1) {
        console.warn(`[blessRoot] root.colIndex: ${root.colIndex}; root.rowIndex: ${root.rowIndex}`);
        console.trace();
    }
    const node = root;
    node.width = nodeWidth / 2;
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

const blessColumnHeader = (nodeWidth, nodeHeight) => columnHeader => {
    if (columnHeader.colIndex < 0 || columnHeader.rowIndex !== -1) {
        console.warn(`[blessColumnHeader] columnHeader.colIndex: ${columnHeader.colIndex}; columnHeader.rowIndex: ${columnHeader.rowIndex}`);
        console.trace();
    }
    const node = columnHeader;
    const xBase = nodeWidth * (node.colIndex + 1);
    node.width = nodeWidth / 2;
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

const blessNode = (nodeWidth, nodeHeight) => node => {
    if (node.colIndex < 0 || node.rowIndex < 0) {
        console.warn(`[blessNode] node.colIndex: ${node.colIndex}; node.rowIndex: ${node.rowIndex}`);
        console.trace();
    }
    const xBase = nodeWidth * (node.colIndex + 1);
    const yBase = nodeHeight * (node.rowIndex + 2);
    const side = Math.max(nodeWidth / 2, nodeHeight / 2);
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

const drawInitialStructure = (root, drawingArea) => {

    const { nodes, numCols, numRows } = rootToStructure(root);
    const nodeWidth = drawingArea.width / (numCols + 1);
    const nodeHeight = drawingArea.height / (numRows + 2);

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

    const drawNode = node => {
        drawingArea.drawNodeRect(node);
        drawDots(node);
    };

    blessRoot(nodeWidth, nodeHeight)(root);
    root.loopRight(blessColumnHeader(nodeWidth, nodeHeight));
    nodes.forEach(blessNode(nodeWidth, nodeHeight));

    drawingArea.drawBorders();

    drawRoot();
    root.loopRight(drawColumnHeader);
    nodes.forEach(drawNode);

    return {
        nodeWidth,
        nodeHeight
    };
};

const getHorizontalCoveredNodes = n => {
    const xs = n.oldRights.slice().reverse();
    return xs.length ? xs.concat(getHorizontalCoveredNodes(xs[xs.length - 1])) : xs;
};

const getVerticalCoveredNodes = n => {
    const xs = n.oldDowns.slice().reverse();
    return xs.length ? xs.concat(getVerticalCoveredNodes(xs[xs.length - 1])) : xs;
};

const drawLinks = (nodeWidth, nodeHeight, root, drawingArea) => {

    drawingArea.removeAllLinks();

    const { nodes } = rootToStructure(root);

    const drawHorizontalLinks = n1 => {
        const n2 = n1.right;
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

    blessRoot(nodeWidth, nodeHeight)(root);
    root.loopRight(blessColumnHeader(nodeWidth, nodeHeight));
    nodes.forEach(blessNode(nodeWidth, nodeHeight));

    const blessCoveredNodesOf = n => {
        const coveredNodes = getVerticalCoveredNodes(n);
        coveredNodes.forEach(n2 => {
            console.log(`[blessCoveredNodesOf] n2.colIndex: ${n2.colIndex}; n2.rowIndex: ${n2.rowIndex}`);
            blessNode(nodeWidth, nodeHeight)(n2);
        });
    };
    const blessCoveredColumnHeadersOf = ch => {
        blessCoveredNodesOf(ch);
        ch.loopDown(blessCoveredNodesOf);
        const coveredNodes = getHorizontalCoveredNodes(ch);
        coveredNodes.forEach(ch2 => {
            console.log(`[blessCoveredColumnHeadersOf] ch2.colIndex: ${ch2.colIndex}; ch2.rowIndex: ${ch2.rowIndex}`);
            blessColumnHeader(nodeWidth, nodeHeight)(ch2);
            blessCoveredNodesOf(ch2);
            ch2.loopDown(blessCoveredNodesOf);
        });
    };
    blessCoveredColumnHeadersOf(root);
    root.loopRight(blessCoveredColumnHeadersOf);

    drawHorizontalLinks(root);
    root.loopRight(drawHorizontalLinks);
    root.loopRight(drawVerticalLinks);
    nodes.forEach(drawHorizontalLinks);
    nodes.forEach(drawVerticalLinks);

    // const drawLinksForCoveredNodesOf = n => {
    //     const coveredNodes = getVerticalCoveredNodes(n);
    //     coveredNodes.forEach(drawHorizontalLinks);
    //     coveredNodes.forEach(drawVerticalLinks);
    // };
    // const drawLinksForCoveredColumnHeadersOf = ch => {
    //     const coveredNodes = getHorizontalCoveredNodes(ch);
    //     coveredNodes.forEach(ch2 => {
    //         drawLinksForCoveredNodesOf(ch2);
    //         ch2.loopDown(drawLinksForCoveredNodesOf);
    //     });
    // };
    // drawLinksForCoveredColumnHeadersOf(root);
    // root.loopRight(drawLinksForCoveredColumnHeadersOf);
};

const queue = [];
const drawingArea = new DrawingAreaSvg('svg');
const preSubMatrix = document.getElementById('preSubMatrix');
const prePartialSolution = document.getElementById('prePartialSolution');
const btnStep = document.getElementById('btnStep');
let nodeWidth = undefined;
let nodeHeight = undefined;

const A = 'A'.codePointAt(0);
const COLUMN_NAMES = matrix[0].map((_, index) => String.fromCodePoint(A + index));

const populateSubMatrix = root => {
    const ss = [];
    const columnsPresent = [];
    root.loopRight(ch => ch.colIndex >= 0 && columnsPresent.push(ch.colIndex));
    ss.push(columnsPresent.map(colIndex => COLUMN_NAMES[colIndex]).join(' '));
    const nodes = [];
    root.loopRight(ch => ch.loopDown(n => nodes.push({ colIndex: n.colIndex, rowIndex: n.rowIndex })));
    const rowIndices = Array.from(Array(matrix.length).keys());
    rowIndices.forEach(rowIndex => {
        const colIndicesOfOnes = nodes.filter(n => n.rowIndex === rowIndex).map(n => n.colIndex);
        if (colIndicesOfOnes.length) {
            const values = Array(matrix[0].length).fill(0);
            colIndicesOfOnes.forEach(colIndex => values[colIndex] = 1);
            const valuesPresent = values.filter((_, index) => columnsPresent.includes(index));
            const s = valuesPresent.join(' ');
            ss.push(s);
        }
    });
    const s = ss.join('\n');
    preSubMatrix.innerHTML = s;
};

const populatePartialSolution = rowIndices => {
    const ss = [];
    rowIndices.forEach(rowIndex => {
        ss.push(`${rowIndex}: ${matrix[rowIndex].join(' ')}`);
    });
    const s = ss.join('\n');
    prePartialSolution.innerHTML = s;
};

const onStep = () => {
    if (queue.length) {
        const { index } = queue.shift();

        // Ugly hack. Ideally, 'root' would be a persistent data structure.
        // But it isn't. It is mutated as the algorithm progresses.
        // Also, it is very difficult to clone 'root'. Therefore, we use a
        // separate dlxlib instance to replay the algorithm up to the
        // step that we are interested in. Yuck! We can get away with this
        // for a small matrix. But it is still horrid! And fortunately, the
        // algorithm is deterministic - otherwise we wouldn't be able to
        // do it this way.
        let secondInstanceStepCount = 0;
        const onSecondInstanceSearchStep = (rowIndices, root) => {
            if (secondInstanceStepCount === index) {
                populateSubMatrix(root);
                populatePartialSolution(rowIndices);
                drawLinks(nodeWidth, nodeHeight, root, drawingArea);
            }
            secondInstanceStepCount++;
        };
        const secondInstance = solutionGenerator(matrix, onSecondInstanceSearchStep);
        secondInstance.next();
    }
    else {
        btnStep.disabled = true;
    }
};

btnStep.addEventListener('click', onStep);

const onSearchStep = (_, root) => {
    const index = queue.length;
    console.log(`[onSearchStep] index: ${index}`);
    if (index === 0) {
        const dimensions = drawInitialStructure(root, drawingArea);
        nodeWidth = dimensions.nodeWidth;
        nodeHeight = dimensions.nodeHeight;
    }
    queue.push({ index });
};

const generator = solutionGenerator(matrix, onSearchStep);
const iteratorObject = generator.next();
if (!iteratorObject.done) {
    const solution = iteratorObject.value;
    console.log(`solution: ${JSON.stringify(solution)}`);
}
onStep();
