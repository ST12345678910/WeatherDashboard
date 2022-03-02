$("#searchButton").on("click", populateWeather);
$(window).on("load", loadCities);
$("#clearHis").on("click", clearHistory);

let city="";
let searchCity = $("#citySearch");
let searchButton = $("#searchButton");
let clearButton = $("#clearHis");
let currentCity = $("#cityCur");
let currentTemperature = $("#temperature");
let currentHumidty = $("#humidity");
let currentWindspeed =$("#windSpeed");
let currentUvindex = $("#uvIndexWarning");
let searchedCity = [];

let keyAPI ="9b3b7e7b2eb2909a41d4a2de25b0083f";

function populateWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}

function currentWeather(city){
    
    let weatherURL= `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${keyAPI}`;
    $.ajax({
        url:weatherURL,
        method:"GET",
    }).then((response) => {

            let weathericon = response.weather[0].icon;
            let iconLink = `https://openweathermap.org/img/wn/${weathericon}.png`;
            let temperatureF = (response.main.temp - 273.15) * 1.80 + 32;
            let date = new Date(response.dt * 1000).toLocaleDateString();
            let ws = response.wind.speed;
            let windsmph = (ws * 2.24).toFixed(1);

            $(currentCity).html(`${response.name}(${date})<img src=${iconLink}>`);
            $(currentTemperature).html(`${(temperatureF).toFixed(1)}&#8457`);
            $(currentHumidty).html(`${response.main.humidity} %`);
            $(currentWindspeed).html(`${windsmph} MPH`);

            UVIndex(response.coord.lon, response.coord.lat);
            forecast(response.id);
            if (response.cod == 200) {
                searchedCity = JSON.parse(localStorage.getItem("cities"));
                if (searchedCity == null) {
                    searchedCity = [];
                    searchedCity.push(city.toUpperCase()
                    );
                    localStorage.setItem("cities", JSON.stringify(searchedCity));
                    addToList(city);
                }
                else {
                    if (find(city) > 0) {
                        searchedCity.push(city.toUpperCase());
                        localStorage.setItem("cities", JSON.stringify(searchedCity));
                        addToList(city);
                    }
                }
            }

        });
}


function UVIndex(ln,lt){
 
    let uvURL=`https://api.openweathermap.org/data/2.5/uvi?appid=${keyAPI}&lat=${lt}&lon=${ln}`;
    $.ajax({
            url:uvURL,
            method:"GET"
            }).then((response) => {
                    $(currentUvindex).html(response.value);
                if ((response.value) > 7) {
                    document.getElementById("uvIndexWarning").classList.add('btn-danger');
                } else if ((response.value) < 5) {
                    document.getElementById("uvIndexWarning").classList.add('btn-success');
                }else {
                    document.getElementById("uvIndexWarning").classList.add('btn-warning');
                }
                });    
}

function forecast(cityid){
    let dayover= false;
    let forecastURL=`https://api.openweathermap.org/data/2.5/forecast?id=${cityid}&appid=${keyAPI}`;
    $.ajax({
        url:forecastURL,
        method:"GET"
    }).then((response) => {

            for (i = 0; i < 5; i++) {
                let temperatureK = response.list[((i + 1) * 8) - 1].main.temp;
                let temperatureF = (((temperatureK - 273.5) * 1.80) + 32).toFixed(1);
                let humidity = response.list[((i + 1) * 8) - 1].main.humidity;
                let date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
                let iconcode = response.list[((i + 1) * 8) - 1].weather[0].icon;
                let iconLink = `https://openweathermap.org/img/wn/${iconcode}.png`;

                $(`#dateCalc${i}`).html(date);
                $(`#weIcon${i}`).html(`<img src=${iconLink}>`);
                $(`#tempCalc${i}`).html(`${temperatureF}&#8457`);
                $(`#humidityCalc${i}`).html(`${humidity}%`);
            }
        });
}


function addToList(c){
    let listEl= $(`<li>${c.toUpperCase()}</li>`);
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}


function loadCities(){
    $("ul").empty();
    let searchedCity = JSON.parse(localStorage.getItem("cities"));
    if(searchedCity!==null){
        searchedCity=JSON.parse(localStorage.getItem("cities"));
        for(i=0; i<searchedCity.length;i++){
            addToList(searchedCity[i]);
        }
        city=searchedCity[i-1];
        currentWeather(city);
    }

}

function clearHistory(event){
    event.preventDefault();
    searchedCity=[];
    localStorage.removeItem("cities");
    document.location.reload();
}

























