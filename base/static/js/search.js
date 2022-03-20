const mediaDropdownBtn = document.querySelector(".media-type");
const mediaDropdown = document.querySelector(".type__dropdown__list");

const filterFields = document.querySelector(".filter__field__container");

const genreDropdown = document.querySelector(".genres__list");
const genreBox = document.querySelector("#genre-value");
let selectedGenres = new Set();

const typeDropdown = document.querySelector(".type__list");
const typeBox = document.querySelector("#type-value");
let selectedType;

const statusDropdown = document.querySelector(".status__list");
const statusBox = document.querySelector("#status-value");
let selectedStatus;

const sortBtn = document.querySelector(".sort__method");
const sortDropdown = document.querySelector(".sort__list");
const activeSortTitle = document.querySelector(".sort__method");

const activeFilterContainer = document.querySelector(".active__filter-wrap");
const query = document.querySelector("#query");

let nextPage;
let mediaType = mediaDropdownBtn.textContent.toLowerCase();

// Grab only the Genres and not the Tags
const allGenres = new Set(
	[...genreDropdown.querySelectorAll(".filter__dropdown__option")]
		.slice(0, 16)
		.map((g) => g.textContent)
);

/**
 * Resets everything back to Default.
 */
const reset = function () {
	nextPage = "";
	selectedGenres = new Set();
	selectedType = null;
	selectedStatus = null;

	document.querySelector(".results").innerHTML = "";
	activeFilterContainer.innerHTML = "";
	query.value = "";
	activeSortTitle.innerHTML = `<i data-feather="code" class="sort-icon"></i>Score`;
	genreBox.innerHTML = `<p class="field__placeholder">Any</p>
		<div class="tag-wrap">
			<span class="tag first-tag"></span>
			<span class="tag other-tag"></span>
		</div>
		<i data-feather="chevron-down" class="drop-icon"></i>`;
	feather.replace();
	typeBox.querySelector(".field__placeholder").innerHTML = "Any";
	statusBox.querySelector(".field__placeholder").innerHTML = "Any";
	const selectedOpt = [...document.querySelectorAll(".filter__dropdown__option--selected")];
	selectedOpt.forEach((opt) => {
		opt.classList.remove("filter__dropdown__option--selected");
		opt.querySelector("svg").remove();
	});
};

/**
 * Replaces Filter options when media type is switched.
 */
const switchType = function () {
	if (mediaType === "manga") {
		typeDropdown.innerHTML = `<ul class="filter__dropdown__list">
			<li class="filter__dropdown__option">Manga</li>
			<li class="filter__dropdown__option">Novel</li>
			<li class="filter__dropdown__option">Manhwa</li>
			<li class="filter__dropdown__option">Manhua</li>
			<li class="filter__dropdown__option">Doujin</li>
		</ul>`;

		statusDropdown.innerHTML = `<ul class="filter__dropdown__list">
				<li class="filter__dropdown__option">Current</li>
				<li class="filter__dropdown__option">Finished</li>
				<li class="filter__dropdown__option">Upcoming</li>
				<li class="filter__dropdown__option">Unreleased</li>
			</ul>`;
	} else {
		typeDropdown.innerHTML = `<ul class="filter__dropdown__list">
			<li class="filter__dropdown__option">TV</li>
			<li class="filter__dropdown__option">Movie</li>
			<li class="filter__dropdown__option">Special</li>
			<li class="filter__dropdown__option">OVA</li>
			<li class="filter__dropdown__option">ONA</li>
		</ul>`;

		statusDropdown.innerHTML = `<ul class="filter__dropdown__list">
			<li class="filter__dropdown__option">Current</li>
			<li class="filter__dropdown__option">Finished</li>
			<li class="filter__dropdown__option">Upcoming</li>
			<li class="filter__dropdown__option">Unreleased</li>
			</ul>`;
	}
};

/**
 * Flip the Dropdown Icon.
 * @param {element} dropdown The dropdown that was clicked.
 * @param {element} icon The icon that needs to be flipped.
 */
const flipIcon = function (dropdown, icon) {
	if (dropdown.className.includes("open")) icon.style.transform = "rotate(180deg)";
	else icon.style.transform = "rotate(0deg)";
};

/**
 * Closes all the dropdown.
 * @param {element} ignore The Dropdown that should remain open.
 */
const closeDropdown = function (ignore) {
	const dropdowns = document.querySelectorAll(".dropdown");
	dropdowns.forEach((d) => {
		if (d.classList.contains("dropdown--open") && d !== ignore)
			d.classList.remove("dropdown--open");
	});
};

/**
 * Displays the selected genres in the genre field.
 * @param {NodeList} elements Selected genres.
 */
const showMultiTags = function (elements) {
	if (elements.size !== 0) {
		let selected = [...elements];
		genreBox.querySelector(".field__placeholder").classList.add("field__placeholder--hide");
		genreBox.querySelector(".tag-wrap").classList.add("tag-wrap--show");
		genreBox.querySelector(".first-tag").classList.add("tag--show");
		genreBox.querySelector(".first-tag").innerHTML = selected[0];
		if (elements.size > 1) {
			// Simplify extra genres into count when more than one genre is selected.
			genreBox.querySelector(".other-tag").classList.add("tag--show");
			genreBox.querySelector(".other-tag").innerHTML = `+${elements.size - 1}`;
		} else {
			genreBox.querySelector(".other-tag").classList.remove("tag--show");
			genreBox.querySelector(".other-tag").innerHTML = "";
		}
	} else {
		genreBox.querySelector(".field__placeholder").classList.remove("field__placeholder--hide");
		genreBox.querySelector(".tag-wrap").classList.remove("tag-wrap--show");
		genreBox.querySelector(".first-tag").classList.remove("tag--show");
		genreBox.querySelector(".first-tag").innerHTML = "";
	}
};

/**
 * Returns the filter values the user selected.
 * @returns {object} Filter Values.
 */
const getUserQuery = function () {
	const genres = genreDropdown.querySelectorAll(".filter__dropdown__option--selected");
	const type = typeDropdown.querySelector(".filter__dropdown__option--selected");
	const status = statusDropdown.querySelector(".filter__dropdown__option--selected");

	return {
		q: query.value ? query.value : "",
		// Extracting the name of the genre
		genres: genres.length > 0 ? [...genres].map((g) => g.textContent) : [],
		type: type ? type.textContent : "",
		status: status ? status.textContent : "",
		sort: activeSortTitle.dataset.sort,
	};
};

/**
 * Displays all the filters that were selected by the user.
 */
const activeFilters = function () {
	let activeFilters = "";
	const filters = getUserQuery();

	if (filters.q)
		activeFilters += `<div class="active__filter__item">Search: ${filters.q}</div>\n`;
	if (filters.genres.length > 0) {
		filters.genres.forEach((g) => {
			activeFilters += `<div class="active__filter__item">${g}</div>\n`;
		});
	}
	if (filters.type) activeFilters += `<div class="active__filter__item">${filters.type}</div>\n`;
	if (filters.status)
		activeFilters += `<div class="active__filter__item">${filters.status}</div>\n`;

	if (activeFilters) {
		activeFilterContainer.innerHTML = activeFilters;
	} else {
		activeFilterContainer.innerHTML = "";
	}
};

/**
 * Returns a mood icon based on rating.
 * @param {Number} rating Average rating of then media
 * @returns {string} A HTML string that of the respective icon
 */
const ratingIcon = function (rating) {
	if (!rating) return "";
	else if (rating <= 45) return `<i data-feather="frown"></i>`;
	else if (rating >= 75) return `<i data-feather="smile"></i>`;
	else return `<i data-feather="meh"></i>`;
};

/**
 * Generates a collection of Genre elements for a specific media.
 * @param {object} listGenres All the genres related to the fetched media collection.
 * @param {object} mediaGenres All the genres of the specific media.
 * @returns {string} The collection of genre elements respective to specific media.
 */
const generateGenreElements = function (listGenres, mediaGenres) {
	let tags = "";
	let tagCount = 0;

	// Checks if the id of the genre in the media matches with any genre in the collection to get the genre title.
	for (let mg of mediaGenres) {
		for (let lg of listGenres) {
			if (mg && mg.id === lg.id) {
				if (allGenres.has(lg.attributes.title)) {
					tags += `<span class="media__card__info__genre">${lg.attributes.title}</span>\n`;
					tagCount++;
					break;
				}
			}
		}
		// Ensure only four genre are displayed since elements might overflow on the card
		if (tagCount >= 4) return tags;
	}
	return tags;
};

/**
 * Formats the Extra Info (episodes, runtime, chapters) of the media.
 * @param {object} media The media that needs to be formatted.
 * @returns {string} Formatted Extra Info.
 */
const formatExtraInfo = function (media) {
	if (media.subtype === "TV") {
		return (
			`${media.episodeCount ? " • " + media.episodeCount + " Episode" : ""}` +
			`${media.episodeCount > 1 ? "s" : ""}`
		);
	} else if (media.subtype === "movie") {
		let hour = Math.floor(media.totalLength / 60);
		let minutes = Math.floor(media.totalLength % 60);
		return (
			`${hour || minutes ? " • " : ""}` +
			`${hour ? hour + " Hour" : ""}` +
			`${hour > 1 ? "s" : ""}` +
			`${minutes ? " " + minutes + " Minute" : ""}` +
			`${minutes > 1 ? "s" : ""}`
		);
	}
	return (
		`${media.chapterCount ? " • " + media.chapterCount + " Chapter" : ""}` +
		`${media.chapterCount > 1 ? "s" : ""}`
	);
};

/**
 * Construct the API Path based on user query.
 * @returns {string} The API Path.
 */
const constructUrl = function () {
	const query = getUserQuery();
	let base = `https://kitsu.io/api/edge/${mediaType}?include=categories&page[limit]=20&`;

	if (query.q) base += `filter[text]=${query.q}&`;
	if (query.type) base += `filter[subtype]=${query.type}&`;
	if (query.status) base += `filter[status]=${query.status}&`;
	if (query.genres.length) base += `filter[categories]=${[...query.genres]}&`;
	if (!query.q) base += `sort=${query.sort}`; //FIXME: Sort by "Title" doesn't work when filters are applied
	return base;
};

/**
 * Renders the media cards based on search results.
 * @param {boolean} [load=false] Determines whether new cards should be rendered below or replace the existing cards.
 */
const generateMediaCard = function (load = false) {
	let url;
	let cards = "";
	const container = document.querySelector(".results");
	
	if (load) url = nextPage;
	else url = constructUrl();
	
	// Add a delay on fetching data to avoid exhausting API rate.
	setTimeout(() => {
		fetch(url)
			.then((res) => res.json())
			.then((data) => {
				data.data.forEach((x) => {
					media = x.attributes;
					cards += `<div class="media__card">
								<div class="media__card__cover">
									<img src="${media.posterImage.medium}" alt="">
								</div>
								<div class="media__card__info">
									<div class="media__card__info__header-wrap">
										<a href="/${mediaType}/${x.id}/${media.slug}" class="media__card__info__title">${media.canonicalTitle}</a>
										<p class="media__card__info__score">${ratingIcon(Number(media.averageRating))}
										${media.averageRating ? Math.round(Number(media.averageRating)) + "%" : ""}</p>
									</div>
									<div class="media__card__info__extra-wrap">
										<p class="media__card__info__extra">
										${media.subtype}
										${formatExtraInfo(media)}
										</p>
									</div>
									<div class="media__card__info__genres-wrap">${generateGenreElements(
										data.included,
										x.relationships.categories.data
									)}
									</div>
									<div class="media__card__info__plot-wrap">
										<p class="media__card__info__synopsis">
										${media.synopsis ? media.synopsis : ""}
										</p>
									</div>
								</div>
							</div>`;
				});

				if (load) {
					container.insertAdjacentHTML("beforeend", cards);
				} else {
					container.innerHTML = cards;
				}
				feather.replace();

				nextPage = data.links.next ? data.links.next : null;

				let loadedCards = container.children;
				observer.observe(loadedCards.item(loadedCards.length - 4));
			});
	}, 1000);
};

/**
 * Observer function that helps to load new media on scroll.
 * @param {object} entries The elements being observed by th observer.
 * @param {object} observer The Observer object.
 */
const loadMedia = function (entries, observer) { 
	if (entries[0].isIntersecting) {
		// Stop observing the element when it comes into view once.
		// This prevents the page from loading new media every time the element comes into view.
		observer.unobserve(entries[0].target);
		if (nextPage) generateMediaCard((load = true));
	}
};

const observer = new IntersectionObserver(loadMedia, { threshold: [0.5] });

mediaDropdownBtn.addEventListener("click", () => {
	const dropdown = document.querySelector(".type__dropdown");
	let dropdownIcon = mediaDropdownBtn.firstElementChild;
	closeDropdown(dropdown);
	dropdown.classList.toggle("dropdown--open");
	flipIcon(dropdown, dropdownIcon);
});

filterFields.addEventListener("click", (e) => {
	const filterBox = e.target.closest(".field");
	const dropdown = e.target.closest(".field").querySelector(".filter__dropdown");
	let dropdownIcon = filterBox.querySelector(".drop-icon");

	if (!dropdown.contains(e.target)) {
		closeDropdown(dropdown);
		dropdown.classList.toggle("dropdown--open");
		flipIcon(dropdown, dropdownIcon);
	}
});

sortBtn.addEventListener("click", (e) => {
	const dropdown = document.querySelector(".sort__dropdown");
	if (!dropdown.contains(e.target)) {
		closeDropdown(dropdown);
		dropdown.classList.toggle("dropdown--open");
	}
});

mediaDropdown.addEventListener("click", (e) => {
	if (e.target.classList.contains("type__dropdown__option")) {
		mediaDropdownBtn.innerHTML = `${e.target.textContent}<i data-feather="chevron-down" class="media-type__icon"></i>`;
		feather.replace();
		mediaType = e.target.textContent.toLowerCase();
		closeDropdown();
		reset();
		switchType();
	}
});

genreDropdown.addEventListener("click", (e) => {
	if (e.target.classList.contains("filter__dropdown__option")) {
		if (!e.target.classList.contains("filter__dropdown__option--selected")) {
			e.target.insertAdjacentHTML("beforeend", `<i data-feather="check"></i>`);
			feather.replace();
			selectedGenres.add(e.target.textContent);
		} else {
			e.target.querySelector("svg").remove();
			selectedGenres.delete(e.target.textContent);
		}
		e.target.classList.toggle("filter__dropdown__option--selected");
		showMultiTags(selectedGenres);
		activeFilters();
		generateMediaCard();
	}
});

typeDropdown.addEventListener("click", (e) => {
	if (e.target.classList.contains("filter__dropdown__option")) {
		if (!e.target.classList.contains("filter__dropdown__option--selected")) {
			if (selectedType) {
				selectedType.querySelector("svg").remove();
				selectedType.classList.remove("filter__dropdown__option--selected");
			}
			selectedType = e.target;
			selectedType.insertAdjacentHTML("beforeend", `<i data-feather="check"></i>`);
			feather.replace();
			selectedType.classList.add("filter__dropdown__option--selected");
			typeBox.querySelector(".field__placeholder").innerText = selectedType.textContent;
		} else {
			e.target.querySelector("svg").remove();
			e.target.classList.remove("filter__dropdown__option--selected");
			selectedType = null;
			typeBox.querySelector(".field__placeholder").innerText = "Any";
		}
		closeDropdown();
		activeFilters();
		generateMediaCard();
	}
});

statusDropdown.addEventListener("click", (e) => {
	if (e.target.classList.contains("filter__dropdown__option")) {
		if (!e.target.classList.contains("filter__dropdown__option--selected")) {
			if (selectedStatus) {
				selectedStatus.querySelector("svg").remove();
				selectedStatus.classList.remove("filter__dropdown__option--selected");
			}
			selectedStatus = e.target;
			selectedStatus.insertAdjacentHTML("beforeend", `<i data-feather="check"></i>`);
			feather.replace();
			selectedStatus.classList.add("filter__dropdown__option--selected");
			statusBox.querySelector(".field__placeholder").innerText = selectedStatus.textContent;
		} else {
			e.target.querySelector("svg").remove();
			e.target.classList.remove("filter__dropdown__option--selected");
			selectedStatus = null;
			statusBox.querySelector(".field__placeholder").innerText = "Any";
		}
		closeDropdown();
		activeFilters();
		generateMediaCard();
	}
});

sortDropdown.addEventListener("click", (e) => {
	if (e.target.classList.contains("sort__dropdown__option")) {
		activeSortTitle.dataset.sort = e.target.dataset.sort;
		activeSortTitle.innerHTML = `<i data-feather="code" class="sort-icon"></i>${e.target.textContent}`;
		feather.replace();
		closeDropdown();
		generateMediaCard();
	}
});

query.addEventListener("input", () => {
	activeFilters();
	if (query.value.length >= 3) generateMediaCard();
});
