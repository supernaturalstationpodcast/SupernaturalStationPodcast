async function loadEpisodes() {
  try {
    const res = await fetch("assets/data/episodes.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load episodes.json");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

function setYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
}

function mobileNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function episodeCard(ep) {
  const tags = (ep.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("");
  const links = [];

  if (ep.apple) links.push(`<a class="pill" href="${ep.apple}" target="_blank" rel="noopener">Apple</a>`);
  if (ep.spotify) links.push(`<a class="pill" href="${ep.spotify}" target="_blank" rel="noopener">Spotify</a>`);
  if (ep.youtube) links.push(`<a class="pill" href="${ep.youtube}" target="_blank" rel="noopener">YouTube</a>`);
  if (ep.tiktok) links.push(`<a class="pill" href="${ep.tiktok}" target="_blank" rel="noopener">TikTok</a>`);

  return `
    <article class="episode">
      <div class="episode__top">
        <h3 class="episode__title">${escapeHtml(ep.title || "Untitled episode")}</h3>
        <div class="episode__date">${escapeHtml(ep.date || "")}</div>
      </div>
      ${ep.guest ? `<div class="card__meta">Guest: ${escapeHtml(ep.guest)}</div>` : ``}
      <p class="episode__desc">${escapeHtml(ep.description || "")}</p>
      <div class="tag-row">${tags}</div>
      <div class="links-row">${links.join("")}</div>
    </article>
  `;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}

function normalize(str) {
  return String(str ?? "").toLowerCase().trim();
}

async function initEpisodesPage() {
  const list = document.getElementById("episodesList");
  if (!list) return;

  const search = document.getElementById("episodeSearch");
  const tagFilter = document.getElementById("tagFilter");

  const episodes = await loadEpisodes();

  // Build tag dropdown
  const tagsSet = new Set();
  for (const ep of episodes) (ep.tags || []).forEach(t => tagsSet.add(t));
  const tags = Array.from(tagsSet).sort((a,b)=>a.localeCompare(b));
  for (const t of tags) {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    tagFilter.appendChild(opt);
  }

  function render() {
    const q = normalize(search?.value);
    const selectedTag = tagFilter?.value || "";

    const filtered = episodes.filter(ep => {
      const haystack = [
        ep.title, ep.description, ep.guest, ...(ep.tags || [])
      ].map(normalize).join(" ");
      const matchesQuery = !q || haystack.includes(q);
      const matchesTag = !selectedTag || (ep.tags || []).includes(selectedTag);
      return matchesQuery && matchesTag;
    });

    if (!filtered.length) {
      list.innerHTML = `<div class="card"><div class="card__title">No matches</div><div class="card__meta">Try a different search or tag.</div></div>`;
      return;
    }

    list.innerHTML = filtered.map(episodeCard).join("");
  }

  search?.addEventListener("input", render);
  tagFilter?.addEventListener("change", render);

  render();
}

async function initLatestEpisodeCard() {
  const card = document.getElementById("latestEpisodeCard");
  if (!card) return;

  const episodes = await loadEpisodes();
  if (!episodes.length) {
    card.innerHTML = `<div class="card__title">No episodes yet</div><div class="card__meta">Add entries to assets/data/episodes.json</div>`;
    return;
  }

  // Assume episodes.json is sorted newest first
  const ep = episodes[0];
  card.innerHTML = `
    <div class="card__title">${escapeHtml(ep.title || "Latest Episode")}</div>
    <div class="card__meta">${escapeHtml(ep.date || "")}${ep.guest ? ` • Guest: ${escapeHtml(ep.guest)}` : ""}</div>
    <div class="card__body">${escapeHtml(ep.description || "")}</div>
    <div class="links-row" style="margin-top:12px;">
      ${ep.apple ? `<a class="pill" href="${ep.apple}" target="_blank" rel="noopener">Apple</a>` : ""}
      ${ep.spotify ? `<a class="pill" href="${ep.spotify}" target="_blank" rel="noopener">Spotify</a>` : ""}
      ${ep.youtube ? `<a class="pill" href="${ep.youtube}" target="_blank" rel="noopener">YouTube</a>` : ""}
      ${ep.tiktok ? `<a class="pill" href="${ep.tiktok}" target="_blank" rel="noopener">TikTok</a>` : ""}
    </div>
  `;
}

setYear();
mobileNav();
initEpisodesPage();
initLatestEpisodeCard();
