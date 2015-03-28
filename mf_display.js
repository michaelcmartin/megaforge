// This is the sample generic-display system for Megaforge. To use it
// in a webpage, you need to have first included megaforge.js, and
// then need to run mf_display.initialize() on pageload
// completion. Your page must also have these elements:
//
// - A <select> element with an ID of "gameSelect" that, when changed,
//   calls mf_display.selectGame(this.selectedIndex)
// - An empty <table> element with an ID of "optionsTable"
// - An element that can contain text with an ID of "output"
//
// You may also have an element that may contain text with an ID of
// "debug" - this will dump internal information about the processed
// password when the password is updated.
mf_display = (function () {
    var selections = {};  // Currently selected options
    var gameList = [];    // Available games to build passwords for
    var game = null;      // Currently selected game object

    // Enumerate the games in the megaforge object and fill up the
    // "gameSelect" object based on that.
    var initialize = function () {
        gameList = [];
        for (var gameName in megaforge.algorithms) {
            if (megaforge.algorithms.hasOwnProperty(gameName)) {
                gameList.push(gameName);
            }
        }
        gameList.sort();
        for (var i = 0; i < gameList.length; i++) {
	    var newOption = document.createElement("OPTION");
	    var optionText = document.createTextNode(gameList[i]);
	    newOption.appendChild(optionText);
	    newOption.id = gameList[i];
	    document.getElementById('gameSelect').appendChild(newOption);
        };
        if (gameList.length > 0) {
            mf_display.selectGame(0);
        }
    };

    // A new option has been selected. Update the "game" object, and
    // recreate the "optionsTable" element according to the "options"
    // array in the object.
    var selectGame = function (index) {
        var nextGame = megaforge.algorithms[gameList[index]];

        if (nextGame) {
            game = nextGame;
            var table = document.getElementById("optionsTable");
            // Clear selected options
            selections = {}
            // Clear table
            while (table.rows.length > 0) {
                table.deleteRow(0);
            }
            // Recreate table from game.options
	    for (var k = 0; k < game.options.length; k = k+1) {
                var v = game.options[k];
	        var newRow = table.insertRow(table.rows.length);
	        var newCell = newRow.insertCell(0);
                var newLabel;
                var optionText = "";
                // What this row is depends on the type of the value
                if (v === null) {
                    // null: Divider row.
                    var newHr = document.createElement("HR");
                    newCell.appendChild(newHr);
                } else if (typeof(v) === 'string') {
                    // string: checkbox
		    newLabel = document.createElement("LABEL");
		    newCell.appendChild(newLabel);
		    var newCheckbox = document.createElement("INPUT");
		    newCheckbox.setAttribute("type", "checkbox");
		    newCheckbox.id = v;
		    newCheckbox.onclick = function () {
		        if (this.checked) {
			    selections[this.id] = 1;
		        } else {
                            delete selections[this.id];
		        };
		        update();
		    };
		    optionText = document.createTextNode(v);
		    newLabel.appendChild(newCheckbox);
		    newLabel.appendChild(optionText);
                } else {
                    // Otherwise, it must be a numeric type, so this
                    // is an array of the form [name, min, max]
		    newLabel = document.createElement("LABEL");
		    newCell.appendChild(newLabel);
		    var newNumeric = document.createElement("INPUT");
		    newNumeric.setAttribute("type", "number");

		    newNumeric.id = v[0];
                    newNumeric.min = v[1];
                    newNumeric.max = v[2];
                    newNumeric.defaultValue = v[1];
                    newNumeric.value = v[1];
		    newNumeric.onchange = function () {
                        selections[this.id] = parseInt(this.value, 10);
                        update();
		    };
		    optionText = document.createTextNode(v[0] + ": ");
		    newLabel.appendChild(optionText);
		    newLabel.appendChild(newNumeric);
                }
	    }
            // Reset the password to the (now-empty) password
            update();
        }
    };

    // Create the password from the selections field,
    // interpret it in the default way, and write the simple password
    // to the "output" element and the debug information to (if
    // present) the "debug" element.
    var update = function () {
        var pwdArray = [];
        var password = null;
        if (game) {
            pwdArray = game.createPassword(selections);
            password = game.interpret(pwdArray);
        }
        if (password) {
	    document.getElementById("output").innerHTML = password;
            var internalDebug = "{";
            for (var k in selections) {
                if (selections.hasOwnProperty(k)) {
                    internalDebug += (internalDebug === "{") ? "" : ", ";
                    internalDebug += k + ": " + selections[k];
                }
            }
            internalDebug += "}";
            var debugElt = document.getElementById("debug");
            if (debugElt) {
                debugElt.innerHTML = "DEBUG: " + game.debugInterpret(pwdArray) + "<br>" + internalDebug;
            }
        }
    };

    return { 'initialize': initialize,
             'selectGame': selectGame,
           };
})();
