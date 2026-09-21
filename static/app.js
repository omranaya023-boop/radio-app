const grid = document.getElementById("grid");
const status = document.getElementById("status");
const search = document.getElementById("search");
const audio = document.getElementById("audio");
const playBtn = document.getElementById("play-btn");
const npName = document.getElementById("np-name");
const npCountry = document.getElementById("np-country");
const npImg = document.getElementById("np-img");
const volume = document.getElementById("volume");
const filterCountry = document.getElementById("filter-country");
const filterGenre = document.getElementById("filter-genre");

let currentStation = null;
let isPlaying = false;

loadStations();

let t;
search.addEventListener("input", () => {
  clearTimeout(t);
  t = setTimeout(loadStations, 400);
});
filterCountry.addEventListener("change", loadStations);
filterGenre.addEventListener("change", loadStations);

async function loadStations() {
  const q = search.value.trim();
  const country = filterCountry.value;
  const tag = filterGenre.value;

  status.textContent = "Loading...";
  grid.innerHTML = "";

  let url = "/api/stations?";
  if (q) url += `q=${encodeURIComponent(q)}&`;
  if (country) url += `country=${encodeURIComponent(country)}&`;
  if (tag) url += `tag=${encodeURIComponent(tag)}&`;
  if (!q && !country && !tag) url += "country=France";

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      status.textContent = "No stations found.";
      return;
    }
    status.textContent = `${data.length} stations`;
    data.forEach(renderCard);
  } catch (e) {
    status.textContent = "Error loading stations.";
    console.error(e);
  }
}

function renderCard(s) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="${s.favicon || 'https://via.placeholder.com/70/0a1a3a/00a8ff?text=FM'}"
         onerror="this.onerror=null; this.src='https://via.placeholder.com/70/0a1a3a/00a8ff?text=FM';" />
    <h3>${s.name}</h3>
    <p>${s.country || "Unknown"}</p>
  `;
  card.onclick = () => playStation(s);
  grid.appendChild(card);
}

function playStation(s) {
  currentStation = s;
  audio.src = s.url;
  audio.volume = volume.value;
  audio.play().then(() => {
    isPlaying = true;
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    npName.textContent = s.name;
    npCountry.textContent = s.country || "";
    npImg.src = s.favicon || "https://via.placeholder.com/50/0a1a3a/00a8ff?text=FM";
  }).catch(err => {
    console.log("Play failed:", err, "URL:", s.url);
    npName.textContent = s.name;
    npCountry.textContent = "Stream blocked — try another";
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    isPlaying = false;
  });
}

playBtn.onclick = () => {
  if (!currentStation) return;
  if (isPlaying) { audio.pause(); playBtn.innerHTML = '<i class="fas fa-play"></i>'; }
  else { audio.play().catch(e => console.log(e)); playBtn.innerHTML = '<i class="fas fa-pause"></i>'; }
  isPlaying = !isPlaying;
};

volume.oninput = () => audio.volume = volume.value;

audio.onerror = () => {
  npCountry.textContent = "Stream error — try another station";
  playBtn.innerHTML = '<i class="fas fa-play"></i>';
  isPlaying = false;
};