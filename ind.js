
let city ="" ;
const button = document.getElementById('get');
const resultDiv = document.getElementById('result');
const detailButton = document.getElementById('viewDetail');
detailButton.style.display = 'none' ;

const detailPopup = document.getElementById('detail_popup');
const closeBtn = document.getElementById('close');

closeBtn.addEventListener('click', () => {
  detailPopup.style.display = 'none'; // hide popup
});


if ( navigator.geolocation) {
    navigator.geolocation.getCurrentPosition( async (pos)=> {
        let lon = pos.coords.longitude
        let lat = pos.coords.latitude

        let r = await fetch( `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`) ;
        let data = await r.json() ;
        document.getElementById('city').value = data.address.city || data.address.town || data.address.village || data.address.county;
    });
    }else {
        alert ("Geolocation not supported!");
    }



detailButton.addEventListener('click', () => {
    if ( !city ) {
        showpopup("Please enter a city name");
        return ;    
    }
    detailPopup.style.display = 'flex'; 
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=5382f04d300fb02ccf91ce6bf04ac750&units=metric`)
        .then(response => response.json())
        .then(data => {
                viewDetail(data) ;
                console.log(data) ;
                
        })
        .catch(error => console.error('Error fetching weather data:', error));
}) ;

button.addEventListener('click', () => {
    city = document.getElementById('city').value.trim();
    if (!city) {
        showpopup("Please enter a city name");
        return;
    }
    
    const clink = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=5382f04d300fb02ccf91ce6bf04ac750&units=metric`;
    const link = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=5382f04d300fb02ccf91ce6bf04ac750&units=metric`;
    getweather(clink, link);
});

function getweather(clink, link) {
    fetch(clink)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log(data);
            if ( (data.cod === "404") ) {
                showpopup("City not found. Please try again."); 
                return ; 
         }
          detailButton.style.display = 'flex' ;
            TodaysDisplay(data);
            getforecast(link);
        })
        .catch((err) => {
            console.log(err);
        })
}





function viewDetail(data) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];  
    const matter = document.getElementById('Detail_info') ;
    matter.innerHTML = '' ;
    data.list.forEach(forecast => {
        const forecastDate = forecast.dt_txt.split(' ')[0] ;
        
        if ( forecastDate === today ) {
                const forecastTime = forecast.dt_txt.split(' ')[1];
                matter.innerHTML += `
                <div id = 'info_card' class = 'info_card'>
                        <p><strong>Date:</strong> ${forecastDate}</p>
                        <p><strong>Time:</strong> ${forecastTime}</p>

                        <p><strong>Temp:</strong> ${forecast.main.temp} °C</p>
                        <p><strong>Weather:</strong> ${forecast.weather[0].main}</p>
                        <p><strong>Humidity:</strong> ${forecast.main.humidity}%</p>
                        <p><strong>Wind Speed:</strong> ${forecast.wind.speed} m/s</p>
                </div>
                ` ;             
        }
    })

}



function getforecast(link) {
    fetch(link)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            foreCastDisplay(data);
        })
        .catch((err) => {
            console.log(err);
        });
}


function toLocalTime(dt, timezone) {
    return new Date((dt + timezone) * 1000);
}

function TodaysDisplay(data) {
    if (data.cod === "404") {
        showpopup("City not found. Please try again.");
        return;
    }


    const todayWeatherDiv = document.getElementById('today-weather');
    todayWeatherDiv.innerHTML = `
                <h3>Weather in ${data.name}, ${data.sys.country}</h3>
                <p>🌡 Temperature: ${data.main.temp} °C</p>
                <p><strong>${data.weather[0].main}</strong></p>
            `;

    const extraInfoDiv = document.getElementById('extra-info');
    extraInfoDiv.innerHTML = `
                <p>💧 Humidity: ${data.main.humidity}%</p>
                <p>🌬 Wind Speed: ${data.wind.speed} m/s</p>
                <p>📅 Date & Time: ${new Date(data.dt * 1000).toLocaleString()}</p>
            `;

    const weatherBox = document.querySelector('.today-section');
    if (data.weather[0].main === 'Clouds') {
        setBackground('cloud');
    } else if (data.weather[0].main === 'Rain') {
        setBackground('Rain');
    }else if (data.weather[0].main === 'Mist') {
        setBackground('Mist');
    }
    else if (data.weather[0].main === 'Thunderstorm') {
        setBackground('Thunderstrom');
    }else {
        setBackground('clear');
    }
}


function foreCastDisplay(data) {
    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = "";

    if (data.cod != 404) {
        document.getElementById('heading').innerHTML = "<h3>Forecast</h3>";
    }

    let c = 0;
    let sday = new Set();
    const today = new Date().getDate();   // 🔥 actual system "today" date

    for (let i = 0; i < data.list.length; i++) {
        const d = toLocalTime(data.list[i].dt, data.city.timezone);
        const day = d.getDate();

        // 🔥 skip today, only one card per future day
        if (day !== today && !sday.has(day) && (d.getHours() >= 11 && d.getHours() <= 13)) {
            sday.add(day);
            const forecast = data.list[i];
            forecastDiv.innerHTML += `
                <div class="forecast-card">
                    <p><strong>${d.toLocaleDateString()}</strong></p>
                    <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="icon">
                    <p>🌡 ${forecast.main.temp} °C</p>
                    <p>${forecast.weather[0].main}</p>
                    <p>💧 ${forecast.main.humidity}%</p>
                </div>
                <hr>
            `;
            c++;
            if (c === 5) break;
        }
    }
}


function setBackground(temp) {
    const weatherBox = document.querySelector('.today-section');
    weatherBox.style.backgroundImage = `url('${temp}.jpg')`;
    weatherBox.style.backgroundSize = "cover";
    weatherBox.style.backgroundPosition = "center";
    weatherBox.style.backgroundColor = "rgba(20, 19, 19, 0.4)";
    weatherBox.style.backgroundBlendMode = "darken";
}



function showpopup(message) {
    const popup = document.getElementById('popup');
    const msg = document.getElementById('msg');
    msg.innerText = message;
    popup.style.display = 'flex';
    const closeBtn = document.getElementById('closePopup');
    closeBtn.addEventListener('click', closepopup);
}

function closepopup() {
    const popup = document.getElementById('popup');;
    popup.style.display = 'none';
}

document.addEventListener('keydown', function(event) {    
    if (event.key === "Enter" ) {
        city = document.getElementById('city').value.trim();
        if (!city) {
            showpopup("Please enter a city name");
            return;
        }

        const clink = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=5382f04d300fb02ccf91ce6bf04ac750&units=metric`;
        const link = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=5382f04d300fb02ccf91ce6bf04ac750&units=metric`;

        getweather(clink, link);
    }
});
