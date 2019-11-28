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

		let textBuffer = "";
		for (let i = 0; i < compat.length; i++) {
			textBuffer += "<div class=\"result-entry\">" + compat[i]["name"]["english"] + "</div>";
		}
		e.parent.resultsElements.innerHTML = textBuffer;
	}
}