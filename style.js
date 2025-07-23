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
document.addEventListener('click', (e) => {
    // Prevent closing if click is inside suggestions
    if (!suggestionsContainer.contains(e.target) && e.target !== cityInput) {
        hideSuggestions();
    }
});

// Initialize app
function initializeApp() {
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
        const response = await fetch('https://app-json-server-jj04.onrender/weather/cities.com');
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
    themeToggle.textContent = isDark ? '☀' : '🌙';
    themeToggle.classList.toggle('dark');
    updateDarkElements();

    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    document.body.classList.add('theme-transition');
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
    hideSuggestions();
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

    suggestionsContainer.innerHTML = '';
    matchingCities.forEach(city => {
        const li = document.createElement('li');
        li.textContent = `${city.name}, ${city.country}`;
        li.addEventListener('click', () => {
            cityInput.value = city.name;
            searchWeather();
        });
        suggestionsContainer.appendChild(li);
    });

    suggestionsContainer.classList.add('show');
}

function hideSuggestions() {
    suggestionsContainer.classList.remove('show');
}

// Display weather
function displayWeather(cityInfo) {
    const cityData = weatherData.weather[cityInfo.id];
    if (!cityData) {
        showError('Weather data not available for this city');
        return;
    }

    const weatherCard = createWeatherCard(cityInfo, cityData);
    weatherInfo.innerHTML = '';
    weatherInfo.appendChild(weatherCard);
}

function createWeatherCard(cityInfo, cityData) {
    const card = document.createElement('div');
    card.className = 'weather-card';

    const icon = document.createElement('img');
    icon.src = cityData.icon;
    icon.alt = cityData.description;
    icon.className = 'weather-icon';

    const cityName = document.createElement('h2');
    cityName.textContent = `Weather in ${cityInfo.name}`;

    const currentWeather = createCurrentWeatherSection(cityData);
    const climateInfo = createClimateInfoSection(cityInfo);

    // Buttons: Edit & Delete
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'card-buttons';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-btn';
    editBtn.addEventListener('click', () => editWeather(cityInfo.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => card.remove());

    buttonsContainer.appendChild(editBtn);
    buttonsContainer.appendChild(deleteBtn);

    card.appendChild(icon);
    card.appendChild(cityName);
    card.appendChild(currentWeather);
    card.appendChild(climateInfo);
    card.appendChild(buttonsContainer);

    return card;
}

function createCurrentWeatherSection(data) {
    const section = document.createElement('div');
    section.className = 'current-weather';

    const temp = document.createElement('p');
    temp.textContent = `Temperature: ${data.tempC}°C (${data.tempF}°F)`;

    const desc = document.createElement('p');
    desc.textContent = `Description: ${data.description}`;

    const humidity = document.createElement('p');
    humidity.textContent = `Humidity: ${data.humidity}%`;

    const wind = document.createElement('p');
    wind.textContent = `Wind Speed: ${data.windSpeed} m/s`;

    section.appendChild(temp);
    section.appendChild(desc);
    section.appendChild(humidity);
    section.appendChild(wind);

    return section;
}

function createClimateInfoSection(cityInfo) {
    const section = document.createElement('div');
    section.className = 'climate-info';

    const type = document.createElement('p');
    type.textContent = `Climate Type: ${cityInfo.climate.type}`;

    const rainy = document.createElement('p');
    rainy.textContent = `Rainy Seasons: ${cityInfo.climate.rainy_season}`;

    const avgTemp = document.createElement('p');
    avgTemp.textContent = `Average Temperature: ${cityInfo.climate.average_temp}`;

    const desc = document.createElement('p');
    desc.textContent = cityInfo.climate.description;
    desc.className = 'climate-description';

    section.appendChild(type);
    section.appendChild(rainy);
    section.appendChild(avgTemp);
    section.appendChild(desc);

    return section;
}

// Edit functionality
function editWeather(cityId) {
    const cityData = weatherData.weather[cityId];
    const newTempC = prompt('Enter new temperature (°C):', cityData.tempC);
    const newDesc = prompt('Enter new description:', cityData.description);

    if (newTempC !== null && newDesc !== null) {
        cityData.tempC = newTempC;
        cityData.description = newDesc;
        cityData.tempF = (newTempC * 9) / 5 + 32; // Update Fahrenheit
        displayWeather(weatherData.cities[cityId]); // Re-render updated card
    }
}

// Helper functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

function showError(message) {
    console.error(message);
    alert(message);
}
