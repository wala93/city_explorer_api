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
const YELP_API_KEY=process.env.YELP_API_KEY;
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
const arrOfParks = [];
const moviesData = [];
let arrOfYelp = [];



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

function Parks(object) {
  this.name = object.fullName;
  this.address = `${object.addresses[0].line1} ${object.addresses[0].city}`;
  this.fee = object.entranceFees[0].cost;
  this.description = object.description;
  this.url = object.url;
  arrOfParks.push(this);
}

function Movie(data) {
  this.title = data.title;
  this.overview = data.overview;
  this.average_votes = data.vote_average;
  this.total_votes = data.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500/${data.poster_path}`;
  this.popularity = data.popularity;
  this.released_on = data.release_date;
  moviesData.push(this);
}

function Yelp(data) {
  this.name = data.name;
  this.image_url = data.image_url;
  this.price = data.price;
  this.rating = data.rating;
  this.url = data.url;
  arrOfYelp.push(this);
}


function handleLocation(request, response) {

  let city = request.query.city;

  // const SQL = 'SELECT * FROM locations WHERE search_query = $1';
  // let sqlArr = [city];
  // client
  //   .query(SQL, sqlArr)
  //   .then((result) =>
  //     response.status(200).json(result.rows[0])
  //   );
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






function handlelMovies(request, response) {

  const url = `http://api.themoviedb.org/3/movie/top_rated?api_key=${MOVIE_API_KEY}&query=${request.query.city}`;
  console.log(`inside movies`);
  superagent.get(url).then(resData => {
    let data = resData.body.results.map(movie => {
      new Movie(movie);
    });


    response.send(moviesData);
  }).catch((error) => {
    response.send('Sorry, something went wrong');

  });

}




function handleRestu(request, response) {
  let page=request.query.page;

  const url = `https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${request.query.latitude}&longitude=${request.query.longitude}&limit=20`;

  console.log(`inside yelp`);
  superagent.get(url)
    .set('Authorization', `Bearer ${YELP_API_KEY}`)
    .then(apiData => {
      let data = apiData.body.businesses.map(element => {
        new Yelp(element);
      });
      response.send(arrOfYelp.slice((page-1)*5,page*5));
    }).catch((error) => {
      response.send('Sorry, something went wrong');

    });
}

