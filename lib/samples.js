(function () {

  window.S = window.S || {};

  var clearInputs = S.Board.prototype.clearInputs = function () {
    _.each(this.inputs, function (input) {
      $(input).val("");
    });
  };

  var populatePreset = S.Board.prototype.populatePreset = function (preset) {
    _.each(this.inputs, function (input) {
      var id = $(input).data('cell-id');
      if (preset[id]) {
        $(input).val(preset[id]);
      }
    });
  };

  var populateEasy = S.Board.prototype.populateEasy = function () {
    var easy = {
      3:  1,
      5:  5,
      9:  1,
      10: 4,
      15: 6,
      16: 7,
      19: 8,
      23: 2,
      24: 4,
      28: 6,
      29: 3,
      31: 7,
      34: 1,
      36: 9,
      44: 3,
      46: 1,
      49: 9,
      51: 5,
      52: 2,
      56: 7,
      57: 2,
      61: 8,
      64: 2,
      65: 6,
      70: 3,
      71: 5,
      75: 4,
      77: 9
    };
    this.populatePreset(easy);
  };

  var populateGentle = S.Board.prototype.populateGentle = function () {
    var gentle = {
      5:  4,
      7:  2,
      8:  8,
      9:  4,
      11: 6,
      17: 5,
      18: 1,
      22: 3,
      24: 6,
      30: 3,
      32: 1,
      37: 8,
      38: 7,
      42: 1,
      43: 4,
      48: 7,
      50: 9,
      56: 2,
      58: 1,
      62: 3,
      63: 9,
      69: 5,
      71: 7,
      72: 6,
      73: 7,
      75: 4
    };
    this.populatePreset(gentle);
  };

  var populateMedium = S.Board.prototype.populateMedium = function () {
    var medium = {
      0:  4,
      4:  1,
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
    this.populatePreset(medium);
  };

  var populateHard = S.Board.prototype.populateHard = function () {
    var hard = {
      0:  3,
      2:  9,
      6:  4,
      9:  2,
      12: 7,
      14: 9,
      19: 8,
      20: 7,
      27: 7,
      28: 5,
      31: 6,
      33: 2,
      34: 3,
      36: 6,
      39: 9,
      41: 4,
      44: 8,
      46: 2,
      47: 8,
      49: 5,
      52: 4,
      53: 1,
      60: 5,
      61: 9,
      66: 1,
      68: 6,
      71: 7,
      74: 6,
      78: 1,
      80: 4
    };
    this.populatePreset(hard);
  };

  var populateEvil = S.Board.prototype.populateEvil = function () {
    var evil = {
      3:  7,
      5:  4,
      8:  5,
      10: 2,
      13: 1,
      16: 7,
      22: 8,
      26: 2,
      28: 9,
      32: 6,
      33: 2,
      34: 5,
      36: 6,
      40: 7,
      44: 8,
      46: 5,
      47: 3,
      48: 2,
      52: 1,
      54: 4,
      58: 9,
      64: 3,
      67: 6,
      70: 9,
      72: 2,
      75: 4,
      77: 7
    };
    this.populatePreset(evil);
  };

})();
