// taken from stackoverflow user paul-s at https://stackoverflow.com/a/30970691/6849725
function hexToRGB(hex, adjustment = 0) {
	let m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
	return {
		r: parseInt(m[1], 16)+adjustment,
		g: parseInt(m[2], 16)+adjustment,
		b: parseInt(m[3], 16)+adjustment
	};
}


// object that enumerates egg groups
// this would be easier and faster with sequential values for egg groups instead of bit flags
// i am too lazy to edit pokedex.js now since i originially intended to use one integer value
// with these bits set for each egg group but while parsing the table on bulbapedia
// i ended up keeping them as arrays when merging the object with pokemon.json
var EggGroup = {
	Undiscovered: 	0,
	Monster: 		1 << 0,
	Water1: 		1 << 1,
	Bug: 			1 << 2,
	Flying: 		1 << 3,
	Field: 			1 << 4,
	Fairy: 			1 << 5,
	Grass: 			1 << 6,
	HumanLike: 		1 << 7,
	Water3: 		1 << 8,
	Mineral: 		1 << 9,
	Amorphous: 		1 << 10,
	Water2: 		1 << 11,
	Ditto: 			1 << 12,
	Dragon: 		1 << 13
};

// table for finding names of egg groups
var EggGroupName = {
	"0": 			"Undiscovered",
	"1": 			"Monster",
	"2": 			"Water 1",
	"4": 			"Bug",
	"8": 			"Flying",
	"16": 			"Field",
	"32": 			"Fairy",
	"64": 			"Grass",
	"128": 			"Human-Like",
	"256": 			"Water 3",
	"512": 			"Mineral",
	"1024": 		"Amorphous",
	"2048": 		"Water 2",
	"4096": 		"Ditto",
	"8192": 		"Dragon"
};

// these are the same colors used on bulbapedia
// some seem a little ambiguous but they're good enough
var EggGroupColor = {
	"0": 			"#000000", // Undiscovered
	"1": 			"#d25064", // Monster
	"2": 			"#97b5fd", // Water1
	"4": 			"#a8b820", // Bug
	"8": 			"#a890f0", // Flying
	"16": 			"#e0c068", // Field
	"32": 			"#ee99ac", // Fairy
	"64": 			"#78c850", // Grass
	"128": 			"#d29682", // Human-Like
	"256": 			"#5876be", // Water3
	"512": 			"#7a6252", // Mineral
	"1024": 		"#8a8a8a", // Amorphous
	"2048": 		"#729afa", // Water2
	"4096": 		"#a664bf", // Ditto
	"8192": 		"#7038f8", // Dragon
};

// function to create a section of a gradident that is used as the backgroun-image in result nodes
function makeGradientStopString(color, w, isFirst) {
	return color + " " + w.toString() + "%, " + color;
};

class PokeSelect {
	// reference to pokemon select element
	selectElement = null;
	// reference to result container element
	resultsElement = null;
	// reference to checkbox element for using gen 8 egg groups
	useGen8EggsCheckbox = null;
	// reference to result name text filter element
	resultsNameTextFilter = null;
	// reference to result egg group select filter element
	resultsEggGroupSelectFilter = null;

	constructor(
		selectElement, 
		resultsElement, 
		useGen8EggsCheckbox, 
		resultsNameFilter, 
		resultsEggGroupSelectFilter
	) {
		// assign references and create field called "parent" that references this object
		this.selectElement = selectElement;
		this.selectElement.parent = this;

		this.resultsElement = resultsElement;
		this.resultsElement.parent = this;

		this.useGen8EggsCheckbox = useGen8EggsCheckbox;
		this.useGen8EggsCheckbox.parent = this;

		this.resultsNameTextFilter = resultsNameFilter;
		this.resultsNameTextFilter.parent = this;

		this.resultsEggGroupSelectFilter = resultsEggGroupSelectFilter;
		this.resultsEggGroupSelectFilter.parent = this;

		// populate the pokemon select element with the english names from pokedex
		for (let i = 0; i < pokedex.length; i++) {
			let dexEntry = pokedex[i];
			let opt = document.createElement("option");
			opt.text = dexEntry["name"]["english"];
			opt.dexEntry = dexEntry;
			this.selectElement.add(opt);
		}

		// add "Any" option to egg group select filter
		let anyOpt = document.createElement("option");
		anyOpt.text = "Any";
		anyOpt.value = "-1";
		this.resultsEggGroupSelectFilter.add(anyOpt);

		// add all the egg groups from the EggGroup object
		Object.entries(EggGroup).forEach(entry => {
			let value = entry[1];

			// if not the "Undiscovered" egg group
			if (value !== 0) {
				// add egg group option to egg group select filter
				let opt = document.createElement("option");
				// set option text to egg group name
				opt.text = EggGroupName[value];
				// convert egg group color from hex to rgb and make the color 24 values lighter
				// made lighte so black text color has more contrast
				let rgb = hexToRGB(EggGroupColor[value], 24);
				// set option background color to adjusted egg group color
				opt.style.backgroundColor = "rgba(" + rgb.r + "," + rgb.g + ", " + rgb.b + ", 0.75)";
				// set the option value to the same value as EggGroup
				opt.value = value.toString();
				// add option to egg group select filter
				this.resultsEggGroupSelectFilter.add(opt);
			}
		});

		// set the initial value of the pokemon select to a blank option
		this.selectElement.selectedIndex = -1;

		// add event listeners
		// "this" does not refer to the instance of this object inside event listeners
		// functions called in event listeners are wrapped inside another function
		// this object can then be accessed through the "parent" property
		this.selectElement.addEventListener(
			"change", 
			function(e) {
				let parent = e.target.parent;
				// refresh results 
				parent.selectionChanged(e.target);
				// apply the current filters to new results
				parent.resultsNameTextFilterChanged(parent.resultsNameTextFilter);
				parent.resultsEggGroupFilterChanged(parent.resultsEggGroupSelectFilter);
			}
		);

		this.useGen8EggsCheckbox.addEventListener(
			"change", 
			function(e) { 
				let parent = e.target.parent;
				// refresh results
				parent.selectionChanged(parent.selectElement);
				// apply the current filters to new results
				parent.resultsNameTextFilterChanged(parent.resultsNameTextFilter);
				parent.resultsEggGroupFilterChanged(parent.resultsEggGroupSelectFilter);
			}
		);

		this.resultsNameTextFilter.addEventListener(
			"input", 
			function(e) { 
				let parent = e.target.parent;
				// refresh results
				parent.selectionChanged(parent.selectElement);
				// apply the current egg group select filter first
				parent.resultsEggGroupFilterChanged(parent.resultsEggGroupSelectFilter);
				// now apply name text filter
				parent.resultsNameTextFilterChanged(e.target); 
			}
		);

		this.resultsEggGroupSelectFilter.addEventListener(
			"change", 
			function(e) { 
				let parent = e.target.parent;
				// refresh results
				parent.selectionChanged(parent.selectElement);
				// apply the current name text filter first
				parent.resultsNameTextFilterChanged(parent.resultsNameTextFilter); 
				// then apply egg group select filter
				parent.resultsEggGroupFilterChanged(e.target); 
			}
		);
	}

	// event for when egg group select filter changes
	resultsEggGroupFilterChanged(e) {
		// get current egg group select filter option as an integer
		let filter = parseInt(e.options[e.selectedIndex].value);
		// if current egg group select option is "Any"
		if (filter === -1) {
			return;
		}

		// array of results to be pruned
		let pruned = [];
		// reference to children nodes of result element
		let resultNodes = e.parent.resultsElement.children;
		// for each result node
		for (let i = 0; i < resultNodes.length; i++) {
			// reference to current result node
			let resultEntry = resultNodes[i];

			// reference to egg group array in current result node
			let eggGroups = resultEntry.eggGroups;
			// result node egg groups do not include filtered option
			if (!eggGroups.includes(filter)) {
				// add result to prune list
				pruned.push(resultEntry);
			}
		}

		// for each result node in prune list
		for (let i = 0; i < pruned.length; i++) {
			// remove node from result element
			e.parent.resultsElement.removeChild(pruned[i]);
		}
	}

	// event for when name text filter changes
	resultsNameTextFilterChanged(e) {
		// get value of name text filter and convert to lowercase
		// converting value to lowercase avoids case-sensitivity in filtering
		let filter = e.value.toLowerCase();
		// if filter is blank there is nothing to be done
		if (filter === "") {
			return;
		}

		// array of nodes to be pruned from results element
		let pruned = [];
		// reference to children array of results element
		let results = e.parent.resultsElement.children;
		// for each node in results element
		for (let i = 0; i < results.length; i++) {
			// reference to current results element child
			let resultEntry = results[i];

			// get the result name
			// convert to lowercase again to avoid case-sensitivity
			let name = resultEntry.children[0].resultName.toLowerCase();
			// compare result name to filter text with a regular expression
			// regular expression evaluates to true if any result name begins with current filter name text
			// if name does not match filter
			if (!name.match("^" + filter)) {
				// push result node to prune list
				pruned.push(resultEntry);
			}
		}

		// remove all results that do not match name filter text
		// for each result in prune list
		for (let i = 0; i < pruned.length; i++) {
			// remove result node from result element
			e.parent.resultsElement.removeChild(pruned[i]);
		}
	}

	// event for when a result is clicked
	resultClicked(e) {
		// for each pokemon in pokemon select element
		for (let i = 0; i < e.parent.selectElement.options.length; i++) {
			// if pokemon name matched the name of result clicked
			if (e.parent.selectElement.options[i].value === e.resultName) {
				// set selected option in pokemon select to result clicked
				e.parent.selectElement.value = e.resultName;
				// manually refresh results
				e.parent.selectionChanged(e.parent.selectElement);
				// stop looking through pokemon select options
				break;
			}
		}

		// apply the current filters to new results
		e.parent.resultsNameTextFilterChanged(e.parent.resultsNameTextFilter);
		e.parent.resultsEggGroupFilterChanged(e.parent.resultsEggGroupSelectFilter);
	}

	// event for when pokemon select changes
	selectionChanged(e) {
		// remove all result nodes in result element
		// while results elements contains child nodes
		while (e.parent.resultsElement.children.length > 0) {
			// remove node from results element
			e.parent.resultsElement.removeChild(e.parent.resultsElement.children[0]);
		}

		// if the pokemon select element somehow manages to be set to an invalid index
		if (e.options[e.selectedIndex] === undefined || e.options[e.selectedIndex] === null) {
			// disable the filtering elements
			e.parent.resultsNameTextFilter.disabled = true;
			e.parent.resultsEggGroupSelectFilter.disabled = true;
			return;
		}

		// enable the filtering elements
		e.parent.resultsNameTextFilter.disabled = false;
		e.parent.resultsEggGroupSelectFilter.disabled = false;

		// get the dex selectedEntry for the selected option in pokemon select element
		let selectedEntry = e.options[e.selectedIndex].dexEntry;
		if (selectedEntry.egg[0] === EggGroup.Undiscovered) {
			// this pokemon cannot breed, no results to be shown
			return;
		}

		// array of results found
		let results = [];
		// string for which egg group field to use
		// "gen8egg" is the updated egg groups for gen 8
		// "egg" is the egg groups for all previous gens
		let eggField = e.parent.useGen8EggsCheckbox.checked ? "gen8egg" : "egg";

		// for each entry in pokedex
		for (let i = 0; i < pokedex.length; i++) {
			// reference to current pokedex entry
			let dexEntry = pokedex[i];

			// special cases for ditto
			// if selected entry is not ditto and current dex entry is ditto
			if (selectedEntry[eggField][0] !== EggGroup.Ditto && dexEntry[eggField][0] === EggGroup.Ditto) {
				// any non-undiscovered pokemon can breed with ditto
				results.push(dexEntry);
				continue;
			}

			// if selected entry is ditto and current dex entry is not undiscovered
			if (selectedEntry[eggField][0] === EggGroup.Ditto && dexEntry[eggField][0] !== EggGroup.Undiscovered) {
				// ditto can breed with any non-undiscovered pokemon
				results.push(dexEntry);
				continue;
			}

			// boolean value for an early escape condition for when a match is found in any egg group
			let foundMatch = false;
			// for each egg group in selected entry
			for (let j = 0; j < selectedEntry[eggField].length; j++) {
				// for each egg group in dex entry
				for (let k = 0; k < dexEntry[eggField].length; k++) {
					// if selected entry egg group matches a dex entry egg group
					if (selectedEntry[eggField][j] === dexEntry[eggField][k]) {
						// push this dex entry to results array
						results.push(dexEntry);
						// set early escape condition
						foundMatch = true;
						break;
					}
				}

				// if early escape condition is true
				if (foundMatch) {
					// stop looking through selected entry's egg groups
					// this is pretty non-consequential since there are only 2 possible egg groups
					// keeping this in case this tool ever needs updated for radical changes in the games
					break;
				}
			}
		}

		// for each entry in results array
		for (let i = 0; i < results.length; i++) {
			// reference to current result entry
			let resultEntry = results[i];
			// reference to array of result egg groups
			let resultEggGroups = resultEntry[eggField];

			// percentage of result background that egg group will occupy
			let w = (1.0/resultEggGroups.length)*100.0;
			// string for gradient of result node background-image style property
			let gradientStopsString = ""

			// for each egg group in result entry
			for (let j = 0; j < resultEggGroups.length; j++) {
				// reference to current egg group in result egg group array
				let eggGroup = resultEggGroups[j];

				// append stop to gradient style string
				gradientStopsString += makeGradientStopString(EggGroupColor[eggGroup.toString()], w);

				// if this is not the last egg group
				if (j < resultEggGroups.length-1) {
					// add a comma to the gradient style string
					gradientStopsString += ", ";
				}
			}

			// create result entry div element
			let resultNode = document.createElement("div");
			// assign field "parent" to "this" object
			resultNode.parent = this;
			// assign field "resultName" to the english name of the result entry
			resultNode.resultName = resultEntry["name"]["english"];
			// assign field "eggGroups" to a reference of the array of eggGroups in result entry
			resultNode.eggGroups = resultEggGroups;
			// set the result entry class name to apply css style
			resultNode.className = "result-entry";
			// assign gradient to background-image property of result entry style
			resultNode.style.backgroundImage = "linear-gradient(to right, " + gradientStopsString + ")";
			// add event listener for when result entry is clicked
			resultNode.addEventListener("click", function(e) { e.target.parent.resultClicked(e.target); });

			// create result text label element
			let resultTextNode = document.createElement("label");
			// assign some of the same values to the text of result entry
			// this is in case the text is clicked and not the box part of a result
			// the event from the parent node propagates to all the children
			// this is also why no event listener is added to the text child
			resultTextNode.parent = this;
			resultTextNode.resultName = resultNode.resultName;
			resultTextNode.eggGroups = resultNode.eggGroups;
			// set the result entry class name to apply css style
			resultTextNode.className = "result-entry-text";
			// set the text inside the result entry
			resultTextNode.innerHTML = resultNode.resultName;

			// add text node to result node
			resultNode.appendChild(resultTextNode);
			// add result node to results container element
			e.parent.resultsElement.appendChild(resultNode);
		}
	}
}