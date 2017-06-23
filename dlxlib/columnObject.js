import { DataObject } from './dataObject';

export class ColumnObject extends DataObject {

    constructor(colIndex) {
        super(null, -1, colIndex);
        this.numberOfRows = 0;
    }

    unlinkColumnHeader() {
        this.right.left = this.left;
        this.left.right = this.right;
    }

    relinkColumnHeader() {
        this.right.left = this;
        this.left.right = this;
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
