import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =========================================
// CONFIGURAZIONE — sostituisci con i tuoi valori
// (Supabase Dashboard > Project Settings > API)
// =========================================
const SUPABASE_URL = "https://tytgiggvnzvxseszcavu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Aau3K5trdEpIRPcJ-AhMew_Du3lS3YX";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = document.querySelector("#app");

let state = { locations: [], restaurants: [] };
let session = null;

// =========================================
// Caricamento dati dal database (al posto di loadData/localStorage)
// =========================================
async function fetchState() {
  const [{ data: locations, error: locError }, { data: restaurants, error: restError }] =
    await Promise.all([
      supabase.from("locations").select("*").order("name"),
      supabase.from("restaurants").select("*").order("name"),
    ]);

  if (locError) console.error("Errore caricando le località:", locError);
  if (restError) console.error("Errore caricando i ristoranti:", restError);

  state.locations = locations || [];
  state.restaurants = (restaurants || []).map((r) => ({
    id: r.id,
    locationId: r.location_id,
    name: r.name,
    address: r.address,
    cover: r.cover,
    photos: r.photos || [],
    description: r.description,
    scores: {
      location: r.score_location,
      service: r.score_service,
      menu: r.score_menu,
      bill: r.score_bill,
    },
  }));
}

async function refreshSession() {
  const { data } = await supabase.auth.getSession();
  session = data.session;
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

// =========================================
// Routing
// =========================================
async function render() {
  const [route = "", first, second] = location.hash.replace(/^#\/?/, "").split("/");

  if (route === "admin") {
    await renderAdmin();
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

// =========================================
// Admin: login + gestione contenuti
// =========================================
async function renderAdmin() {
  await refreshSession();

  if (!session) {
    renderLogin();
    return;
  }

  const selectedLocationId = state.locations[0]?.id || "";

  app.innerHTML = `
    <section>
      <div class="section-head">
        <div>
          <p class="eyebrow">Portale admin</p>
          <h2>Gestione contenuti</h2>
          <p>Loggato come ${escapeHtml(session.user.email)}. I dati sono condivisi: chiunque visiti il sito vede subito le modifiche.</p>
        </div>
        <div class="button-row">
          <a class="button secondary" href="#/">Vedi sito</a>
          <button id="logout" class="button danger" type="button">Esci</button>
        </div>
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
          <p>Modifica rapida tramite cancellazione e reinserimento.</p>
        </div>
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

function renderLogin() {
  app.innerHTML = `
    <section class="admin-layout" style="grid-template-columns: 1fr;">
      <div class="admin-panel" style="max-width: 420px; margin: 40px auto;">
        <h2>Accesso admin</h2>
        <form id="login-form" class="form-grid">
          <div class="field">
            <label for="login-email">Email</label>
            <input id="login-email" type="email" required>
          </div>
          <div class="field">
            <label for="login-password">Password</label>
            <input id="login-password" type="password" required>
          </div>
          <p id="login-error" class="card-text" style="color:#a83b3b; display:none;"></p>
          <button class="button" type="submit">Accedi</button>
        </form>
      </div>
    </section>
  `;

  document.querySelector("#login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.querySelector("#login-email").value.trim();
    const password = document.querySelector("#login-password").value;
    const errorBox = document.querySelector("#login-error");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      errorBox.textContent = "Credenziali non valide.";
      errorBox.style.display = "block";
      return;
    }

    await renderAdmin();
  });
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

// =========================================
// Upload immagini su Supabase Storage (al posto del base64 in localStorage)
// =========================================
async function uploadToStorage(file) {
  const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}`;
  const { error } = await supabase.storage.from("photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("Errore upload:", error);
    alert("Upload immagine fallito. Controlla la console.");
    return "";
  }

  const { data } = supabase.storage.from("photos").getPublicUrl(path);
  return data.publicUrl;
}

function bindAdminEvents() {
  document.querySelector("#logout")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    await renderAdmin();
  });

  document.querySelector("#location-photo-file")?.addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (file) document.querySelector("#location-photo").value = await uploadToStorage(file);
  });

  document.querySelector("#restaurant-cover-file")?.addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (file) document.querySelector("#restaurant-cover").value = await uploadToStorage(file);
  });

  document.querySelector("#restaurant-photos-file")?.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const values = await Promise.all(files.map(uploadToStorage));
    const input = document.querySelector("#restaurant-photos");
    input.value = [input.value, ...values].filter(Boolean).join("\n").trim();
  });

  document.querySelector("#location-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.querySelector("#location-name").value.trim();

    const { error } = await supabase.from("locations").insert({
      id: uniqueId(name, state.locations),
      name,
      photo:
        form.querySelector("#location-photo").value.trim() ||
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
      description: form.querySelector("#location-description").value.trim(),
    });

    if (error) {
      alert("Errore salvando la località.");
      console.error(error);
      return;
    }

    await fetchState();
    await renderAdmin();
  });

  document.querySelector("#restaurant-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.querySelector("#restaurant-name").value.trim();
    const photos = form
      .querySelector("#restaurant-photos")
      .value.split("\n")
      .map((value) => value.trim())
      .filter(Boolean);

    const { error } = await supabase.from("restaurants").insert({
      id: uniqueId(name, state.restaurants),
      location_id: form.querySelector("#restaurant-location").value,
      name,
      address: form.querySelector("#restaurant-address").value.trim(),
      cover:
        form.querySelector("#restaurant-cover").value.trim() ||
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80",
      photos,
      description: form.querySelector("#restaurant-description").value.trim(),
      score_location: Number(form.querySelector("#score-location").value),
      score_service: Number(form.querySelector("#score-service").value),
      score_menu: Number(form.querySelector("#score-menu").value),
      score_bill: Number(form.querySelector("#score-bill").value),
    });

    if (error) {
      alert("Errore salvando il posto.");
      console.error(error);
      return;
    }

    await fetchState();
    await renderAdmin();
  });

  document.querySelectorAll("[data-delete-location]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.deleteLocation;
      const { error } = await supabase.from("locations").delete().eq("id", id);
      if (error) {
        alert("Errore eliminando la località.");
        console.error(error);
        return;
      }
      await fetchState();
      await renderAdmin();
    });
  });

  document.querySelectorAll("[data-delete-restaurant]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.deleteRestaurant;
      const { error } = await supabase.from("restaurants").delete().eq("id", id);
      if (error) {
        alert("Errore eliminando il posto.");
        console.error(error);
        return;
      }
      await fetchState();
      await renderAdmin();
    });
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

// =========================================
// Avvio
// =========================================
window.addEventListener("hashchange", render);

(async () => {
  await fetchState();
  await render();
})();
