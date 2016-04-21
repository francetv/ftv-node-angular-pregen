var express    = require('express');
var bodyParser = require('body-parser');
var url        = require('url');
var fs         = require('fs');
var path       = require('path');
var mustache   = require('mustache');

var angularPregen = require('../angular-pregen');
var templateFile = fs.readFileSync(path.join(__dirname, './template.html'), 'utf-8');
var env = fs.readFileSync(path.join(__dirname, './static/env.js'), 'utf-8');

var viewDataConfig = {
    home: {
        title: 'Home Demo Pregen',
        SPECIFIC_ENV_VALUE: 'specific home value',
        data: JSON.stringify({
            dummyField: 'dummy home value'
        })
    },
    otherPage: {
        title: 'Other Page Demo Pregen',
        SPECIFIC_ENV_VALUE: 'specific other page value',
        data: JSON.stringify({
            dummyField: 'dummy other page value'
        })
    }
}

/**
 * Dummy api service getting the data for the view
 */
var dummyApiService = {
    getViewData: function(url){
        var viewData = viewDataConfig.home;
        if (url === '/other-page') {
            viewData = viewDataConfig.otherPage;
        }

        return viewData;
    }
};

var app = express();

app.use(express.static('demo/static'));

app.get('*', function(req, res){
    var viewData = dummyApiService.getViewData(req.originalUrl);

    template = mustache.render(templateFile, viewData, {env: env});

    var envJs = mustache.render(env, viewData);

    var parsedUrl = url.parse(req.originalUrl);

    var config = {
        src: [
            envJs
        ],
        serverScripts: [
            path.join(__dirname, "./static/required-pregen-lib.js"),
            path.join(__dirname, "./static/app.js")
        ],
        angularModules: [
            'app'
        ],
        moduleOptions: {
            request: {
                hostname: '127.0.0.1',
                url:      req.originalUrl,
                protocol: 'http:',
                headers: {
                    host:         '127.0.0.1',
                    'X-TOKEN':    'DUMMY TOKEN'
                }
            }
        }
    };

    angularPregen.renderAngularSnapshot(template, config, function(err, staticSnapshot){
        if (err) return res.sendStatus(500);

        res.send(staticSnapshot);

        if (process.memoryUsage().heapUsed > 100000000) { //only call if memory use is bove 100MB
            global.gc();
        }
    });
});

app.listen(3000);
console.log('Listening on port 3000');