const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const weatherDataDiv = document.getElementById("weatherData");

// FIXME: move api key to env file. See more: https://stackoverflow.com/questions/41501016/how-to-use-env-file-variable-in-js-file-other-than-keystone-js
// Why move private or secret keys to env file: https://medium.com/@oadaramola/a-pitfall-i-almost-fell-into-d1d3461b2fb8
const API_KEY = "2decce60c5970ba417be8bcdda6c323a"; // API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) {
    // HTML cho thẻ thời tiết chính
    return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Nhiệt độ: ${(weatherItem.main.temp - 273.15).toFixed(
                      2
                    )}°C</h6>
                    <h6>Sức gió: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Độ ẩm: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${
                      weatherItem.weather[0].icon
                    }@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
  } else {
    // HTML for the other five day forecast card
    return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${
                      weatherItem.weather[0].icon
                    }@4x.png" alt="weather-icon">
                    <h6>Nhiệt độ: ${(weatherItem.main.temp - 273.15).toFixed(
                      2
                    )}°C</h6>
                    <h6>Sức gió: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Độ ẩm: ${weatherItem.main.humidity}%</h6>
                </li>`;
  }
};

const getWeatherDetails = (cityName, latitude, longitude) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then((response) => response.json())
    .then((data) => {
      // Lấy thông tin thời tiết hôm nay
      const todayWeather = data.list[0]; // Giả sử dự báo đầu tiên là cho hôm nay
      const weatherCondition = todayWeather.weather[0].main; // Lấy điều kiện thời tiết chính

      // Thay đổi màu nền dựa trên điều kiện thời tiết
      changeBackgroundImage(weatherCondition);
      // Xử lý dữ liệu và hiển thị
      const uniqueForecastDays = [];

      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          uniqueForecastDays.push(forecastDate);
          return true;
        }
        return false;
      });

      // Xóa dữ liệu thời tiết trước đó
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      // Hiển thị dữ liệu thời tiết
      fiveDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityName, weatherItem, index);
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML("beforeend", html);
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        }
      });

      // Hiện phần giao diện thời tiết
      weatherDataDiv.style.display = "block"; // Hiện phần dữ liệu thời tiết
    })
    .catch((error) => {
      alert("Đã xảy ra lỗi khi lấy dữ liệu thời tiết!");
    });
};

const changeBackgroundImage = (condition) => {
  let backgroundImage;

  switch (condition.toLowerCase()) {
    case "clear":
      backgroundImage = "url('images/clearsky.jpg')"; // Hình ảnh cho trời quang đãng
      break;
    case "clouds":
      backgroundImage = "url('images/cloudy1.jpg')"; // Hình ảnh cho nhiều mây
      break;
    case "rain":
      backgroundImage = "url('images/rain.jpg')"; // Hình ảnh cho trời mưa
      break;
    case "snow":
      backgroundImage = "url('images/snow.jpg')"; // Hình ảnh cho tuyết
      break;
    case "thunderstorm":
      backgroundImage = "url('images/thunderstorm.jpg')"; // Hình ảnh cho bão
      break;
    default:
      backgroundImage = "url('images/default.jpg')"; // Hình ảnh mặc định nếu không có điều kiện cụ thể
  }

  document.body.style.backgroundImage = backgroundImage; // Thay đổi hình nền của body
  document.body.style.backgroundSize = "cover"; // Đảm bảo hình nền phủ kín
  document.body.style.backgroundPosition = "center"; // Căn giữa hình nền
};
const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (cityName === "") return;
  // FIXME: API URL https://api.openweathermap.org/geo/1.0 are repeat at getCityCoordinates function and getUserCoordinates function. Split it into a variable to reuseable
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data.length) return alert(`Không tìm thấy tọa độ cho ${cityName}`);
      const { lat, lon, name } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("Đã xảy ra lỗi khi lấy tọa độ!");
    });
};

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords; // Lấy tọa độ vị trí người dùng
      // Lấy tên thành phố từ tọa độ bằng API mã hóa địa lý ngược
      const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert("An error occurred while fetching the city name!");
        });
    },
    (error) => {
      // Hiển thị cảnh báo nếu người dùng từ chối quyền truy cập vị trí
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          "Yêu cầu định vị địa lý bị từ chối. Vui lòng đặt lại quyền truy cập vị trí để cấp lại quyền truy cập."
        );
      } else {
        alert(
          "Lỗi yêu cầu định vị địa lý. Vui lòng đặt lại quyền truy cập vị trí."
        );
      }
    }
  );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && getCityCoordinates()
);
