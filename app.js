const mysql = require('mysql')
const bodyparser = require('body-parser')
const express = require('express')
var app = express()
var guid = require("guid")
const axios = require('axios')

var mysqlConnection = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '2580',
        database: 'productDB'

    }
)

app.use(bodyparser.json())

mysqlConnection.connect((err) => {
    if (!err)
        console.log("DB connection Succesful")
    else {
        console.log("DB connection Unsuccessful")
    }
})

app.listen(3000, () => console.log("Server running on port no :3000"))


app.get('/cart', (req, res) => {


    mysqlConnection.query('SELECT * FROM cart', (err, rows, fields) => {
        if (!err) {
            res.send(rows)
        }
        else {
            console.log(err)
        }
    }
    )
}
)


app.post('/cart/:item', (req, res) => {
    var item = req.params.item

    const { productId, rating, raterId } = req.body

    if ((req.headers['session-id']) == undefined || (req.headers['session-id']) == "") {
        var _guid = guid.create();

        mysqlConnection.query("insert into cart (productname,quantity,sessionid) values (' " + item + " ', " + 1 + ",'" + _guid + "')", (err, rows, fields) => {
            if (!err) {

                res.writeHead(200, {
                    'Content-Type': 'text/plain',
                    'session-id': _guid
                });

                res.end()
            }
            else {
                console.log(err)
            }
        }
        )
    }
    else {

        var _guidid = req.headers['session-id']
        mysqlConnection.query("SELECT EXISTS (SELECT * from cart WHERE productname= ' " + item + " ' and sessionid= '" + _guidid + "') as bool", (err, rows, fields) => {
            if (!err) {
                if (rows[0].bool != 1) {
                    mysqlConnection.query("insert into cart (productname,quantity,sessionid) values (' " + item + " ', " + 1 + ",'" + _guidid + "')", (err, rows, fields) => {
                        if (!err) {
                            var _guid = guid.create();

                            res.send("Added")
                        }
                        else {
                            console.log(err)
                        }
                    }
                    )

                }
                else {

                    mysqlConnection.query("select quantity as q from cart where productname=' " + item + " 'and sessionid= '" + _guidid + "'", (err, rows, fields) => {
                        if (!err) {

                            mysqlConnection.query("UPDATE cart SET quantity= " + (rows[0].q + 1) + " where productname=' " + item + " ' and sessionid= '" + _guidid + "'", (err, rows, fields) => {
                                if (!err) {
                                    res.send("increased")
                                }
                                else {
                                    console.log(err)
                                }
                            }
                            )
                        }
                        else {
                            console.log(err)
                        }
                    }
                    )
                }

            }
            else {
                console.log(err)
            }

        })
    }
}
)


app.delete('/cart/remove/:item', (req, res) => {

    var item = req.params.item
    var _guidid = req.headers['session-id']

    if ((req.headers['session-id']) == undefined || (req.headers['session-id']) == "") {
        res.send("No Session. Provide Valid Session ID")
    }
    else {



        mysqlConnection.query("Delete from cart where productname = ' " + item + " ' and sessionid= '" + _guidid + "' ", (err, rows, fields) => {
            if (!err) {
                res.send("deleted")
            }
            else {
                console.log(err)
            }
        }
        )
    }
}
)


app.delete('/cart/decrease/:item', (req, res) => {

    var item = req.params.item
    var _guidid = req.headers['session-id']


    if ((req.headers['session-id']) == undefined || (req.headers['session-id']) == "") {
        res.send("No Session. Provide Valid Session ID")
    }
    else {
        mysqlConnection.query("select quantity as q from cart where productname=' " + item + " 'and sessionid= '" + _guidid + "'", (err, rows, fields) => {
            if (!err) {

                mysqlConnection.query("UPDATE cart SET quantity= " + (rows[0].q - 1) + " where productname=' " + item + " 'and sessionid= '" + _guidid + "'", (err, rows, fields) => {
                    if (!err) {
                        res.send("decreased")

                    }
                    else {
                        console.log(err)
                    }
                }
                )
            }
            else {
                console.log(err)
            }
        }
        )
    }
}
)
