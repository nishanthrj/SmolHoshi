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
if (mediaType === "anime")
	episodesTabContainer = document.querySelector(".tab.episodes .episodes__cards");
else chaptersTabContainer = document.querySelector(".tab.chapters .chapters__cards");

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
	staffs: [],
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

const getSeason = function (year, month) {
	const seasons = ["Winter", "Spring", "Summer", "Fall"];
	return `${seasons[Math.floor(Number(month) / 3)]} ${year}`;
};

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
	media.en = data.titles.en;
	media.enjp = data.titles.en_jp;
	media.jp = data.titles.ja_jp;
	media.score = data.averageRating ? Math.round(Number(data.averageRating)) + "%" : "";
	media.rating = `${data.ageRating} - ${data.ageRatingGuide}`;
	media.trailerId = data.youtubeVideoId;
	media.season = getSeason(...data.startDate.split("-").slice(0, 2));
};

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

	media.relations.forEach((x, i) => {
		media.relations[i].relation = mediaRelation.find((r) => r.id === x.id).role;
	});
};

const main = function () {
	let url = `https://kitsu.io/api/edge/${mediaType}/${mediaId}?include=categories,mappings,mediaRelationships.destination,productions.company`;
	fetch(url)
		.then((res) => res.json())
		.then((data) => {
			parseIncluded(data.included);
			parseData(data.data);
		});
};

setTimeout(main, 1000);
