const STORAGE_KEY = "ale-sasi-reviews-v1";

const seedData = {
  locations: [
    {
      id: "roma",
      name: "Roma",
      photo:
        "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1200&q=80",
      description:
        "Trattorie sincere, tavole contemporanee e indirizzi da salvare per quando la fame diventa una piccola missione.",
    },
    {
      id: "milano",
      name: "Milano",
      photo:
        "https://images.unsplash.com/photo-1512237798647-84b57b22b517?auto=format&fit=crop&w=1200&q=80",
      description:
        "Cene veloci, posti eleganti e scoperte nascoste tra quartieri pieni di energia.",
    },
    {
      id: "palma-de-mallorca",
      name: "Palma de Mallorca",
      photo:
        "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=1200&q=80",
      description:
        "Tavoli vista mare, tapas, mercati e pause lunghe con il sole che fa la sua parte.",
    },
    {
      id: "sardegna",
      name: "Sardegna",
      photo:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      description:
        "Sapori netti, pesce fresco, terrazze luminose e posti da ricordare quando torna voglia d'estate.",
    },
  ],
  restaurants: [
    {
      id: "osteria-trastevere",
      locationId: "roma",
      name: "Osteria Trastevere 53",
      address: "Via della Scala 53, Roma",
      cover:
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1400&q=80",
      photos: [
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Atmosfera calda, piatti romani generosi e servizio informale. Perfetto per una cena senza fretta dopo una passeggiata.",
      scores: { location: 8.5, service: 8, menu: 8.8, bill: 7.5 },
    },
    {
      id: "brera-table",
      locationId: "milano",
      name: "Brera Table",
      address: "Via Solferino 18, Milano",
      cover:
        "https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=1400&q=80",
      photos: [
        "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1533777324565-a040eb52fac1?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Una cucina pulita e moderna, bella carta dei vini e conto coerente con la zona. Ideale quando si vuole qualcosa di curato.",
      scores: { location: 8, service: 8.7, menu: 8.4, bill: 7.8 },
    },
  ],
};

const app = document.querySelector("#app");

function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return structuredClone(seedData);

  try {
    return JSON.parse(stored);
  } catch {
    return structuredClone(seedData);
  }
}

let state = loadData();

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function uniqueId(base, collection) {
  const slug = slugify(base) || "elemento";
  let candidate = slug;
  let count = 2;
  const ids = new Set(collection.map((item) => item.id));

  while (ids.has(candidate)) {
    candidate = `${slug}-${count}`;
    count += 1;
  }

  return candidate;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function averageScore(restaurant) {
  const values = Object.values(restaurant.scores || {}).map(Number);
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function formatScore(value) {
  return Number(value || 0).toFixed(1).replace(".", ",");
}

function restaurantsFor(locationId) {
  return state.restaurants.filter((restaurant) => restaurant.locationId === locationId);
}

function render() {
  const [route = "", first, second] = location.hash.replace(/^#\/?/, "").split("/");

  if (route === "admin") {
    renderAdmin();
    return;
  }

  if (route === "luogo" && first) {
    renderLocation(first);
    return;
  }

  if (route === "ristorante" && first) {
    renderRestaurant(first, second);
    return;
  }

  renderHome();
}

function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <p class="eyebrow">Diario gastronomico</p>
        <h1>Ale & Sasi provano, votano, ricordano.</h1>
        <p>Una raccolta ordinata dei posti in cui abbiamo mangiato, con voti su location, servizio, menu, conto e una media finale facile da confrontare.</p>
      </div>
    </section>

    <section>
      <div class="section-head">
        <div>
          <h2>Luoghi</h2>
          <p>Scegli una città o una zona e scopri tutti i ristoranti recensiti.</p>
        </div>
        <a class="button secondary" href="#/admin">Gestisci contenuti</a>
      </div>
      <div class="grid">
        ${state.locations.map(renderLocationCard).join("")}
      </div>
    </section>
  `;
}

function renderLocationCard(locationItem) {
  const count = restaurantsFor(locationItem.id).length;
  return `
    <a class="place-card" href="#/luogo/${locationItem.id}">
      <img class="card-image" src="${escapeHtml(locationItem.photo)}" alt="${escapeHtml(locationItem.name)}">
      <div class="card-body">
        <div class="card-kicker">${count} ${count === 1 ? "posto" : "posti"}</div>
        <h3 class="card-title">${escapeHtml(locationItem.name)}</h3>
        <p class="card-text">${escapeHtml(locationItem.description)}</p>
      </div>
    </a>
  `;
}

function renderLocation(locationId) {
  const locationItem = state.locations.find((item) => item.id === locationId);
  if (!locationItem) {
    renderNotFound();
    return;
  }

  const restaurants = restaurantsFor(locationId);
  app.innerHTML = `
    <section class="page-cover" style="background-image: url('${escapeHtml(locationItem.photo)}')">
      <div class="page-cover-content">
        <a class="back-link" href="#/">Torna ai luoghi</a>
        <p class="eyebrow">${restaurants.length} ${restaurants.length === 1 ? "recensione" : "recensioni"}</p>
        <h1>${escapeHtml(locationItem.name)}</h1>
        <p>${escapeHtml(locationItem.description)}</p>
      </div>
    </section>

    <section>
      <div class="section-head">
        <div>
          <h2>Posti provati</h2>
          <p>Copertina, indirizzo e media finale per scegliere subito dove entrare nel dettaglio.</p>
        </div>
      </div>
      ${
        restaurants.length
          ? `<div class="grid">${restaurants.map((restaurant) => renderRestaurantCard(restaurant, locationId)).join("")}</div>`
          : `<section class="empty-state"><p>Qui non ci sono ancora recensioni. Aggiungine una dal portale admin.</p></section>`
      }
    </section>
  `;
}

function renderRestaurantCard(restaurant, locationId) {
  return `
    <a class="restaurant-card" href="#/ristorante/${locationId}/${restaurant.id}">
      <img class="card-image" src="${escapeHtml(restaurant.cover)}" alt="${escapeHtml(restaurant.name)}">
      <div class="card-body">
        <div class="card-kicker">Media ${formatScore(averageScore(restaurant))}</div>
        <h3 class="card-title">${escapeHtml(restaurant.name)}</h3>
        <p class="address">${escapeHtml(restaurant.address)}</p>
        <div class="meta-row">
          <span class="pill gold">Finale ${formatScore(averageScore(restaurant))}/10</span>
        </div>
      </div>
    </a>
  `;
}

function renderRestaurant(locationId, restaurantId) {
  const locationItem = state.locations.find((item) => item.id === locationId);
  const restaurant = state.restaurants.find(
    (item) => item.id === restaurantId && item.locationId === locationId,
  );

  if (!locationItem || !restaurant) {
    renderNotFound();
    return;
  }

  const photos = (restaurant.photos || []).filter(Boolean);

  app.innerHTML = `
    <section class="page-cover" style="background-image: url('${escapeHtml(restaurant.cover)}')">
      <div class="page-cover-content">
        <a class="back-link" href="#/luogo/${locationId}">Torna a ${escapeHtml(locationItem.name)}</a>
        <p class="eyebrow">${escapeHtml(locationItem.name)}</p>
        <h1>${escapeHtml(restaurant.name)}</h1>
        <p>${escapeHtml(restaurant.address)}</p>
      </div>
    </section>

    <section class="restaurant-detail">
      <article class="detail-panel">
        <h2>Recensione</h2>
        <p>${escapeHtml(restaurant.description)}</p>
        ${
          photos.length
            ? `<div class="photo-strip">${photos.map((photo, index) => `<img src="${escapeHtml(photo)}" alt="${escapeHtml(restaurant.name)} foto ${index + 1}">`).join("")}</div>`
            : ""
        }
      </article>
      <aside class="scores-panel">
        <h2>Voti</h2>
        <div class="score-list">
          ${renderScore("Location", restaurant.scores.location)}
          ${renderScore("Servizio", restaurant.scores.service)}
          ${renderScore("Menu", restaurant.scores.menu)}
          ${renderScore("Conto", restaurant.scores.bill)}
        </div>
        <div class="final-score">
          <span>Media finale</span>
          <strong>${formatScore(averageScore(restaurant))}</strong>
        </div>
      </aside>
    </section>
  `;
}

function renderScore(label, value) {
  const numericValue = Math.max(0, Math.min(10, Number(value) || 0));
  return `
    <div class="score-item">
      <span class="score-label">${label}</span>
      <span class="score-value">${formatScore(numericValue)}</span>
      <div class="score-bar"><span style="width: ${numericValue * 10}%"></span></div>
    </div>
  `;
}

function renderAdmin() {
  const selectedLocationId = state.locations[0]?.id || "";

  app.innerHTML = `
    <section>
      <div class="section-head">
        <div>
          <p class="eyebrow">Portale admin</p>
          <h2>Gestione contenuti</h2>
          <p>Aggiungi località e ristoranti. I dati vengono salvati in questo browser.</p>
        </div>
        <a class="button secondary" href="#/">Vedi sito</a>
      </div>

      <div class="admin-layout">
        <div class="admin-panel">
          <h2>Nuova località</h2>
          <form id="location-form" class="form-grid">
            <div class="field">
              <label for="location-name">Nome</label>
              <input id="location-name" required placeholder="Es. Firenze">
            </div>
            <div class="field">
              <label for="location-photo">Foto copertina</label>
              <input id="location-photo" placeholder="URL immagine">
              <input id="location-photo-file" type="file" accept="image/*">
            </div>
            <div class="field">
              <label for="location-description">Breve descrizione</label>
              <textarea id="location-description" required></textarea>
            </div>
            <button class="button" type="submit">Aggiungi località</button>
          </form>
        </div>

        <div class="admin-panel">
          <h2>Nuovo posto</h2>
          <form id="restaurant-form" class="form-grid">
            <div class="field">
              <label for="restaurant-location">Località</label>
              <select id="restaurant-location" required>
                ${state.locations.map((item) => `<option value="${item.id}" ${item.id === selectedLocationId ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}
              </select>
            </div>
            <div class="form-row">
              <div class="field">
                <label for="restaurant-name">Nome</label>
                <input id="restaurant-name" required placeholder="Nome ristorante">
              </div>
              <div class="field">
                <label for="restaurant-address">Indirizzo</label>
                <input id="restaurant-address" required placeholder="Via, città">
              </div>
            </div>
            <div class="field">
              <label for="restaurant-cover">Foto copertina</label>
              <input id="restaurant-cover" placeholder="URL immagine">
              <input id="restaurant-cover-file" type="file" accept="image/*">
            </div>
            <div class="field">
              <label for="restaurant-photos">Foto riassuntive</label>
              <textarea id="restaurant-photos" placeholder="Un URL per riga"></textarea>
              <input id="restaurant-photos-file" type="file" accept="image/*" multiple>
            </div>
            <div class="field">
              <label for="restaurant-description">Breve descrizione</label>
              <textarea id="restaurant-description" required></textarea>
            </div>
            <div class="form-row">
              ${renderScoreInput("Location", "score-location")}
              ${renderScoreInput("Servizio", "score-service")}
              ${renderScoreInput("Menu", "score-menu")}
              ${renderScoreInput("Conto", "score-bill")}
            </div>
            <button class="button" type="submit">Aggiungi posto</button>
          </form>
        </div>
      </div>

      <div class="section-head">
        <div>
          <h2>Contenuti salvati</h2>
          <p>Modifica rapida tramite cancellazione e reinserimento. È una base pronta per evolvere verso login e database.</p>
        </div>
        <button id="reset-data" class="button danger" type="button">Ripristina esempi</button>
      </div>
      <div class="admin-layout">
        <div class="admin-panel">
          <h2>Località</h2>
          <div class="admin-list">${state.locations.map(renderAdminLocation).join("") || "<p>Nessuna località.</p>"}</div>
        </div>
        <div class="admin-panel">
          <h2>Posti</h2>
          <div class="admin-list">${state.restaurants.map(renderAdminRestaurant).join("") || "<p>Nessun posto.</p>"}</div>
        </div>
      </div>
    </section>
  `;

  bindAdminEvents();
}

function renderScoreInput(label, id) {
  return `
    <div class="field">
      <label for="${id}">${label}</label>
      <input id="${id}" type="number" min="0" max="10" step="0.1" required value="8">
    </div>
  `;
}

function renderAdminLocation(locationItem) {
  return `
    <div class="admin-item">
      <img src="${escapeHtml(locationItem.photo)}" alt="${escapeHtml(locationItem.name)}">
      <div>
        <h3>${escapeHtml(locationItem.name)}</h3>
        <p>${restaurantsFor(locationItem.id).length} recensioni</p>
        <div class="admin-actions">
          <a class="tiny-button" href="#/luogo/${locationItem.id}">Apri</a>
          <button class="tiny-button danger" data-delete-location="${locationItem.id}" type="button">Elimina</button>
        </div>
      </div>
    </div>
  `;
}

function renderAdminRestaurant(restaurant) {
  const locationItem = state.locations.find((item) => item.id === restaurant.locationId);
  return `
    <div class="admin-item">
      <img src="${escapeHtml(restaurant.cover)}" alt="${escapeHtml(restaurant.name)}">
      <div>
        <h3>${escapeHtml(restaurant.name)}</h3>
        <p>${escapeHtml(locationItem?.name || "Senza località")} · media ${formatScore(averageScore(restaurant))}</p>
        <div class="admin-actions">
          <a class="tiny-button" href="#/ristorante/${restaurant.locationId}/${restaurant.id}">Apri</a>
          <button class="tiny-button danger" data-delete-restaurant="${restaurant.id}" type="button">Elimina</button>
        </div>
      </div>
    </div>
  `;
}

function bindAdminEvents() {
  document.querySelector("#location-photo-file")?.addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (file) document.querySelector("#location-photo").value = await readFile(file);
  });

  document.querySelector("#restaurant-cover-file")?.addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (file) document.querySelector("#restaurant-cover").value = await readFile(file);
  });

  document.querySelector("#restaurant-photos-file")?.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const values = await Promise.all(files.map(readFile));
    const input = document.querySelector("#restaurant-photos");
    input.value = [input.value, ...values].filter(Boolean).join("\n").trim();
  });

  document.querySelector("#location-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.querySelector("#location-name").value.trim();

    state.locations.push({
      id: uniqueId(name, state.locations),
      name,
      photo:
        form.querySelector("#location-photo").value.trim() ||
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
      description: form.querySelector("#location-description").value.trim(),
    });

    saveData();
    renderAdmin();
  });

  document.querySelector("#restaurant-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.querySelector("#restaurant-name").value.trim();
    const photos = form
      .querySelector("#restaurant-photos")
      .value.split("\n")
      .map((value) => value.trim())
      .filter(Boolean);

    state.restaurants.push({
      id: uniqueId(name, state.restaurants),
      locationId: form.querySelector("#restaurant-location").value,
      name,
      address: form.querySelector("#restaurant-address").value.trim(),
      cover:
        form.querySelector("#restaurant-cover").value.trim() ||
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80",
      photos,
      description: form.querySelector("#restaurant-description").value.trim(),
      scores: {
        location: Number(form.querySelector("#score-location").value),
        service: Number(form.querySelector("#score-service").value),
        menu: Number(form.querySelector("#score-menu").value),
        bill: Number(form.querySelector("#score-bill").value),
      },
    });

    saveData();
    renderAdmin();
  });

  document.querySelectorAll("[data-delete-location]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.deleteLocation;
      state.locations = state.locations.filter((item) => item.id !== id);
      state.restaurants = state.restaurants.filter((item) => item.locationId !== id);
      saveData();
      renderAdmin();
    });
  });

  document.querySelectorAll("[data-delete-restaurant]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.deleteRestaurant;
      state.restaurants = state.restaurants.filter((item) => item.id !== id);
      saveData();
      renderAdmin();
    });
  });

  document.querySelector("#reset-data")?.addEventListener("click", () => {
    state = structuredClone(seedData);
    saveData();
    renderAdmin();
  });
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function renderNotFound() {
  app.innerHTML = `
    <section class="empty-state">
      <p>Pagina non trovata.</p>
      <a class="button secondary" href="#/">Torna alla home</a>
    </section>
  `;
}

window.addEventListener("hashchange", render);
render();
