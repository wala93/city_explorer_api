const express = require('express');
const cors = require('cors');
// const { report } = require('node:process');

require('dotenv').config();

const app = express(); // Creates a server application.
const PORT = process.env.PORT || 3002;


// Allow access to our api from another domain
app.use(cors());

app.get('/', (req, res) => {
  res.status(200);
  res.send('basic server!');
});

app.listen(PORT, () => console.log(' app listening on port 3000!'));

//-------------------------------------------------------------------------------------

// let  arrOflocations =[];
// require('dotenv').config();

app.get('/location', handleLocation);

function Locations (search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query;
  this.latitude = latitude;
  this.longitude = longitude;
  // arrOflocations.push(this);

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

function Forcast (search_query,forecast, time) {
  this.search_query = search_query;
  this.forecast = forecast;
  this.time = time;
}

function handlelWeather(request, response) {
  let weatherJson= [];
  let weatherData = require('./data/ weather.json');
  try{
    for (let i = 0; i < weatherData.data.length; i++) {
      let Value = new Forcast (weatherData.data[i].weather.description, weatherData.data[i].valid_date);
      weatherJson.push(Value);
    }
    response.status(200).json(weatherJson);
  } catch (error){
    response.status(500).send('ERROR');

  }
}





