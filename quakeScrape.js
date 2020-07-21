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

//schedule event (currently scheduled for: 5 minutes)
let event = schedule.scheduleJob("*/5 * * * *", () => {
    //axios to get json data (axios automatically parses JSON so yay!)
    axios.all([
        axios.get(oneHour.link),
        axios.get(past24.link)
      ])
      .then(responseArr => {
        //this will be executed when both requests are complete
        let oneHourUpdatedJSON = responseArr[0];
        let past24UpdatedJSON = responseArr[1];

        let time = formatSQLtime(new Date());
        console.log(time);
        console.log("Number of quakes over past 1 hour: " + oneHourUpdatedJSON.data.features.length);
        console.log("Number of quakes over past 24 hours: " + past24UpdatedJSON.data.features.length);

        updateDB('json_data', 1, oneHourUpdatedJSON.data, time);
        updateDB('json_data', 24, past24UpdatedJSON.data, time);

        let d = new Date();
        let min = d.getMinutes();
      
        if(min === 0) {
          let maxHR = getMaxMag(responseArr[0].data);
          let max24 = getMaxMag(responseArr[1].data);

          let statsData = {
            MaxMagHR: maxHR,
            pastHRtotal: responseArr[0].data.features.length,
            MaxMagDay: max24,
            pastDayTotal: responseArr[1].data.features.length
          }

          console.log(statsData);
          updateDB('stats_log', null, statsData, formatSQLtime(d));
        }
    })
      
      .catch(err => {
        console.log("ERROR = " + err);
    });
});

  function formatSQLtime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    let monthFormat = (date.getMonth()+1) < 10 ? '0' + (date.getMonth()+1) : (date.getMonth()+1);
    let dateFormat = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let sqlFormattedDate = date.getFullYear() + '-' + monthFormat + '-' + dateFormat;

    let time = sqlFormattedDate + " " + hours + ':' + minutes + ':' + '00';
    let strTime = time.toString();
    console.log(strTime);
    return strTime;
}

  function getMaxMag(JSONset) {
    let arr = JSONset.features.map((obj) => {
      let thisQuakeMag = obj.properties.mag;
      return thisQuakeMag;
    });
    //console.log(JSONset.features);

    let max = Math.max(...arr);
    console.log(max);
    return max;
  }