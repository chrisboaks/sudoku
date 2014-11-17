(function () {

  window.S = window.S || {};

  var Board = S.Board = function (cells) {

    this.inputs = $('input');
    this.cells = this.populateModelCells();
    this.rows = _.groupBy(this.cells, function (cell) { return cell.rowId; });
    this.cols = _.groupBy(this.cells, function (cell) { return cell.colId; });
    this.boxes = _.groupBy(this.cells, function (cell) { return cell.boxId; });
    this.groups = _.values(this.boxes).concat(_.values(this.cols)).concat(_.values(this.rows));
    //
    // _.each(this.cells, function (cell) {
    //   $(cell).data({ possibilities: [1,2,3,4,5,6,7,8,9] });
    // });

    _.each($(this.inputs), colorize);

  };

  //needs correction?
  var executeMainLogic = Board.prototype.executeMainLogic = function () {
    var i = 0;
    while (!this.isSolved() && i < 1000) {
      this.findSingles();
      this.propagateExclusiveSubgroups();
      this.findSingles();
      this.ariadne();
      i += 1;
    }
    if (this.isSolved() && isValid()) {
      alert("Solved!");
    } else {
      alert("This puzzle cannot be solved");
    }
  };

  var printSolution = Board.prototype.printSolution = function () {
    var board = this;
    var solved = solvedCells(this.cells);
    _.each(solved, function (cell) {
      board.inputOf(cell).val(cell.value);
    });
  };


  //needs correction
  var ariadne = Board.prototype.ariadne = function () {
    var board = this;
    var unsolved = unsolvedCells(this.cells);
    _.each(unsolved, function (cell) {
      var dup = new Board();
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
        var excludedValues = cellSet[0].possibilities;

        _.each(shared, function (neighbor) {
          _.each(excludedValues, function (val) {
            neighbor.removeExcludedValue(val);
          });
        });


      });
    });
  };

  var handleInput = Board.prototype.handleInput = function () {
    board = this;
    _.each(this.inputs, function (input) {
      var rawInput = $(input).val();
      var parsedInput = parseInt(rawInput);
      if (rawInput === "") {
        return;
      } else if (1 <= parsedInput && parsedInput <= 9) {
        board.cellOf(input).solve(parsedInput);
      } else {
        console.log('Invalid input :(');
      }
    });
  };

  var findSingles = Board.prototype.findSingles = function () {
    var board = this;
    _.each(this.groups, function (group) {
      var groupStats = {};
      var unsolved = unsolvedCells(group);
      _.each(unsolved, function (cell) {
        _.each(cell.possibilities, function (poss) {
          groupStats[poss] = groupStats[poss] || [];
          groupStats[poss].push(cell);
        });
      });
      _.each(_.keys(groupStats), function (digit) {
        if (groupStats[digit].length === 1) {
          var cell = groupStats[digit][0];
          cell.solve(parseInt(digit));
        }
      });
    });
  };


  //LOGIC UTILITIES

  //cell.removeExcludedValue(value) replaces removeExcludedValue(cell, value)

  //cell.solve() replaces solveCell(cell)

  var unsolvedCells = Board.prototype.unsolvedCells = function (cells) {
    return _.filter(cells, function (cell) {
      return !cell.isSolved();
    });
  };

  var solvedCells = Board.prototype.solvedCells = function (cells) {
    return _.filter(cells, function (cell) {
      return cell.isSolved();
    });
  };

  //cell.neighbors() replaces neighborsOf(cell)

  var getValues = Board.prototype.getValues = function (cells) {
    var rawVals =  _.map(cells, function (cell) {
      return cell.value;
    });

    return rawVals.filter(Number);
  };

  var sharedNeighbors = Board.prototype.sharedNeighbors = function (cells) {
    var neighborSets = [];
    _.each(cells, function (cell) {
      neighborSets.push(cell.neighbors());
    });
    var a = neighborSets[0];
    var b = neighborSets[1];
    var c = neighborSets[2] || window.board.cells;

    return _.intersection(a, b, c);
  };

  var findExclusiveSubgroups = Board.prototype.findExclusiveSubgroups = function (cells) {
    var subs = _.groupBy(cells, function (cell) {
      return cell.possibilities;
    }); // subs is an object mapping possibility sets to arrays of the cells with those sets
    var possibilitySets = _.keys(subs);
    var exclusiveCells = [];
    _.each(possibilitySets, function (set) {
      var parsedSet = set.split(',');
      if (1 < parsedSet.length && parsedSet.length <= 3 && parsedSet.length === subs[set].length) {
        exclusiveCells.push(subs[set]);
      }
    });
    return exclusiveCells;
  };


  //BASIC BOOLEAN STATUS FUNCTIONS

  //cell.isSolved() replaces isSolved(cell)

  var isSolved = Board.prototype.isSolved = function () {
    return unsolvedCells(this.cells).length === 0;
  };

  var isValid = Board.prototype.isValid = function () {
    return _.all(this.groups, function (group) {
      var vals = getValues(group);
      return vals.length === _.uniq(vals).length;
    });
  };


  //BASIC UTILITY FUNCTIONS
  var bindKeyHandlers = Board.prototype.bindKeyHandlers = function () {
    board = this;
    $("button").on('click', function (event) {
      board.handleInput();
    });
  };

  var populateModelCells = Board.prototype.populateModelCells = function () {
    var cells = [];
    var board = this;

    _.each(_.range(81), function (id) {
      cells.push(new S.Cell(id, board));
    });

    return cells;
  };

  var cellOf = Board.prototype.cellOf = function (input) {
    var id = $(input).data('cell-id');
    return this.cells[id];
  };

  var inputValueOf = Board.prototype.inputValueOf = function (cell) {
    return inputOf(cell).val();
  };

  var inputOf = Board.prototype.inputOf = function (cell) {
    return $(this.inputs[cell.id]);
  };

  var colorize = Board.prototype.colorize = function (input) {
    var id = $(input).data('cell-id');
    var boxId = Math.floor(id / 27) * 3 + Math.floor((id % 9) / 3);

    if (boxId % 2 === 0) {
      $(input).addClass('green');
    } else {
      $(input).addClass('blue');
    }
  };

})();
