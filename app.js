const CONFIG_URL = "site.config.json";
const HERO_CONFIG_URL = "hero.config.json";
const DEFAULT_HOME_VIDEO_INDEXES = [0, 1, 2];
const DEFAULT_VIDEO_IMAGE = "assets/bfq.png";
const DEFAULT_HERO_INTERVAL = 3000;

const icons = {
  instagram:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><path d="M17.5 6.5h.01"></path></svg>',
  youtube:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12s0-3.3-.42-4.88a2.75 2.75 0 0 0-1.94-1.95C17.94 4.72 12 4.72 12 4.72s-5.94 0-7.64.45a2.75 2.75 0 0 0-1.94 1.95C2 8.7 2 12 2 12s0 3.3.42 4.88a2.75 2.75 0 0 0 1.94 1.95c1.7.45 7.64.45 7.64.45s5.94 0 7.64-.45a2.75 2.75 0 0 0 1.94-1.95C22 15.3 22 12 22 12Z"></path><path d="m10 15.5 5.2-3.5L10 8.5v7Z"></path></svg>',
  search:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z"></path></svg>',
  arrow:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>',
  arrowLeft:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5"></path><path d="m11 18-6-6 6-6"></path></svg>',
  up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18 15-6-6-6 6"></path></svg>'
};

const app = document.querySelector("#app");
const videoModal = document.querySelector("[data-modal]");
const modalVideo = document.querySelector("[data-modal-video]");
const modalTitle = document.querySelector("[data-modal-title]");
const closeModalButton = document.querySelector("[data-close]");
const videoListModal = document.querySelector("[data-video-list-modal]");
const videoList = document.querySelector("[data-video-list]");
const closeVideoListButton = document.querySelector("[data-close-video-list]");
const videoPrevButton = document.querySelector("[data-video-prev]");
const videoNextButton = document.querySelector("[data-video-next]");
const imageModal = document.querySelector("[data-image-modal]");
const previewImage = document.querySelector("[data-preview-image]");
const closeImageButton = document.querySelector("[data-close-image]");
const previewPrevButton = document.querySelector("[data-preview-prev]");
const previewNextButton = document.querySelector("[data-preview-next]");
const aboutModal = document.querySelector("[data-about-modal]");
const closeAboutButton = document.querySelector("[data-close-about]");
const aboutTitle = document.querySelector("[data-about-title]");
const aboutLink = document.querySelector("[data-about-link]");
const aboutImage = document.querySelector("[data-about-image]");
const aboutEmpty = document.querySelector("[data-about-empty]");
const aboutDescription = document.querySelector("[data-about-description]");

let activeConfig;
let activeHeroConfig;
let featuredOrder = [];
let galleryStartIndex = 0;
let activePreviewIndex = 0;
let galleryTouchStartX = 0;
let activeVideoIndex = -1;
let heroImageIndex = 0;
let heroTimer;

async function init() {
  try {
    const [siteConfig, heroConfig] = await Promise.all([fetchJson(CONFIG_URL), fetchJson(HERO_CONFIG_URL)]);
    activeConfig = siteConfig;
    activeHeroConfig = heroConfig;
    featuredOrder = getRandomFeaturedImages(activeConfig);
    render(activeConfig, activeHeroConfig);
    renderVideoList(activeConfig);
    bindEvents();
    startHeroCarousel();
  } catch (error) {
    app.innerHTML = `
      <main class="config-error">
        <div>
          <h1>无法读取配置文件</h1>
          <p>请通过本地服务器打开页面，并确认 ${CONFIG_URL} 和 ${HERO_CONFIG_URL} 与 index.html 在同一目录。</p>
          <p>${escapeHtml(error.message)}</p>
        </div>
      </main>
    `;
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${url} 读取失败：${response.status}`);
  return response.json();
}

function render(config, heroConfig) {
  app.innerHTML = `
    ${renderHero(config, heroConfig)}
    <main class="content">
      ${renderLatest(config)}
      ${renderFollow(config)}
    </main>
    ${renderFooter(config)}
  `;
}

function renderHero(config, heroConfig) {
  const heroImage = getHeroImages(heroConfig)[heroImageIndex] || heroConfig.image || "";
  const heroVideo = resolveAssetUrl(heroConfig.video || "", "video", config);
  return `
    <header class="hero" id="home">
      <img class="hero-image" data-hero-image src="${escapeAttr(heroImage)}" alt="${escapeAttr(config.hero.title)}" />
      <div class="topbar">
        ${renderBrand(config.brand)}
        <nav class="nav" aria-label="主导航">
          ${(config.navigation || [])
            .map((item) => {
              const external = isExternalUrl(item.href);
              return `<a class="${item.active ? "is-active" : ""}" href="${escapeAttr(item.href)}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${escapeHtml(item.label)}</a>`;
            })
            .join("")}
        </nav>
        <div class="socials">
          ${renderSocials(config.social)}
          <button class="search-button" type="button" aria-label="搜索">${icons.search}</button>
        </div>
      </div>
      <div class="hero-content">
        <div class="hero-copy">
          <p class="eyebrow">${escapeHtml(config.hero.eyebrow)}</p>
          <h1>${escapeHtml(config.hero.title)}</h1>
          <p class="hero-description">${escapeHtml(config.hero.description)}</p>
          <button class="watch-button" type="button" data-video-index="0" data-video="${escapeAttr(heroVideo)}" data-title="${escapeAttr(config.hero.title)}">
            ${icons.play}
            <span>${escapeHtml(config.hero.ctaLabel)}</span>
          </button>
          <button class="watch-button watch-button-secondary" type="button" data-open-about>
            <span>关注抖音</span>
          </button>
        </div>
      </div>
    </header>
  `;
}

function renderLatest(config) {
  const latest = config.sections.latest;
  return `
    <section id="videos" aria-labelledby="latest-title">
      ${renderSectionHead("latest-title", latest, "videos")}
      <div class="video-grid video-wall">
        ${getVideoWall(config).map((item, index) => renderVideoCard(item, index, config)).join("")}
      </div>
    </section>
  `;
}

function getVideoWall(config) {
  return (config.videos || []).filter(Boolean);
}

function renderVideoCard(item, index, config) {
  const title = getVideoTitle(item, index);
  const video = getVideoSrc(item, config);
  return `
    <article class="video-card ${index === 0 ? "is-featured" : ""}">
      <div class="media-frame">
        <img src="${escapeAttr(getVideoImage(item, config))}" alt="${escapeAttr(title)}" loading="${index === 0 ? "eager" : "lazy"}" />
        <button class="play-overlay" type="button" data-video-index="${getVideoIndex(item)}" data-video="${escapeAttr(video)}" data-title="${escapeAttr(title)}" aria-label="播放 ${escapeAttr(title)}">
          <span class="play-circle">${icons.play}</span>
        </button>
        <span class="video-rank">${String(index + 1).padStart(2, "0")}</span>
        ${index === 0 ? '<span class="video-badge">最新</span>' : ""}
      </div>
      <h3>${escapeHtml(title)}</h3>
    </article>
  `;
}

function renderFollow(config) {
  const about = config.about || {};
  return `
    <section class="follow-panel" id="follow" aria-label="关注抖音">
      <div class="follow-copy">
        <p>DOUYIN CREATOR</p>
        <h2>更多实战干货，尽在抖音</h2>
        <span>扫码关注 @路亚码农，看最新窗口、标点、装备和鱼口复盘。</span>
      </div>
      <button class="follow-qr" type="button" data-open-about aria-label="打开抖音二维码">
        ${about.qrImage ? `<img src="${escapeAttr(about.qrImage)}" alt="路亚码农抖音二维码" loading="lazy" />` : "<span>抖音二维码</span>"}
      </button>
    </section>
  `;
}

function renderGallery(config) {
  const gallery = config.sections.gallery;
  return `
    <section id="gallery" aria-labelledby="gallery-title">
      ${renderSectionHead("gallery-title", gallery, "gallery")}
      <div class="gallery-shell">
        <button class="gallery-nav gallery-nav-prev" type="button" data-gallery-prev aria-label="上一张精选图片">
          ${icons.arrowLeft}
        </button>
        <div class="gallery-grid" data-gallery-grid>
          ${renderVisibleGalleryImages()}
        </div>
        <button class="gallery-nav gallery-nav-next" type="button" data-gallery-next aria-label="下一张精选图片">
          ${icons.arrow}
        </button>
      </div>
    </section>
  `;
}

function renderDiary(config) {
  const diary = config.diary || {};
  const section = (config.sections && config.sections.diary) || { title: "路亚日记" };
  const entries = diary.entries || [];
  return `
    
  `;
}

function renderDiaryEntry(entry) {
  const image = entry.images && entry.images.length ? entry.images[0] : "";
  return `
    <article class="diary-card">
      ${image ? `<img src="${escapeAttr(image)}" alt="${escapeAttr(entry.title || "日记图片")}" loading="lazy" />` : ""}
      <div class="diary-copy">
        <p>${[entry.date, entry.location, entry.weather].filter(Boolean).map(escapeHtml).join(" / ")}</p>
        <h3>${escapeHtml(entry.title || "未命名日记")}</h3>
        <div>${escapeHtml(entry.content || "")}</div>
      </div>
    </article>
  `;
}

function renderVisibleGalleryImages() {
  return getVisibleFeaturedImages().map(renderGalleryImage).join("");
}

function getVisibleFeaturedImages() {
  const count = Math.min(getFeaturedDisplayCount(activeConfig), featuredOrder.length);
  return Array.from({ length: count }, (_, offset) => {
    const index = (galleryStartIndex + offset) % featuredOrder.length;
    return { image: featuredOrder[index], index };
  });
}

function renderGalleryImage(item, offset) {
  return `
    <button class="gallery-item" type="button" data-preview-index="${item.index}" aria-label="预览精选图片 ${offset + 1}">
      <img src="${escapeAttr(item.image)}" alt="精选图片 ${offset + 1}" loading="lazy" />
    </button>
  `;
}

function renderSectionHead(id, section, type) {
  if (type === "gallery") {
    return `
      <div class="section-head">
        <h2 id="${id}">${escapeHtml(section.title)}</h2>
      </div>
    `;
  }

  return `
    <div class="section-head">
      <h2 id="${id}">${escapeHtml(section.title)}</h2>
      <button class="view-all" type="button" data-open-video-list>
        <span>${escapeHtml(section.linkLabel)}</span>
        ${icons.arrow}
      </button>
    </div>
  `;
}

function renderFooter(config) {
  return `
    <footer class="footer" id="about">
      <div class="footer-inner">
        ${renderBrand(config.brand)}
        <p class="footer-tagline">${escapeHtml(config.brand.tagline)}</p>
        <div class="footer-actions">
          ${renderSocials(config.social)}
          <a class="back-top" href="#home" aria-label="返回顶部">${icons.up}</a>
        </div>
      </div>
    </footer>
  `;
}

function renderBrand(brand) {
  return `
    <a class="brand" href="#home" aria-label="${escapeAttr(brand.name)} ${escapeAttr(brand.subline)}">
      <span class="brand-name">${escapeHtml(brand.name)}</span>
      <span class="brand-subline">${escapeHtml(brand.subline)}</span>
    </a>
  `;
}

function renderSocials(socials = []) {
  return socials
    .map(
      (item) => `
        <a class="icon-link" href="${escapeAttr(item.href)}" target="_blank" rel="noreferrer" aria-label="${escapeAttr(item.label)}">
          ${icons[item.type] || icons.arrow}
        </a>
      `
    )
    .join("");
}

function renderVideoList(config) {
  videoList.innerHTML = (config.videos || [])
    .map((item, index) => {
      const title = getVideoTitle(item, index);
      const video = getVideoSrc(item, config);
      return `
        <button class="video-list-item" type="button" data-video-index="${index}" data-video="${escapeAttr(video)}" data-title="${escapeAttr(title)}">
          <span class="video-list-cover">
            <img src="${escapeAttr(getVideoImage(item, config))}" alt="${escapeAttr(title)}" loading="lazy" />
          </span>
          <span class="video-list-copy">
            <strong>${escapeHtml(title)}</strong>
          </span>
          <span class="video-list-play" aria-hidden="true">${icons.play}</span>
        </button>
      `;
    })
    .join("");
}

function getVideoImage(item, config) {
  return resolveAssetUrl((item && item.image) || config.videoDefaultImage || DEFAULT_VIDEO_IMAGE, "image", config);
}

function getVideoSrc(item, config) {
  return resolveAssetUrl(item && item.video, "video", config);
}

function resolveAssetUrl(value = "", type, config = activeConfig) {
  if (!value || isExternalUrl(value) || value.startsWith("/") || value.startsWith("data:") || value.startsWith("blob:")) {
    return value || "";
  }

  const assets = (config && config.assets) || {};
  const baseUrl = trimTrailingSlash(assets.baseUrl || "");
  const folder = type === "video" ? assets.videos : type === "image" ? assets.images : "";
  const normalizedFolder = trimSlashes(folder || "");
  const normalizedValue = trimLeadingSlash(value);

  if (!baseUrl) {
    return [normalizedFolder, normalizedValue].filter(Boolean).join("/");
  }

  return [baseUrl, normalizedFolder, normalizedValue].filter(Boolean).join("/");
}

function trimTrailingSlash(value = "") {
  return String(value).replace(/\/+$/, "");
}

function trimLeadingSlash(value = "") {
  return String(value).replace(/^\/+/, "");
}

function trimSlashes(value = "") {
  return trimLeadingSlash(trimTrailingSlash(value));
}

function getVideoTitle(item, index) {
  return (item && item.title) || `视频 ${index + 1}`;
}

function getVideoIndex(item) {
  if (!activeConfig || !Array.isArray(activeConfig.videos)) return -1;
  return activeConfig.videos.indexOf(item);
}

function getVideoByIndex(index) {
  if (!activeConfig || !Array.isArray(activeConfig.videos) || !activeConfig.videos.length) return null;
  const wrappedIndex = wrapIndex(index, activeConfig.videos.length);
  const item = activeConfig.videos[wrappedIndex];
  return item ? { item, index: wrappedIndex } : null;
}

function updateVideoNavState() {
  const total = activeConfig && Array.isArray(activeConfig.videos) ? activeConfig.videos.length : 0;
  const disabled = total <= 1 || activeVideoIndex < 0;
  videoPrevButton.disabled = disabled;
  videoNextButton.disabled = disabled;
}

function openVideoByIndex(index) {
  const next = getVideoByIndex(index);
  if (!next) return;
  openVideo(getVideoSrc(next.item, activeConfig), getVideoTitle(next.item, next.index), next.index);
}

function moveVideo(direction) {
  if (activeVideoIndex < 0) return;
  openVideoByIndex(activeVideoIndex + direction);
}

function getRandomFeaturedImages(config) {
  const images = [...((config.featuredImages && config.featuredImages.images) || [])];
  return shuffle(images);
}

function getFeaturedDisplayCount(config) {
  return Number(config && config.featuredImages && config.featuredImages.displayCount) || 4;
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }
  return items;
}

function bindEvents() {
  app.addEventListener("click", (event) => {
    const navLink = event.target.closest("a");
    if (navLink && navLink.getAttribute("href") === "#about") {
      event.preventDefault();
      openAbout();
      return;
    }

    const videoButton = event.target.closest("[data-video]");
    if (videoButton) {
      openVideo(videoButton.dataset.video, videoButton.dataset.title, Number(videoButton.dataset.videoIndex));
      closeVideoList();
      return;
    }

    if (event.target.closest("[data-open-video-list]")) {
      openVideoList();
      return;
    }

    if (event.target.closest("[data-open-about]")) {
      openAbout();
      return;
    }

    if (event.target.closest("[data-gallery-prev]")) {
      moveGallery(-getFeaturedDisplayCount(activeConfig));
      return;
    }

    if (event.target.closest("[data-gallery-next]")) {
      moveGallery(getFeaturedDisplayCount(activeConfig));
      return;
    }

    const previewButton = event.target.closest("[data-preview-index]");
    if (previewButton) {
      openImage(Number(previewButton.dataset.previewIndex));
    }
  });

  app.addEventListener("touchstart", (event) => {
    if (!event.target.closest("[data-gallery-grid]")) return;
    galleryTouchStartX = event.changedTouches[0].clientX;
  });

  app.addEventListener("touchend", (event) => {
    if (!event.target.closest("[data-gallery-grid]")) return;
    const distance = event.changedTouches[0].clientX - galleryTouchStartX;
    if (Math.abs(distance) < 36) return;
    moveGallery(distance > 0 ? -getFeaturedDisplayCount(activeConfig) : getFeaturedDisplayCount(activeConfig));
  });

  videoList.addEventListener("click", (event) => {
    const videoButton = event.target.closest("[data-video]");
    if (videoButton) {
      openVideo(videoButton.dataset.video, videoButton.dataset.title, Number(videoButton.dataset.videoIndex));
      closeVideoList();
    }
  });

  closeModalButton.addEventListener("click", closeVideo);
  closeVideoListButton.addEventListener("click", closeVideoList);
  closeImageButton.addEventListener("click", closeImage);
  closeAboutButton.addEventListener("click", closeAbout);
  previewPrevButton.addEventListener("click", () => movePreview(-1));
  previewNextButton.addEventListener("click", () => movePreview(1));
  videoPrevButton.addEventListener("click", () => moveVideo(-1));
  videoNextButton.addEventListener("click", () => moveVideo(1));

  videoModal.addEventListener("click", (event) => {
    if (event.target === videoModal) closeVideo();
  });
  videoListModal.addEventListener("click", (event) => {
    if (event.target === videoListModal) closeVideoList();
  });
  imageModal.addEventListener("click", (event) => {
    if (event.target === imageModal) closeImage();
  });
  aboutModal.addEventListener("click", (event) => {
    if (event.target === aboutModal) closeAbout();
  });
  document.addEventListener("keydown", (event) => {
    if (!videoModal.hidden && event.key === "ArrowLeft") moveVideo(-1);
    if (!videoModal.hidden && event.key === "ArrowRight") moveVideo(1);
    if (!imageModal.hidden && event.key === "ArrowLeft") movePreview(-1);
    if (!imageModal.hidden && event.key === "ArrowRight") movePreview(1);
    if (event.key === "Escape") {
      closeVideo();
      closeVideoList();
      closeImage();
      closeAbout();
    }
  });
}

function moveGallery(direction) {
  if (!featuredOrder.length) return;
  galleryStartIndex = wrapIndex(galleryStartIndex + direction, featuredOrder.length);
  const grid = document.querySelector("[data-gallery-grid]");
  if (grid) grid.innerHTML = renderVisibleGalleryImages();
}

function startHeroCarousel() {
  const images = getHeroImages(activeHeroConfig);
  clearInterval(heroTimer);
  if (images.length <= 1) return;
  heroTimer = setInterval(() => {
    heroImageIndex = wrapIndex(heroImageIndex + 1, images.length);
    const heroImage = document.querySelector("[data-hero-image]");
    if (heroImage) heroImage.src = images[heroImageIndex];
  }, Number(activeHeroConfig.interval) || DEFAULT_HERO_INTERVAL);
}

function getHeroImages(heroConfig) {
  if (Array.isArray(heroConfig.images) && heroConfig.images.length) return heroConfig.images;
  return heroConfig.image ? [heroConfig.image] : [];
}

function openVideo(src, title, index = -1) {
  if (!src) return;
  activeVideoIndex = Number.isFinite(index) ? index : -1;
  videoModal.classList.remove("is-landscape-video", "is-portrait-video");
  modalVideo.pause();
  modalVideo.removeAttribute("src");
  modalVideo.load();
  modalVideo.src = src;
  modalVideo.onloadedmetadata = () => {
    videoModal.classList.toggle("is-portrait-video", modalVideo.videoHeight > modalVideo.videoWidth);
    videoModal.classList.toggle("is-landscape-video", modalVideo.videoWidth >= modalVideo.videoHeight);
  };
  modalTitle.textContent = title || "";
  videoModal.classList.add("is-fullscreen-fallback");
  videoModal.hidden = false;
  updateVideoNavState();
  modalVideo.play().catch(() => {});
}

function closeVideo() {
  if (videoModal.hidden) return;
  videoModal.hidden = true;
  videoModal.classList.remove("is-fullscreen-fallback");
  videoModal.classList.remove("is-landscape-video", "is-portrait-video");
  modalVideo.onloadedmetadata = null;
  activeVideoIndex = -1;
  updateVideoNavState();
  modalVideo.pause();
  modalVideo.removeAttribute("src");
  modalVideo.load();
}

function openVideoList() {
  videoListModal.hidden = false;
}

function closeVideoList() {
  videoListModal.hidden = true;
}

function openImage(index) {
  if (!featuredOrder.length) return;
  activePreviewIndex = wrapIndex(index, featuredOrder.length);
  previewImage.src = featuredOrder[activePreviewIndex];
  imageModal.classList.add("is-fullscreen-fallback");
  imageModal.hidden = false;
  requestFullscreen(imageModal);
}

function movePreview(direction) {
  if (imageModal.hidden || !featuredOrder.length) return;
  activePreviewIndex = wrapIndex(activePreviewIndex + direction, featuredOrder.length);
  previewImage.src = featuredOrder[activePreviewIndex];
}

function closeImage() {
  exitFullscreen(imageModal);
  imageModal.hidden = true;
  imageModal.classList.remove("is-fullscreen-fallback");
  previewImage.removeAttribute("src");
}

function openAbout() {
  const about = activeConfig.about || {};
  aboutTitle.textContent = about.title || "关于我";
  aboutDescription.textContent = about.description || "";
  aboutLink.href = about.link || "#";
  if (about.qrImage) {
    aboutImage.src = about.qrImage;
    aboutImage.hidden = false;
    aboutEmpty.textContent = "";
  } else {
    aboutImage.hidden = true;
    aboutImage.removeAttribute("src");
    aboutEmpty.textContent = "请在 site.config.json 的 about.qrImage 配置二维码图片";
  }
  aboutModal.hidden = false;
}

function closeAbout() {
  aboutModal.hidden = true;
}

function wrapIndex(index, length) {
  return ((index % length) + length) % length;
}

function requestFullscreen(element) {
  if (!element) return;
  if (element.webkitEnterFullscreen) {
    element.webkitEnterFullscreen();
    return;
  }
  const request = element.requestFullscreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
  if (!request) return;
  const result = request.call(element);
  if (result && result.catch) result.catch(() => {});
}

function exitFullscreen(owner) {
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
  if (!fullscreenElement || (owner && fullscreenElement !== owner && !owner.contains(fullscreenElement))) return;
  const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
  if (!exit) return;
  const result = exit.call(document);
  if (result && result.catch) result.catch(() => {});
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value = "") {
  return escapeHtml(value);
}

function isExternalUrl(value = "") {
  return /^https?:\/\//.test(String(value));
}

init();
