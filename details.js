const API_BASE = 'https://api.jikan.moe/v4';

const loader = document.getElementById('loader');
const content = document.getElementById('content');

// DOM Elements
const heroImg = document.getElementById('heroImg');
const posterImg = document.getElementById('posterImg');
const animeTitle = document.getElementById('animeTitle');
const animeTags = document.getElementById('animeTags');
const score = document.getElementById('score');
const rank = document.getElementById('rank');
const episodes = document.getElementById('episodes');
const studio = document.getElementById('studio');
const synopsis = document.getElementById('synopsis');

const charGrid = document.getElementById('charGrid');
const trailerSection = document.getElementById('trailerSection');
const trailerIframe = document.getElementById('trailerIframe');

// Get ID from URL
const urlParams = new URLSearchParams(window.location.search);
const animeId = urlParams.get('id');

const fetchAnimeDetails = async () => {
    if (!animeId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/anime/${animeId}/full`);
        const data = await res.json();
        const anime = data.data;

        // Populate header
        document.title = `${anime.title_english || anime.title} | Anime Universe`;
        
        posterImg.src = anime.images.webp.large_image_url;
        
        if (anime.trailer && anime.trailer.images && anime.trailer.images.maximum_image_url) {
            heroImg.src = anime.trailer.images.maximum_image_url;
        } else {
            heroImg.src = anime.images.webp.large_image_url;
        }

        animeTitle.textContent = anime.title_english || anime.title;
        
        // Tags (Genres + Demographics)
        const allTags = [...(anime.genres || []), ...(anime.demographics || []), ...(anime.themes || [])];
        animeTags.innerHTML = '';
        allTags.forEach(tag => {
            const span = document.createElement('span');
            span.classList.add('tag');
            span.textContent = tag.name;
            animeTags.appendChild(span);
        });

        // Stats
        score.textContent = anime.score || 'N/A';
        rank.textContent = anime.rank ? `#${anime.rank}` : 'N/A';
        episodes.textContent = anime.episodes ? `${anime.episodes} Eps` : 'Ongoing';
        
        if (anime.studios && anime.studios.length > 0) {
            studio.textContent = anime.studios[0].name;
        }

        synopsis.textContent = anime.synopsis || "No synopsis available for this anime.";

        // Trailer
        if (anime.trailer && anime.trailer.youtube_id) {
            trailerSection.style.display = 'block';
            trailerIframe.src = `https://www.youtube.com/embed/${anime.trailer.youtube_id}`;
        }

        // Fetch Characters
        fetchCharacters();

    } catch (error) {
        console.error("Failed to load anime details", error);
        content.innerHTML = `<h2 class="error-msg">Error loading details. <a href="index.html" style="color:var(--accent-color)">Go Back</a></h2>`;
    }
};

const fetchCharacters = async () => {
    try {
        const res = await fetch(`${API_BASE}/anime/${animeId}/characters`);
        const data = await res.json();
        const characters = data.data.slice(0, 12); // limit to top 12

        charGrid.innerHTML = '';
        characters.forEach(char => {
            const card = document.createElement('div');
            card.classList.add('char-card');

            const imgUrl = char.character.images.webp.image_url;
            
            card.innerHTML = `
                <img src="${imgUrl}" alt="${char.character.name}" class="char-img">
                <div class="char-info">
                    <div class="char-name">${char.character.name}</div>
                    <div class="char-role">${char.role}</div>
                </div>
            `;
            
            charGrid.appendChild(card);
        });

        // Reveal content
        loader.style.display = 'none';
        content.classList.remove('hidden');

    } catch (error) {
        console.error("Failed to fetch chars", error);
    }
};

fetchAnimeDetails();
