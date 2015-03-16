mm7 = (function() {
  var spec = ['Intro',
              null,
              'Burst Man',
              'Cloud Man',
              'Freeze Man',
              'Junk Man',
              null,
              'Robot Museum',
              null,
              'Shade Man',
              'Slash Man',
              'Spring Man',
              'Turbo Man',
              null,
              'Rush Jet',
              'Rush Search',
              'Suit Adapter',
              'Protoshield',
              'Energy Balancer',
              'Power Enhancer',
              null,
              '[R] Tile',
              '[U] Tile',
              '[S] Tile',
              '[H] Tile',
              null,
              'Found HyperBolt',
              'Delivered HyperBolt',
              'Rescued Beat',
              null,
              ['Bolts', 0, 999],
              ['E-Tanks', 0, 4],
              ['W-Tanks', 0, 4],
              ['Beat Whistles', 0, 4],
              'S-Tank',
              'Exit'];

  var basepwd = [0, 7, 3, 5, 2, 5, 2, 7, 4, 4, 1, 6, 0, 3, 6, 2];
  var elements = {
    'Intro': [6, 2],
    'Freeze Man': [10, 4],
    'Junk Man': [8, 4],
    'Cloud Man': [1, 4],
    'Burst Man': [7, 1],
    'Robot Museum': [10, 1],
    'Shade Man': [5, 1],
    'Spring Man': [4, 1],
    'Turbo Man': [15, 1],
    'Slash Man': [13, 2],

    'S-Tank': [12, 4],
    'Exit': [15, 2],
    'Rescued Beat': [9, 2],
    'Found HyperBolt': [13, 4],
    'Delivered HyperBolt': [11, 2],
    'Energy Balancer': [1, 2],
    'Power Enhancer': [12, 1],
    '[R] Tile': [14, 1],
    '[U] Tile': [9, 4],
    '[S] Tile': [0, 4],
    '[H] Tile': [6, 4],
    'Rush Jet': [0, 2],
    'Rush Search': [11, 1],
    'Suit Adapter': [14, 2],
    'Protoshield': [7, 4],

    /* Selections below this are computed from the user input */
    'Tier 2': [1, 1],
    'All Robots Defeated': [4, 4],
    '512 bolt': [5, 4],
    '256 bolt': [2, 2],
    '128 bolt': [0, 1],
    '64 bolt': [14, 4],
    '32 bolt': [12, 2],
    '16 bolt': [5, 2],
    '8 bolt': [11, 4],
    '4 bolt': [8, 2],
    '2 bolt': [2, 4],
    '1 bolt': [4, 2],
    '4 W-Tank': [3, 4],
    '2 W-Tank': [3, 1],
    '1 W-Tank': [7, 2],
    '4 E-Tank': [15, 4],
    '2 E-Tank': [9, 1],
    '1 E-Tank': [13, 1],
    '4 Whistle': [3, 2],
    '2 Whistle': [2, 1],
    '1 Whistle': [10, 2],

    'Check Bit 1': [6, 1],
    'Check Bit 2': [8, 1]
  };

  var createPasswordRaw = function(elts) {
    var result = [];
    var i;
    for (i = 0; i < 16; ++i) {
      result[i] = basepwd[i];
    }
    for (i = 0; i < elts.length; ++i) {
      var x = elements[elts[i]];
      if (x) {
        result[x[0]] ^= x[1];
      } else {
        alert("Unknown element: " + elts[i]);
      }
    }
    for (i = 0; i < 16; ++i) {
      if (result[i] == 0) {
        result[i] = 8;
      }
    }
    return result;
  }

  var expandElts = function(oldElts, bolts, etanks, wtanks, whistles) {
    var elts = []
    var i, power, tier1, tier2, check;
    tier1 = 0; tier2 = 0;
    for (i = 0; i < oldElts.length; ++i) {
      elts[i] = oldElts[i];
      if (elts[i] == "Burst Man" || elts[i] == "Cloud Man" || elts[i] == "Freeze Man" || elts[i] == "Junk Man") {
        ++tier1;
      }
      if (elts[i] == "Turbo Man" || elts[i] == "Spring Man" || elts[i] == "Shade Man" || elts[i] == "Slash Man") {
        ++tier2;
      }
    }
    if (tier2 != 0) {
      elts[i] = "Tier 2";
      ++i;
    }
    if (tier1 == 4 && tier2 == 4) {
      elts[i] = "All Robots Defeated";
      ++i;
    }
    for (power = 1; power <= bolts && power < 1024; power *= 2) {
      if ((bolts & power) != 0) {
        elts[i] = power + " bolt";
        ++i;
      }
    }
    for (power = 1; power <= etanks && power < 8; power *= 2) {
      if ((etanks & power) != 0) {
        elts[i] = power + " E-Tank";
        ++i;
      }
    }
    for (power = 1; power <= wtanks && power < 8; power *= 2) {
      if ((wtanks & power) != 0) {
        elts[i] = power + " W-Tank";
        ++i;
      }
    }
    for (power = 1; power < whistles && power < 8; power *= 2) {
      if ((whistles & power) != 0) {
        elts[i] = power + " Whistle";
        ++i;
      }
    }
    if (i > 0) {
      check = 2-i;
      if (check & 1) {
        elts[i] = "Check Bit 1";
        ++i;
      }
      if (check & 2) {
        elts[i] = "Check Bit 2";
        ++i;
      }
    }
    return elts;
  };

  var createPassword = function(eltmap) {
      var bolts = 0;
      var etanks = 0;
      var wtanks = 0;
      var whistles = 0;
      var elts = [];
      for (k in eltmap) {
          if (eltmap[k] && elements[k]) {
              elts.push(k);
          }
      }
      if (typeof eltmap['Bolts'] === 'number') {
          bolts = eltmap['Bolts'];
      }
      if (typeof eltmap['E-Tanks'] === 'number') {
          etanks = eltmap['E-Tanks'];
      }
      if (typeof eltmap['W-Tanks'] === 'number') {
          wtanks = eltmap['W-Tanks'];
      }
      if (typeof eltmap['Beat Whistles'] === 'number') {
          whistles = eltmap['Beat Whistles'];
      }
      return createPasswordRaw(expandElts(elts, bolts, etanks, wtanks, whistles));
  };

  var interpret = function(pwdArray) {
      return pwdArray.slice(0, 4).join("") + "-" + pwdArray.slice(4, 8).join("") + "-" + pwdArray.slice(8, 12).join("") + "-" + pwdArray.slice(12, 16).join("");
  };

  var debugInterpret = function(pwdArray) {
      var resultArray = [];
      for (var k in elements) {
          if (elements.hasOwnProperty(k)) {
              var i = elements[k][0];
              var mask = elements[k][1];
              if ((pwdArray[i] & mask) !== (basepwd[i] & mask)) {
                  resultArray.push(k);
              }
          }
      }
      return "[" + resultArray.join(", ") + "]";
  };

  return {
    'options': spec,
    'createPassword': createPassword, // Still interim
    'interpret': interpret,
    'debugInterpret': debugInterpret
  };
})();
