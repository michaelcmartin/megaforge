// Megaforge core functionality module
//
// The module itself only has the object "algorithms" within it. This
// matches game names to password algorithm objects. These objects are
// the actually interesting functionality provided.
//
// Algorithm objects each contain the following members:
//
// - options: An array that specifies the keys the algorithm
//            understands, and some hints for display systems. Each
//            element is one of three things: a string (representing a
//            checkbox), a 3-element array ([name, minimum, maximum],
//            representing a numeric value such as energy tanks), or
//            null (representing a division between groups of
//            selections).
//
// - createPassword: takes an object representing password selections
//                   and turns it into a (game-specific) password
//                   representation suitable for further
//                   processing. (for simple, default processing, see
//                   below.) The object contains one entry for each
//                   selection. The keys correspond to values from the
//                   options array, and the values are numbers that
//                   indicate the selection. Checked checkboxes should
//                   have the value 1. Numeric values should map to
//                   the numeric value, which ought to be between the
//                   min and max values specified.
//
// - interpret: Takes a data object that is returned from
//              createPassword() and renders it in a form similar to
//              the traditional written form of Mega Man
//              passwords. This varied a bit from game to game, but
//              the most common format involved the placement of red
//              and blue dots on a grid.
//
// - debugInterpret: Like 'interpret' but the data is less
//                   processed. This is unlikely to be useful to end
//                   users, as the name suggests.

    // ----- Module-private routines -----

    // The sort method on arrays is a string sort by default; we often
    // want numeric sort, so here it is.
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

    // Mega Man 3 and 5 use red and blue dots. This forwards through
    // gridIntrpret(6) to get their results.
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

    // ----- Per-game algorithms -----

    // Mega Man 2 algorithm
    let mm2 = (function() {
        var spec = ['Air Man', 'Bubble Man', 'Crash Man', 'Flash Man',
                    'Heat Man', 'Metal Man', 'Quick Man', 'Wood Man',
                    null, ['E-Tanks', 0, 4]];

        // Effectively, the MM2 system puts its dots on a 5x4 grid,
        // and then that grid is rotated based on the number of
        // E-Tanks. Each robot has a dot on that grid based on whether
        // or not it is defeated. Heat Man, for instance, has a dot at
        // B2 if defeated or D5 if not. Those translate to 1 and
        // 14. These are the [beaten, unbeaten] indices.
        var elements = {'Heat Man': [1, 14],
                        'Quick Man': [3, 8],
                        'Flash Man': [5, 18],
                        'Crash Man': [9, 16],
                        'Bubble Man': [10, 7],
                        'Wood Man': [12, 4],
                        'Air Man': [17, 11],
                        'Metal Man': [19, 15]};

        // To create the password, we place the 8 dots corresponding
        // to the robots, rotate them according to the E-tank count,
        // and then finally place the dot corresponding to the E-Tank
        // count.
        var createPassword = function(elts) {
            var etanks = 0;
            var result = [];
            if (typeof elts['E-Tanks'] === 'number') {
                etanks = elts['E-Tanks'];
            }
            result.push(etanks);
            for (var robotMaster in elements) {
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
    // password system. We map the characters to MM2 characters and
    // then forward everything to the mm2 object.
    let sfxmm = (function () {
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
            for (var k in elts) {
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

    // Mega Man 3: a set of red and blue dots on a 6x6 grid.
    let mm3 = (function () {
        var spec = ['Gemini Man', 'Hard Man', 'Magnet Man', 'Needle Man',
                    'Shadow Man', 'Snake Man', 'Spark Man', 'Top Man',
                    null,
                    'Gemini Man Docbots', 'Needle Man Docbots',
                    'Shadow Man Docbots', 'Spark Man Docbots',
                    null, 'Break Man', null, ['E-Tanks', 0, 9]];
        // One of the red dots indicates how many E-Tanks you
        // have. These are the indices for each value from 0 to 9.
        var etankcodes = [16, 29, 27, 9, 4, 12, 19, 14, 31, 5];
        // Each robot also has a location associated with them.
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
        // The robots also come in pairs. If both robots in the pair
        // are defeated, instead of two red dots, you put a blue dot
        // in the first robot instead.
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

    // Mega Man 4
    let mm4 = (function() {
        var spec = ['Bright Man', 'Dive Man', 'Drill Man', 'Dust Man',
                    'Pharaoh Man', 'Ring Man', 'Skull Man', 'Toad Man',
                    null, 'Balloon', 'Wire'];
        // Robots are paired, and there are four locations associated
        // with each pair. Essentially, each one represents two bits
        // of data. The first robot represents the 1 bit and the
        // second the 2-bit. Then the four elements for 0-3 are listed
        // in order.
        var roboquads = [['Toad Man', 'Bright Man', 1, 6, 13, 0],
                         ['Pharaoh Man', 'Drill Man', 2, 9, 14, 3],
                         ['Ring Man', 'Dust Man', 4, 11, 16, 10],
                         ['Dive Man', 'Skull Man', 18, 24, 31, 25],
                         ['Balloon', 'Wire', 26, 20, 21, 32]];
        // There is also a final dot that has a fixed position based
        // on how many items have been collected. With five pairs,
        // that's 11 possible values.
        var checksums = [34, 5, 7, 8, 12, 15, 17, 19, 27, 29, 30];
        var createPassword = function(elts) {
            var result = [];
            var count = 0;
            for (var i = 0; i < roboquads.length; ++i) {
                var index = 2;
                if (elts[roboquads[i][0]]) {
                    count += 1;
                    index += 1;
                }
                if (elts[roboquads[i][1]]) {
                    count += 1;
                    index += 2;
                }
                result.push(roboquads[i][index]);
            }
            result.push(checksums[count]);
            numericSort(result);
            return result;
        };
        return { 'options': spec,
                 'createPassword': createPassword,
                 'interpret': gridInterpret(6),
                 'debugInterpret': arrayDump
               };
    }());

    // Mega Man 5
    let mm5 = (function() {
        var spec = ['Charge Man', 'Crystal Man', 'Gravity Man', 'Gyro Man',
                    'Napalm Man', 'Star Man', 'Stone Man', 'Wave Man',
                    null,
                    '[M] Tile (1)', '[E] Tile', '[G] Tile', '[A] Tile (1)',
                    '[M] Tile (2)', '[A] Tile (2)', '[N] Tile', '[V] Tile'];
        // Each dot represents two or three bits now. But there are
        // three sets of locations and six groups of selections. The
        // primary will be selected if possible, and the secondary
        // will be selected otherwise.
        var primary = [[34, 10, 11, 16, 17, 5, 4, 35],
                       [20, 32, 33, 2, 3, 27, 26, 21],
                       [6, 19, 25, 12]];
        var secondary = [[28, 22, 29, 22, 29, 23, 28, 23],
                         [8, 14, 15, 14, 15, 9, 8, 9],
                         [30, 1, 1, 30]];
        // We map each selection to a row and a bit-value. We can sum
        // these up for each color to do our lookups.
        var bitmap = {'Gravity Man': [0, 4],
                      'Wave Man': [0, 2],
                      'Stone Man': [0, 1],
                      'Gyro Man': [1, 4],
                      'Star Man': [1, 2],
                      'Charge Man': [1, 1],
                      'Napalm Man': [2, 2],
                      'Crystal Man': [2, 1],
                      '[M] Tile (1)': [3, 4],
                      '[E] Tile': [3, 2],
                      '[G] Tile': [3, 1],
                      '[A] Tile (1)': [4, 4],
                      '[M] Tile (2)': [4, 2],
                      '[A] Tile (2)': [4, 1],
                      '[N] Tile': [5, 2],
                      '[V] Tile': [5, 1]};
        var createPassword = function(elts) {
            var reds = [];
            var blues = [];
            var scores = [0, 0, 0, 0, 0, 0];
            for (var k in bitmap) {
                if (bitmap.hasOwnProperty(k) && elts[k]) {
                    scores[bitmap[k][0]] += bitmap[k][1];
                }
            }
            for (var i = 0; i < 3; ++i) {
                reds.push(primary[i][scores[i]]);
                if (scores[i] === scores[3+i]) {
                    blues.push(secondary[i][scores[3+i]]);
                } else {
                    blues.push(primary[i][scores[3+i]]);
                }
            }
            numericSort(reds);
            numericSort(blues);
            return { 'red': reds, 'blue': blues };
        }

        return { 'options': spec,
                 'createPassword': createPassword,
                 'interpret': colorInterpret,
                 'debugInterpret': colorDump };
    }());

    // Mega Man 6. The MM6 password system is nondeterministic: we
    // select values to use instead of trying to generate all possible
    // results. For the full set of possibilities, consult
    // algorithms.txt.
    let mm6 = (function() {
        var spec = ['Blizzard Man', 'Centaur Man', 'Flame Man', 'Knight Man',
                    'Plant Man', 'Tomahawk Man', 'Yamato Man', 'Wind Man',
                    null,
                    '[B] Tile', '[E] Tile', '[A] Tile', '[T] Tile',
                    null, 'Energy Economizer'];
        // Selections are grouped into triples, representing, in some
        // sense, three bits of information; however, two combinations
        // (third entry alone, or only first and third elements) are
        // impossible. We shrink our tables accordingly.
        //
        // The presence or absence of the Energy Economizer selection
        // dictates which of two otherwise completely independent
        // lookup tables we use.
        var noEcon = [['Blizzard Man', 'Tomahawk Man', '[B] Tile', 1, 13, 25, 9, 5, 17],
                      ['Wind Man', 'Yamato Man', '[E] Tile', 6, 8, 10, 18, 11, 22],
                      ['Plant Man', 'Knight Man', '[A] Tile', 2, 3, 4, 26, 14, 16],
                      ['Flame Man', 'Centaur Man', '[T] Tile', 7, 0, 12, 24, 19, 31]];
        var econ = [['Blizzard Man', 'Tomahawk Man', '[B] Tile', 0, 1, 6, 7, 12, 13],
                    ['Wind Man', 'Yamato Man', '[E] Tile', 24, 25, 30, 31, 2, 3],
                    ['Plant Man', 'Knight Man', '[A] Tile', 4, 5, 10, 11, 16, 17],
                    ['Flame Man', 'Centaur Man', '[T] Tile', 14, 15, 20, 21, 26, 27]];
        var createPassword = function(elts) {
            var result = []
            var table = noEcon;
            if (elts['Energy Economizer']) {
                table = econ;
                result.push(28);
            } else {
                result.push(34);
            }
            for (var i = 0; i < table.length; ++i) {
                var index = 3;
                if (elts[table[i][0]]) {
                    index += 1;
                }
                if (elts[table[i][1]]) {
                    index += 2;
                    // We only check this value if the second item is
                    // selected; it is impossible to even express
                    // results where the third is selected but the
                    // second is not. Attempts to do so treat the
                    // third element as a no-op.
                    if (elts[table[i][2]]) {
                        index += 2;
                    }
                }
                result.push(table[i][index]);
            }
            numericSort(result);
            return result;
        };

        return { 'options': spec,
                 'createPassword': createPassword,
                 'interpret': gridInterpret(6),
                 'debugInterpret': arrayDump
               };
    }());

    // Mega Man 7; the most sophisticated password system.
    let mm7 = (function() {
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

        // The MM7 password is essentially a set of 3-bit values XORed
        // against a base value.
        var basepwd = [0, 7, 3, 5, 2, 5, 2, 7, 4, 4, 1, 6, 0, 3, 6, 2];
        // The element map includes an offset and which bit is toggled
        // (1, 2, or 4).
        var elements = {
            // Most selections are one-bit-per-checkbox.
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

            // Numeric values are represented in binary
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

            // A number of bits are set or cleared as sanity-checks or
            // explicit checksums. See algorithms.txt for details.
            'Tier 2': [1, 1],
            'All Robots Defeated': [4, 4],
            'Check Bit 1': [6, 1],
            'Check Bit 2': [8, 1]
        };

        // Assemble the password from an array of elements. This just
        // does the XOR work; most attempts to use this by hand will
        // produce illegal passwords.
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

        // Break a parsed set of selections and numeric values into
        // pure selections and checksums.
        var expandElts = function(oldElts, bolts, etanks, wtanks, whistles) {
            var elts = []
            var i, power, tier1, tier2, check;
            tier1 = 0; tier2 = 0;
            // copy over checkbox-y values, recording which robots
            // were beaten in which tier
            for (i = 0; i < oldElts.length; ++i) {
                var value = oldElts[i];
                elts.push(value);
                if (value === "Burst Man" || value === "Cloud Man" || value === "Freeze Man" || value === "Junk Man") {
                    ++tier1;
                }
                if (value === "Turbo Man" || value === "Spring Man" || value === "Shade Man" || value === "Slash Man") {
                    ++tier2;
                }
            }
            // Compute sanity check values
            if (tier2 != 0) {
                elts.push("Tier 2");
            }
            if (tier1 == 4 && tier2 == 4) {
                elts.push("All Robots Defeated");
            }
            // Decompose numeric values
            for (power = 1; power <= bolts && power < 1024; power *= 2) {
                if ((bolts & power) != 0) {
                    elts.push(power + " bolt");
                }
            }
            for (power = 1; power <= etanks && power < 8; power *= 2) {
                if ((etanks & power) != 0) {
                    elts.push(power + " E-Tank");
                }
            }
            for (power = 1; power <= wtanks && power < 8; power *= 2) {
                if ((wtanks & power) != 0) {
                    elts.push(power + " W-Tank");
                }
            }
            for (power = 1; power <= whistles && power < 8; power *= 2) {
                if ((whistles & power) != 0) {
                    elts.push(power + " Whistle");
                }
            }
            // Compute final checksum
            i = elts.length;
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

        // To create the password, split out numeric values from the
        // others, then forward it through expandElts to
        // createPasswordRaw.
        var createPassword = function(eltmap) {
            var bolts = 0;
            var etanks = 0;
            var wtanks = 0;
            var whistles = 0;
            var elts = [];
            for (var k in eltmap) {
                if (eltmap.hasOwnProperty(k) && eltmap[k] && elements[k]) {
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

        // MM7 passwords are traditionally rendered in the form
        // 1234-1234-1234-1234, so that's just slicing and rejoining.
        var interpret = function(pwdArray) {
            return pwdArray.slice(0, 4).join("") + "-" + pwdArray.slice(4, 8).join("") + "-" + pwdArray.slice(8, 12).join("") + "-" + pwdArray.slice(12, 16).join("");
        };

        // Our debugInterpret reconstructs the actual expanded
        // elements from the resulting password.
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
            'createPassword': createPassword,
            'interpret': interpret,
            'debugInterpret': debugInterpret
        };
    })();

    export let algorithms = { "Mega Man 2": mm2,
                              "Mega Man 3": mm3,
                              "Mega Man 4": mm4,
                              "Mega Man 5": mm5,
                              "Mega Man 6": mm6,
                              "Mega Man 7": mm7,
                              "Street Fighter X Mega Man": sfxmm
                            };
