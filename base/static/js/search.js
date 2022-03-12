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
const allGenres = new Set(
	[...genreDropdown.querySelectorAll(".filter__dropdown__option")]
		.slice(0, 16)
		.map((g) => g.textContent)
);

const reset = function () {
	nextPage = "";
	selectedGenres = new Set();
	selectedType = null;
	selectedStatus = null;

	document.querySelector(".results").innerHTML = "";
	activeFilterContainer.innerHTML = "";
	query.value = "";
	activeSortTitle.innerHTML = `<i class="fi fi-rs-sort"></i>Popularity`;
	genreBox.innerHTML = `<p class="field__placeholder">Any</p>
		<div class="tag-wrap">
			<span class="tag first-tag"></span>
			<span class="tag other-tag"></span>
		</div>
		<i class="fi fi-rs-angle-small-down drop-icon"></i>`;
	typeBox.querySelector(".field__placeholder").innerHTML = "Any";
	statusBox.querySelector(".field__placeholder").innerHTML = "Any";
	const dropdowns = [...document.querySelectorAll(".filter__dropdown__list")];
	dropdowns.forEach((d) => {
		[...d.children].forEach((opt) => {
			if (opt.classList.contains("filter__dropdown__option--selected")) {
				opt.classList.remove("filter__dropdown__option--selected");
				opt.querySelector(".fi").remove();
			}
		});
	});
};

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

const flipIcon = function (icon) {
	if (icon.className.includes("up")) icon.className = icon.className.replace("up", "down");
	else icon.className = icon.className.replace("down", "up");
};

const closeDropdown = function (ignore) {
	const dropdowns = document.querySelectorAll(".dropdown");
	dropdowns.forEach((d) => {
		if (d.classList.contains("dropdown--open") && d !== ignore)
			d.classList.remove("dropdown--open");
	});
};

const showMultiTags = function (container, elements) {
	if (elements.size !== 0) {
		let selected = [...elements];
		container.querySelector(".field__placeholder").classList.add("field__placeholder--hide");
		container.querySelector(".tag-wrap").classList.add("tag-wrap--show");
		container.querySelector(".first-tag").classList.add("tag--show");
		container.querySelector(".first-tag").innerHTML = selected[0];
		if (elements.size > 1) {
			container.querySelector(".other-tag").classList.add("tag--show");
			container.querySelector(".other-tag").innerHTML = `+${elements.size - 1}`;
		} else {
			container.querySelector(".other-tag").classList.remove("tag--show");
			container.querySelector(".other-tag").innerHTML = "";
		}
	} else {
		container.querySelector(".field__placeholder").classList.remove("field__placeholder--hide");
		container.querySelector(".tag-wrap").classList.remove("tag-wrap--show");
		container.querySelector(".first-tag").classList.remove("tag--show");
		container.querySelector(".first-tag").innerHTML = "";
	}
};

const getUserQuery = function () {
	const genres = genreDropdown.querySelectorAll(".filter__dropdown__option--selected");
	const type = typeDropdown.querySelector(".filter__dropdown__option--selected");
	const status = statusDropdown.querySelector(".filter__dropdown__option--selected");

	return {
		q: query.value ? query.value : "",
		genres: genres.length > 0 ? [...genres].map((g) => g.textContent) : [],
		type: type ? type.textContent : "",
		status: status ? status.textContent : "",
		sort: activeSortTitle.dataset.sort,
	};
};

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

const ratingIcon = function (rating) {
	if (!rating) return "";
	else if (rating <= 45) return `<i class="fi fi-rs-sad"></i>`;
	else if (rating >= 75) return `<i class="fi fi-rs-smile"></i>`;
	else return `<i class="fi fi-rs-meh"></i>`;
};

const generateGenreElements = function (listGenres, mediaGenres) {
	let tags = "";
	let tagCount = 0;

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
		if (tagCount >= 4) return tags;
	}
	return tags;
};

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

const generateMediaCard = function (load = false) {
	setTimeout(() => {
		let url;
		let cards = "";
		const container = document.querySelector(".results");

		if (load) url = nextPage;
		else url = constructUrl();

		fetch(url)
			.then((res) => res.json())
			.then((data) => {
				data.data.forEach((x) => {
					media = x.attributes;
					cards += `<div class="media__card">
								<div class="media__card__cover">
									<img src="${media.posterImage.original}" alt="">
								</div>
								<div class="media__card__info">
									<div class="media__card__info__header-wrap">
										<a href="#" class="media__card__info__title">${media.canonicalTitle}</a>
										<p class="media__card__info__score">${ratingIcon(Number(media.averageRating))}
										${media.averageRating ? Math.round(Number(media.averageRating)) + '%' : ""}</p>
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

				nextPage = data.links.next ? data.links.next : null;

				let loadedCards = container.children;
				observer.observe(loadedCards.item(loadedCards.length - 4));
			});
	}, 1000);
};

const loadMedia = function (entries, observer) {
	if (entries[0].isIntersecting) {
		observer.unobserve(entries[0].target);
		if (nextPage) generateMediaCard((load = true));
	}
};

const observer = new IntersectionObserver(loadMedia, { threshold: [0.5] });

mediaDropdownBtn.addEventListener("click", () => {
	const dropdown = document.querySelector(".type__dropdown");
	let dropdownIcon = mediaDropdownBtn.firstElementChild;
	closeDropdown(dropdown);
	flipIcon(dropdownIcon);
	dropdown.classList.toggle("dropdown--open");
});

filterFields.addEventListener("click", (e) => {
	const filterBox = e.target.closest(".field");
	const dropdown = e.target.closest(".field").querySelector(".filter__dropdown");
	let dropdownIcon = filterBox.querySelector(".drop-icon");

	if (!dropdown.contains(e.target)) {
		closeDropdown(dropdown);
		flipIcon(dropdownIcon);

		dropdown.classList.toggle("dropdown--open");
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
		mediaDropdownBtn.innerHTML = `${e.target.textContent}<i class="fi fi-rs-angle-small-down media-type__icon"></i>`;
		mediaType = e.target.textContent.toLowerCase();
		closeDropdown();
		reset();
		switchType();
	}
});

genreDropdown.addEventListener("click", (e) => {
	if (e.target.classList.contains("filter__dropdown__option")) {
		if (!e.target.classList.contains("filter__dropdown__option--selected")) {
			e.target.insertAdjacentHTML("beforeend", '<i class="fi fi-rs-check"></i>');
			selectedGenres.add(e.target.textContent);
		} else {
			e.target.querySelector("i").remove();
			selectedGenres.delete(e.target.textContent);
		}
		e.target.classList.toggle("filter__dropdown__option--selected");
		showMultiTags(genreBox, selectedGenres);
		activeFilters();
		generateMediaCard();
	}
});

typeDropdown.addEventListener("click", (e) => {
	if (e.target.classList.contains("filter__dropdown__option")) {
		if (!e.target.classList.contains("filter__dropdown__option--selected")) {
			if (selectedType) {
				selectedType.querySelector("i").remove();
				selectedType.classList.remove("filter__dropdown__option--selected");
			}
			selectedType = e.target;
			selectedType.insertAdjacentHTML("beforeend", '<i class="fi fi-rs-check"></i>');
			selectedType.classList.add("filter__dropdown__option--selected");
			typeBox.querySelector(".field__placeholder").innerText = selectedType.textContent;
		} else {
			e.target.querySelector("i").remove();
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
				selectedStatus.querySelector("i").remove();
				selectedStatus.classList.remove("filter__dropdown__option--selected");
			}
			selectedStatus = e.target;
			selectedStatus.insertAdjacentHTML("beforeend", '<i class="fi fi-rs-check"></i>');
			selectedStatus.classList.add("filter__dropdown__option--selected");
			statusBox.querySelector(".field__placeholder").innerText = selectedStatus.textContent;
		} else {
			e.target.querySelector("i").remove();
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
		activeSortTitle.innerHTML = `<i class="fi fi-rs-sort"></i>${e.target.textContent}`;
		closeDropdown();
		generateMediaCard();
	}
});

query.addEventListener("input", () => {
	activeFilters();
	if (query.value.length >= 3) generateMediaCard();
});
