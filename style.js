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

// Theme functionality
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        themeToggle.textContent = '☀';
        themeToggle.classList.add('dark');
        updateDarkElements();
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    
    // Update theme toggle button
    themeToggle.textContent = isDark ? '☀' : '🌙';
    themeToggle.classList.toggle('dark');
    
    // Update all elements with dark class
    updateDarkElements();
    
    // Save theme preference
    const currentTheme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    
    // Add smooth transition class
    document.body.classList.add('theme-transition');
    
    // Remove transition class after animation
    setTimeout(() => {
        document.body.classList.remove('theme-transition');
    }, 300);
}

function updateDarkElements() {
    const darkElements = document.querySelectorAll('.dark');
    darkElements.forEach(el => el.classList.toggle('dark'));
}

// Search functionality
function searchWeather() {
    const cityName = cityInput.value.trim();
    if (!cityName) {
        showError('Please enter a city name');
        return;
    }

    const cityInfo = findCity(cityName);
    if (!cityInfo) {
        showError('City not found');
        return;
    }

    displayWeather(cityInfo);
    cityInput.value = '';
}

function findCity(name) {
    return Object.values(weatherData.cities)
        .find(city => city.name.toLowerCase() === name.toLowerCase());
}

// Suggestions functionality
function showSuggestions() {
    const cityName = cityInput.value.trim();
    if (!cityName) {
        hideSuggestions();
        return;
    }

    const matchingCities = Object.values(weatherData.cities)
        .filter(city => city.name.toLowerCase().includes(cityName.toLowerCase()))
        .slice(0, 5);

    if (matchingCities.length === 0) {
        hideSuggestions();
        return;
    }
    