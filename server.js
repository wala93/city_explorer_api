require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express(); // Creates a server application.
const PORT = process.env.PORT || 3002;
const superagent = require('superagent');
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);

const PARKS_API_KEY = process.env.PARKS_API_KEY;


// Allow access to our api from another domain
app.use(cors());

app.get('/', (req, res) => {
  res.status(200);
  res.send('basic server!');
});

app.listen(PORT, () => console.log(` app listening on port ${PORT}!`));

//----------------------------------------------------------------------

app.get('/location', handleLocation);
app.get('/weather', handlelWeather);
app.get('/parks', handleParks);
app.get('/movies', handlelMovies);
app.get('/yelp', handleRestu);



function Locations(search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query;
  this.latitude = latitude;
  this.longitude = longitude;
}

function Forcast(dayweather) {
  this.forecast = dayweather.weather.description;
  this.time = dayweather.datetime;
}

function Parks(data) {
  this.name = data.name;
  this.address = data.address;
  this.fee = data.fees;
  this.description = data.description;
  this.url = data.url;
}

function Movie(data) {
  this.title = data.title;
  this.overview = data.overview;
  this.average_votes = data.average_votes;
  this.total_votes = data.total_votes;
  this.image_url = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
  this.popularity = data.popularity;
  this.released_on = data.released_on;
}

function Yelp(data) {
  this.name = data.name;
  this.image_url = data.image_url;
  this.price = data.price;
  this.rating = data.rating;
  this.url = data.url;
}


function handleLocation(request, response) {

  let city = request.query.city;

  const SQL = 'SELECT * FROM locations WHERE search_query = $1';
  let sqlArr = [city];
  client
    .query(SQL, sqlArr)
    .then((result) =>
      response.status(200).json(result.rows[0])
    );
  const url = `https://eu1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json`;

  console.log('inside location');
  superagent.get(url).then(locationData => {

    const geoApiData = locationData.body[0];
    console.log(geoApiData);
    let location = new Locations(city, geoApiData.display_name, geoApiData.lat, geoApiData.lon);
    response.status(200).send(location);

  }).catch((error) => {
    response.send('Sorry, something went wrong');
  });


}






function handlelWeather(request, response) {
  let weatherJson = [];
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




function handleParks(request, respons) {
  const city = request.query.city;
  const url = `https://developer.nps.gov/api/v1/parks?parkCode=${city}&api_key=${PARKS_API_KEY}`;

  console.log(`inside parks`);
  const arrOfParks = [];
  superagent.get(url).then(parksData => {
    let data;
    data = parksData.data.map(park => {
      arrOfParks.push(new Parks(park));
      return arrOfParks;

    });
    console.log(arrOfParks);
    respons.send(data);
  }).catch((error) => {
    respons.send('Sorry, something went wrong');
  });

}






function handlelMovies(request, response) {

  console.log(`inside movies`);
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&query=${request.query.city}`;
  const moviesData = [];
  superagent.get(url).then(resData => {
    let data = resData.body.results.map(movie => {
      moviesData.push(new Movie(movie));
      return moviesData;
    });
    response.send(data);
  }).catch((error) => {
    response.send('Sorry, something went wrong');

  });

}




function handleRestu(request, response) {

  const url = `https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${request.query.latitude}&longitude=${request.query.longitude}&limit=20`;

  console.log(`inside yelp`);
  let arrOfRestu = [];
  superagent.get(url).then(apiData=> {
    let data=apiData.body.businesses.map(element=>{
      arrOfRestu.push( new Yelp(element));
      return arrOfRestu;

    });
    response.send(data);
  }).catch((error)=>{
    response.send('Sorry, something went wrong');

  });
}

