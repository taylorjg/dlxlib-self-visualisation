import { solutionGenerator } from '../dlxlib';
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

    bless(nodeWidth, nodeHeight)(root);
    root.loopRight(bless(nodeWidth, nodeHeight));
    nodes.forEach(bless(nodeWidth, nodeHeight));

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
    const xs = n.oldRights;
    const ys = xs.map(getHorizontalCoveredNodes);
    return xs.concat(...ys).sort((a, b) => a.colIndex - b.colIndex);
};

const getVerticalCoveredNodes = n => {
    const xs = n.oldDowns;
    const ys = xs.map(getVerticalCoveredNodes);
    return xs.concat(...ys).sort((a, b) => a.rowIndex - b.rowIndex);
};

const drawLinks = (nodeWidth, nodeHeight, root, drawingArea) => {

    const { nodes } = rootToStructure(root);

    const drawHorizontalLinks = n1 => {
        const coveredNodes = getHorizontalCoveredNodes(n1);
        const n2 = n1.right;
        if (n2.colIndex > n1.colIndex) {
            drawingArea.drawHorizontalLinks(n1, n2, coveredNodes);
        }
        else {
            drawingArea.drawHorizontalLinksToRightEdge(n1, coveredNodes);
            drawingArea.drawHorizontalLinksFromLeftEdge(n2);
        }
    };

    const drawVerticalLinks = n1 => {
        const coveredNodes = getVerticalCoveredNodes(n1);
        let n2 = n1.down;
        if (n2.rowIndex > n1.rowIndex) {
            drawingArea.drawVerticalLinks(n1, n2, coveredNodes);
        }
        else {
            drawingArea.drawVerticalLinksToBottomEdge(n1, coveredNodes);
            drawingArea.drawVerticalLinksFromTopEdge(n2);
        }
    };

    bless(nodeWidth, nodeHeight)(root);
    root.loopRight(bless(nodeWidth, nodeHeight));
    nodes.forEach(bless(nodeWidth, nodeHeight));

    const allCoveredNodes = [];

    const addCoveredNode = n => {
        allCoveredNodes.push(n);
        drawingArea.addCoveredNode(n);
    };

    const blessCoveredNodesOf = n => {
        const coveredNodes = getVerticalCoveredNodes(n);
        coveredNodes.forEach(n2 => {
            bless(nodeWidth, nodeHeight)(n2);
            addCoveredNode(n2);
        });
    };
    const blessUncoveredNodesOf = n => {
        n.loopDown(n2 => {
            bless(nodeWidth, nodeHeight)(n2);
            addCoveredNode(n2);
        });
    };
    const blessCoveredColumnHeadersOf = ch => {
        ch.loopDown(blessCoveredNodesOf);
        const coveredColumnHeaders = getHorizontalCoveredNodes(ch);
        coveredColumnHeaders.forEach(ch2 => {
            bless(nodeWidth, nodeHeight)(ch2);
            blessUncoveredNodesOf(ch2);
            blessCoveredNodesOf(ch2);
            ch2.loopDown(blessCoveredNodesOf);
            addCoveredNode(ch2);
        });
    };
    blessCoveredColumnHeadersOf(root);
    root.loopRight(blessCoveredColumnHeadersOf);
    root.loopRight(blessCoveredNodesOf);

    drawHorizontalLinks(root);
    root.loopRight(drawHorizontalLinks);
    root.loopRight(drawVerticalLinks);
    nodes.forEach(drawHorizontalLinks);
    nodes.forEach(drawVerticalLinks);

    allCoveredNodes.forEach(n => {
        if (n.rowIndex >= 0) {
            drawHorizontalLinks(n);
        }
        drawVerticalLinks(n);
    });
};

const searchSteps = [];
const svg = document.getElementById('svg');
const preSubMatrix = document.getElementById('preSubMatrix');
const prePartialSolution = document.getElementById('prePartialSolution');
const btnStep = document.getElementById('btnStep');

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
    return s;
};

const populatePartialSolution = rowIndices =>
    rowIndices
        .map(rowIndex => `${rowIndex}: ${matrix[rowIndex].join(' ')}`)
        .join(`\n`);

const onStep = () => {
    if (searchSteps.length) {
        const { drawingArea, subMatrixText, partialSolutionText } = searchSteps.shift();
        drawingArea.resetLinks();
        drawingArea.resetCoveredNodes();
        drawingArea.insertElementsIntoDOM();
        drawingArea.setCoveredNodes();
        preSubMatrix.innerHTML = subMatrixText;
        prePartialSolution.innerHTML = partialSolutionText;
    }
    else {
        btnStep.disabled = true;
    }
};

btnStep.addEventListener('click', onStep);

const onSearchStep = () => {

    let nodeWidth;
    let nodeHeight;

    return (rowIndices, root) => {

        if (searchSteps.length === 0) {
            const drawingArea = new DrawingAreaSvg(svg);
            const dimensions = drawInitialStructure(root, drawingArea);
            drawingArea.insertElementsIntoDOM();
            nodeWidth = dimensions.nodeWidth;
            nodeHeight = dimensions.nodeHeight;
        }

        const drawingArea = new DrawingAreaSvg(svg);
        drawLinks(nodeWidth, nodeHeight, root, drawingArea);
        const subMatrixText = populateSubMatrix(root);
        const partialSolutionText = populatePartialSolution(rowIndices);
        searchSteps.push({ drawingArea, subMatrixText, partialSolutionText });
    };
};

const generator = solutionGenerator(matrix, onSearchStep());
const iteratorObject = generator.next();
if (!iteratorObject.done) {
    const solution = iteratorObject.value;
    console.log(`solution: ${JSON.stringify(solution)}`);
}
onStep();
