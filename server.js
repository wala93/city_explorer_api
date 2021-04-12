'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const superagent = require('superagent');

const app = express(); // Creates a server application.
const PORT = process.env.PORT || 3000;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const PARKS_API_KEY = process.env.PARKS_API_KEY;

// const { query } = require('express');
const DATABASE_URL = process.env.DATABASE_URL;
console.log(DATABASE_URL);
const client = new pg.Client(DATABASE_URL);

// Allow access to our api from another domain
app.use(cors());

app.get('/', (req, res) => {
  res.status(200);
  res.send('basic server!');
});
app.get('/location', handleLocation);

client.connect().then(() => app.listen(PORT, () => console.log(` app listening on port ${PORT}!`)));

//----------------------------------------------------------------------




function Locations(search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query;
  this.latitude = latitude;
  this.longitude = longitude;


}


function handleLocation(request, response) {
  console.log('inside location');
  let city = request.query.city;
  const findCitySql = 'SELECT * FROM locations WHERE search_query = $1;';
  const sqlArray = [city];

  const url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&format=json&q=${city}&limit=1`;
  const quryParams = {
    key: GEOCODE_API_KEY,
    format: 'json',
    q: city,
    limit: 1
  };
  client.query(findCitySql, sqlArray)
    .then((dataFromDB) => {
      if (dataFromDB.rowCount === 0) {

        superagent.get(url, quryParams).then(dataFromAPI => {
          console.log('from API', dataFromAPI);
          const data = dataFromAPI.body[0];

          const cityLocation = new Locations(city, data.display_name, data.lat, data.lon);
          const insertCitySQL = 'INSERT INTO locations (search_query , formatted_query, latitude, longitude) VALUES ($1 , $2 , $3, $4)';
          console.log('insid if ');
          client.query(insertCitySQL, [city, data.display_name, data.lat, data.lon]);
          response.send(cityLocation);

        });
      }
      else {
        console.log('from Dabtbase');
        const data = dataFromDB.rows[0];
        console.log(data);
        // const cityLocation = new Locations(city, data.formatted_query, data.latitude, data.longitude);
        // console.log('inside else');
        response.send(data);


      }
    }).catch((error) => {
      console.log(error);
      response.send('Sorry, something went wrong');
    });


  //_____________________________________________________________________________________________

}


app.get('/weather', handlelWeather);

function Forcast(dayweather) {
  // this.search_query = dayweather.search_query;
  this.forecast = dayweather.weather.description;
  this.time = dayweather.datetime;
}



function handlelWeather(request, response) {
  let weatherJson = [];

  // let weatherData = require('./data/ weather.json');
  let search_query = request.query.search_query;

  console.log(`inside weather`);

  superagent.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${search_query}&key=${WEATHER_API_KEY}&format=json`)
    .then(weatherDta => {
      console.log(search_query);
      weatherJson = weatherDta.body.data.map((dayweather) => {
        // weatherJson.push(new Forcast(dayweather));
        return new Forcast(dayweather);

        // return weatherJson;
      });
      console.log(weatherDta);
      response.status(200).send(weatherJson);
      // console.log(weatherDta.text);
      // response.send(weatherDta.body.data);


    }).catch((error) => {
      response.send('Sorry, something went wrong');
    });


  console.error();
}



app.get('/parks', handleParks);

function handleParks(request, respons) {
  const city = request.query.city;
  const url = `https://developer.nps.gov/api/v1/parks?api_key=${PARKS_API_KEY}&q=${request.query.search_query}`;

  console.log(`inside parks`);
  superagent.get(url).then(parksData => {
    let data;
    data = parksData.body.data.map(park => {
      new Parks(park);
      return arrOfParks;

    });
    console.log(arrOfParks);
    respons.send(arrOfParks);
  }).catch((error) => {
    respons.send('Sorry, something went wrong');
  });

}

const arrOfParks = [];

function Parks(object) {
  this.name = object.fullName;
  this.address = `${object.addresses[0].line1} ${object.addresses[0].city}`;
  this.fee = object.entranceFees[0].cost;
  this.description = object.description;
  this.url = object.url;
  arrOfParks.push(this);
}