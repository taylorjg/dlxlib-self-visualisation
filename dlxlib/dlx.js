import { DataObject } from './dataObject';
import { ColumnObject } from './columnObject';

/**
 * @typedef {number[]} PartialSolution The indices of the matrix rows that comprise a partial solution.
 */

/**
 * @typedef {number[]} Solution The indices of the matrix rows that comprise a complete solution.
 */

/**
 * This callback is invoked for each step of the algorithm.
 * @callback searchStepCallback
 * @param {PartialSolution} partialSolution The partial solution that represents this step of the algorithm.
 */

/**
 * This callback is invoked for each solution found.
 * @callback solutionFoundCallback
 * @param {Solution} solution A complete solution to the matrix being solved.
 */

/**
 * @typedef {*} MatrixValue Matrix values can be of any time. Anything truthy is treated as a 1. Anything falsy is treated as a 0.
 */

/**
 * @typedef {MatrixValue[]} MatrixRow A matrix row is an array of {MatrixValue}.
 */

/**
 * @typedef {MatrixRow[]} Matrix A matrix is an array of {MatrixRow}.
 */

/**
 * Solves the matrix and returns an array of solutions.
 * @param {Matrix} matrix The matrix to be solved.
 * @param {Object} [options] An options object.
 * @param {searchStepCallback} options.onSearchStep A callback invoked for each step of the algorithm.
 * @param {solutionFoundCallback} options.onSolutionFound A callback invoked for each solution found.
 * @param {Number} options.numSolutions The number of solutions to return.
 * @param {Object} options.columnChooser How to choose column 'c'.
 * @returns {Solution[]} The solutions that were found.
 */
export const solve = (matrix, options) => {
    const generator = solutionGenerator(matrix, options);
    const max = options.n || Number.MAX_VALUE;
    const solutions = [];
    for (let i = 0; i < max; i++) {
        const iteratorResult = generator.next();
        if (iteratorResult.done) break;
        solutions.push(iteratorResult.value);
    }
    return solutions;
};

/**
 * Creates an ES2015 Generator object that can be used to iterate over the solutions to the matrix.
 * @param {Matrix} matrix The matrix to be solved.
 * @param {Object} [options] An options object.
 * @param {searchStepCallback} options.onSearchStep A callback invoked for each step of the algorithm.
 * @param {solutionFoundCallback} options.onSolutionFound A callback invoked for each solution found.
 * @param {Number} options.numSolutions The number of solutions to return.
 * @param {Object} options.columnChooser How to choose column 'c'.
 * @returns {IterableIterator.<number>} An ES2015 Generator object that can be used to iterate over the solutions.
 */
export const solutionGenerator = function* (matrix, options) {
    const root = buildInternalStructure(matrix);
    const searchState = new SearchState(root, options || {});
    yield* search(searchState);
};

const buildInternalStructure = matrix => {

    const root = new ColumnObject(-1);
    const colIndexToListHeader = new Map();

    matrix.forEach((row, rowIndex) => {
        let firstDataObjectInThisRow = null;
        row.forEach((col, colIndex) => {
            if (rowIndex === 0) {
                const listHeader = new ColumnObject(colIndex);
                root.appendLeftRight(listHeader);
                colIndexToListHeader.set(colIndex, listHeader);
            }
            if (col) {
                const listHeader = colIndexToListHeader.get(colIndex);
                const dataObject = new DataObject(listHeader, rowIndex, colIndex);
                if (firstDataObjectInThisRow)
                    firstDataObjectInThisRow.appendLeftRight(dataObject);
                else
                    firstDataObjectInThisRow = dataObject;
            }
        });
    });

    return root;
};

function* search(searchState) {

    searchState.searchStep();

    if (searchState.isEmpty()) {
        if (searchState.currentSolution.length) {
            searchState.solutionFound();
            yield searchState.currentSolution.slice().sort((a, b) => a - b);
        }
        return;
    }

    const c = chooseColumn(searchState);
    coverColumn(c);
    for (let r = c.down; r !== c; r = r.down) {
        searchState.pushRowIndex(r.rowIndex);
        r.loopRight(j => coverColumn(j.listHeader));
        yield* search(searchState);
        r.loopLeft(j => uncoverColumn(j.listHeader));
        searchState.popRowIndex();
    }
    uncoverColumn(c);
}

const chooseColumn = searchState => {
    switch (searchState.columnChooser) {
        case 1: return searchState.root.right;
        case 2: return searchState.root.left;
        default: return chooseColumnWithFewestRows(searchState);
    }
};

const chooseColumnWithFewestRows = searchState => {
    let chosenColumn = null;
    searchState.root.loopRight(column => {
        if (!chosenColumn || column.numberOfRows < chosenColumn.numberOfRows) {
            chosenColumn = column;
        }
    });
    return chosenColumn;
};

const coverColumn = c => {
    c.unlinkColumnHeader();
    c.loopDown(i => i.loopRight(j => j.listHeader.unlinkDataObject(j)));
};

const uncoverColumn = c => {
    c.loopUp(i => i.loopLeft(j => j.listHeader.relinkDataObject(j)));
    c.relinkColumnHeader();
};

class SearchState {

    constructor(root, options) {
        this.root = root;
        this.onSearchStep = options.onSearchStep;
        this.onSolutionFound = options.onSolutionFound;
        this.columnChooser = options.columnChooser || 0;
        this.currentSolution = [];
    }

    isEmpty() {
        return this.root.right === this.root;
    }

    pushRowIndex(rowIndex) {
        this.currentSolution.push(rowIndex);
    }

    popRowIndex() {
        this.currentSolution.pop();
    }

    searchStep() {
        if (this.onSearchStep) {
            this.onSearchStep(this.currentSolution, this.root);
        }
    }

    solutionFound() {
        if (this.onSolutionFound) {
            this.onSolutionFound(this.currentSolution, this.root);
        }
    }
}
