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
        columnHeader.loopDown(node => nodes.push(node));
    });
    return nodes;
};

const findNode = (allNodes, colIndex, rowIndex) =>
    allNodes.find(n => n.colIndex === colIndex && n.rowIndex === rowIndex);

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
    
    const insetHorizontal = node.width / 4;
    const insetVertical = node.height / 4;

    node.nwx = node.x + insetHorizontal;
    node.nwy = node.y + insetVertical;

    node.nex = node.x + node.width - insetHorizontal;
    node.ney = node.y + insetVertical;

    node.swx = node.x + insetHorizontal;
    node.swy = node.y + node.height - insetVertical;
    
    node.sex = node.x + node.width - insetHorizontal;
    node.sey = node.y + node.height - insetVertical;
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
    };

    root.allNodes.forEach(bless(nodeWidth, nodeHeight));
    drawingArea.drawBorders();
    root.allNodes.forEach(drawNode);
};

const makeRange1 = (l, h) => {
    return Array.from(Array(h - l - 1).keys()).map(x => x + l + 1);
};

const makeRange2 = (l, h, numRowsOrCols, includeMinus1) => {
    const v1 = includeMinus1 ? [-1] : [];
    const v2 = v1.concat(Array.from(Array(numRowsOrCols).keys()));
    const v4 = v2.filter(x => x < l || x > h);
    return v4;
};

const findTweenersHorizontally = (root, n1, n2) => {

    const rowIndex = n1.rowIndex;

    const range = (n2.colIndex > n1.colIndex)
        ? makeRange1(n1.colIndex, n2.colIndex)
        : makeRange2(n2.colIndex, n1.colIndex, root.numCols, rowIndex === -1);

    return range.reduce((acc, colIndex) => {
        const tweener = findNode(root.allNodes, colIndex, rowIndex);
        if (tweener) acc.push(tweener);
        return acc;
    }, []);
};

const findTweenersVertically = (root, n1, n2) => {

    const colIndex = n1.colIndex;

    const range = (n2.rowIndex > n1.rowIndex)
        ? makeRange1(n1.rowIndex, n2.rowIndex)
        : makeRange2(n2.rowIndex, n1.rowIndex, root.numRows, true);

    return range.reduce((acc, rowIndex) => {
        const tweener = findNode(root.allNodes, colIndex, rowIndex);
        if (tweener) acc.push(tweener);
        return acc;
    }, []);
};

const drawLinks = (root, drawingArea) => {

    const drawHorizontalLinks = n => {

        const rightTweeners = findTweenersHorizontally(root, n, n.right);
        if (rightTweeners.length) {
            drawingArea.drawGoingAroundRightLink(n, n.right, rightTweeners);
        }
        else {
            drawingArea.drawNormalRightLink(n, n.right);
        }

        const leftTweeners = findTweenersHorizontally(root, n.left, n);
        if (leftTweeners.length) {
            drawingArea.drawGoingAroundLeftLink(n, n.left, leftTweeners);
        }
        else {
            drawingArea.drawNormalLeftLink(n, n.left);
        }
    };

    const drawVerticalLinks = n => {

        if (n.colIndex === -1 && n.rowIndex === -1) return;

        const downTweeners = findTweenersVertically(root, n, n.down);
        if (downTweeners.length) {
            drawingArea.drawGoingAroundDownLink(n, n.down, downTweeners);
        }
        else {
            drawingArea.drawNormalDownLink(n, n.down);
        }

        const upTweeners = findTweenersVertically(root, n.up, n);
        if (upTweeners.length) {
            drawingArea.drawGoingAroundUpLink(n, n.up, upTweeners);
        }
        else {
            drawingArea.drawNormalUpLink(n, n.up);
        }
    };

    root.allNodes.forEach(n => {
        drawHorizontalLinks(n);
        drawVerticalLinks(n);
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
        const { root, drawingArea, subMatrixText, partialSolutionText, linksMap } = searchSteps[currentSearchStepIndex];
        drawingArea.removeLinks();
        drawingArea.resetCoveredNodes();
        drawingArea.insertElementsIntoDOM();
        drawingArea.setCoveredNodes();
        preSubMatrix.innerHTML = subMatrixText;
        prePartialSolution.innerHTML = partialSolutionText;
        const onNodeClick = function(e) {
            const links = linksMap.get(e.target.node);
            console.log(`links: ${JSON.stringify(links)}`);
        };
        root.allNodes.forEach(n => drawingArea.removeClickHandler(n));
        root.allNodes.forEach(n => drawingArea.addClickHandler(n, onNodeClick));
    }
};

btnFirstStep.addEventListener('click', () => onStep(0));
btnStepBackwards.addEventListener('click', () => onStep(currentSearchStepIndex - 1));
btnStepForwards.addEventListener('click', () => onStep(currentSearchStepIndex + 1));
btnLastStep.addEventListener('click', () => onStep(searchSteps.length - 1));

const onSearchStep = (rowIndices, root) => {

    if (searchSteps.length === 0) {
        const allNodes = findAllNodes(root);
        const { numCols, numRows } = calcDimensions(allNodes);
        root.allNodes = allNodes;
        root.numCols = numCols;
        root.numRows = numRows;
        const drawingArea = new DrawingAreaSvg(svg);
        drawInitialStructure(root, drawingArea);
        drawingArea.insertElementsIntoDOM();
    }

    const drawingArea = new DrawingAreaSvg(svg);
    drawLinks(root, drawingArea);
    const subMatrixText = populateSubMatrix(root);
    const partialSolutionText = populatePartialSolution(rowIndices);
    const linksMap = createLinksMap(root);
    searchSteps.push({ root, drawingArea, subMatrixText, partialSolutionText, linksMap });
};

const displaySolutions = solutions =>
    solutions.forEach((solution, index) =>
        console.log(`solution[${index}]: ${JSON.stringify(solution)}`));

const solutions = solve(matrix, onSearchStep);
displaySolutions(solutions);
onStep(0);
