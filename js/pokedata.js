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
	Dragon: 		1 << 13,
	_14: 			1 << 14,
	_15: 			1 << 15,
	_16: 			1 << 16,
	_17: 			1 << 17,
	_18: 			1 << 18,
	_19: 			1 << 19,
	_20: 			1 << 20,
	_21: 			1 << 21,
	_22: 			1 << 22,
	_23: 			1 << 23,
	_24: 			1 << 24,
	_25: 			1 << 25,
	_26: 			1 << 26,
	_27: 			1 << 27,
	_28: 			1 << 28,
	_29: 			1 << 29,
	_30: 			1 << 30,
	_31: 			1 << 31,
};

var EggGroupColor = {
	Undiscovered: "#000000",
	Monster: "#d25064",
	Water1: "#97b5fd",
	Bug: "#a8b820",
	Flying: "#a890f0",
	Field: "#e0c068",
	Fairy: "#ee99ac",
	Grass: "#78c850",
	HumanLike: "#d29682",
	Water3: "#5876be",
	Mineral: "#7a6252",
	Amorphous: "#8a8a8a",
	Water2: "#729afa",
	Ditto: "#a664bf",
	Dragon: "#7038f8",
};

class PokeSelect {
	selectElement = null;
	resultsElements = null;

	useGen8EggsCheckbox = null;

	constructor(selectElement, resultsElements, useGen8EggsCheckbox) {
		this.selectElement = selectElement;
		this.selectElement.parent = this;

		this.resultsElements = resultsElements;
		this.resultsElements.parent = this;

		this.useGen8EggsCheckbox = useGen8EggsCheckbox;
		this.useGen8EggsCheckbox.parent = this;

		for (let i = 0; i < pokedex.length; i++) {
			let opt = document.createElement("option");
			opt.innerHTML = pokedex[i]["name"]["english"];
			opt.dexEntry = pokedex[i];
			this.selectElement.appendChild(opt);
		}

		this.selectElement.selectedIndex = -1;
		this.selectElement.addEventListener("change", function(e) { e.target.parent.selectionChanged(e.target); });

		this.useGen8EggsCheckbox.addEventListener("change", function(e) { e.target.parent.useGen8EggsChanged(e.target); });
	}

	useGen8EggsChanged(e) {
		e.parent.selectionChanged(e.parent.selectElement);
	}

	resultClicked(e) {
		//console.log(e.resultName);
		for (let i = 0; i < e.parent.selectElement.options.length; i++) {
			if (e.parent.selectElement.options[i].value === e.resultName) {
				e.parent.selectElement.value = e.resultName;
				e.parent.selectionChanged(e.parent.selectElement);
				break;
			}
		}
	}

	selectionChanged(e) {
		e.parent.resultsElements.innerHTML = "";

		if (e.options[e.selectedIndex] === undefined || e.options[e.selectedIndex] === null) {
			return;
		}

		let entry = e.options[e.selectedIndex].dexEntry;
		if (entry.egg[0] === EggGroup.Undiscovered) {
			// this pokemon cannot breed
			return;
		}

		let compat = [];
		let eggMember = e.parent.useGen8EggsCheckbox.checked ? "gen8egg" : "egg";

		for (let i = 0; i < pokedex.length; i++) {
			// special cases for ditto
			if (entry[eggMember][0] !== EggGroup.Ditto && pokedex[i][eggMember][0] === EggGroup.Ditto) {
				// any non-undiscovered pokemon can breed with ditto
				compat.push(pokedex[i]);
				continue;
			}

			if (entry[eggMember][0] === EggGroup.Ditto && pokedex[i][eggMember][0] !== EggGroup.Undiscovered) {
				// ditto can breed with any non-undiscovered pokemon
				compat.push(pokedex[i]);
				continue;
			}

			let foundMatch = false;
			for (let j = 0; j < entry[eggMember].length; j++) {
				for (let k = 0; k < pokedex[i][eggMember].length; k++) {
					if (entry[eggMember][j] === pokedex[i][eggMember][k]) {
						compat.push(pokedex[i]);
						foundMatch = true;
						break;
					}
				}

				if (foundMatch) {
					break;
				}
			}
		}

		for (let i = 0; i < compat.length; i++) {
			let eggGroupCount = compat[i][eggMember].length;
			let w = (1.0/eggGroupCount)*100.0;
			let grad = ""

			let isFirst = true;
			for (let j = 0; j < eggGroupCount; j++) {
				if (isFirst) {
					if (compat[i][eggMember][j] === EggGroup.Monster) {
						grad += EggGroupColor.Monster + "," + EggGroupColor.Monster + " " + w.toString() + "%";
					}
					else if (compat[i][eggMember][j] === EggGroup.Water1) {
						grad += EggGroupColor.Water1 + "," + EggGroupColor.Water1 + " " + w.toString() + "%";
					}
					else if (compat[i][eggMember][j] === EggGroup.Bug) {
						grad += EggGroupColor.Bug + "," + EggGroupColor.Bug + " " + w.toString() + "%";
					}
					else if (compat[i][eggMember][j] === EggGroup.Flying) {
						grad += EggGroupColor.Flying + "," + EggGroupColor.Flying + " " + w.toString() + "%";
					}
					else if (compat[i][eggMember][j] === EggGroup.Field) {
						grad += EggGroupColor.Field + "," + EggGroupColor.Field + " " + w.toString() + "%";
					}
					else if (compat[i][eggMember][j] === EggGroup.Fairy) {
						grad += EggGroupColor.Fairy + "," + EggGroupColor.Fairy + " " + w.toString() + "%";
					}
					else if (compat[i][eggMember][j] === EggGroup.Grass) {
						grad += EggGroupColor.Grass + "," + EggGroupColor.Grass + " " + w.toString() + "%";
					}
					else if (compat[i][eggMember][j] === EggGroup.HumanLike) {
						grad += EggGroupColor.HumanLike + "," + EggGroupColor.HumanLike + " " + w.toString() + "%";
					}
					else if (compat[i][eggMember][j] === EggGroup.Water3) {
						grad += EggGroupColor.Water3 + "," + EggGroupColor.Water3 + " " + w.toString() + "%";
					}
					else if (compat[i][eggMember][j] === EggGroup.Mineral) {
						grad += EggGroupColor.Mineral + "," + EggGroupColor.Mineral + " " + w.toString() + "%";
					}
					else if (compat[i][eggMember][j] === EggGroup.Amorphous) {
						grad += EggGroupColor.Amorphous + "," + EggGroupColor.Amorphous + " " + w.toString() + "%";
					}
					else if (compat[i][eggMember][j] === EggGroup.Water2) {
						grad += EggGroupColor.Water2 + "," + EggGroupColor.Water2 + " " + w.toString() + "%";
					}
					else if (compat[i][eggMember][j] === EggGroup.Ditto) {
						grad += EggGroupColor.Ditto + "," + EggGroupColor.Ditto + " " + w.toString() + "%";
					}
					else if (compat[i][eggMember][j] === EggGroup.Dragon) {
						grad += EggGroupColor.Dragon + "," + EggGroupColor.Dragon + " " + w.toString() + "%";
					} else {
						grad += EggGroupColor.Undiscovered + "," + EggGroupColor.Undiscovered + " " + w.toString() + "%";
					}

					isFirst = false;
				}
				else {
					if (compat[i][eggMember][j] === EggGroup.Monster) {
						grad += EggGroupColor.Monster + " " + w.toString() + "%, " + EggGroupColor.Monster;
					}
					else if (compat[i][eggMember][j] === EggGroup.Water1) {
						grad += EggGroupColor.Water1 + " " + w.toString() + "%, " + EggGroupColor.Water1;
					}
					else if (compat[i][eggMember][j] === EggGroup.Bug) {
						grad += EggGroupColor.Bug + " " + w.toString() + "%, " + EggGroupColor.Bug;
					}
					else if (compat[i][eggMember][j] === EggGroup.Flying) {
						grad += EggGroupColor.Flying + " " + w.toString() + "%, " + EggGroupColor.Flying;
					}
					else if (compat[i][eggMember][j] === EggGroup.Field) {
						grad += EggGroupColor.Field + " " + w.toString() + "%, " + EggGroupColor.Field;
					}
					else if (compat[i][eggMember][j] === EggGroup.Fairy) {
						grad += EggGroupColor.Fairy + " " + w.toString() + "%, " + EggGroupColor.Fairy;
					}
					else if (compat[i][eggMember][j] === EggGroup.Grass) {
						grad += EggGroupColor.Grass + " " + w.toString() + "%, " + EggGroupColor.Grass;
					}
					else if (compat[i][eggMember][j] === EggGroup.HumanLike) {
						grad += EggGroupColor.HumanLike + " " + w.toString() + "%, " + EggGroupColor.HumanLike;
					}
					else if (compat[i][eggMember][j] === EggGroup.Water3) {
						grad += EggGroupColor.Water3 + " " + w.toString() + "%, " + EggGroupColor.Water3;
					}
					else if (compat[i][eggMember][j] === EggGroup.Mineral) {
						grad += EggGroupColor.Mineral + " " + w.toString() + "%, " + EggGroupColor.Mineral;
					}
					else if (compat[i][eggMember][j] === EggGroup.Amorphous) {
						grad += EggGroupColor.Amorphous + " " + w.toString() + "%, " + EggGroupColor.Amorphous;
					}
					else if (compat[i][eggMember][j] === EggGroup.Water2) {
						grad += EggGroupColor.Water2 + " " + w.toString() + "%, " + EggGroupColor.Water2;
					}
					else if (compat[i][eggMember][j] === EggGroup.Ditto) {
						grad += EggGroupColor.Ditto + " " + w.toString() + "%, " + EggGroupColor.Ditto;
					}
					else if (compat[i][eggMember][j] === EggGroup.Dragon) {
						grad += EggGroupColor.Dragon + " " + w.toString() + "%, " + EggGroupColor.Dragon;
					} else {
						grad += EggGroupColor.Undiscovered + " " + w.toString() + "%, " + EggGroupColor.Undiscovered;
					}
				}

				if (j < eggGroupCount-1) {
					grad += ", ";
				}
			}

			let bgImage = "background-image: linear-gradient(to right, " + grad + ");"

			let resultEntry = document.createElement("div");
			resultEntry.parent = this;
			resultEntry.resultName = compat[i]["name"]["english"];
			resultEntry.className = "result-entry";
			resultEntry.style = bgImage;
			resultEntry.addEventListener("click", function(e) { e.target.parent.resultClicked(e.target); });

			let resultEntryText = document.createElement("label");
			resultEntryText.parent = this;
			resultEntryText.resultName = resultEntry.resultName;
			resultEntryText.className = "result-entry-text";
			resultEntryText.innerHTML = resultEntry.resultName;

			resultEntry.appendChild(resultEntryText);
			e.parent.resultsElements.appendChild(resultEntry);
		}
	}
}