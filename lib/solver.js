(function () {

  window.S = window.S || {};

  var Board = S.Board = function () {

    this.cells = $('input')
    this.rows = _.groupBy(this.cells, function (cell) { return rowIdOf(cell) })
    this.cols = _.groupBy(this.cells, function (cell) { return colIdOf(cell) })
    this.boxes = _.groupBy(this.cells, function (cell) { return boxIdOf(cell) })
    this.groups = _.values(this.rows).concat(_.values(this.cols)).concat(_.values(this.boxes));
    this.solvedToPropagate = [];
    this.groupsToPropagate = [];

    $(this.cells).data({ possibilities: [1,2,3,4,5,6,7,8,9] });

    _.each($(this.cells), colorize);

  };


  var propagate = Board.prototype.propagate = function () {
    while (this.solvedToPropagate.length > 0) {
      $solvedCell = $(this.solvedToPropagate.pop());
      solvedVal = parseInt($solvedCell.val());
      _.each(this.neighborsOf($solvedCell), function (cell) {
        this.removeExcludedValue(cell, solvedVal);
      }.bind(this))
    }
  };

  var removeExcludedValue = Board.prototype.removeExcludedValue = function (cell, value) {
    if (!isSolved(cell)) {
      var $cell = $(cell);
      var poss = $cell.data('possibilities');
      var valIndex = poss.indexOf(value);
      if (valIndex !== -1) {
        poss.splice(valIndex, 1);
        $cell.data({ possibilities: poss });

        if (poss.length === 1) {
          this.solve(cell, poss[0]);
        }

      }
    }
  };

  var solveCell = Board.prototype.solveCell = function (cell, value) {
    $(cell).val(value);
    $(cell).data({ possibilities: [value] });
    this.solvedToPropagate.push($(cell));
  };

  var isSolved = Board.prototype.isSolved = function (cell) {
    return !!$(cell).val();
  };

  var colorize = Board.prototype.colorize = function (cell) {
    if (boxIdOf(cell) % 2 === 0) {
      $(cell).addClass('green');
    } else {
      $(cell).addClass('blue');
    }
  };

  var rowIdOf = Board.prototype.rowIdOf = function (cell) {
    return Math.floor($(cell).data('cell-id') / 9);
  };

  var colIdOf = Board.prototype.colIdOf = function (cell) {
    return $(cell).data('cell-id') % 9;
  };

  var boxIdOf = Board.prototype.boxIdOf = function (cell) {
    var id = $(cell).data('cell-id');
    return Math.floor(id / 27) * 3 + Math.floor((id % 9) / 3);
  };

  var cellIdsOf = Board.prototype.cellIdsOf = function (cells) {      // TRASH?
    return _.uniq(_.map(cells, function(cell) {
      return $(cell).data('cell-id')
    }));
  };

  var neighborsOf = Board.prototype.neighborsOf = function (cell) {
    var rowId = rowIdOf(cell);
    var colId = colIdOf(cell);
    var boxId = boxIdOf(cell);
    var allNeighbors = this.boxes[boxId].concat(this.rows[rowId]).concat(this.cols[colId]);
    var $uniqNeighbors = $(_.uniq(allNeighbors));
    var index = $uniqNeighbors.index($(cell));
    $uniqNeighbors.splice(index, 1);
    return $uniqNeighbors;
  };

})();
