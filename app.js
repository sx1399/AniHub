//https://graphql.anilist.co

const apiUrl = "https://graphql.anilist.co";
const headers = {
  "Content-Type": "application/json",
};

const animeWrapper = document.querySelector(".anime__list");
let isTrending = true;
const trendingID = [
  "22",
  "20",
  "21",
  "113",
  "128893",
  "136",
  "16498",
  "127230",
];

async function makeGraphQLRequest(query, variables) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
  });

  const data = (await response.json()).data;
  return data;
}

async function fetchTrendingAnime() {
  const query = `
    query ($ids: [Int]) {
      Page(page: 1, perPage: 8) {
        media(id_in: $ids) {
          id
          title {
            english
            romaji
          }
          coverImage {
            large
          }
          startDate {
            year
          }
        }
      }
    }
  `;

  const variables = {
    ids: trendingID.map(Number),
  };

  const data = await makeGraphQLRequest(query, variables);
  const trendingArr = data.Page.media;

  animeWrapper.innerHTML = trendingArr
    .map((anime) => animeHTML(anime, isTrending))
    .join("");
}

async function renderAnime(search = "", filter) {
  document.getElementById("filter").style.display = "block";
  animeWrapper.innerHTML = '<i class="fa-solid fa-spinner spinner"></i>';
  animeWrapper.classList.add("loading");

  if (!!search) {
    const query = `
      query ($search: String) {
        Page {
          media(search: $search, type: ANIME) {
            id
            title {
              english
              romaji
            }
            startDate {
              year
            }
            coverImage {
              large
            }
          }
        }
      }
    `;

    const variables = {
      search: search,
    };

    const data = await makeGraphQLRequest(query, variables);
    const animeData = data.Page.media.slice(0, 8);

    if (filter === "OLDEST-NEWEST") {
      animeData.sort((a, b) => a.startDate.year - b.startDate.year);
    } else if (filter === "NEWEST-OLDEST") {
      animeData.sort((a, b) => b.startDate.year - a.startDate.year);
    }

    setTimeout(() => {
      animeWrapper.classList.remove("loading");
      animeWrapper.innerHTML = animeData
        .map((anime) => animeHTML(anime, (isTrending = false)))
        .join("");
    }, 250);
  } else {
    // If search term is empty, fetch trending anime instead
    fetchTrendingAnime();
  }
}

function animeHTML(anime) {
  const startYear = anime.startDate ? anime.startDate.year : "N/A";

  return `<div class="anime">
          <figure class="anime__img--wrapper">
            <img class="anime__img" src="${anime.coverImage.large}" alt="">
          </figure>
          <h2 class="anime__title">${
            anime.title.english || anime.title.romaji
          }</h2>
          <p class="anime__year">${startYear}</p>
        </div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".search__bar");
  const filterSelect = document.getElementById("filter");

  searchInput.addEventListener("input", (event) => {
    const searchValue = event.target.value.trim();
    renderAnime(searchValue, filterSelect.value);
  });

  filterSelect.addEventListener("change", (event) => {
    const searchValue = searchInput.value.trim();
    renderAnime(searchValue, event.target.value);
  });

  setTimeout(() => {
    fetchTrendingAnime();
  }, 10);
});
