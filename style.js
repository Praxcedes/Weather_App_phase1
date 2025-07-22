// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherInfo = document.getElementById('weatherInfo');
const suggestionsContainer = document.getElementById('suggestions');
const themeToggle = document.getElementById('themeToggle');

// State
let weatherData = null;
let currentCity = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
themeToggle.addEventListener('click', toggleTheme);
searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('input', debounce(showSuggestions, 500));
document.addEventListener('click', hideSuggestions);

// Initialize app
function initializeApp() {
    // Load weather data
    fetchWeatherData()
        .then(data => {
            weatherData = data;
            initializeTheme();
        })
        .catch(error => {
            console.error('Error loading weather data:', error);
            showError('Error loading weather data');
        });
}
// Fetch weather data
async function fetchWeatherData() {
    try {
        const response = await fetch('db.json');
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}


