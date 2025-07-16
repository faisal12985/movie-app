const searchBtn = document.getElementById("searchBtn");
const movieInput = document.getElementById("movieInput");
const movieGrid = document.getElementById("movieGrid");
const toggleModeBtn = document.getElementById("toggleMode");
const movieModal = document.getElementById("movieModal");
const modalDetails = document.getElementById("modalDetails");
const closeModal = document.getElementById("closeModal");

const API_KEY = "c58efb0f";

// ✅ Public Domain Mode Toggle
let publicDomainMode = false;

toggleModeBtn.addEventListener("click", () => {
  publicDomainMode = !publicDomainMode;
  toggleModeBtn.textContent = `Public Domain Mode: ${publicDomainMode ? "ON" : "OFF"}`;
  movieGrid.innerHTML = publicDomainMode
    ? showPublicDomainMovies()
    : `<p>🔍 Search a movie to begin...</p>`;
});

searchBtn.addEventListener("click", () => {
  if (publicDomainMode) {
    alert("Switch OFF Public Domain Mode to search OMDB movies!");
    return;
  }
  const movieName = movieInput.value.trim();
  if (movieName) {
    fetchMovies(movieName);
  } else {
    alert("Please enter a movie name!");
  }
});

// ✅ Fetch OMDB Movies (Normal Mode)
async function fetchMovies(query) {
  const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.Response === "True") {
      displayMovies(data.Search);
    } else {
      movieGrid.innerHTML = `<p>❌ No movies found! Try another name.</p>`;
    }
  } catch (error) {
    movieGrid.innerHTML = `<p>⚠️ Error fetching data.</p>`;
  }
}

function displayMovies(movies) {
  movieGrid.innerHTML = movies
    .map(
      (movie) => `
      <div class="movie-card" onclick="showMovieDetails('${movie.imdbID}')">
        <img src="${
          movie.Poster !== "N/A"
            ? movie.Poster
            : "https://via.placeholder.com/150"
        }" alt="${movie.Title}">
        <h3>${movie.Title}</h3>
        <p>📅 ${movie.Year}</p>
      </div>
    `
    )
    .join("");
}

// ✅ Show Movie Details (Normal Mode with YouTube Trailer)
async function showMovieDetails(id) {
  if (publicDomainMode) return; // Skip if in Public Domain Mode

  const url = `https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === "True") {
      const trailerEmbed = await fetchTrailer(data.Title);
      modalDetails.innerHTML = `
        <img src="${data.Poster}" alt="${data.Title}">
        <h2>${data.Title} (${data.Year})</h2>
        <p><strong>⭐ Rating:</strong> ${data.imdbRating}</p>
        <p><strong>🎭 Genre:</strong> ${data.Genre}</p>
        <p><strong>📖 Plot:</strong> ${data.Plot}</p>
        ${trailerEmbed}
      `;
      movieModal.style.display = "flex";
    }
  } catch (error) {
    console.error("Error fetching details", error);
  }
}

async function fetchTrailer(movieTitle) {
  const query = encodeURIComponent(`${movieTitle} official trailer`);
  return `<iframe src="https://www.youtube.com/embed?listType=search&list=${query}"
      frameborder="0" allowfullscreen></iframe>`;
}

// ✅ PUBLIC DOMAIN MOVIES LIST (Working Embed Links)
function showPublicDomainMovies() {
  const publicMovies = [
    {
      title: "Night of the Living Dead",
      year: "1968",
      poster: "https://archive.org/services/img/night_of_the_living_dead",
      embed: "https://archive.org/embed/night_of_the_living_dead",
    },
    {
      title: "Plan 9 from Outer Space",
      year: "1959",
      poster: "https://archive.org/services/img/plan_9_from_outer_space",
      embed: "https://archive.org/embed/plan_9_from_outer_space",
    },
    {
      title: "House on Haunted Hill",
      year: "1959",
      poster: "https://archive.org/services/img/house_on_haunted_hill",
      embed: "https://archive.org/embed/house_on_haunted_hill",
    },
    {
      title: "The Little Shop of Horrors",
      year: "1960",
      poster: "https://archive.org/services/img/LittleShopOfHorrorscolorized",
      embed: "https://archive.org/embed/LittleShopOfHorrorscolorized",
    },
    {
      title: "His Girl Friday",
      year: "1940",
      poster: "https://archive.org/services/img/his_girl_friday",
      embed: "https://archive.org/embed/his_girl_friday",
    },
    {
      title: "Gulliver's Travels",
      year: "1939",
      poster: "https://archive.org/services/img/gullivers_travels",
      embed: "https://archive.org/embed/gullivers_travels",
    }
  ];

  return publicMovies
    .map(
      (movie) => `
      <div class="movie-card" onclick="playPublicDomain('${movie.embed}','${movie.title}','${movie.year}','${movie.poster}')">
        <img src="${movie.poster}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>📅 ${movie.year}</p>
      </div>
    `
    )
    .join("");
}

// ✅ PLAY FULL PUBLIC DOMAIN MOVIE IN POPUP
function playPublicDomain(embedUrl, title, year, poster) {
  modalDetails.innerHTML = `
    <img src="${poster}" alt="${title}">
    <h2>${title} (${year})</h2>
    <iframe src="${embedUrl}" width="100%" height="300" frameborder="0" allowfullscreen></iframe>
  `;
  movieModal.style.display = "flex";
}

// ✅ Close Modal
closeModal.onclick = () => (movieModal.style.display = "none");
window.onclick = (e) => {
  if (e.target === movieModal) movieModal.style.display = "none";
}
