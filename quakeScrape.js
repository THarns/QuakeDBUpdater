const schedule = require('node-schedule');
const axios = require('axios');
const updateDB = require('./updateDB.js');

//time frame data objects
const oneHour = {
    link:'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_hour.geojson',
    view:1
}
const past24 = {
    link:'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
    view:24
}

//schedule event (currently scheduled for: 1 minute)
let event = schedule.scheduleJob("*/5 * * * *", function() {
    //axios to get json data (axios automatically parses JSON so yay!)
    axios.all([
        axios.get(oneHour.link),
        axios.get(past24.link)
      ])
      .then(responseArr => {
        //this will be executed when both requests are complete
        let oneHourUpdatedJSON = responseArr[0];
        let past24UpdatedJSON = responseArr[1];

        let today = new Date();
        let date = (today.getMonth()+1) + '-' + today.getDate() + "-" + today.getFullYear();
        
        let time = formatAMPM(new Date);

        console.log(oneHourUpdatedJSON.data);
        console.log(past24UpdatedJSON.data.features.length);
        console.log(date + " " + time);

        updateDB(1, oneHourUpdatedJSON.data, time);
        updateDB(24, past24UpdatedJSON.data, time);
    })
      
      .catch(err => {
        console.log("ERROR = " + err);
    });
});

function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }