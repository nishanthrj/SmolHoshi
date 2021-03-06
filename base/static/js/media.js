const mainContainer = document.querySelector(".content");
const navbar = document.querySelector(".navbar");
const tabs = document.querySelectorAll(".tab");
const overviewBtn = document.querySelector(".navbar__link.overview");
const episodesBtn = document.querySelector(".navbar__link.episodes");
const charactersBtn = document.querySelector(".navbar__link.characters");
const posterContainer = document.querySelector(".header__poster__img");
const headerTextContainer = document.querySelector(".header__text");
const relationsContainer = document.querySelector(".relations__media__cards");
const charactersContainer = document.querySelector(".characters__cards");
const charactersTabContainer = document.querySelector(".tab.characters .characters__cards");
const detailsContainer = document.querySelector(".details__text");
const trailerContainer = document.querySelector(".trailer");
const statsContainer = document.querySelector(".stats__container");
const statsBar = document.querySelector(".stats__bar");
const recommendedContainer = document.querySelector(".recommended__cards");

let episodesTabContainer, chaptersTabContainer;
if (mediaType === "anime") {
	episodesTabContainer = document.querySelector(".tab.episodes .episodes__cards");
} else {
	chaptersTabContainer = document.querySelector(".tab.chapters .chapters__cards");
}

const allGenres = {
	150: "Action",
	157: "Adventure",
	160: "Comedy",
	184: "Drama",
	162: "Ecchi",
	156: "Fantasy",
	158: "Horror",
	132: "Music",
	234: "Mystery",
	232: "Psychological",
	164: "Romance",
	155: "Science Fiction",
	169: "Slice of Life",
	180: "Sports",
	233: "Supernatural",
	159: "Thriller",
};

let media = {
	malId: "",
	id: "",
	slug: "",
	studio: "",
	publisher: "",
	title: "",
	poster: "",
	type: "",
	episodeCount: "",
	chapterCount: "",
	runtime: "",
	status: "",
	genres: [],
	tags: [],
	synopsis: "",
	relations: [],
	episodes: [],
	characters: [],
	startDate: "",
	en: "",
	enjp: "",
	jp: "",
	source: "",
	season: "",
	score: "",
	rating: "",
	popularity: "",
	trailerId: "",
	watching: "",
	reading: "",
	completed: "",
	planning: "",
	paused: "",
	dropped: "",
	recommended: [],
};

/**
 * Returns the season and year of the anime.
 * @param {String} year Release year.
 * @param {String} month Release month.
 * @returns Release season and year of the anime.
 */
const getSeason = function (year, month) {
	const seasons = ["Winter", "Spring", "Summer", "Fall"];
	return `${seasons[Math.floor(Number(month) / 3)]} ${year}`;
};

/**
 * Update primary media information from Kitsu API.
 * @param {Object} data Media data.
 */
const parseData = function (data) {
	media.id = data.id;
	data = data.attributes;
	media.slug = data.slug;
	media.title = data.canonicalTitle;
	media.poster = data.posterImage.large;
	media.type = data.subtype;
	media.episodeCount = data.episodeCount;
	media.chapterCount = data.chapterCount;
	media.runtime = data.totalLength;
	media.status = data.status;
	media.synopsis = data.synopsis;
	media.startDate = data.startDate;
	media.en = data.titles.en_us;
	media.enjp = data.titles.en_jp;
	media.jp = data.titles.ja_jp;
	media.score = data.averageRating ? Math.round(Number(data.averageRating)) + "%" : "";
	media.rating = `${data.ageRating} - ${data.ageRatingGuide}`;
	media.trailerId = data.youtubeVideoId;
	media.season = getSeason(...data.startDate.split("-").slice(0, 2));

	if (data.subtype === "manhwa") {
		media.enjp = data.titles.en_kr;
		media.jp = data.titles.ko_kr;
	}
};

/**
 * Update included media information such as relations, genres, etc from Kitsu API.
 * @param {Array} data Included data.
 */
const parseIncluded = function (data) {
	let mediaRelation = [];

	data.forEach((x) => {
		if (x.type === "mappings" && x.attributes.externalSite.includes("myanimelist")) {
			media.malId = x.attributes.externalId;
			return;
		}

		if (x.type === "anime" || x.type === "manga") {
			media.relations.push({
				id: x.id,
				slug: x.attributes.slug,
				poster: x.attributes.posterImage.medium,
				title: x.attributes.canonicalTitle,
				type: x.attributes.subtype,
				format: x.type,
				status: x.attributes.status,
			});
			return;
		}

		if (x.type === "categories") {
			if (allGenres[x.id]) media.genres.push(allGenres[x.id]);
			else media.tags.push(x.attributes.title);
			return;
		}

		if (x.type === "producers" && !media.studio) {
			media.studio = x.attributes.name;
		}

		if (x.type === "mediaRelationships") {
			mediaRelation.push({
				id: x.relationships.destination.data.id,
				role: x.attributes.role.replace("_", " "),
			});
		}
	});

	// Maps related media with its respective role.
	media.relations.forEach((x, i) => {
		media.relations[i].relation = mediaRelation.find((r) => r.id === x.id).role;
	});

	relationsContainer.innerHTML = createRelationCards().join("\n");
};

/**
 * Fetches media info from Jikan API.
 * @param {Number} id MAL ID of the anime.
 */
const fetchInfo = function (id) {
	fetch(`https://api.jikan.moe/v4/${mediaType}/${id}`)
		.then((res) => res.json())
		.then((data) => {
			data = data.data;
			media.source = data.source;
			media.episodeCount = data.episodes;
			media.chapterCount = data.chapters;
			media.synopsis = data.synopsis?.replace("[Written by MAL Rewrite]", "");
			media.en = data.title_english ? data.title_english : media.en;
			media.enjp = data.title;
			media.jp = data.title_japanese;
			media.popularity = data.members;
			media.score = data.score ? Math.round(data.score * 10) + "%" : "";
			media.rating = data.rating;
			media.trailerId = data.trailer?.youtube_id;
			media.season = `${data.season} ${data.year}`;
			media.publisher = data.serializations?.[0]?.name;
			media.studio = data.studios?.[0]?.name;

			renderContent();
		});
};

/**
 * Fetches Character info from Jikan API.
 * @param {Number} id MAL ID of the media.
 */
const fetchCharacters = function (id) {
	fetch(`https://api.jikan.moe/v4/${mediaType}/${id}/characters`)
		.then((res) => res.json())
		.then((data) => {
			characters = data.data;
			characters.forEach((c) => {
				media.characters.push({
					id: c.character.mal_id,
					// Need to split the name from url.
					// since names are mentioned in japanese style (lastname, firstname).
					name: c.character.url.split("/").at(-1).replaceAll("_", " "),
					image: c.character.images.jpg.image_url,
					voice: c.voice_actors?.[0]?.person.url.split("/").at(-1).replaceAll("_", " "),
				});
			});

			// Sort characters by id to get important characters on the top.
			media.characters.sort((a, b) => a.id - b.id);

			let characterCards = createCharacterCards();
			charactersContainer.innerHTML = characterCards.slice(0, 6).join("\n");
			charactersTabContainer.innerHTML = characterCards.join("\n");
		});
};

/**
 * Fetches stats from Jikan API.
 * @param {Number} id MAL ID of the anime.
 */
const fetchStats = function (id) {
	fetch(`https://api.jikan.moe/v4/${mediaType}/${id}/statistics`)
		.then((res) => res.json())
		.then((data) => {
			stats = data.data;
			media.popularity = stats.total;
			media.completed = stats.completed;
			media.planning = stats.plan_to_watch;
			media.paused = stats.on_hold;
			media.dropped = stats.dropped;
			if (mediaType === "anime") {
				media.watching = stats.watching;
				media.planning = stats.plan_to_watch;
			} else {
				media.reading = stats.reading;
				media.planning = stats.plan_to_read;
			}

			renderStats();
		});
};

/**
 * Fetches Episodes and Trailer.
 * @param {Number} id MAL ID of the anime.
 */
const fetchVideos = function (id) {
	let episodes = [];
	page = `https://kitsu.io/api/edge/episodes?filter[mediaId]=${media.id}`;

	// Initially fetch episodes from  Kitsu API.
	const fetchKitsuEpisodes = function () {
		fetch(page)
			.then((res) => res.json())
			.then((data) => {
				episodes.push(...data.data);
				// Ignore all the episodes if the meta data isn't available.
				if (!episodes[0]?.attributes.canonicalTitle) {
					return;
				}
				// Check if next page is available and fetch the new page too.
				page = data.links.next ? data.links.next : null;
				if (page) {
					fetchKitsuEpisodes();
					return;
				}
				episodes.forEach((e) => {
					if (!e.attributes.canonicalTitle) {
						return;
					}
					media.episodes.push({
						episode: `Episode ${e.attributes.number}`,
						title: e.attributes.canonicalTitle ? e.attributes.canonicalTitle : "",
						cover: e.attributes.thumbnail?.large,
					});
				});
				episodesTabContainer.innerHTML = createEpisodeCards().join("\n");
			});
	};
	fetchKitsuEpisodes();

	// Fetch episodes and videos from Jikan API.
	fetch(`https://api.jikan.moe/v4/anime/${id}/videos`)
		.then((res) => res.json())
		.then((data) => {
			media.trailerId = data.data?.promo[0]?.trailer.youtube_id;

			// Get the PV instead of official trailer since they are often unavailable.
			for (let t of data.data.promo) {
				if (t.title.includes("PV")) {
					media.trailerId = t.trailer.youtube_id;
					break;
				}
			}

			if (mediaType === "anime") {
				trailerContainer.innerHTML = `
				<h1 class="trailer__heading">Trailer</h1>
				<a class="trailer__clip" data-fancybox data-type="iframe" href="https://www.youtube.com/embed/${media.trailerId}">
					<img class="trailer__clip__thumbnail" src="https://img.youtube.com/vi/${media.trailerId}/maxresdefault.jpg">
				</a>`;
			}

			// Get episode info from crunchyroll videos.
			if (data.data.episodes.length) {
				episodes = data.data.episodes;
				episodes.forEach((e) => {
					media.episodes.push({
						episode: e.episode,
						title: e.title,
						cover: e.images.jpg.image_url?.replace("large", "fwide"),
					});
				});
				media.episodes.reverse();
				episodesTabContainer.innerHTML = createEpisodeCards().join("\n");
			} else {
				// Get episodes info from episodes path if crunchyroll videos are unavailable.
				setTimeout(() => {
					// Skip fetching if episodes data is already available.
					if (!media.episodes.length) {
						fetch(`https://api.jikan.moe/v4/anime/${id}/episodes`)
							.then((res) => res.json())
							.then((data) => {
								episodes = data.data;
								episodes.forEach((e) => {
									media.episodes.push({
										episode: `Episode ${e.mal_id}`,
										title: e.title,
										cover: null,
									});
								});
								episodesTabContainer.innerHTML = createEpisodeCards().join("\n");
							});
					}
				}, 1000);
			}
		});
};

/**
 * Fetches additional data from Jikan API.
 */
const fetchMALData = function () {
	if (media.malId) {
		fetchInfo(media.malId);
		fetchCharacters(media.malId);
		fetchStats(media.malId);
		setTimeout(() => {
			if (mediaType === "anime") {
				fetchVideos(media.malId);
			} else {
				createChapterCards();
			}
		}, 2000);
	}
};

/**
 * Formats the extra info (episodes, runtime, chapters).
 * @returns {string} Formatted extra info.
 */
const formatExtrasCount = function () {
	if (media.type === "TV") {
		return (
			`${media.episodeCount ? media.episodeCount + " Episode" : ""}` +
			`${media.episodeCount > 1 ? "s" : ""}` +
			`${media.episodeCount ? " ??? " : ""}`
		);
	} else if (media.type === "movie") {
		let hour = Math.floor(media.runtime / 60);
		let minutes = Math.floor(media.runtime % 60);
		return (
			`${hour ? hour + " Hour" : ""}` +
			`${hour > 1 ? "s" : ""}` +
			`${minutes ? " " + minutes + " Minute" : ""}` +
			`${minutes > 1 ? "s" : ""}` +
			`${hour || minutes ? " ??? " : ""}`
		);
	}
	return (
		`${media.chapterCount ? media.chapterCount + " Chapter" : ""}` +
		`${media.chapterCount > 1 ? "s" : ""}` +
		`${media.chapterCount ? " ??? " : ""}`
	);
};

/**
 * Creates genre elements.
 * @returns {String} An HTML string of genre elements.
 */
const createGenreElements = function () {
	return media.genres
		.map((g) => `<span class="header__text__genre__item">${g}</span>`)
		.join("\n");
};

/**
 * Creates related media cards.
 * @returns {Array} An array of HTML string of related media cards.
 */
const createRelationCards = function () {
	return media.relations.map((r) => {
		return `<div class="relations__media__card">
				<div class="relations__media__card__cover">
					<img src="${r.poster}"/>
				</div>
				<div class="relations__media__card__text">
					<p class="relations__media__card__text__relation">${r.relation}</p>
					<a href="/${r.format}/${r.type}/${r.id}/${r.slug}" 
					   class="relations__media__card__text__title">
						${r.title}
					</a>
					<p class="relations__media__card__text__extras">${r.type} ??? ${r.status}</p>
				</div>
			</div>`;
	});
};

/**
 * Creates episode cards.
 * @returns {Array} An array of HTML string of episode cards.
 */
const createEpisodeCards = function () {
	return media.episodes.map((e) => {
		return `<div class="episodes__card">
		<div class="episodes__card__cover">
		${e.cover ? `<img src="${e.cover}"/>` : ""}
		</div>
		<p class="episodes__card__number">${e.episode}</p>
		<p class="episodes__card__title">${e.title}</p>
		</div>`;
	});
};

/**
 * Creates chapter cards.
 */
const createChapterCards = function () {
	let cards = "";
	let chapters = 0;

	if (media.chapterCount) {
		chapters = media.chapterCount;
	} else {
		// If chapter count is unavailable
		// calculate chapters based on weeks passed since release.
		d1 = new Date(media.startDate);
		d2 = new Date();
		chapters = Math.round((d2 - d1) / (7 * 24 * 60 * 60 * 1000));
	}

	for (let x = 1; x <= chapters; x++) {
		cards += `<div class="chapters__card">
		<div class="chapters__card__cover">
		</div>
		<p class="episodes__card__number"></p>
		<p class="chapters__card__title">Chapter ${x}</p>
		</div>`;
	}

	if (cards) {
		chaptersTabContainer.innerHTML = cards;
	}
};

/**
 * Creates character cards.
 * @returns {Array} An array of HTML string of character cards.
 */
const createCharacterCards = function () {
	return media.characters.map((c) => {
		return `<div class="characters__card">
				<div class="characters__card__img">
				${!c.image.includes("questionmark") ? `<img src="${c.image}"/>` : ""}
				</div>
				<p class="characters__card__name">${c.name}</p>
				<p class="characters__card__voice">${c.voice ? c.voice : ""}</p>
			</div>`;
	});
};

/**
 * Creates recommended media cards.
 * @returns {Array} An array of HTML string of recommended media cards.
 */
const createRecommendedCards = function () {
	return recommended.map((x) => {
		return `<div class="recommended__card">
				<div class="recommended__card__cover">
					<img src="${x.poster}">
				</div>
				<a href="/${mediaType}/${x.type}/${x.id}/${x.slug}"  
					class="recommended__card__title">${x.title}</a>
			</div>`;
	});
};

/**
 * Updates the size of each entries in stats bar.
 */
const updateStatsBar = function () {
	let statsBarWidth = {
		completed: "0%",
		planning: "0%",
		watching: "0%",
		reading: "0%",
		paused: "0%",
		dropped: "0%",
	};

	statsBarWidth.completed = ((media.completed / media.popularity) * 100).toFixed(1) + "%";
	statsBarWidth.planning = ((media.planning / media.popularity) * 100).toFixed(1) + "%";
	statsBarWidth.paused = ((media.paused / media.popularity) * 100).toFixed(1) + "%";
	statsBarWidth.dropped = ((media.dropped / media.popularity) * 100).toFixed(1) + "%";
	if (mediaType === "anime") {
		statsBarWidth.watching = ((media.watching / media.popularity) * 100).toFixed(1) + "%";
	} else {
		statsBarWidth.reading = ((media.reading / media.popularity) * 100).toFixed(1) + "%";
	}

	statsBar.querySelector(`.stats__bar__completed`).style.width = statsBarWidth.completed;
	statsBar.querySelector(`.stats__bar__planning`).style.width = statsBarWidth.planning;
	statsBar.querySelector(`.stats__bar__paused`).style.width = statsBarWidth.paused;
	statsBar.querySelector(`.stats__bar__dropped`).style.width = statsBarWidth.dropped;
	if (mediaType === "anime") {
		statsBar.querySelector(`.stats__bar__watching`).style.width = statsBarWidth.watching;
	} else {
		statsBar.querySelector(`.stats__bar__reading`).style.width = statsBarWidth.reading;
	}
};

/**
 * Renders the stats on the page.
 */
const renderStats = function () {
	statsContainer.innerHTML = `<div class="stats__item completed">
			<h6 class="stats__item__name">Completed</h6>
			<p class="stats__item__value"><span>${media.completed}</span> Users</p>
		</div>
		<div class="stats__item planning">
			<h6 class="stats__item__name">Planning</h6>
			<p class="stats__item__value"><span>${media.planning}</span> Users</p>
		</div>
		<div class="stats__item current">
			<h6 class="stats__item__name">${mediaType === "anime" ? "Watching" : "Reading"}</h6>
			<p class="stats__item__value"><span>${
				mediaType === "anime" ? media.watching : media.reading
			}</span> Users</p>
		</div>
		<div class="stats__item dropped">
			<h6 class="stats__item__name">Dropped</h6>
			<p class="stats__item__value"><span>${media.dropped}</span> Users</p>
		</div>`;

	updateStatsBar();
};

/**
 * Renders media data on the page.
 */
const renderContent = function () {
	document.title = media.title + " | Hoshi";

	posterContainer.innerHTML = `<img src="${media.poster}">`;

	headerTextContainer.innerHTML = `<p class="header__text__${
		mediaType === "anime" ? "studio" : "publisher"
	}">
			${mediaType === "anime" ? media.studio : media.publisher}
		</p>
		<h1 class="header__text__title">${media.title}</h1>
		<p class="header__text__extras">${media.type} ??? ${formatExtrasCount()} ${media.status}</p>
		<div class="header__text__genre">
			${createGenreElements()}
		</div>
		<p class="header__text__synopsis">${media.synopsis ? media.synopsis : ""}
		</p>`.replaceAll("undefined", "");

	detailsContainer.innerHTML = `<div class="details__text__en">
			<strong>English</strong>
			<span>${media.en}</span>
		</div>
		<div class="details__text__enjp">
			<strong>Romaji</strong>
			<span>${media.enjp}</span>
		</div>
		<div class="details__text__jp">
			<strong>Native</strong>
			<span>${media.jp}</span>
		</div>
		<div class="details__text__format">
			<strong>Format</strong>
			<span>${media.type}</span>
		</div>
		<div class="details__text__source">
			<strong>Source</strong>
			<span>${media.source}</span>
		</div>
		${
			media.type !== "movie"
				? `<div class="details__text__${mediaType === "anime" ? "episodes" : "chapters"}">
					<strong>${mediaType === "anime" ? "Episodes" : "Chapters"}</strong>
					<span>${formatExtrasCount().replace(" ??? ", "")}</span>
				</div>`
				: `<div class="details__text__runtime">
					<strong>Runtime</strong>
					<span>${formatExtrasCount().replace(" ??? ", "")}</span>
				</div>`
		}
		<div class="details__text__status">
			<strong>Status</strong>
			<span>${media.status}</span>
		</div>
		<div class="details__text__score">
			<strong>Score</strong>
			<span>${media.score}</span>
		</div>
		<div class="details__text__popularity">
			<strong>Popularity</strong>
			<span>${media.popularity}</span>
		</div>
		<div class="${mediaType === "anime" ? "studio" : "publisher"}">
			<strong>${mediaType === "anime" ? "Studio" : "Publisher"}</strong>
			<span>${mediaType === "anime" ? media.studio : media.publisher}</span>
		</div>
		${
			mediaType === "anime"
				? `${
						media.type !== "movie"
							? `<div class="details__text__season">
									<strong>Season</strong>
									<span>${media.season}</span>
								</div>`
							: ""
				  }
					<div class="details__text__rating">
						<strong>Rating</strong>
						<span>${media.rating}</span>
					</div>`
				: ""
		}
		<div class="details__text__genre">
			<strong>Genre</strong>
			<span>${media.genres.join(", ")}</span>
		</div>
		<div class="details__text__tags">
			<strong>Tags</strong>
			<span>${media.tags.join(", ")}</span>
		</div>`
		.replaceAll("undefined", "")
		.replaceAll("null", "");

	recommendedContainer.innerHTML = createRecommendedCards().join("\n");
};

/**
 * Main function to fetch and render data on the page.
 */
const main = function () {
	let url = `https://kitsu.io/api/edge/${mediaType}/${mediaId}?include=categories,mappings,mediaRelationships.destination,productions.company`;
	fetch(url)
		.then((res) => res.json())
		.then((data) => {
			parseIncluded(data.included);
			parseData(data.data);
			fetchMALData();
			mainContainer.classList.remove("content--hidden");
			renderContent();
		});
};

setTimeout(main, 1000);

/**
 * Switch between tabs on the media page.
 * @param {*} selected The tab selected by the user.
 */
const switchTab = function (selected) {
	if (selected.classList.contains("navbar__link")) {
		let selectedTab = document.querySelector(`.tab.${selected.dataset.tab}`);
		tabs.forEach((t) => {
			if (t !== selectedTab) {
				t.classList.add("hidden");
			}
			document
				.querySelector(".navbar__link--active")
				.classList.remove("navbar__link--active");
			selected.classList.add("navbar__link--active");
			selectedTab.classList.remove("hidden");
		});
	}
};
navbar.addEventListener("click", (e) => switchTab(e.target));
