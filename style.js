// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherInfo = document.getElementById('weatherInfo');
const suggestionsContainer = document.getElementById('suggestions');
const themeToggle = document.getElementById('themeToggle');
const loading = document.getElementById('loading');

// API URL
const API_URL = 'https://app-json-server-jj04.onrender.com';

// State
let weatherData = [];

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('input', debounce(showSuggestions, 500));
document.addEventListener('click', e => {
    if (!suggestionsContainer.contains(e.target) && e.target !== cityInput) {
        hideSuggestions();
    }
});

// Initialize App
async function initializeApp() {
    showLoading();
    try {
        const data = await fetchWeatherData();
        weatherData = mergeCityWeather(data);
        console.log('✅ Fetched data from API:', weatherData);
    } catch (err) {
        console.warn('⚠ Backend unavailable. Using local fallback.');
        weatherData = mergeCityWeather(getLocalData());
    }
    initializeTheme();
    hideLoading();
}

// Fetch Data
async function fetchWeatherData() {
    const res = await fetch(`${API_URL}`);
    const contentType = res.headers.get("content-type");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Not JSON");
    }
    return res.json();
}

// Merge cities + weather
function mergeCityWeather(data) {
    const result = [];
    const cities = data.cities;
    const weather = data.weather;

    for (const id in cities) {
        const city = cities[id];
        const weatherInfo = weather[id] || {};
        result.push({
            ...city,
            ...weatherInfo
        });
    }
    return result;
}

// Fallback Local Data
function getLocalData() {
    return {
        "cities": {
            "1": {
                "id": "1",
                "name": "Nairobi",
                "country": "KE",
                "coordinates": { "lat": -1.2864, "lon": 36.8175 },
                "climate": {
                    "type": "Tropical savanna climate",
                    "rainy_season": "March-May, Oct-Dec",
                    "average_temp": "18°C",
                    "description": "Moderate year-round temperatures."
                }
            },
            "2": {
                "id": "2",
                "name": "Mombasa",
                "country": "KE",
                "coordinates": { "lat": -4.0468, "lon": 39.6637 },
                "climate": {
                    "type": "Tropical monsoon climate",
                    "rainy_season": "Apr-May, Oct-Nov",
                    "average_temp": "27°C",
                    "description": "Warm and humid year-round."
                }
            },
            "3": {
                "id": "3",
                "name": "Kisumu",
                "country": "KE",
                "coordinates": { "lat": -0.0833, "lon": 34.7667 },
                "climate": {
                    "type": "Tropical savanna climate",
                    "rainy_season": "March-May, Oct-Nov",
                    "average_temp": "24°C",
                    "description": "Warm, moderate climate."
                }
            }
        },
        "weather": {
            "1": {
                "tempC": 22,
                "tempF": 71.6,
                "description": "Partly cloudy",
                "humidity": 65,
                "windSpeed": 5.1,
                "icon": "https://openweathermap.org/img/wn/02d@2x.png",
                "lastUpdated": new Date().toISOString()
            },
            "2": {
                "tempC": 28,
                "tempF": 82.4,
                "description": "Sunny",
                "humidity": 75,
                "windSpeed": 4.5,
                "icon": "https://openweathermap.org/img/wn/01d@2x.png",
                "lastUpdated": new Date().toISOString()
            },
            "3": {
                "tempC": 25,
                "tempF": 77,
                "description": "Cloudy",
                "humidity": 80,
                "windSpeed": 3.8,
                "icon": "https://openweathermap.org/img/wn/04d@2x.png",
                "lastUpdated": new Date().toISOString()
            }
        }
    };
}

// Search + Suggestions
function searchWeather() {
    const name = cityInput.value.trim().toLowerCase();
    if (!name) return showError('Enter a city name');
    const match = weatherData.find(c => c.name.toLowerCase() === name);
    if (!match) return showError(`City "${cityInput.value}" not found`);
    displayWeather(match);
    cityInput.value = '';
    hideSuggestions();
}

function showSuggestions() {
    const query = cityInput.value.trim().toLowerCase();
    if (!query) return hideSuggestions();

    const matches = weatherData.filter(c =>
        c.name.toLowerCase().includes(query)
    ).slice(0, 5);

    suggestionsContainer.innerHTML = '';
    matches.forEach(city => {
        const li = document.createElement('li');
        li.textContent = `${city.name}, ${city.country}`;
        li.addEventListener('click', () => {
            cityInput.value = city.name;
            searchWeather();
        });
        suggestionsContainer.appendChild(li);
    });

    suggestionsContainer.classList.toggle('show', matches.length > 0);
}

function hideSuggestions() {
    suggestionsContainer.classList.remove('show');
}

// Display Weather
function displayWeather(city) {
    weatherInfo.innerHTML = '';
    weatherInfo.appendChild(createWeatherCard(city));
}

function createWeatherCard(city) {
    const card = document.createElement('div');
    card.className = 'weather-card';
    card.innerHTML = `
        <img src="${city.icon}" alt="${city.description}" class="weather-icon">
        <h2>${city.name}</h2>
        <p>${city.description}</p>
        <p>Temp: ${city.tempC}°C (${city.tempF}°F)</p>
        <p>Humidity: ${city.humidity}%</p>
        <p>Wind: ${city.windSpeed} m/s</p>
        <div class="climate-info">
            <p>${city.climate.type}</p>
            <p>${city.climate.description}</p>
        </div>
    `;
    return card;
}

// Theme
function toggleTheme() {
    document.body.classList.toggle('dark');
    themeToggle.textContent = document.body.classList.contains('dark') ? '☀' : '🌙';
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        themeToggle.textContent = '☀';
    } else {
        themeToggle.textContent = '🌙';
    }
}

// Utilities
function debounce(fn, wait = 300) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), wait);
    };
}
function showError(msg) { alert(msg); }
function showLoading() { if (loading) loading.style.display = 'flex'; }
function hideLoading() { if (loading) loading.style.display = 'none'; }
