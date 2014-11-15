(function () {

  window.Sudoku = window.Sudoku || {};

  var Board = Sudoku.Board = function () {
    this.cells = $('input')

    this.rows = _.groupBy(this.cells, function (cell) {
      return Math.floor(parseInt($(cell).data('cell-id')) / 9);
    });

    this.cols = _.groupBy(this.cells, function (cell) {
      return parseInt($(cell).data('cell-id')) % 9;
    });

    this.boxes = _.groupBy(this.cells, function (cell) {
      var id = parseInt($(cell).data('cell-id'));
      return Math.floor(id / 27) * 3 + Math.floor((id % 9) / 3);
    });

    $(this.cells).data({ possibilities: [1,2,3,4,5,6,7,8,9] });
  };



})();
