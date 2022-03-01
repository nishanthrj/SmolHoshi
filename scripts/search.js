const dropdownBtn = document.querySelector(".type");

const filterFields = document.querySelector(".filter-field-container");

const genreDropdown = document.querySelector(".genres__list");
const genreBox = document.querySelector("#genre-value");
const selectedGenres = new Set();

const typeDropdown = document.querySelector(".type__list");
const typeBox = document.querySelector("#type-value");
let selectedType;

const statusDropdown = document.querySelector(".status__list");
const statusBox = document.querySelector("#status-value");
let selectedStatus;

const sortBtn = document.querySelector(".active__sort__method");
const sortDropdown = document.querySelector(".sort__list");
const activeSortTitle = document.querySelector(".active__sort__method");

const activeFilterContainer = document.querySelector(".active__filter-wrap");
const query = document.querySelector("#query");



dropdownBtn.addEventListener("click", () => {
	const dropdown = document.querySelector(".type__dropdown");
	let dropdownIcon = dropdownBtn.firstElementChild;
	_flipIcon(dropdownIcon);
	dropdown.classList.toggle("open-dropdown");
});

filterFields.addEventListener("click", (e) => {
	const filterBox = e.target.closest(".filter");
	const dropdown = e.target.closest(".filter").querySelector(".filter__dropdown");
	let dropdownIcon = filterBox.querySelector(".drop-icon");

	if (!dropdown.contains(e.target)) {
		_closeDropdown(dropdown);
		_flipIcon(dropdownIcon);

		dropdown.classList.toggle("open-dropdown");
	}
});

sortBtn.addEventListener("click", (e) => {
	const dropdown = document.querySelector(".sort__dropdown");
	if (!dropdown.contains(e.target)) {
		_closeDropdown(dropdown);
		dropdown.classList.toggle("open-dropdown");
	}
});

genreDropdown.addEventListener("click", (e) => {
	if (e.target.classList.contains("filter__dropdown__option")) {
		if (!e.target.classList.contains("checked")) {
			e.target.insertAdjacentHTML("beforeend", '<i class="fi fi-rs-check"></i>');
			selectedGenres.add(e.target.textContent);
		} else {
			e.target.querySelector("i").remove();
			selectedGenres.delete(e.target.textContent);
		}
		e.target.classList.toggle("checked");
		_showMultiTags(genreBox, selectedGenres);
		_activeFilters();
	}
});

typeDropdown.addEventListener("click", (e) => {
	if (e.target.classList.contains("filter__dropdown__option")) {
		if (!e.target.classList.contains("checked")) {
			if (selectedType) {
				selectedType.querySelector("i").remove();
				selectedType.classList.remove("checked");
			}
			selectedType = e.target;
			selectedType.insertAdjacentHTML("beforeend", '<i class="fi fi-rs-check"></i>');
			selectedType.classList.add("checked");
			typeBox.querySelector(".placeholder").innerText = selectedType.textContent;
		} else {
			e.target.querySelector("i").remove();
			e.target.classList.remove("checked");
			selectedType = null;
			typeBox.querySelector(".placeholder").innerText = "Any";
		}
		_activeFilters();
		_closeDropdown();
	}
});

statusDropdown.addEventListener("click", (e) => {
	if (e.target.classList.contains("filter__dropdown__option")) {
		if (!e.target.classList.contains("checked")) {
			if (selectedStatus) {
				selectedStatus.querySelector("i").remove();
				selectedStatus.classList.remove("checked");
			}
			selectedStatus = e.target;
			selectedStatus.insertAdjacentHTML("beforeend", '<i class="fi fi-rs-check"></i>');
			selectedStatus.classList.add("checked");
			statusBox.querySelector(".placeholder").innerText = selectedStatus.textContent;
		} else {
			e.target.querySelector("i").remove();
			e.target.classList.remove("checked");
			selectedStatus = null;
			statusBox.querySelector(".placeholder").innerText = "Any";
		}
		_activeFilters();
		_closeDropdown();
	}
});

sortDropdown.addEventListener("click", (e) => {
	if (e.target.classList.contains("sort__dropdown__option")) {
		activeSortTitle.innerHTML = `<i class="fi fi-rs-sort"></i>${e.target.textContent}`;
		_closeDropdown();
	}
});

query.addEventListener("input", () => {
	_activeFilters();
});



const _flipIcon = function (icon) {
	if (icon.className.includes("up")) icon.className = icon.className.replace("up", "down");
	else icon.className = icon.className.replace("down", "up");
};

const _closeDropdown = function (ignore) {
	const dropdowns = document.querySelectorAll(".dropdown");
	dropdowns.forEach((d) => {
		if (d.classList.contains("open-dropdown") && d !== ignore)
			d.classList.remove("open-dropdown");
	});
};

const _showMultiTags = function (container, elements) {
	if (elements.size !== 0) {
		let selected = [...elements];
		container.querySelector(".placeholder").classList.add("hide");
		container.querySelector(".tag-wrap").classList.add("show");
		container.querySelector(".first-tag").classList.add("show");
		container.querySelector(".first-tag").innerHTML = selected[0];
		if (elements.size > 1) {
			container.querySelector(".other-tag").classList.add("show");
			container.querySelector(".other-tag").innerHTML = `+${elements.size - 1}`;
		} else {
			container.querySelector(".other-tag").classList.remove("show");
			container.querySelector(".other-tag").innerHTML = "";
		}
	} else {
		container.querySelector(".placeholder").classList.remove("hide");
		container.querySelector(".tag-wrap").classList.remove("show");
		container.querySelector(".first-tag").classList.remove("show");
		container.querySelector(".first-tag").innerHTML = "";
	}
};

const _activeFilters = function () {
	const genres = genreDropdown.querySelectorAll(".checked");
	const type = typeDropdown.querySelector(".checked");
	const status = statusDropdown.querySelector(".checked");
	let activeFilters = "";

	if (query.value) activeFilters += `<div class="active__filter">Search: ${query.value}</div>\n`;
	if (genres.length > 0) {
		genres.forEach((g) => {
			activeFilters += `<div class="active__filter">${g.textContent}</div>\n`;
		});
	}
	if (type) activeFilters += `<div class="active__filter">${type.textContent}</div>\n`;
	if (status) activeFilters += `<div class="active__filter">${status.textContent}</div>\n`;

	if (activeFilters) activeFilterContainer.innerHTML = activeFilters;
	else activeFilterContainer.innerHTML = "";
};
