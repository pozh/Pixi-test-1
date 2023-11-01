const PIXI = require("pixi.js");
const Graphics = PIXI.Graphics;
import Brick from './Brick';

export default class Game extends PIXI.Container {

  constructor(left, top, columns, rows) {
    super();
    this.x = left;
    this.y = top;
    this.cells = [];
    this.isDeleting = false;
    this.isAdding = false;
    this.columns = columns;
    this.rows = rows;
    this.margin = 1;
    this.cellSize = 50;
    this.variants = 4;
    this.newLineDelay = 1; // initial delay in new line appearance
    const width = this.columns * (this.cellSize + this.margin);
    const height = this.rows * (this.cellSize + this.margin);
    this.bg = new Graphics()
      .beginFill(0x000000, 0.41)
      .drawRoundedRect(-5, -5, width + 10, height + 10, 10)
      .endFill();
    this.addChild(this.bg);
  }

  setup() {
    for (let row = this.rows-5; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        if (!this.cells[row]) this.cells[row] = [];
        const color = Math.floor(Math.random() * this.variants);
        var sprite = new Brick.from(`./assets/images/c${color}.png`);
        this.addChild(sprite);
        sprite.color = color;
        sprite.interactive = true;
        sprite.buttonMode = true;
        sprite.on('pointerdown', this.onClick);
        sprite.x = col * (this.cellSize + this.margin);
        sprite.y = row * (this.cellSize + this.margin);
        sprite.width = this.cellSize;
        sprite.height = this.cellSize;
        this.cells[row][col] = sprite;
      }
    }
  }

  start() {
    setTimeout(this.addRowIteration(), this.newLineDelay * 1000);
  }

  isFull() {
    for (let col = 0; col < this.columns; col++) {
      if (this.cells[0] && this.cells[0][col]) {
        return true;
      }
    }
    return false;
  }

  isBusy() {
    return this.isDeleting === true || this.isAdding === true;
  }

  moveUp() {
    for (let row = 1; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        if (this.cells[row] && this.cells[row][col]) {
          if (!this.cells[row-1]) this.cells[row-1] = [];
          this.cells[row-1][col] = this.cells[row][col];
          if (this.cells[row-1][col]) this.cells[row-1][col].y -= (this.cellSize + this.margin);
          this.cells[row][col] = null;
        }
      }
    }
  }

  addRow() {
    const row = this.rows - 1;
    for (let col = 0; col < this.columns; col++) {
      if (!this.cells[row]) this.cells[row] = [];
      const color = Math.floor(Math.random() * this.variants);
      var sprite = new Brick.from(`./assets/images/c${color}.png`);
      this.addChild(sprite);
      sprite.color = color;
      sprite.x = col * (this.cellSize + this.margin);
      sprite.y = row * (this.cellSize + this.margin);
      sprite.width = this.cellSize;
      sprite.height = this.cellSize;
      sprite.interactive = true;
      sprite.buttonMode = true;
      sprite.on('pointerdown', this.onClick);
      this.cells[row][col] = sprite;
    }
  }

  addRowIteration() {
    const _this = this;
    setTimeout(function () {
      if (!_this.isFull() && !_this.isBusy()) {
        _this.isAdding = true;
        _this.moveUp();
        _this.addRow();
        _this.isAdding = false;
      }
      _this.addRowIteration();
    }, this.newLineDelay * 1000);
  }

  onClick(e) {
    const game = e.target.parent;
    if (game.isBusy === true) return;
    const col = Math.floor(e.target.x / (game.cellSize + game.margin));
    const row = Math.floor(e.target.y / (game.cellSize + game.margin));
    console.log(col, row, e.target.x, e.target.y);
    game.resetActiveStates();
    const linkedCount = game.findLinked(col, row, e.target.color);
    if (linkedCount > 1) {
      game.deleteBlocks();
    }
  }

  resetActiveStates() {
    for (let col = 0; col < this.columns; col++) {
      for (let row = 0; row < this.rows; row++) {
        if (this.cells[row] && this.cells[row][col])
          this.cells[row][col].isActive = false;
      }
    }
  }

  findLinked(col, row, color) {
    if (!this.cells[row] || !this.cells[row][col]) return 0;
    const c = this.cells[row][col].color;
    let count = 0;
    if (c === color && !this.cells[row][col].isActive) {
      count = 1;
      this.cells[row][col].isActive = true;
      if (col > 0) count += this.findLinked(col - 1, row, color);
      if (col < this.columns - 1) count += this.findLinked(col + 1, row, color);
      if (row > 0) count += this.findLinked(col, row - 1, color);
      if (row < this.rows - 1) count += this.findLinked(col, row + 1 , color);
    }
    return count;
  }

  columnIsEmpty(col) {
    for (let row = 0; row < this.rows; row++) {
      if (this.cells[row] && this.cells[row][col]) return false;
    }
    return true;
  }

  moveColumn(col) {
    for (let row = 0; row < this.rows; row++)  {
      this.cells[row][col+1] = this.cells[row][col];
      if (this.cells[row][col+1]) {
        this.cells[row][col+1].x += (this.cellSize + this.margin);
        this.cells[row][col+1].color = this.cells[row][col].color;
      }
      this.cells[row][col] = null;
    }
  }

  moveEmptyColumns() {
    for (let k = 0; k < this.columns - 1; k++)
      for (let col = 0; col < this.columns-1-k; col++)
        if (this.columnIsEmpty(col+1)) this.moveColumn(col);
  }


  deleteBlocks() {
    this.isDeleting = true;
    for (let col = 0; col < this.columns; col++) {
      for (let row = 0; row < this.rows; row++) {
        if (this.cells[row] && this.cells[row][col] && this.cells[row][col].isActive) {
          this.removeChild(this.cells[row][col]);
          this.cells[row][col] = null;
        }
      }
    }

    // move down cells in column
    for (let col = 0; col < this.columns; col++) {
      for (let k = 0; k < this.rows-1; k++) {
        for (let row = 0; row < this.rows-1-k; row++) {
          if (!this.cells[row + 1]) this.cells[row + 1] = [];
          if (!this.cells[row + 1][col]) {
            this.cells[row + 1][col] = this.cells[row] && this.cells[row][col] ? this.cells[row][col] : null;
            if (this.cells[row] && this.cells[row][col]) this.cells[row][col] = null;
            if (this.cells[row + 1] && this.cells[row + 1][col]) {
              this.cells[row + 1][col].x = col * (this.cellSize + this.margin);
              this.cells[row + 1][col].y = (row + 1) * (this.cellSize + this.margin);
            }
          }
        }
      }
    }

    this.moveEmptyColumns();
    this.isDeleting = false;
  }

}
