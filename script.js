const API_BASE = 'https://api.jikan.moe/v4';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchResultsSection = document.getElementById('searchResultsSection');
const mainContent = document.getElementById('mainContent');
const searchResultsGrid = document.getElementById('searchResultsGrid');
const searchLoader = document.getElementById('searchLoader');

const trendingGrid = document.getElementById('trendingGrid');
const trendingLoader = document.getElementById('trendingLoader');

const topGrid = document.getElementById('topGrid');
const topLoader = document.getElementById('topLoader');

const upcomingGrid = document.getElementById('upcomingGrid');
const upcomingLoader = document.getElementById('upcomingLoader');

const heroBg = document.getElementById('heroBg');
const heroTitle = document.getElementById('heroTitle');
const heroSynopsis = document.getElementById('heroSynopsis');

// Utilities
const showLoader = (loaderElement) => {
    if (loaderElement) loaderElement.style.display = 'block';
};

const hideLoader = (loaderElement) => {
    if (loaderElement) loaderElement.style.display = 'none';
};

const createAnimeCard = (anime) => {
    const card = document.createElement('div');
    card.classList.add('anime-card');
    card.onclick = () => {
        window.location.href = `anime.html?id=${anime.mal_id}`;
    };

    const imgContainer = document.createElement('div');
    imgContainer.classList.add('anime-img-container');

    const img = document.createElement('img');
    img.src = anime.images.webp.large_image_url || anime.images.jpg.image_url;
    img.alt = anime.title;
    img.classList.add('anime-img');

    const overlay = document.createElement('div');
    overlay.classList.add('anime-overlay');

    const title = document.createElement('h3');
    title.classList.add('anime-title');
    title.textContent = anime.title_english || anime.title;

    const meta = document.createElement('div');
    meta.classList.add('anime-meta');

    const rating = document.createElement('span');
    rating.innerHTML = `<i class="fa-solid fa-star"></i> ${anime.score || 'N/A'}`;

    const type = document.createElement('span');
    type.textContent = anime.type === 'TV' ? `${anime.episodes || '?'} Eps` : anime.type;

    meta.appendChild(rating);
    meta.appendChild(type);

    overlay.appendChild(title);
    overlay.appendChild(meta);

    imgContainer.appendChild(img);
    imgContainer.appendChild(overlay);

    card.appendChild(imgContainer);

    return card;
};

// Data Fetching
const fetchAnime = async (endpoint, container, loader, limit = 10) => {
    try {
        if (loader) showLoader(loader);
        const res = await fetch(`${API_BASE}${endpoint}`);
        const data = await res.json();
        const animes = data.data.slice(0, limit);
        
        if (container) {
            container.innerHTML = '';
            animes.forEach(anime => {
                container.appendChild(createAnimeCard(anime));
            });
        }
        
        if (loader) hideLoader(loader);
        return animes;
    } catch (error) {
        console.error('Error fetching data:', error);
        if (container) {
            container.innerHTML = `<p class="error-msg">Failed to load data. Please try again later.</p>`;
        }
        if (loader) hideLoader(loader);
        return [];
    }
};

// Search Logic
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    clearTimeout(searchTimeout);
    
    if (query.length < 3) {
        searchResultsSection.classList.add('hidden');
        mainContent.classList.remove('hidden');
        return;
    }

    searchTimeout = setTimeout(async () => {
        searchResultsSection.classList.remove('hidden');
        mainContent.classList.add('hidden');
        
        showLoader(searchLoader);
        try {
            const res = await fetch(`${API_BASE}/anime?q=${query}&limit=20`);
            const data = await res.json();
            
            searchResultsGrid.innerHTML = '';
            
            if (data.data.length === 0) {
                searchResultsGrid.innerHTML = `<p class="error-msg" style="grid-column: 1/-1;">No anime found matching "${query}"</p>`;
            } else {
                data.data.forEach(anime => {
                    searchResultsGrid.appendChild(createAnimeCard(anime));
                });
            }
        } catch (error) {
            searchResultsGrid.innerHTML = `<p class="error-msg" style="grid-column: 1/-1;">Error searching. Try again later.</p>`;
        }
        hideLoader(searchLoader);
    }, 500);
});

// Initialize Page
const initPage = async () => {
    // Top Trending/Airing
    const topAiring = await fetchAnime('/top/anime?filter=airing', trendingGrid, trendingLoader, 10);
    
    // Top 10 All Time
    await fetchAnime('/top/anime?filter=bypopularity', topGrid, topLoader, 10);
    
    // Top Upcoming
    await fetchAnime('/top/anime?filter=upcoming', upcomingGrid, upcomingLoader, 5);

    // Set Hero Banner to the #1 airing anime if available
    if (topAiring && topAiring.length > 0) {
        const featured = topAiring[0];
        heroTitle.textContent = featured.title_english || featured.title;
        const fullSynopsis = featured.synopsis || "No synopsis available.";
        heroSynopsis.textContent = fullSynopsis.length > 200 ? fullSynopsis.substring(0, 200) + '...' : fullSynopsis;
        if (featured.images.webp.large_image_url) {
            heroBg.src = featured.images.webp.large_image_url;
        } else if (featured.trailer && featured.trailer.images && featured.trailer.images.maximum_image_url) {
            heroBg.src = featured.trailer.images.maximum_image_url;
        }
    }
};

if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    initPage();
}
