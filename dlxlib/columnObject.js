import { DataObject } from './dataObject';

export class ColumnObject extends DataObject {

    constructor(colIndex) {
        super(null, -1, colIndex);
        this.numberOfRows = 0;
    }

    unlinkColumnHeader() {
        // console.log(`[unlinkColumnHeader before] colIndex: ${this.colIndex}; rowIndex: ${this.rowIndex}; left.oldRights: ${this.left.oldRights.map(x => x.colIndex)}`);
        this.left.oldRights.unshift(this);
        this.right.left = this.left;
        this.left.right = this.right;
        // console.log(`[unlinkColumnHeader after] colIndex: ${this.colIndex}; rowIndex: ${this.rowIndex}; left.oldRights: ${this.left.oldRights.map(x => x.colIndex)}`);
    }

    relinkColumnHeader() {
        // console.log(`[relinkColumnHeader before] colIndex: ${this.colIndex}; rowIndex: ${this.rowIndex}; left.oldRights: ${this.left.oldRights.map(x => x.colIndex)}`);
        this.right.left = this;
        this.left.right = this;
        this.left.oldRights.shift();
        // console.log(`[relinkColumnHeader after] colIndex: ${this.colIndex}; rowIndex: ${this.rowIndex}; left.oldRights: ${this.left.oldRights.map(x => x.colIndex)}`);
    }

    addDataObject(dataObject) {
        this.appendUpDown(dataObject);
        this.numberOfRows++;
    }

    unlinkDataObject(dataObject) {
        dataObject.unlinkFromColumn();
        this.numberOfRows--;
    }

    relinkDataObject(dataObject) {
        dataObject.relinkIntoColumn();
        this.numberOfRows++;
    }
}
