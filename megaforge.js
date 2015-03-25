megaforge = (function () {
    // Utility functions used by multiple games

    // Sort is a string sort by default; we often want numeric sort.
    var numericSort = function(arr) { arr.sort(function(a, b) { return a-b; }); };

    // Turn a set of NxN codepoints (0-N^2-1, rowmajor) into the
    // traditional Mega Man password strings. 5 for MM2 and 6 for
    // the others.
    //
    // This is effectively a curried function of two arguments. The
    // algorithm spec will supply n, and the user will ultimately
    // supply pwdArray.
    var gridInterpret = function(n) { return function (pwdArray) {
        var result = "";
        var current = "";
        var letters = ["A", "B", "C", "D", "E", "F"];
        for (var i = 0; i < pwdArray.length; i += 1) {
            var letter = letters[Math.floor(pwdArray[i] / n)];
            var index = ((pwdArray[i] % n) + 1).toString();
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
    }; };

    var colorInterpret = function(pwdObj) {
        var grid = gridInterpret(6);
        var hasRed = pwdObj.red.length > 0;
        var hasBlue = pwdObj.blue.length > 0;
        var result = "";
        if (hasRed) {
            result += '<span style="color: red">Red: ' + grid(pwdObj.red) + '</span>';
            if (hasBlue) { result += '<br>'; }
        }
        if (hasBlue) {
            result += '<span style="color: blue">Blue: ' + grid(pwdObj.blue) + '</span>';
        }
        return result;
    }

    // For debugging purposes: a handy array dump and colordump
    var arrayDump = function(pwdArray) {
        return "[" + pwdArray.join(", ") + "]";
    };
    var colorDump = function(pwdObj) {
        return "{ red: " + arrayDump(pwdObj['red']) + ", blue: "+arrayDump(pwdObj['blue']) + "}";
    };

    // Mega Man 2
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
            numericSort(result);
            return result;
        };

        return {
            'options': spec,
            'createPassword': createPassword,
            'interpret': gridInterpret(5),
            'debugInterpret': arrayDump
        };
    })();

    // Street Fighter X Mega Man is ultimately a reskin of MM2's
    // password system.
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

    // Mega Man 3
    mm3 = (function () {
        var spec = ['Gemini Man', 'Hard Man', 'Magnet Man', 'Needle Man',
                    'Shadow Man', 'Snake Man', 'Spark Man', 'Top Man',
                    null,
                    'Gemini Man Docbots', 'Needle Man Docbots',
                    'Shadow Man Docbots', 'Spark Man Docbots',
                    null, 'Break Man', null, ['E-Tanks', 0, 9]];
        var etankcodes = [16, 29, 27, 9, 4, 12, 19, 14, 31, 5];
        var robots = {'Top Man': 2,
                      'Spark Man': 33,
                      'Needle Man': 20,
                      'Gemini Man': 10,
                      'Spark Man Docbots': 0,
                      'Needle Man Docbots': 7,
                      'Snake Man': 35,
                      'Shadow Man': 23,
                      'Magnet Man': 34,
                      'Hard Man': 15,
                      'Shadow Man Docbots': 3,
                      'Gemini Man Docbots': 11,
                      'Break Man': 24};
        var robopairs = {'Top Man': 'Snake Man',
                         'Spark Man': 'Shadow Man',
                         'Needle Man': 'Magnet Man',
                         'Gemini Man': 'Hard Man',
                         'Spark Man Docbots': 'Shadow Man Docbots',
                         'Needle Man Docbots': 'Gemini Man Docbots'};
        var createPassword = function(elts) {
            var etanks = 0;
            var reds = [];
            var blues = [];
            if (typeof elts['E-Tanks'] === 'number') {
                etanks = elts['E-Tanks'];
            }
            if (etanks < 0) { etanks = 0; }
            if (etanks > 9) { etanks = 9; }
            reds.push(etankcodes[etanks]);
            if (elts['Break Man']) {
                reds.push(robots['Break Man']);
            }
            for (var robot in robopairs) {
                if (robopairs.hasOwnProperty(robot)) {
                    var otherRobot = robopairs[robot];
                    if (elts[robot]) {
                        if (elts[otherRobot]) {
                            blues.push(robots[robot]);
                        } else {
                            reds.push(robots[robot]);
                        }
                    } else if (elts[otherRobot]) {
                        reds.push(robots[otherRobot]);
                    }
                }
            }

            numericSort(reds);
            numericSort(blues);
            
            return { 'red': reds, 'blue': blues };
        };

        return { 'options': spec,
                 'createPassword': createPassword,
                 'interpret': colorInterpret,
                 'debugInterpret': colorDump };
    }());

    // Mega Man 7; the most sophisticated password system
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

    return {"algorithms": { "Mega Man 2": mm2,
                            "Mega Man 3": mm3,
                            "Mega Man 7": mm7,
                            "Street Fighter X Mega Man": sfxmm
                          }
           };

}());
