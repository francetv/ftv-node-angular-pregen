FTV - Angular Pregen
====================

Angular generator

# Get sources

```
git clone git@gitlab.ftven.net:team-infini/angular-pregen.git
```

# Required dependencies

- [npm](https://nodejs.org/)

# Installation

```
npm install ftv-angular-pregen
```

# Dev requirement

```
npm install -g gulp
npm install
```

# JS Linter

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
pm2 start --node-args='--expose-gc' --watch zoom-server.js
```

In the demo we require using garbage collector when memory is too high because by this time of using this laster jsdom version it is still having memory leak

## Explanation

- Server
  - Api Service - Retrieving "view data" according the url
  - Pregen page with the "view data" and on the required librairies
  - Inserting in the snapshot the "view data" in a angular module
  - Sending snapshot to the client
- Client
  - Initializing the angular app
  - Building the page with the "view data" retrieved from the inserted angular modules (prevent to call again the api - server side only)