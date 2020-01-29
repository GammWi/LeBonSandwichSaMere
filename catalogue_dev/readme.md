# Catalogue API

Projet **_"Le Bon Sandwich"_** 2019/2020 version Node.js

## Installation des dépendances NPM

Se placer à la racine du dossier catalogue_dev et installer les dépendances NPM via la commande suivante :

> npm i

Par défaut, les dépendances du dossier catalogue_dev/node_modules sont envoyées dans le dossier catalogue_api/node_modules

Attention, seules les dépendances appartenant à la liste _"dependencies"_ du fichier package.json sont transférées. Nodemon doit donc figurer dans les _"dependencies"_ et non les _"dev_dependencies"_.

En cas de problème, installer les dépendances directement sur le service distant catalogue_api

> docker-compose up

ouvrir un second onglet du terminal

> docker-compose ps

récupérer le nom du service docker en cours d'exécution associé à catalogue_api

> docker exec -ti <nom_du_service> npm i

La commande "npm run dev" renseignée dans le fichier "docker-compose.yml" ne peut fonctionner que si nodemon est installé dans le service catalogue_api

Si besoin, installer nodemon directement dans le service catalogue_api

> docker exec -ti <nom_du_service> npm i nodemon

## Description fonctionnelle

L'API Catalogue est connectée à la base de données de type MongoDB nommée "mongo" et mise à disposition par le service "mongo.cat"

L'API Catalogue utilise l'ODM Mongoose pour interragir avec la base de données https://mongoosejs.com/

Dans l'exemple fourni, l'API Catalogue permet de récupérer la liste des catégories via une requête GET et de créer de nouvelles catégories via une requête POST
