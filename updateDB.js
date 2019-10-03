const sql = require('./db.js');

function updateDB(interval, features, time) {

    let JSONstringified = JSON.stringify(features);
    const dataSQL = `UPDATE json_data SET Data = ?, Updated = ? WHERE Time = ?`;
    let data = [JSONstringified, time, interval];

    sql.query(dataSQL, data, (error, results, fields) => {
        if(error) {
            console.log(error.message);
        }

        console.log("Rows affected: " + results.affectedRows);
    });
}

module.exports = updateDB;