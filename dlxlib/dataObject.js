export class DataObject {

    constructor(listHeader, rowIndex, colIndex) {
        this.listHeader = listHeader;
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
        this.up = this;
        this.down = this;
        this.left = this;
        this.right = this;
        this.oldRights = [];
        this.oldDowns = [];
        if (listHeader) {
            listHeader.addDataObject(this);
        }
    }

    appendLeftRight(dataObject) {
        this.left.right = dataObject;
        dataObject.right = this;
        dataObject.left = this.left;
        this.left = dataObject;
    }

    appendUpDown(dataObject) {
        this.up.down = dataObject;
        dataObject.down = this;
        dataObject.up = this.up;
        this.up = dataObject;
    }

    unlinkFromColumn() {
        this.up.oldDowns.unshift(this);
        this.down.up = this.up;
        this.up.down = this.down;
    }

    relinkIntoColumn() {
        this.down.up = this;
        this.up.down = this;
        this.up.oldDowns.shift();
    }

    loopUp(fn) { this.loop(fn, 'up'); }
    loopDown(fn) { this.loop(fn, 'down'); }
    loopLeft(fn) { this.loop(fn, 'left'); }
    loopRight(fn) { this.loop(fn, 'right'); }
    
    loop(fn, propName) {
        for (let next = this[propName]; next !== this; next = next[propName]) {
            fn(next);
        }
    }
}
