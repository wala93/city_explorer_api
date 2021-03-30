require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express(); // Creates a server application.
const PORT = process.env.PORT || 3002;
const superagent = require('superagent');
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;

// Allow access to our api from another domain
app.use(cors());

app.get('/', (req, res) => {
  res.status(200);
  res.send('basic server!');
});

app.listen(PORT, () => console.log(` app listening on port ${PORT}!`));

//----------------------------------------------------------------------



app.get('/location', handleLocation);

function Locations (search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query;
  this.latitude = latitude;
  this.longitude = longitude;


}


function handleLocation(request, response) {
  // let city = request.query.city;
  // let locationsData = require(`./data/location.json`);
  // let locationObj ;
  // try {
  //   locationsData.forEach(value =>{
  //     locationObj = new Locations(city,value.display_name, value.lat, value.lon);
  //   });
  //   response.status(200).json(locationObj);
  // }
  // catch (error){
  //   response.status(500).send('ERROR');

  // }

  let city = request.query.city;
  const url = `https://eu1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json`;
  console.log('inside location');
  superagent.get(url).then( locationData => {

    const geoApiData = locationData.body[0];
    console.log(geoApiData);
    let location = new Locations(city, geoApiData.display_name, geoApiData.lat, geoApiData.lon);
    response.status(200).json(location);

  });


}


app.get('/weather', handlelWeather);

function Forcast (dayweather) {
  this.search_query = dayweather.search_query;
  this.forecast = dayweather.forecast;
  this.time = dayweather.time;
}



function handlelWeather(request, response) {
  let weatherJson= [];

  // let weatherData = require('./data/ weather.json');
  let search_query = request.query.search_query;
console.log(`inside weather`);
  superagent.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${search_query}&key=${WEATHER_API_KEY}&format=json`)
    .then(weatherDta => {

      weatherJson = weatherDta.body[0].data.map((dayweather) => {
        return new Forcast(dayweather);
      });
      console.log(weatherDta);
      response.status(200).json(weatherJson);


    }).
    catch((error) =>{
      response.send('Sorry, something went wrong');
    });

}



//to make sure it pushed to git hub


//push again
//install ggogl-map
