const sql = require('./db.js');

function updateDB(table_name, interval, features, time) { //add table field i.e. JSONdata

    if(table_name === 'json_data') {
        let JSONstringified = JSON.stringify(features);
        const dataSQL = `UPDATE json_data SET Data = ?, Updated = ? WHERE Time = ?`;
        let data = [JSONstringified, time, interval];

        sql.query(dataSQL, data, (error, results) => {
            if(error) {
                console.log(error.message);
            }

            console.log("Rows affected: " + results.affectedRows);
        });

    } else if(table_name === 'stats_log') {
    
        const dataSQL = 'INSERT INTO stats_log SET ?';
        let values = {
            MaxMagHR: features.MaxMagHR,
            pastHRtotal: features.pastHRtotal,
            MaxMagDay: features.MaxMagDay,
            pastDayTotal: features.pastDayTotal,
            TimeStamp: time
        }

        console.log(values);

        sql.query(dataSQL, values, (error, results) => {
            if(error) {
                console.log(error.message);
            }

            console.log("Statslog rows affected: " + results.affectedRows);
        });
    }  
}

module.exports = updateDB;