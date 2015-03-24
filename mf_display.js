mf_display = (function () {
    var options = {};
    var gameList = [];
    var game = null;

    var initialize = function () {
        gameList = [];
        for (var gameName in megaforge.algorithms) {
            if (megaforge.algorithms.hasOwnProperty(gameName)) {
                gameList.push(gameName);
            }
        }
        gameList.sort();
        // Build dropdown based on the master array of included game algorithms
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

    var selectGame = function (index) {
        game = megaforge.algorithms[gameList[index]];

        if (game) {
            var table = document.getElementById("optionsTable");
            while (table.rows.length > 0) {
                table.deleteRow(0);
            }
            options = {}
	    for (var k = 0; k < game.options.length; k = k+1) {
                var v = game.options[k];
	        var newRow = table.insertRow(table.rows.length);
	        var newCell = newRow.insertCell(0);
                var newLabel;
                var optionText = "";
                if (v === null) {
                    var newHr = document.createElement("HR");
                    newCell.appendChild(newHr);
                } else if (typeof(v) === 'string') {
		    newLabel = document.createElement("LABEL");
		    newCell.appendChild(newLabel);
		    var newCheckbox = document.createElement("INPUT");
		    newCheckbox.setAttribute("type", "checkbox");
		    newCheckbox.id = v;
		    newCheckbox.onclick = function () {
		        if (this.checked) {
			    options[this.id] = 1;
		        } else {
                            delete options[this.id];
		        };
		        update(options);
		    };
		    optionText = document.createTextNode(v);
		    newLabel.appendChild(newCheckbox);
		    newLabel.appendChild(optionText);
                } else {
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
                        options[this.id] = parseInt(this.value, 10);
                        update(options);
		    };
		    optionText = document.createTextNode(v[0] + ": ");
		    newLabel.appendChild(optionText);
		    newLabel.appendChild(newNumeric);
                }
	    }
        }
        mf_display.update();
    };

    var update = function (optionMap) {
        var pwdArray = [];
        var password = null;
        if (!(optionMap)) {
	    optionMap = {};
        };
        if (game) {
            pwdArray = game.createPassword(optionMap);
            password = game.interpret(pwdArray);
        }
        if (password) {
	    document.getElementById("output").innerHTML = password;
            var internalDebug = "{";
            for (var k in optionMap) {
                if (optionMap.hasOwnProperty(k)) {
                    internalDebug += (internalDebug === "{") ? "" : ", ";
                    internalDebug += k + ": " + optionMap[k];
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
             'update': update
           };
})();
