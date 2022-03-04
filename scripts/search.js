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

let totalPages;
let page = 1;

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
		_generateMediaCard();
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
		_closeDropdown();
		_activeFilters();
		_generateMediaCard();
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
		_closeDropdown();
		_activeFilters();
		_generateMediaCard();
	}
});

sortDropdown.addEventListener("click", (e) => {
	if (e.target.classList.contains("sort__dropdown__option")) {
		activeSortTitle.dataset.sort = e.target.dataset.sort;
		activeSortTitle.innerHTML = `<i class="fi fi-rs-sort"></i>${e.target.textContent}`;
		_closeDropdown();
		_generateMediaCard();
	}
});

query.addEventListener("input", () => {
	_activeFilters();
	if (query.value.length >= 3) _generateMediaCard();
});

const loadMedia = function (entries, observer) {
	if (entries[0].isIntersecting) {
		observer.unobserve(entries[0].target);
		if (page <= totalPages) page += 1;
		_generateMediaCard((load = true));
	}
};
const observer = new IntersectionObserver(loadMedia, { threshold: [0.5] });

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

const _getUserQuery = function () {
	const genres = genreDropdown.querySelectorAll(".checked");
	const type = typeDropdown.querySelector(".checked");
	const status = statusDropdown.querySelector(".checked");

	return {
		q: query.value ? query.value : "",
		genres: genres.length > 0 ? [...genres].map((g) => g.dataset.genreId) : [],
		type: type ? type.textContent : "",
		status: status ? status.textContent : "",
		order: activeSortTitle.dataset.sort,
		sort: activeSortTitle.dataset.sort === "title" ? "asc" : "desc",
	};
};

const _activeFilters = function () {
	let activeFilters = "";
	const filters = _getUserQuery();
	const genresNames = genreDropdown.querySelectorAll(".checked");

	if (filters.q) activeFilters += `<div class="active__filter">Search: ${filters.q}</div>\n`;
	if (genresNames.length > 0) {
		genresNames.forEach((g) => {
			activeFilters += `<div class="active__filter">${g.textContent}</div>\n`;
		});
	}
	if (filters.type) activeFilters += `<div class="active__filter">${filters.type}</div>\n`;
	if (filters.status) activeFilters += `<div class="active__filter">${filters.status}</div>\n`;

	if (activeFilters) activeFilterContainer.innerHTML = activeFilters;
	else activeFilterContainer.innerHTML = "";
};

const _ratingIcon = function (rating) {
	if (!rating) return "";
	else if (rating <= 4) return `<i class="fi fi-rs-sad"></i>`;
	else if (rating >= 7) return `<i class="fi fi-rs-smile"></i>`;
	else return `<i class="fi fi-rs-meh"></i>`;
};

const _generateGenreElements = function (genres) {
	let tags = "";
	genres.slice(0, 5).forEach((g) => {
		tags += `<span class="media__card__info__genre">${g.name}</span>\n`;
	});
	return tags;
};

const _generateMediaCard = function (load = false) {
	setTimeout(() => {
		let cards = "";
		const container = document.querySelector(".results");
		const query = _getUserQuery();
		const url =
			`https://api.jikan.moe/v4/anime?q=${query.q}&page=${page}&` +
			`type=${query.type}&status=${query.status}&sfw=true` +
			`&genres=${[...query.genres]}&order_by=${query.order}&sort=${query.sort}`;

		console.log(url);
		fetch(url)
			.then((res) => res.json())
			.then((data) => {
				totalPages = data.pagination.last_visible_page;
				data.data.forEach((media) => {
					cards += `<div class="media__card">
								<div class="media__card__cover">
									<img src="${media.images.jpg.large_image_url}" alt="">
								</div>
								<div class="media__card__info">
									<div class="media__card__info__header-wrap">
										<a href="#" class="media__card__info__title">${media.title}</a>
										<p class="media__card__info__score">${_ratingIcon(media.score)}
										${media.score ? media.score.toString().padEnd(4, 0): ''}</p>
									</div>
									<div class="media__card__info__extra-wrap">
										<p class="media__card__info__extra">
										${media.type}
										${media.episodes ? " • " + media.episodes + " Episode" : ""}${media.episodes > 1 ? "s" : ""}
										</p>
									</div>
									<div class="media__card__info__genres-wrap">${_generateGenreElements(media.genres)}
									</div>
									<div class="media__card__info__plot-wrap">
										<p class="media__card__info__synopsis">
										${media.synopsis ? media.synopsis.replace("[Written by MAL Rewrite]", ""): ''}
										</p>
									</div>
								</div>
							</div>`
				});
				if (load) {
					container.insertAdjacentHTML("beforeend", cards);
				} else {
					container.innerHTML = cards;
					page = 1;
				}

				let loadedCards = container.children;
				observer.observe(loadedCards.item(loadedCards.length - 4));
			});
	}, 1000);
};
