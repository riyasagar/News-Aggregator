const API_KEY = '5be31f1f2a562587e6e4dfe8b8b24b11';
const BASE_URL = 'https://gnews.io/api/v4';

let currentPage = 1;
let currentQuery = '';
let currentTopic = '';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

async function fetchNews(query = '', topic = '', page = 1) {
  const url = `${BASE_URL}/top-headlines?lang=en&country=us&page=${page}${
    query ? `&q=${query}` : ''
  }${topic ? `&topic=${topic}` : ''}&token=${API_KEY}`;

  toggleLoader(true);
  try {
    const response = await axios.get(url);
    if (page === 1) document.getElementById('news-container').innerHTML = '';
    displayNews(response.data.articles);
  } catch (error) {
    console.error('Error fetching news:', error);
    document.getElementById('news-container').innerHTML =
      '<p>Error fetching news. Please try again later.</p>';
  } finally {
    toggleLoader(false);
  }
}

function displayNews(articles) {
  const newsContainer = document.getElementById('news-container');
  if (articles.length === 0) {
    newsContainer.innerHTML =
      '<p>No news articles found. Try another search.</p>';
    return;
  }

  articles.forEach((article) => {
    const newsCard = document.createElement('div');
    newsCard.className = 'news-card';

    const publishDate = new Date(article.publishedAt).toLocaleDateString(
      'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );

    const isFavorite = favorites.some((fav) => fav.url === article.url);

    newsCard.innerHTML = `
      <img src="${article.image || 'https://via.placeholder.com/300x200'}" alt="News Image">
      <div class="content">
        <h2>${article.title}</h2>
        <p>${article.description || 'No description available.'}</p>
        <p><strong>Published:</strong> ${publishDate}</p>
        <p><strong>Source:</strong> ${article.source.name || 'Unknown'}</p>
        <a href="${article.url}" target="_blank">Read More</a>
        <button onclick="toggleFavorite('${encodeURIComponent(
          JSON.stringify(article)
        )}')">${isFavorite ? '❤️ Remove' : '🤍 Save'}</button>
      </div>
    `;
    newsContainer.appendChild(newsCard);
  });
}

function toggleFavorite(articleStr) {
  const article = JSON.parse(decodeURIComponent(articleStr));
  const index = favorites.findIndex((fav) => fav.url === article.url);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(article);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  fetchNews(currentQuery, currentTopic, currentPage);
}

function showFavorites() {
  document.getElementById('news-container').innerHTML = '';
  if (favorites.length === 0) {
    document.getElementById('news-container').innerHTML =
      '<p>No favorites saved yet.</p>';
    return;
  }
  displayNews(favorites);
}

function toggleLoader(show) {
  document.getElementById('loader').classList.toggle('hidden', !show);
}

function handleSearch() {
  currentQuery = document.getElementById('search').value.trim();
  currentPage = 1;
  fetchNews(currentQuery);
}

function filterNews(topic) {
  currentTopic = topic;
  currentPage = 1;
  fetchNews('', topic);
}

function loadMore() {
  currentPage++;
  fetchNews(currentQuery, currentTopic, currentPage);
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const btn = document.getElementById('toggle-theme');
  btn.textContent = document.body.classList.contains('dark')
    ? '☀️ Light Mode'
    : '🌙 Dark Mode';
}

async function loadTrending() {
  const url = `${BASE_URL}/top-headlines?lang=en&country=us&max=5&token=${API_KEY}`;
  try {
    const response = await axios.get(url);
    const trending = document.getElementById('trending');
    trending.innerHTML = '🔥 Trending: ';
    response.data.articles.forEach((article) => {
      const span = document.createElement('span');
      span.textContent = article.title.split(' ').slice(0, 5).join(' ') + '...';
      span.onclick = () => fetchNews(article.title);
      trending.appendChild(span);
    });
  } catch (error) {
    console.error('Error fetching trending news:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchNews();
  loadTrending();

  document.getElementById('search-btn').addEventListener('click', handleSearch);
  document
    .getElementById('favorites-btn')
    .addEventListener('click', showFavorites);
  document
    .querySelectorAll('.categories button')
    .forEach((btn) =>
      btn.addEventListener('click', () => filterNews(btn.dataset.topic))
    );
  document
    .getElementById('load-more-btn')
    .addEventListener('click', loadMore);
  document
    .getElementById('toggle-theme')
    .addEventListener('click', toggleTheme);
});
