(function () {

  window.S = window.S || {};

  var Board = S.Board = function (cells) {

    this.inputs = $('input');
    this.cells = cells || this.populateModelCells();

    _.each($(this.inputs), colorize);
  };


  var executeMainLogic = Board.prototype.executeMainLogic = function () {
    if (!window.board.isSolved()) {
      this.findSingles();
      this.propagateExclusiveSubgroups();
      this.findSingles();
      this.ariadne();

      if (this.isSolved() && this.isValid()) {
        window.board = this;
      }
    }
  };

  var printSolution = Board.prototype.printSolution = function () {
    var board = window.board;
    var solved = solvedCells(this.cells);
    _.each(solved, function (cell) {
      board.inputOf(cell).val(cell.value);
    });
  };

  var ariadne = Board.prototype.ariadne = function () {
    var board = this;
    var unsolved = _.sortBy(board.unsolvedCells(this.cells), function(cell) {
      return cell.possibilities.length;
    });
    var j = 0;
    var unchanged = true;

    while (unchanged && j < unsolved.length) {
      var cellId = unsolved[j].id;
      var val = board.cells[cellId].possibilities[0];

      var dup = new Board();
      var dupedCells = board.dupCells(dup);
      dup.cells = dupedCells;

      dup.cells[cellId].solve(val);
      dup.executeMainLogic();
      if (!dup.isValid()) {
        board.cells[cellId].removeExcludedValue(val);
        unchanged = false;
        board.executeMainLogic();
      } else if (dup.isValid() && dup.isSolved()){
        window.board = dup;
        unchanged = false;
      } else {

      }
      j += 1;
    }
  };

  var propagateExclusiveSubgroups = Board.prototype.propagateExclusiveSubgroups = function () {
    _.each(this.groups(), function (group) {
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
    var board = this;
    this.inputs.each(function (index, input) {
      var rawInput = $(this).val();
      var parsedInput = parseInt(rawInput);
      if (rawInput === "") {
        return;
      } else if (1 <= parsedInput && parsedInput <= 9) {
        board.cellOf(this).solve(parsedInput);
      } else {
        console.log('Invalid input :(');
      }
    });
  };

  var findSingles = Board.prototype.findSingles = function () {
    var board = this;
    _.each(this.groups(), function (group) {
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

  var isSolved = Board.prototype.isSolved = function () {
    return unsolvedCells(this.cells).length === 0;
  };

  var isValid = Board.prototype.isValid = function () {
    return _.all(this.groups(), function (group) {
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

  var rows = Board.prototype.rows = function () {
    return _.groupBy(this.cells, function (cell) { return cell.rowId; });
  };

  var cols = Board.prototype.cols = function () {
    return _.groupBy(this.cells, function (cell) { return cell.colId; });
  };

  var boxes = Board.prototype.boxes = function () {
    return _.groupBy(this.cells, function (cell) { return cell.boxId; });
  };

  var groups = Board.prototype.groups = function () {
    return _.values(this.boxes()).concat(_.values(this.cols())).concat(_.values(this.rows()));
  };

  var populatePreset = Board.prototype.populatePreset = function (preset) {
    _.each(this.inputs, function (input) {
      var id = $(input).data('cell-id');
      if (preset[id]) {
        $(input).val(preset[id]);
      }
    });
  };

  var populateModerate = Board.prototype.populateModerate = function () {
    var moderate = {
      0: 4,
      4: 1,
      12: 3,
      14: 9,
      16: 4,
      19: 7,
      23: 5,
      26: 9,
      31: 6,
      34: 2,
      35: 1,
      38: 4,
      40: 7,
      42: 6,
      45: 1,
      46: 9,
      49: 5,
      54: 9,
      57: 4,
      61: 7,
      64: 3,
      66: 6,
      68: 8,
      76: 3,
      80: 6
    };
    this.populatePreset(moderate);
  };

  var dupCells = Board.prototype.dupCells = function (dupBoard) {
    dupes = [];
    _.each(this.cells, function (cell) {
      var id = cell.id;
      var board = dupBoard;
      var poss = cell.possibilities.slice();
      var value = cell.value;
      dupes.push(new S.Cell(id, board, poss, value));
    });
    return dupes;
  };

})();
