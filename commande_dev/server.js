"use strict";

const axios = require('axios');
const app = require('express')();
const mysql = require("mysql");

const bodyParser = require('body-parser');
const CustomError = require('./class/Error');
const Command = require('./class/Command');
const sanitizeHtml = require('sanitize-html');
const uid = require('uuid');

const bcrypt = require('bcrypt');

const defaultSize = 5;

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

        let query = "select count(id) as nbElement from commande %%JOKER%%";

        if (req.query.s != null) {
            query = query.replace('%%JOKER%%', `WHERE status LIKE ${req.query.s}`);
        } else {
            query = query.replace('%%JOKER%%', '');
        }

        let promise = new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });

        let size;
        let nbPages;
        let page;

        promise.then(lm => {
            const nbElement = lm[0].nbElement;

            size = (req.query.size != null) ? req.query.size : defaultSize;
            nbPages = Math.ceil(nbElement / size);

            page = 1;

            if (req.query.page != null) {
                if (req.query.page >= 1) {
                    if (req.query.page > nbPages) {
                        page = nbPages;
                    } else {
                        page = req.query.page;
                    }
                }
            }

            page = parseInt(page);
            size = parseInt(size);
            console.log(page);
            console.log(size);


            query = `SELECT * FROM commande %%JOKER%% ORDER BY id ASC %%SIZE%% %%PAGE%%`; // query database to get all the players

            if (req.query.s != null) {
                query = query.replace('%%JOKER%%', `WHERE status LIKE ${req.query.s}`);
            } else {
                query = query.replace('%%JOKER%%', '');
            }


            if (page != null && page > 1) {
                query = query.replace('%%PAGE%%', `OFFSET ${(page - 1) * size}`);
            } else {
                query = query.replace('%%PAGE%%', ``);
            }

            if (size != null) {
                query = query.replace('%%SIZE%%', `LIMIT ${size}`);
            } else {
                query = query.replace('%%SIZE%%', ``);
            }

            let tmp = {};
            db.query(query, (err, result) => {
                if (err) {
                    tmp = new CustomError({type: 404, msg: err, error: 'NOT FOUND'});
                    res.status(404).send(JSON.stringify(tmp));
                } else {
                    tmp = new CustomError({type: 200, msg: 'SUCCESS', error: 'SUCCESS'});
                    const commandList = [];
                    let command = {};
                    result.forEach(lm => {
                        command.command = {
                            id: lm.id,
                            nom: lm.nom,
                            created_at: lm.created_at,
                            livraison: lm.livraison,
                            status: lm.status
                        };
                        command.links = {self: {href: `/commandes/${lm.id}`}};
                        commandList.push(command);
                        command = {};
                    });

                    let data = {};

                    data.type = "collection";
                    data.count = commandList.length;
                    data.size = size;
                    data.page = page;
                    data.commands = commandList;

                    const pageNext = (page >= nbPages) ? nbPages : page + 1;
                    const pagePrev = (page <= 1) ? 1 : page - 1;
                    const pageLast = nbPages;
                    const pageFirst = 1;

                    data.links = {
                        next: {
                            href: `/commandes?page=${pageNext}&size=${size}`
                        },
                        prev: {
                            href: `/commandes?page=${pagePrev}&size=${size}`
                        },
                        last: {
                            href: `/commandes?page=${pageLast}&size=${size}`
                        },
                        first: {
                            href: `/commandes?page=${pageFirst}&size=${size}`
                        },
                    };

                    res.status(200).send(JSON.stringify(data));
                }
            })
        });
    })
    .post(function (req, res) {
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        let cleanInput = {};
        for (let lm in req.body) {
            // noinspection JSUnfilteredForInLoop
            cleanInput[lm] = sanitizeHtml(req.body[lm]);
        }
        cleanInput.id = uid();

        cleanInput.token = bcrypt.hashSync(cleanInput.id, bcrypt.genSaltSync(10));

        let tmp = {};
        let newCommand = new Command(cleanInput);

        db.query('Insert INTO commande VALUES (?)', [newCommand.getArray()], (err, result) => {
            if (err) {
                tmp = new CustomError({type: 404, msg: err, error: 'NOT FOUND'});
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

function checkToken(req) {
    return new Promise((resolve, reject) => {

        let token = (req.header('X-lbs-token') !== undefined ? req.header('X-lbs-token') : (req.query.token) ? req.query.token : null);
        bcrypt.compare(req.params.id, token).then(lm => {
            resolve(lm);
        }).catch(err => {
            reject(false);
        })
    });
}

app.route('/commandes/:id')
    .get(function (req, res) {
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        checkToken(req).then(lm => {
            if (lm) {
                axios.get('http://catalog:8080/categories/1/sandwichs').then(lm => {
                    console.log(lm);
                }).catch(err => {
                    console.log(err.toJSON());
                });

                let query = `SELECT * FROM commande WHERE commande.id = ? ORDER BY id ASC`; // query database to get all the players
                let tmp = {};
                db.query(query, req.params.id, (err, result) => {
                    if (err) {
                        tmp = new CustomError({type: 404, msg: err, error: 'NOT FOUND'});
                        res.status(404).send(JSON.stringify(tmp));
                    } else {
                        if (result.length > 0) {
                            res.status(200).send(JSON.stringify({commandes: (result)}));
                        } else {
                            tmp = new CustomError({
                                type: 404,
                                msg: `La commande ${req.params.id} n'existe pas.`,
                                error: 'NOT FOUND'
                            });
                            res.status(404).send(JSON.stringify(tmp));
                        }
                    }
                })
            } else {
                res.status(401).send(`Vous n'êtes pas autorisé à utiliser cette ressource.`);
            }
        }).catch(err => {
            res.status(500).send(`Erreur serveur. Veuillez contacter votre administrateur. Vérifier votre token.`);
        });
    })
    .post(function (req, res) {
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        checkToken(req).then(lm => {
            if (lm) {
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
                                    change: (commande)
                                }));
                            });
                        }
                    }
                })
            } else {
                res.status(401).send(`Vous n'êtes pas autorisé à utiliser cette ressource.`);
            }
        }).catch(err => {
            res.status(500).send(`Erreur serveur. Veuillez contacter cotre administrateur.`);
        });
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
        console.error(err);
        // res.status(500).json(new CustomError({error: 500, type: 'Internal Server Error', msg: 'Internal Server Error'}))
    }
    console.log("Connected to database");
});
