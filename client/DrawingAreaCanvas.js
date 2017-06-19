// export class DrawingAreaCanvas {

//     constructor(id) {
//         this.canvas = document.getElementById(id);
//         this.width = this.canvas.scrollWidth;
//         this.height  = this.canvas.scrollHeight;
//         this.ctx = this.canvas.getContext('2d');
//     }

//     drawBorders() {
//         this.ctx.beginPath();
//         this.ctx.strokeStyle = 'green';
//         this.ctx.setLineDash([1, 4]);
//         this.ctx.moveTo(0, 0);
//         this.ctx.lineTo(this.width, 0);
//         this.ctx.lineTo(this.width, this.height);
//         this.ctx.lineTo(0, this.height);
//         this.ctx.closePath();
//         this.ctx.stroke();
//         this.ctx.setLineDash([]);
//     }

//     drawDot(x, y) {
//         this.ctx.beginPath();
//         this.ctx.arc(x, y, 1, 0, Math.PI * 2, false);
//         this.ctx.fillStyle = 'green';
//         this.ctx.fill;
//         this.ctx.stroke();
//     }

//     drawNodeRect(node) {
//         this.ctx.strokeStyle = 'green';
//         this.ctx.strokeRect(node.x, node.y, node.width, node.height);
//     }

//     drawHorizontalLinks(n1, n2) {
//         this.ctx.beginPath();
//         this.ctx.strokeStyle = 'green';
//         this.ctx.moveTo(n1.nex, n1.ney);
//         this.ctx.lineTo(n2.x, n1.ney);
//         this.ctx.moveTo(n2.swx, n2.swy);
//         this.ctx.lineTo(n1.x + n1.width, n2.swy);
//         this.ctx.stroke();
//     }

//     drawHorizontalLinksToRightEdge(n) {
//         this.ctx.beginPath();
//         this.ctx.strokeStyle = 'green';
//         this.ctx.moveTo(n.nex, n.ney);
//         this.ctx.lineTo(this.width, n.ney);
//         this.ctx.moveTo(this.width, n.swy);
//         this.ctx.lineTo(n.x + n.width, n.swy);
//         this.ctx.stroke();
//     }

//     drawHorizontalLinksFromLeftEdge(n) {
//         this.ctx.beginPath();
//         this.ctx.strokeStyle = 'green';
//         this.ctx.moveTo(0, n.nwy);
//         this.ctx.lineTo(n.x, n.nwy);
//         this.ctx.moveTo(n.swx, n.swy);
//         this.ctx.lineTo(0, n.swy);
//         this.ctx.stroke();
//     }

//     drawVerticalLinks(n1, n2) {
//         this.ctx.beginPath();
//         this.ctx.strokeStyle = 'green';
//         this.ctx.moveTo(n1.sex, n1.sey);
//         this.ctx.lineTo(n1.sex, n2.y);
//         this.ctx.moveTo(n2.nwx, n2.nwy);
//         this.ctx.lineTo(n2.nwx, n1.y + n1.height);
//         this.ctx.stroke();
//     }

//     drawVerticalLinksToBottomEdge(n) {
//         this.ctx.beginPath();
//         this.ctx.strokeStyle = 'green';
//         this.ctx.moveTo(n.sex, n.sey);
//         this.ctx.lineTo(n.sex, this.height);
//         this.ctx.moveTo(n.nwx, this.height);
//         this.ctx.lineTo(n.nwx, n.y + n.height);
//         this.ctx.stroke();
//     }

//     drawVerticalLinksFromTopEdge(n) {
//         this.ctx.beginPath();
//         this.ctx.strokeStyle = 'green';
//         this.ctx.moveTo(n.nex, 0);
//         this.ctx.lineTo(n.nex, n.y);
//         this.ctx.moveTo(n.nwx, n.nwy);
//         this.ctx.lineTo(n.nwx, 0);
//         this.ctx.stroke();
//     }
// }
