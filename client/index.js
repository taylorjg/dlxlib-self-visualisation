import { solve } from '../dlxlib';
import { DrawingAreaSvg } from './DrawingAreaSvg';
import 'hammerjs';

const MATRIX1 = [
    [0, 0, 1, 0, 1, 1, 0],
    [1, 0, 0, 1, 0, 0, 1],
    [0, 1, 1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 1],
    [0, 0, 0, 1, 1, 0, 1]
];

const MATRIX2 = [
    [1, 0, 0, 0],
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 0, 1, 1],
    [0, 1, 0, 0],
    [0, 0, 1, 0]
];

const MATRIX3 = [
    [1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1],
    [0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1]
];

const MATRICES = [MATRIX1, MATRIX2, MATRIX3];

const CODE_POINT_A = 'A'.codePointAt(0);
const COLUMN_NAMES = Array.from(Array(26).keys()).map((_, index) => String.fromCodePoint(CODE_POINT_A + index));

const findAllNodes = root => {
    const nodes = [];
    nodes.push(root);
    root.loopRight(columnHeader => {
        nodes.push(columnHeader);
        columnHeader.loopDown(node => nodes.push(node));
    });
    return nodes;
};

const findNode = (root, colIndex, rowIndex) =>
    root.allNodes.find(n => n.colIndex === colIndex && n.rowIndex === rowIndex);

const calcDimensions = allNodes => {
    const maxColIndex = allNodes.reduce((acc, n) => Math.max(acc, n.colIndex), 0);
    const maxRowIndex = allNodes.reduce((acc, n) => Math.max(acc, n.rowIndex), 0);
    return {
        numCols: maxColIndex + 1,
        numRows: maxRowIndex + 1
    };
};

const blessRoot = (nodeWidth, nodeHeight) => root => {
    const node = root;
    node.width = nodeWidth;
    node.height = nodeHeight * 2;
    node.x = nodeWidth;
    node.y = nodeHeight;
};

const blessColumnHeader = (nodeWidth, nodeHeight) => columnHeader => {
    const node = columnHeader;
    node.width = nodeWidth;
    node.height = nodeHeight * 2;
    node.x = nodeWidth * (2 * node.colIndex + 3);
    node.y = nodeHeight;
};

const blessNode = (nodeWidth, nodeHeight) => node => {
    node.width = nodeWidth;
    node.height = nodeHeight;
    node.x = nodeWidth * (2 * node.colIndex + 3);
    node.y = nodeHeight * (2 * node.rowIndex + 4);
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
    node.swy = node.y + node.height - inset;
    node.sex = node.x + node.width - inset;
    node.sey = node.y + node.height - inset;
};

// Return the array of indices between l and h (excluding l and h).
// e.g. l = 2 and h = 5 => [3, 4]
const makeNormalRange = (l, h) =>
    Array.from(Array(h - l - 1).keys())
        .map(x => x + l + 1);

// Return the array of indices before l and after h (excluding l and h).
// Note that the indices are returned in ascending order.
// e.g. l = 2, h = 5, numRowsOrCols = 7 and includeMinus1 = true => [-1, 0, 1, 6]
const makeWrapAroundRange = (l, h, numRowsOrCols, includeMinus1) =>
    (includeMinus1 ? [-1] : [])
        .concat(Array.from(Array(numRowsOrCols).keys()))
        .filter(x => x < l || x > h);

const findTweenersHorizontally = (root, n1, n2) => {

    const rowIndex = n1.rowIndex;

    const range = (n2.colIndex > n1.colIndex)
        ? makeNormalRange(n1.colIndex, n2.colIndex)
        : makeWrapAroundRange(n2.colIndex, n1.colIndex, root.numCols, rowIndex === -1);

    return range.reduce((acc, colIndex) => {
        const tweener = findNode(root, colIndex, rowIndex);
        if (tweener) acc.push(tweener);
        return acc;
    }, []);
};

const findTweenersVertically = (root, n1, n2) => {

    const colIndex = n1.colIndex;

    const range = (n2.rowIndex > n1.rowIndex)
        ? makeNormalRange(n1.rowIndex, n2.rowIndex)
        : makeWrapAroundRange(n2.rowIndex, n1.rowIndex, root.numRows, true);

    return range.reduce((acc, rowIndex) => {
        const tweener = findNode(root, colIndex, rowIndex);
        if (tweener) acc.push(tweener);
        return acc;
    }, []);
};

const findSearchDepthOfGoingAroundLink = (n1, n2, direction, defaultSearchDepth) => {
    if (searchSteps.length === 0) return defaultSearchDepth;
    const lastSearchStep = searchSteps[searchSteps.length - 1];
    const lastDrawingArea = lastSearchStep.drawingArea;
    const key = `(${n1.colIndex},${n1.rowIndex})-(${n2.colIndex},${n2.rowIndex})-${direction}`;
    const value = lastDrawingArea.goingAroundLinksMap.get(key);
    return (Number.isInteger(value)) ? value : defaultSearchDepth;
};

const drawInitialStructure = (root, drawingArea) => {

    const nodeWidth = drawingArea.width / (2 * (root.numCols + 1) + 1);
    const nodeHeight = drawingArea.height / (2 * (root.numRows + 2));

    const drawNode = node => {
        drawingArea.drawNodeRect(node);
        drawingArea.drawDot(node.nwx, node.nwy);
        drawingArea.drawDot(node.nex, node.ney);
        drawingArea.drawDot(node.swx, node.swy);
        drawingArea.drawDot(node.sex, node.sey);
        if (node.rowIndex === -1 && node.colIndex >= 0) {
            drawingArea.drawColumnHeaderName(node, COLUMN_NAMES[node.colIndex]);
        }
    };

    root.allNodes.forEach(bless(nodeWidth, nodeHeight));
    drawingArea.drawBorders();
    root.allNodes.forEach(drawNode);
};

const drawLinks = (root, drawingArea, k) => {

    const drawHorizontalLinks = n => {

        const rightTweeners = findTweenersHorizontally(root, n, n.right);
        if (rightTweeners.length) {
            const searchDepth = findSearchDepthOfGoingAroundLink(n, n.right, 'R', k);
            drawingArea.drawRightGoingAroundLink(n, n.right, rightTweeners, searchDepth);
        }
        else {
            drawingArea.drawRightNormalLink(n, n.right);
        }

        const leftTweeners = findTweenersHorizontally(root, n.left, n);
        if (leftTweeners.length) {
            const searchDepth = findSearchDepthOfGoingAroundLink(n, n.left, 'L', k);
            drawingArea.drawLeftGoingAroundLink(n, n.left, leftTweeners, searchDepth);
        }
        else {
            drawingArea.drawLeftNormalLink(n, n.left);
        }
    };

    const drawVerticalLinks = n => {

        if (n.colIndex === -1 && n.rowIndex === -1) return;

        const downTweeners = findTweenersVertically(root, n, n.down);
        if (downTweeners.length) {
            const searchDepth = findSearchDepthOfGoingAroundLink(n, n.down, 'D', k);
            drawingArea.drawDownGoingAroundLink(n, n.down, downTweeners, searchDepth);
        }
        else {
            drawingArea.drawDownNormalLink(n, n.down);
        }

        const upTweeners = findTweenersVertically(root, n.up, n);
        if (upTweeners.length) {
            const searchDepth = findSearchDepthOfGoingAroundLink(n, n.up, 'U', k);
            drawingArea.drawUpGoingAroundLink(n, n.up, upTweeners, searchDepth);
        }
        else {
            drawingArea.drawUpNormalLink(n, n.up);
        }
    };

    root.allNodes.forEach(n => {
        drawHorizontalLinks(n);
        drawVerticalLinks(n);
        if (n.rowIndex === -1 && n.colIndex >= 0) {
            drawingArea.drawColumnHeaderRowCount(n);
        }
    });

    const allCurrentlyReachableNodes = findAllNodes(root);
    const isCovered = n => !allCurrentlyReachableNodes.find(rn => rn.colIndex === n.colIndex && rn.rowIndex === n.rowIndex);
    const allCoveredNodes = root.allNodes.filter(isCovered);
    allCoveredNodes.forEach(drawingArea.addCoveredNode.bind(drawingArea));
};

const searchSteps = [];
let currentSearchStepIndex;
const svg = document.getElementById('svg');
const preSubMatrix = document.getElementById('preSubMatrix');
const prePartialSolution = document.getElementById('prePartialSolution');
const preSelectedNodeDetails = document.getElementById('preSelectedNodeDetails');
const selMatrix = document.getElementById('selMatrix');
const selColumnChooser = document.getElementById('selColumnChooser');
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
    const rowIndices = Array.from(Array(root.matrix.length).keys());
    rowIndices.forEach(rowIndex => {
        const colIndicesOfOnes = nodes.filter(n => n.rowIndex === rowIndex).map(n => n.colIndex);
        if (colIndicesOfOnes.length) {
            const values = Array(root.matrix[0].length).fill(0);
            colIndicesOfOnes.forEach(colIndex => values[colIndex] = 1);
            const valuesPresent = values.filter((_, index) => columnsPresent.includes(index));
            const s = valuesPresent.join(' ');
            lines.push(s);
        }
    });
    return lines.join('\n');
};

const populatePartialSolution = (root, rowIndices) =>
    rowIndices
        .map(formatSolutionRow(root.matrix))
        .join(`\n`);

const populateSelectedNodeDetails = (node, links) => {
    if (node) {
        const formatCoords = coords => `(${COLUMN_NAMES[coords.colIndex] || '-1'}, ${coords.rowIndex})`;
        const formatCoordsArray = coordsArray => coordsArray.length ? `[${coordsArray.map(formatCoords).join(', ')}]` : '';
        const lines = [];
        const appendLine = (label, text) => {
            const padding = ' '.repeat(16 - label.length);
            lines.push(`${label}:${padding} ${text}`);
        };
        appendLine('node', formatCoords(node));
        appendLine('right', formatCoords(links.right));
        appendLine('left', formatCoords(links.left));
        appendLine('down', formatCoords(links.down));
        appendLine('up', formatCoords(links.up));
        appendLine('right tweeners', formatCoordsArray(links.rightTweeners));
        appendLine('left tweeners', formatCoordsArray(links.leftTweeners));
        appendLine('down tweeners', formatCoordsArray(links.downTweeners));
        appendLine('up tweeners', formatCoordsArray(links.upTweeners));
        preSelectedNodeDetails.innerHTML = lines.join('\n');
        preSelectedNodeDetails.style.display = 'block';
        preSelectedNodeDetails.previousElementSibling.style.display = 'block';
    }
    else {
        preSelectedNodeDetails.style.display = 'none';
        preSelectedNodeDetails.previousElementSibling.style.display = 'none';
    }
};        

const createLinksMap = root => {
    const makeCoords = n => ({
        colIndex: n.colIndex,
        rowIndex: n.rowIndex
    });
    const makeLinks = n => ({
        right: makeCoords(n.right),
        left: makeCoords(n.left),
        down: makeCoords(n.down),
        up: makeCoords(n.up),
        rightTweeners: findTweenersHorizontally(root, n, n.right).map(makeCoords),
        leftTweeners: findTweenersHorizontally(root, n.left, n).map(makeCoords),
        downTweeners: findTweenersVertically(root, n, n.down).map(makeCoords),
        upTweeners: findTweenersVertically(root, n.up, n).map(makeCoords)
    });
    const pairs = root.allNodes.map(n => [n, makeLinks(n)]);
    return new Map(pairs);
};

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
        if (index > searchSteps.length - 1) index = searchSteps.length - 1;
        currentSearchStepIndex = index;
        const { k } = searchSteps[currentSearchStepIndex];
        lblSearchStep.style.display = 'inline';
        lblSearchStep.innerText = `search step ${currentSearchStepIndex + 1} of ${searchSteps.length}, search depth (k) = ${k}`;
    }
    else {
        currentSearchStepIndex = -1;
        lblSearchStep.style.display = 'none';
    }

    updateButtonState();

    if (searchSteps.length) {
        const { root, drawingArea, subMatrixText, partialSolutionText, linksMap } = searchSteps[currentSearchStepIndex];
        drawingArea.removeLinks();
        drawingArea.removeColumnHeaderRowCounts();
        drawingArea.resetCoveredNodes();
        drawingArea.insertElementsIntoDOM();
        drawingArea.setCoveredNodes();
        preSubMatrix.innerHTML = subMatrixText;
        prePartialSolution.innerHTML = partialSolutionText;
        populateSelectedNodeDetails();
        const onNodeClick = function (e) {
            const colIndex = Number(e.target.getAttribute('data-col-index'));
            const rowIndex = Number(e.target.getAttribute('data-row-index'));
            const node = findNode(root, colIndex, rowIndex);
            const links = linksMap.get(node);
            populateSelectedNodeDetails(node, links);
        };
        root.allNodes.forEach(n => drawingArea.removeClickHandler(n));
        root.allNodes.forEach(n => drawingArea.addClickHandler(n, onNodeClick));
    }
};

const navigateToFirstStep = () => onStep(0);
const navigateToPreviousStep = () => onStep(currentSearchStepIndex - 1);
const navigateToNextStep = () => onStep(currentSearchStepIndex + 1);
const navigateToLastStep = () => onStep(searchSteps.length - 1);

btnFirstStep.addEventListener('click', navigateToFirstStep);
btnStepBackwards.addEventListener('click', navigateToPreviousStep);
btnStepForwards.addEventListener('click', navigateToNextStep);
btnLastStep.addEventListener('click', navigateToLastStep);

document.addEventListener('keydown', e => {
    switch (e.keyCode) {
        case 37: return e.shiftKey ? navigateToFirstStep() : navigateToPreviousStep();
        case 39: return e.shiftKey ? navigateToLastStep() : navigateToNextStep();
    }
});

const mc = new window.Hammer(svg);
mc.on('swipeleft', navigateToNextStep);
mc.on('swiperight', navigateToPreviousStep);

const onSearchStep = matrix => (k, rowIndices, root) => {

    if (searchSteps.length === 0) {
        const allNodes = findAllNodes(root);
        const { numCols, numRows } = calcDimensions(allNodes);
        root.matrix = matrix;
        root.allNodes = allNodes;
        root.numCols = numCols;
        root.numRows = numRows;
        const drawingArea = new DrawingAreaSvg(svg);
        drawInitialStructure(root, drawingArea);
        drawingArea.insertElementsIntoDOM();
    }

    const drawingArea = new DrawingAreaSvg(svg);
    drawLinks(root, drawingArea, k);
    const subMatrixText = populateSubMatrix(root);
    const partialSolutionText = populatePartialSolution(root, rowIndices);
    const linksMap = createLinksMap(root);
    searchSteps.push({ root, drawingArea, subMatrixText, partialSolutionText, linksMap, k });
};

const rowIndexPadding = (matrix, rowIndex) => {
    const cchRowIndex = rowIndex.toString().length;
    const cchTotal = matrix.length.toString().length;
    return ' '.repeat(cchTotal - cchRowIndex);
};

const formatSolutionRow = matrix => rowIndex => {
    const padding = rowIndexPadding(matrix, rowIndex);
    return `${rowIndex}:${padding} ${matrix[rowIndex].join(' ')}`;
};

const dumpSolution = matrix => (rowIndices, index) => {
    console.log(`solution ${index}:`);
    rowIndices
        .map(formatSolutionRow(matrix))
        .forEach(line => console.log(line));
};

const solveMatrix = () => {

    const matrixIndex = Number(selMatrix.value);
    const columnChooser = Number(selColumnChooser.value);

    const matrix = MATRICES[matrixIndex];

    searchSteps.splice(0);
    Array.from(svg.children).forEach(element => element.remove());

    const options = {
        onSearchStep: onSearchStep(matrix),
        columnChooser
    };

    const solutions = solve(matrix, options);
    solutions.forEach(dumpSolution(matrix));

    onStep(0);
};

selMatrix.addEventListener('change', solveMatrix);
selColumnChooser.addEventListener('change', solveMatrix);

solveMatrix();
