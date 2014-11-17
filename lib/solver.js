(function () {

  window.S = window.S || {};

  var Board = S.Board = function () {

    this.cells = $('input');
    this.rows = _.groupBy(this.cells, function (cell) { return rowIdOf(cell); });
    this.cols = _.groupBy(this.cells, function (cell) { return colIdOf(cell); });
    this.boxes = _.groupBy(this.cells, function (cell) { return boxIdOf(cell); });
    this.groups = _.values(this.rows).concat(_.values(this.cols)).concat(_.values(this.boxes));

    _.each(this.cells, function (cell) {
      $(cell).data({ possibilities: [1,2,3,4,5,6,7,8,9] });
    });

    _.each($(this.cells), colorize);

  };

  var executeMainLogic = Board.prototype.executeMainLogic = function () {
    var i = 0;
    while (!isSolvedBoard() && i < 1000) {
      this.findSingles();
      this.propagateExclusiveSubgroups();
      this.findSingles();
      this.ariadne();
      i += 1;
    }
    if (isSolvedBoard() && isValid()) {
      alert("Solved!");
    } else {
      alert("This puzzle cannot be solved");
    }
  };

  var ariadne = Board.prototype.ariadne = function () {
    var board = this;
    var unsolved = unsolvedCells(this.cells);
    _.each(unsolved, function (cell) {
      var dup = new Board();
      _.extend(dup, board);
      var val = $(cell).data('possibilities')[0];
      dup.solveCell(cell, val);
      dup.executeMainLogic();
      if (!dup.isValid()) {
        board.removeExcludedValue(cell, val);
        return;
      }
    });
  };

  var propagateExclusiveSubgroups = Board.prototype.propagateExclusiveSubgroups = function () {
    _.each(this.groups, function (group) {
      _.each(findExclusiveSubgroups(group), function (cellSet) {
        var shared = sharedNeighbors(cellSet);
        var excludedValues = $(cellSet[0]).data('possibilities');

        _.each(shared, function (neighbor) {
          _.each(excludedValues, function (val) {
            removeExcludedValue(neighbor, val);
          });
        });


      });
    });
  };

  var handleInput = Board.prototype.handleInput = function () {
    _.each(this.cells, function (cell) {
      if (isSolved(cell)) {
        var value = $(cell).val();
        if (1 <= value && value <= 9) {
          solveCell(cell, value);
        } else {
          alert('Invalid input :(');
        }
      }
    });
    // window.board.propagate();
    // window.board.findSingles();
  };

  var findSingles = Board.prototype.findSingles = function () {
    var board = this;
    _.each(this.groups, function (group) {
      var groupStats = {};
      var unsolved = unsolvedCells(group);
      _.each(unsolved, function (cell) {
        var id = $(cell).data('cell-id');
        _.each($(cell).data('possibilities'), function (poss) {
          groupStats[poss] = groupStats[poss] || [];
          groupStats[poss].push(id);
        });
      });
      _.each(_.keys(groupStats), function (digit) {
        if (groupStats[digit].length === 1) {
          var cellIndex = groupStats[digit][0];
          board.solveCell(board.cells[cellIndex], digit);
        }
      });
    });
  };


  //LOGIC UTILITIES
  var removeExcludedValue = Board.prototype.removeExcludedValue = function (cell, value) {
    if (!isSolved(cell)) {
      var $cell = $(cell);
      var poss = $cell.data('possibilities');
      var valIndex = poss.indexOf(value);
      if (valIndex !== -1) {
        poss.splice(valIndex, 1);
        $cell.data({ possibilities: poss });
        if (poss.length === 1) {
          solveCell(cell, poss[0]);
        }
      }
    }
  };

  var solveCell = Board.prototype.solveCell = function (cell, value) {
    var parsedVal = parseInt(value);
    $(cell).val(parsedVal);
    $(cell).data({ possibilities: [parsedVal] });
    _.each(neighborsOf(cell), function (neighbor) {
      removeExcludedValue(neighbor, parsedVal);
    });
  };

  var unsolvedCells = Board.prototype.unsolvedCells = function (cells) {
    return _.filter(cells, function (cell) {
      return !isSolved(cell);
    });
  };

  var solvedCells = Board.prototype.solvedCells = function (cells) {
    return _.filter(cells, function (cell) {
      return isSolved(cell);
    });
  };

  var neighborsOf = Board.prototype.neighborsOf = function (cell) {
    var board = window.board;
    var rowId = rowIdOf(cell);
    var colId = colIdOf(cell);
    var boxId = boxIdOf(cell);
    var allNeighbors = board.boxes[boxId].concat(board.rows[rowId]).concat(board.cols[colId]);
    var $uniqNeighbors = $(_.uniq(allNeighbors));
    var index = $uniqNeighbors.index($(cell));
    $uniqNeighbors.splice(index, 1);
    return $uniqNeighbors;
  };

  var getValues = Board.prototype.getValues = function (cells) {
    var rawVals =  _.map(cells, function (cell) {
      return parseInt($(cell).val());
    });
    return rawVals.filter(Number);
  };

  var sharedNeighbors = Board.prototype.sharedNeighbors = function (cells) {
    var neighborSets = [];
    _.each(cells, function (cell) {
      neighborSets.push(neighborsOf(cell));
    });
    var a = neighborSets[0];
    var b = neighborSets[1];
    var c = neighborSets[2] || window.board.cells;


    return _.intersection(a, b, c);
  };

  var findExclusiveSubgroups = Board.prototype.findExclusiveSubgroups = function (cells) {
    var subs = _.groupBy(cells, function (cell) {
      return $(cell).data('possibilities');
    }); // subs is an object mapping possibility sets to arrays of the cells with those sets
    var possibilitySets = _.keys(subs);
    var exclusiveCells = [];
    _.each(possibilitySets, function (set) {
      var parsedSet = set.split(',');
      if (parsedSet.length === subs[set].length && parsedSet.length <= 3) {
        exclusiveCells.push(subs[set]);
      }
    });
    return exclusiveCells;
  };


  //BASIC BOOLEAN STATUS FUNCTIONS
  var isSolved = Board.prototype.isSolved = function (cell) {
    return !!$(cell).val();
  };

  var isSolvedBoard = Board.prototype.isSolvedBoard = function () {
    return unsolvedCells(window.board.cells).length === 0;
  };

  var isValid = Board.prototype.isValid = function () {
    return _.all(this.groups, function (group) {
      var vals = getValues(group);
      return vals.length === _.uniq(vals).length;
    });
  };


  //BASIC UTILITY FUNCTIONS
  var bindKeyHandlers = Board.prototype.bindKeyHandlers = function () {
    $("button").on('click', function (event) {
      window.board.handleInput();
    });
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

})();
