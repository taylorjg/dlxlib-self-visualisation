import { solve } from '../dlxlib';
import { DrawingAreaSvg } from './DrawingAreaSvg';

const matrix = [
    [0, 0, 1, 0, 1, 1, 0],
    [1, 0, 0, 1, 0, 0, 1],
    [0, 1, 1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 1],
    [0, 0, 0, 1, 1, 0, 1]
];

const CODE_POINT_A = 'A'.codePointAt(0);
const COLUMN_NAMES = matrix[0].map((_, index) => String.fromCodePoint(CODE_POINT_A + index));

const findAllNodes = root => {
    const nodes = [];
    nodes.push(root);
    root.loopRight(columnHeader => {
        nodes.push(columnHeader);
        columnHeader.loopDown(node => {
            nodes.push(node);
        });
    });

    return nodes;
};

const findNode = (allNodes, colIndex, rowIndex) =>
    allNodes.find(n => n.colIndex === colIndex && n.rowIndex === rowIndex);

const calcNumColsAndRows = allNodes => {
    const maxColIndex = allNodes.reduce((acc, n) => Math.max(acc, n.colIndex), 0);
    const maxRowIndex = allNodes.reduce((acc, n) => Math.max(acc, n.rowIndex), 0);
    return {
        numCols: maxColIndex + 1,
        numRows: maxRowIndex + 1
    };
};

const blessRoot = (nodeWidth, nodeHeight) => root => {
    const node = root;
    node.width = nodeWidth / 2;
    node.height = node.width * 2;
    node.x = (nodeWidth - node.width) / 2;
    node.y = ((2 * nodeHeight) - node.height) / 2;
};

const blessColumnHeader = (nodeWidth, nodeHeight) => columnHeader => {
    const node = columnHeader;
    const xBase = nodeWidth * (node.colIndex + 1);
    node.width = nodeWidth / 2;
    node.height = node.width * 2;
    node.x = xBase + ((nodeWidth - node.width) / 2);
    node.y = ((2 * nodeHeight) - node.height) / 2;
};

const blessNode = (nodeWidth, nodeHeight) => node => {
    const xBase = nodeWidth * (node.colIndex + 1);
    const yBase = nodeHeight * (node.rowIndex + 2);
    const side = Math.max(nodeWidth / 2, nodeHeight / 2);
    node.x = xBase + ((nodeWidth - side) / 2);
    node.y = yBase + ((nodeHeight - side) / 2);
    node.width = side;
    node.height = side;
};

const bless = (nodeWidth, nodeHeight) => node => {
    if (node.colIndex === -1 && node.rowIndex === -1) {
        blessRoot(nodeWidth, nodeHeight)(node);
    }
    else {
        if (node.colIndex >= 0 && node.rowIndex === -1) {
            blessColumnHeader(nodeWidth, nodeHeight)(node);
        }
        else {
            blessNode(nodeWidth, nodeHeight)(node);
        }
    }
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

const drawInitialStructure = (allNodes, drawingArea) => {

    const nodeWidth = drawingArea.width / (allNodes.numCols + 1);
    const nodeHeight = drawingArea.height / (allNodes.numRows + 2);

    const drawNode = node => {
        drawingArea.drawNodeRect(node);
        drawingArea.drawDot(node.nwx, node.nwy);
        drawingArea.drawDot(node.nex, node.ney);
        drawingArea.drawDot(node.swx, node.swy);
        drawingArea.drawDot(node.sex, node.sey);
    };

    allNodes.forEach(bless(nodeWidth, nodeHeight));
    drawingArea.drawBorders();
    allNodes.forEach(drawNode);
};

const getHorizontalCoveredNodes = n => {
    const xs = n.oldRights;
    const ys = xs.map(getHorizontalCoveredNodes);
    return xs.concat(...ys).sort((a, b) => a.colIndex - b.colIndex);
};

const getVerticalCoveredNodes = n => {
    const xs = n.oldDowns;
    const ys = xs.map(getVerticalCoveredNodes);
    return xs.concat(...ys).sort((a, b) => a.rowIndex - b.rowIndex);
};

// const findCoveredNodes = root => {

//     const allCoveredNodes = [];

//     const findCoveredNodesOf = n => {
//         const coveredNodes = getVerticalCoveredNodes(n);
//         coveredNodes.forEach(n2 => {
//             allCoveredNodes.push(n2);
//         });
//     };

//     const findUncoveredNodesOf = n => {
//         n.loopDown(n2 => {
//             allCoveredNodes.push(n2);
//         });
//     };

//     const findCoveredColumnHeadersOf = ch => {
//         ch.loopDown(findCoveredNodesOf);
//         const coveredColumnHeaders = getHorizontalCoveredNodes(ch);
//         coveredColumnHeaders.forEach(ch2 => {
//             findUncoveredNodesOf(ch2);
//             findCoveredNodesOf(ch2);
//             ch2.loopDown(findCoveredNodesOf);
//             allCoveredNodes.push(ch2);
//         });
//     };

//     findCoveredColumnHeadersOf(root);
//     root.loopRight(findCoveredColumnHeadersOf);
//     root.loopRight(findCoveredNodesOf);

//     return allCoveredNodes;
// };

const makeRange1 = (l, h) => {
    return Array.from(Array(h - l - 1).keys()).map(x => x + l + 1);
};

const makeRange2 = (l, h, numRowsOrCols, includeMinus1) => {
    const v1 = includeMinus1 ? [-1] : [];
    const v2 = v1.concat(Array.from(Array(numRowsOrCols).keys()));
    const v4 = v2.filter(x => x < l || x > h);
    return v4;
};

const isRightAdjacent = (allNodes,  n1, n2) => {

    if ((Math.abs(n1.colIndex - n2.colIndex)) % allNodes.numCols === 1) return true;

    const rowIndex = n1.rowIndex;

    const range = (n2.colIndex > n1.colIndex)
        ? makeRange1(n1.colIndex, n2.colIndex)
        : makeRange2(n2.colIndex, n1.colIndex, allNodes.numCols, rowIndex === -1);

    return !range.some(colIndex => !!findNode(allNodes, colIndex, rowIndex));
};

const isLeftAdjacent = (allNodes, n1, n2) => {

    if ((Math.abs(n1.colIndex - n2.colIndex)) % allNodes.numCols === 1) return true;

    const rowIndex = n1.rowIndex;

    const range = (n1.colIndex > n2.colIndex)
        ? makeRange1(n2.colIndex, n1.colIndex)
        : makeRange2(n1.colIndex, n2.colIndex, allNodes.numCols, rowIndex === -1);

    return !range.some(colIndex => !!findNode(allNodes, colIndex, rowIndex));
};

const isDownAdjacent = (allNodes, n1, n2) => {

    if ((Math.abs(n1.rowIndex - n2.rowIndex)) % allNodes.numRows === 1) return true;

    const colIndex = n1.colIndex;

    const range = (n2.rowIndex > n1.rowIndex)
        ? makeRange1(n1.rowIndex, n2.rowIndex)
        : makeRange2(n2.rowIndex, n1.rowIndex, allNodes.numRows, true);

    return !range.some(rowIndex => !!findNode(allNodes, colIndex, rowIndex));
};

const isUpAdjacent = (allNodes, n1, n2) => {

    if ((Math.abs(n1.rowIndex - n2.rowIndex)) % allNodes.numRows === 1) return true;

    const colIndex = n1.colIndex;

    const range = (n1.rowIndex > n2.rowIndex)
        ? makeRange1(n2.rowIndex, n1.rowIndex)
        : makeRange2(n1.rowIndex, n2.rowIndex, allNodes.numRows, true);

    return !range.some(rowIndex => !!findNode(allNodes, colIndex, rowIndex));
};

const n2s = n => `(${n.colIndex}, ${n.rowIndex})`;

const drawLinks = (allNodes, drawingArea) => {

    const drawHorizontalLinks = n => {

        const right = n.right;
        if (isRightAdjacent(allNodes, n, right)) {
            drawingArea.drawNormalRightLink(n, right);
        }
        else {
            const coveredNodes = getHorizontalCoveredNodes(n);
            console.log(`[right going around] n: ${n2s(n)}; right: ${n2s(right)}; coveredNodes: ${coveredNodes.map(n2s).join(', ')}`);
            drawingArea.drawGoingAroundRightLink(n, right, coveredNodes);
        }

        const left = n.left;
        if (isLeftAdjacent(allNodes, n, left)) {
            drawingArea.drawNormalLeftLink(n, left);
        }
        else {
            const coveredNodes = getHorizontalCoveredNodes(left).filter(cn => cn.colIndex !== n.colIndex);
            console.log(`[left going around] n: ${n2s(n)}; left: ${n2s(left)}; coveredNodes: ${coveredNodes.map(n2s).join(', ')}`);
            drawingArea.drawGoingAroundLeftLink(n, left, coveredNodes);
        }
    };

    const drawVerticalLinks = n => {

        if (n.colIndex === -1 && n.rowIndex === -1) return;

        const down = n.down;
        if (isDownAdjacent(allNodes, n, down)) {
            drawingArea.drawNormalDownLink(n, down);
        }
        else {
            const coveredNodes = getVerticalCoveredNodes(n);
            console.log(`[down going around] n: ${n2s(n)}; down: ${n2s(down)}; coveredNodes: ${coveredNodes.map(n2s).join(', ')}`);
            drawingArea.drawGoingAroundDownLink(n, down, coveredNodes);
        }

        const up = n.up;
        if (isUpAdjacent(allNodes, n, up)) {
            drawingArea.drawNormalUpLink(n, up);
        }
        else {
            const coveredNodes = getVerticalCoveredNodes(up).filter(cn => cn.rowIndex !== n.rowIndex);
            console.log(`[up going around] n: ${n2s(n)}; up: ${n2s(up)}; coveredNodes: ${coveredNodes.map(n2s).join(', ')}`);
            drawingArea.drawGoingAroundUpLink(n, up, coveredNodes);
        }
    };

    allNodes.forEach(n => {
        drawHorizontalLinks(n);
        drawVerticalLinks(n);
    });
};

const searchSteps = [];
let currentSearchStepIndex;
const svg = document.getElementById('svg');
const preSubMatrix = document.getElementById('preSubMatrix');
const prePartialSolution = document.getElementById('prePartialSolution');
const btnFirstStep = document.getElementById('btnFirstStep');
const btnStepBackwards = document.getElementById('btnStepBackwards');
const btnStepForwards = document.getElementById('btnStepForwards');
const btnLastStep = document.getElementById('btnLastStep');
const lblSearchStep = document.getElementById('lblSearchStep');

const populateSubMatrix = root => {
    const lines = [];
    const columnsPresent = [];
    root.loopRight(ch => ch.colIndex >= 0 && columnsPresent.push(ch.colIndex));
    lines.push(columnsPresent.map(colIndex => COLUMN_NAMES[colIndex]).join(' '));
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
            lines.push(s);
        }
    });
    return lines.join('\n');
};

const populatePartialSolution = rowIndices =>
    rowIndices
        .map(rowIndex => `${rowIndex}: ${matrix[rowIndex].join(' ')}`)
        .join(`\n`);

const updateButtonState = () => {
    if (searchSteps.length === 0) {
        btnFirstStep.disabled = true;
        btnStepBackwards.disabled = true;
        btnStepForwards.disabled = true;
        btnLastStep.disabled = true;
    }
    else {
        btnFirstStep.disabled = currentSearchStepIndex <= 0;
        btnStepBackwards.disabled = currentSearchStepIndex <= 0;
        btnStepForwards.disabled = currentSearchStepIndex >= searchSteps.length - 1;
        btnLastStep.disabled = currentSearchStepIndex >= searchSteps.length - 1;
    }
};

const onStep = index => {
    if (searchSteps.length) {
        if (index < 0) index = 0;
        if (index > index.length - 1) index = index.length - 1;
        currentSearchStepIndex = index;
        lblSearchStep.style.display = 'inline';
        lblSearchStep.innerText = `(search step ${currentSearchStepIndex + 1} of ${searchSteps.length})`;
    }
    else {
        currentSearchStepIndex = -1;
        lblSearchStep.style.display = 'none';
    }

    updateButtonState();

    if (searchSteps.length) {
        const { drawingArea, subMatrixText, partialSolutionText } = searchSteps[currentSearchStepIndex];
        drawingArea.removeLinks();
        drawingArea.resetCoveredNodes();
        drawingArea.insertElementsIntoDOM();
        drawingArea.setCoveredNodes();
        preSubMatrix.innerHTML = subMatrixText;
        prePartialSolution.innerHTML = partialSolutionText;
    }
};

btnFirstStep.addEventListener('click', () => onStep(0));
btnStepBackwards.addEventListener('click', () => onStep(currentSearchStepIndex - 1));
btnStepForwards.addEventListener('click', () => onStep(currentSearchStepIndex + 1));
btnLastStep.addEventListener('click', () => onStep(searchSteps.length - 1));

const onSearchStep = () => {

    let allNodes;

    return (rowIndices, root) => {

        if (searchSteps.length === 0) {
            allNodes = findAllNodes(root);
            const { numCols, numRows } = calcNumColsAndRows(allNodes);
            allNodes.root = root;
            allNodes.numCols = numCols;
            allNodes.numRows = numRows;
            const drawingArea = new DrawingAreaSvg(svg);
            drawInitialStructure(allNodes, drawingArea);
            drawingArea.insertElementsIntoDOM();
        }

        const drawingArea = new DrawingAreaSvg(svg);
        console.log(`[onSearchStep]`);
        drawLinks(allNodes, drawingArea);
        const subMatrixText = populateSubMatrix(root);
        const partialSolutionText = populatePartialSolution(rowIndices);
        searchSteps.push({ drawingArea, subMatrixText, partialSolutionText });
    };
};

const solutions = solve(matrix, onSearchStep());
solutions.forEach((solution, index) =>
    console.log(`solution[${index}]: ${JSON.stringify(solution)}`));
onStep(0);
