(function () {

  window.S = window.S || {};

  var Cell = S.Cell = function (id, board) {
    this.id = id;
    this.value = null;
    this.board = board;
    this.possibilities = [1,2,3,4,5,6,7,8,9];

    this.rowId = Math.floor(id / 9);
    this.colId = id % 9;
    this.boxId = Math.floor(id / 27) * 3 + Math.floor((id % 9) / 3);
  };

  var removeExcludedValue = Cell.prototype.removeExcludedValue = function (value) {
    var poss = this.possibilities;
    var valIndex = poss.indexOf(value);
    if (valIndex !== -1) {
      poss.splice(valIndex, 1);
      this.possibilities = poss;
      if (poss.length === 1) {
        solveCell(cell, poss[0]);
      }
    }
  };

  var solve = Cell.prototype.solve = function (value) {
    this.value = value;
    this.possibilities = [value];
    _.each(this.neighbors(), function (neighbor) {
      neighbor.removeExcludedValue (value);
    });
  };

  var neighbors = Cell.prototype.neighbors = function () {
    var allNeighbors = []
      .concat(this.board.boxes[this.boxId])
      .concat(this.board.rows[this.rowId])
      .concat(this.board.cols[this.colId]);

    var $uniqNeighbors = $(_.uniq(allNeighbors));
    var index = $uniqNeighbors.index(this);
    $uniqNeighbors.splice(index, 1);
    return $uniqNeighbors;
  };

  var isSolved = Cell.prototype.isSolved = function () {
    return !!this.value;
  };

})();
