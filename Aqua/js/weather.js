// API configuration
const apiKey = "ed3b158f56d73941aa20954dbd8f33f1";
const city = "Panabo";


// DOM elements
const cardsContainer = document.getElementById('weather-cards');

// Weather conditions to background mapping
const weatherBackgrounds = {
    'clear': 'linear-gradient(0deg, rgba(247, 225, 87, 1) 0%, rgba(233, 101, 148, 1) 100%)',
    'clouds': 'linear-gradient(0deg, rgba(189, 195, 199, 1) 0%, rgba(149, 165, 166, 1) 100%)',
    'rain': 'linear-gradient(0deg, rgb(29, 94, 138) 0%, rgb(89, 128, 190) 100%)',
    'thunderstorm': 'linear-gradient(0deg, rgba(44, 62, 80, 1) 0%, rgba(52, 73, 94, 1) 100%)'
  };

// Main function to get weather data
async function getWeather() {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    
    if (data.cod !== "200") {
      throw new Error("Failed to fetch weather data");
    }
    
    generateWeatherCards(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    // Display error cards if API fails
    displayErrorCards();
  }
}

// Generate 5 weather cards
function generateWeatherCards(data) {
  cardsContainer.innerHTML = '';
  
  // Get forecast for the next 5 days (including today)
  const forecasts = getDailyForecasts(data.list);
  
  forecasts.slice(0, 7).forEach((forecast, index) => {
    const card = createWeatherCard(forecast, index, data.city.name);
    cardsContainer.appendChild(card);
  });
}

// Get daily forecasts (one per day)
function getDailyForecasts(forecastList) {
  const dailyForecasts = [];
  const datesProcessed = [];
  
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dateString = date.toDateString();
    
    if (!datesProcessed.includes(dateString)) {
      datesProcessed.push(dateString);
      dailyForecasts.push(item);
    }
  });
  
  return dailyForecasts;
}
const weatherImages = {
    'clear': 'https://cdn-icons-png.flaticon.com/512/869/869869.png', // Sun
    'clouds': 'https://cdn-icons-png.flaticon.com/512/414/414825.png', // Cloud
    'rain': '../images/rainy.png', // Rain
    'thunderstorm': 'https://cdn-icons-png.flaticon.com/512/1146/1146860.png' // Thunder
  };
  const weatherMessages = {
    'clear': "Sun’s out, enjoy the day!",
    'clouds': "A bit cloudy, but still a good day!",
    'rain': "Rainy day—don't forget your umbrella!",
    'thunderstorm': "Stormy skies ahead—stay safe and indoors!"
  };
  function createWeatherCard(forecast, index, cityName) {
    const date = new Date(forecast.dt * 1000);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const weatherCondition = forecast.weather[0].main.toLowerCase();
    const message = weatherMessages[weatherCondition] || "Have a nice day!";
    
    const card = document.createElement('div');
    card.className = 'card';
    
    // Set background and weather image
    const background = weatherBackgrounds[weatherCondition] || weatherBackgrounds['clear'];
    const weatherImage = weatherImages[weatherCondition] || weatherImages['clear'];
    
    card.innerHTML = `
      <section class="landscape-section">
        <div class="sky" style="background: ${background}"></div>
        <div class="weather-icon">
          <img src="${weatherImage}" alt="${weatherCondition}" style="width: 50px; height: 50px;">
        </div>
        <div class="weather-icon1">
           <img src="../images/palm-tree.png" alt="">
        </div>
        <div class="weather-icon1 left">
           <img src="../images/palm-tree.png" alt="">
        </div>
        <div class="hill-1"></div>
        <div class="hill-2"></div>
        <div class="ocean">
          <div class="reflection"></div>
          <div class="reflection"></div>
          <div class="reflection"></div>
          <div class="reflection"></div>
          <div class="reflection"></div>
          <div class="shadow-hill-1"></div>
          <div class="shadow-hill-2"></div>
        </div>
        <div class="hill-3"></div>
        <div class="hill-4"></div>
        <div class="filter"></div>
      </section>
      <section class="content-section">
        <div class="weather-info">
          <div class="left-side">${dayName}</div>
          <div class="right-side">
            <div class="location">
                 <img src="../images/location.png" alt="">
              <span id="weather-location">${cityName}</span>
            </div>
            <span id="weather-date">${formattedDate}</span>
            <span id="weather-temp">${Math.round(forecast.main.temp)}°C</span>
          </div>
        </div>
        <div class="weather-message">${message}</div>
      </section>
    `;
    
    return card;
  }

// Display error cards if API fails
function displayErrorCards() {
  cardsContainer.innerHTML = '';
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const card = document.createElement('div');
    card.className = 'card';
    
    card.innerHTML = `
      <section class="landscape-section">
        <div class="sky"></div>
        <div class="sun"></div>
        <div class="hill-1"></div>
        <div class="hill-2"></div>
        <div class="ocean">
          <div class="reflection"></div>
          <div class="reflection"></div>
          <div class="reflection"></div>
          <div class="reflection"></div>
          <div class="reflection"></div>
          <div class="shadow-hill-1"></div>
          <div class="shadow-hill-2"></div>
        </div>
        <div class="hill-3"></div>
        <div class="hill-4"></div>
        <div class="filter"></div>
      </section>
      <section class="content-section">
        <div class="weather-info">
          <div class="left-side">Card ${i + 1} - ${dayName}</div>
          <div class="right-side">
            <div class="location">
                         <img src="../images/location.png" alt="">
              <span id="weather-location">Weather Unavailable</span>
            </div>
            <span id="weather-date">${formattedDate}</span>
            <span id="weather-temp">--°C</span>
          </div>
        </div>
      </section>
    `;
    
    cardsContainer.appendChild(card);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', getWeather);

const widget = document.getElementById('weather-widget');
const toggleBtn = document.getElementById('toggle-widget');
const collapseBtn = document.getElementById('collapse-widget');

toggleBtn.addEventListener('click', () => {
  widget.classList.remove('collapsed');
});

collapseBtn.addEventListener('click', () => {
  widget.classList.add('collapsed');
});

// Add this to your weather.js or in a <script> tag
document.addEventListener('click', function(event) {
  const weatherWidget = document.getElementById('weather-widget');
  const toggleBtn = document.getElementById('toggle-widget');
  const collapseBtn = document.getElementById('collapse-widget');
  
  // Check if click is outside the widget and buttons, and widget is open
  if (!weatherWidget.classList.contains('collapsed') &&
      !weatherWidget.contains(event.target) &&
      event.target !== toggleBtn &&
      !toggleBtn.contains(event.target) &&
      event.target !== collapseBtn &&
      !collapseBtn.contains(event.target)) {
    
    // Close the widget
    weatherWidget.classList.add('collapsed');
  }
});