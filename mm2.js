mm2 = (function() {
  var spec = ['Air Man', 'Bubble Man', 'Crash Man', 'Flash Man', 
              'Heat Man', 'Metal Man', 'Quick Man', 'Wood Man',
              null, ['E-Tanks', 0, 4]];

  var elements = {'Heat Man': [1, 14],
                  'Quick Man': [3, 8],
                  'Flash Man': [5, 18],
                  'Crash Man': [9, 16],
                  'Bubble Man': [10, 7], 
                  'Wood Man': [12, 4],
                  'Air Man': [17, 11],
                  'Metal Man': [19, 15]};

  var createPassword = function(elts) {
      var etanks = 0;
      var result = [];
      if (typeof elts['E-Tanks'] === 'number') {
          etanks = elts['E-Tanks'];
      }
      result.push(etanks);
      for (robotMaster in elements) {
          if (elements.hasOwnProperty(robotMaster)) {
              var newVal = 0;
              if (elts[robotMaster]) {
                  newVal = elements[robotMaster][0];
              } else {
                  newVal = elements[robotMaster][1];
              }
              newVal = (newVal + etanks) % 20;
              result.push(newVal + 5);
          }
      }
      result.sort(function(a, b) { return a-b; });
      return result;
  };

  var interpret = function(pwdArray) {
      var result = "";
      var current = "";
      var letters = ["A", "B", "C", "D", "E"];
      for (var i = 0; i < pwdArray.length; i += 1) {
          var letter = letters[Math.floor(pwdArray[i] / 5)];
          var index = ((pwdArray[i] % 5) + 1).toString();
          if (current === "") {
              current = letter;
              result += letter;
          } else if (current !== letter) {
              current = letter;
              result += " " + letter;
          }
          result += index;
      }
      return result;
  };

  var debugInterpret = function(pwdArray) {
      return "[" + pwdArray.join(", ") + "]";
  };

  return {
    'options': spec,
    'createPassword': createPassword, // Still interim
    'interpret': interpret,
    'debugInterpret': debugInterpret
  };
})();

sfxmm = (function () {
    var conversion = {
        'Blanka': 'Heat Man',
        'C. Viper': 'Quick Man',
        'Ryu': 'Flash Man',
        'Urien': 'Crash Man',
        'Dhalsim': 'Bubble Man',
        'Chun-Li': 'Wood Man',
        'Rolento': 'Air Man',
        'Rose': 'Metal Man'};

    var createPassword = function(elts) {
        var converted = {}
        for (k in elts) {
            if (elts.hasOwnProperty(k)) {
                if (conversion[k]) {
                    converted[conversion[k]] = elts[k];
                } else {
                    converted[k] = elts[k];
                }
            }
        }
        return mm2.createPassword(converted);
    };

    return {
        'options': ['Blanka', 'Chun-Li', 'C. Viper', 'Dhalsim',
                'Rolento', 'Rose', 'Ryu', 'Urien',
                null, ['E-Tanks', 0, 4]],
        'createPassword': createPassword,
        'interpret': mm2.interpret,
        'debugInterpret': mm2.debugInterpret
    };
})();
