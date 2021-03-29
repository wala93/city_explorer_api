const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express(); // Creates a server application.
const PORT = process.env.PORT || 3002;

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const TRAIL_API_KEY = process.env.TRAIL_API_KEY;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;

// Allow access to our api from another domain
app.use(cors());

app.get('/', (req, res) => {
  res.status(200);
  res.send('basic server!');
});

app.listen(PORT, () => console.log(' app listening on port 3000!'));

//----------------------------------------------------------------------



app.get('/location', handleLocation);

function Locations (search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query;
  this.latitude = latitude;
  this.longitude = longitude;


}


function handleLocation(request, response) {
  let city = request.query.city;
  let locationsData = require(`./data/location.json`);
  let locationObj ;
  try {
    locationsData.forEach(value =>{
      locationObj = new Locations(city,value.display_name, value.lat, value.lon);
    });
    response.status(200).json(locationObj);
  }
  catch (error){
    response.status(500).send('ERROR');

  }
}


app.get('/weather', handlelWeather);

function Forcast (eljaw) {
  this.search_query = eljaw.search_query;
  this.forecast = eljaw.forecast;
  this.time = eljaw.time;
}



function handlelWeather(request, response) {
  let weatherJson= [];

  let weatherData = require('./data/ weather.json');
  
    // for (let i = 0; i < weatherData.data.length; i++) {
    //   let Value = new Forcast (weatherData.data[i].weather.description, weatherData.data[i].valid_date);
    //   weatherJson.push(Value);
    // }
    superagent.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${search_query}&key=${WEATHER_API_KEY}`)
    .then(dataX => {

      weatherArr = dataX.body.data.map((rain) => {
        return new Weather(rain);
      });
    response.status(200).json(weatherJson);
 
  catch (error){
    response.status(500).send('ERROR');

  }
  });
 
}


//to compare latest changes

