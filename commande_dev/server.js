"use strict";

const app = require('express')();
const mysql = require("mysql");

const bodyParser = require('body-parser');
const CustomError = require('./class/Error');
const Command = require('./class/Command');
const sanitizeHtml = require('sanitize-html');
const uid = require('uuid');

// Constants
const PORT = 8080;
const HOST = "0.0.0.0";

// App
app.use(bodyParser({extended: true}));

app.get("/", (req, res) => {
    res.send("Commande API\n");
});

app.route('/commandes')
    .get(function (req, res) {
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        let query = "SELECT * FROM `commande` ORDER BY id ASC"; // query database to get all the players
        let tmp = {};
        db.query(query, (err, result) => {
            if (err) {
                tmp = new CustomError({type: 404, msg: err, error: 'NOT FOUND'})
                res.status(404).send(JSON.stringify(tmp));
            } else {
                tmp
                    = new CustomError({type: 200, msg: 'SUCCESS', error: 'SUCCESS'})
                res.status(200).send(JSON.stringify({commandes: result}));
            }
        })
    })
    .post(function (req, res) {
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        let cleanInput = {};
        for (let lm in req.body) {
            cleanInput[lm] = sanitizeHtml(req.body[lm]);
        }
        cleanInput.id = uid();
        let tmp = {};
        let newCommand = new Command(cleanInput);
        db.query('Insert INTO commande VALUES (?)', [newCommand.getArray()], (err, result) => {
            if (err) {
                tmp = new CustomError({type: 404, msg: err, error: 'NOT FOUND'})
                res.status(404).send(JSON.stringify(tmp));
            } else {
                res.setHeader('Location', `commandes/${newCommand.id}`);
                res.status(201).send(JSON.stringify({
                    result: (result),
                    change: (newCommand)
                }));
            }
        });

    })
    .all(function (req, res) {
        res.status(405).send(new CustomError({type: 405, msg: 'Method not allowed', error: 'METHOD NOT ALLOWED'}));
    });


app.route('/commandes/:id')
    .get(function (req, res) {
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        let query = `SELECT * FROM commande WHERE commande.id = ? ORDER BY id ASC`; // query database to get all the players
        let tmp = {};
        db.query(query, req.params.id, (err, result) => {
            if (err) {
                tmp = new CustomError({type: 404, msg: err, error: 'NOT FOUND'})
                res.status(404).send(JSON.stringify(tmp));
            } else {
                if (result.length > 0) {
                    res.status(200).send(JSON.stringify({commandes: (result)}));
                } else {
                    tmp = new CustomError({
                        type: 404,
                        msg: `La commande ${req.params.id} n'existe pas.`,
                        error: 'NOT FOUND'
                    })
                    res.status(404).send(JSON.stringify(tmp));
                }
            }
        })
    })
    .post(function (req, res) {
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        let query = `SELECT * FROM commande WHERE commande.id = ? ORDER BY id ASC`; // query database to get all the players
        let tmp = {};
        db.query(query, [req.params.id], (err, result) => {
            if (err) {
                tmp = new CustomError({type: 404, msg: err, error: 'NOT FOUND'});
                res.status(404).send(JSON.stringify(tmp));
            } else {
                if (result.length < 0) {
                    tmp = new CustomError({
                        type: 404,
                        msg: `La commande ${req.params.id} n'existe pas.`,
                        error: 'NOT FOUND'
                    });
                    res.status(404).send(JSON.stringify(tmp));
                } else {
                    let commande = new Command({...req.body, ...result});
                    query = `Update commande set ${commande.getUpdate()} where id = ?`;
                    db.query(query, [req.params.id], (err, result) => {
                        res.status(200).send(JSON.stringify({
                            result: (result),
                            change: (commande)}));
                    });
                }
            }
        })
    })
    .all(function (req, res) {
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.status(405).send('Method Not Allowed');
    });

app.get('*', function (req, res) {
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    res.status(404).json(new CustomError({error: 400, type: 'BAD REQUEST', msg: 'Cette uri n\'existe pas.'}))
});

app.listen(PORT, HOST);
console.log(`Commande API Running on http://${HOST}:${PORT}`);

const db = mysql.createConnection({
    host: "mysql.commande",
    user: "command_lbs",
    password: "command_lbs",
    database: "command_lbs"
});

// connexion à la bdd
db.connect(err => {
    if (err) {
        res.status(500).json(new CustomError({error: 500, type: 'Internal Server Error', msg: 'Internal Server Error'}))
    }
    console.log("Connected to database");
});

