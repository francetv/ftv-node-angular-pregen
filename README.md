# FTV - NodeJS AngularJS Pregen

This project is part of [francetv zoom open source projects](https://github.com/francetv/zoom-public) (iOS, Android and Angular).

NodeJS server used to generate AngularJS page.

## Get sources

```
git clone git@github.com:francetv/ftv-node-angular-pregen.git
```

## Required dependencies

- [npm](https://nodejs.org/)

## Installation

```
npm install ftv-node-angular-pregen
```

## Dev requirement

```
npm install -g gulp
npm install
```

## JS Linter

```
gulp js-lint
```

# Demo

## Installation

```
gulp demo
```

then requiring nodemon or pm2

```
npm install -g nodemon
nodemon demo/server.js --expose-gc
```

```
npm install -g pm2
pm2 start demo/server.js --node-args='--expose-gc' --watch
```

In the demo we require using garbage collector because current jsdom version still has memory leak

## Explanation

- Server
    - Api Service - Retrieving "view data" according the url
    - Pregen page with the "view data" and on the required librairies
    - Inserting in the snapshot the "view data" in a angular module
    - Sending snapshot to the client
- Client
    - Initializing the angular app
    - Building the page with the "view data" retrieved from the inserted angular modules (prevent to call again the api - server side only)
