var angularContext = require('./angular-context');
var ngoverrides = require('./ngoverrides');
var util = require('./util');

exports.renderAngularSnapshot = function (template, config, callback) {
    var scriptTags = util.extractScriptTags(template);
    var templateNoScript = this.filterTemplate(template);
    var self = this;

    this.getAngularInjector(templateNoScript, config, function(err, $injector){
        if (err) {
            $injector.close();
            return callback(err);
        }

        var $route = $injector.get('$route');

        var reqContext = $injector.get('serverRequestContext');
        var path = reqContext.location.path();
        var search = reqContext.location.search();

        var matchedRoute = $route.getByPath(path, search);

        if (!matchedRoute) {
            $injector.close();
            return callback('Not found');
        }

        var $rootScope = $injector.get('$rootScope');
        var $httpBackend = $injector.get('$httpBackend');

        // just in case the app depends on this event to do some cleanup/initialization
        $route.current = matchedRoute;
        $rootScope.$broadcast(
            '$routeChangeStart',
            matchedRoute,
            undefined
        );
        $rootScope.$digest();

        // making a JSON-friendly route has the side-effect of waiting for all of
        // the route locals to resolve, which we're depending on here.
        // Right now this actually flattens the promises in the route locals as a side-effect,
        // which may or may not be a problem. Keeping it this way for now because at least it
        // means the controller running on the server will see the same thing as the controller
        // running on the client when we're using server-defined routes.
        matchedRoute.populateLocals().then(function () {
            $rootScope.$on('$viewContentLoaded', function () {
                $httpBackend.notifyWhenNoOpenRequests(function () {
                    self.prepareView($injector, $rootScope, scriptTags, callback);
                });
            });

            $rootScope.$broadcast(
                '$routeChangeSuccess',
                matchedRoute,
                undefined
            );
        });
    });
};

exports.prepareView = function ($injector, $rootScope, scriptTags, callback) {
    var element = $injector.get('$rootElement');
    $rootScope.$digest();

    var container = $injector.angular.element('<div></div>');
    container.append(element);

    var $html = container.find('html');
    $html.attr('ng-app', 'app');

    // switch splashscreen with the ng-view
    var ngView = $html.find('[ng-view]');
    var splashscreen = $html.find('.splashscreen');
    splashscreen.html(ngView.html());
    splashscreen.removeAttr('ng-hide');
    splashscreen.removeClass('splashscreen');
    splashscreen.removeClass('ng-hide');
    splashscreen.addClass('genViewContainer');
    ngView.empty();

    var staticSnapshot = container.html();
    container = null;

    staticSnapshot = util.removeScriptTags(staticSnapshot);

    var matches = staticSnapshot.match(/<\/body(?:.*?)>(?:[\S\s]*?)<\/html>/gi);
    staticSnapshot = staticSnapshot.replace(matches[0], scriptTags.join(''));
    staticSnapshot += '</body></html>';

    $injector.close();

    callback(null, staticSnapshot);
};

exports.filterTemplate = function (template) {
    var templateNoScript = util.removeScriptTags(template);
    return util.removeNgApp(templateNoScript);
};

exports.getAngularInjector = function (templateNoScript, config, callback) {
    angularContext.createContext(templateNoScript, config.serverScripts, config.src, function (err, context) {
        if (err) {
            context.dispose();
            return callback(err);
        }

        ngoverrides.registerModule(context, config.moduleOptions);

        var angular = context.getAngular();

        var modules = angular.copy(config.angularModules);
        modules.unshift('angularjs-server');
        modules.unshift('ng');

        var $injector = context.injector(modules);

        // Although the called module will primarily use the injector, we
        // also give it indirect access to the angular object so it can
        // make use of Angular's "global" functions.
        $injector.angular = angular;

        // provide console.log in node when pre-generating angular
        var $window = $injector.get('$window');
        $window.console.log = console.log;

        // The caller must call this when it's finished in order to free the context.
        $injector.close = function () {
            context.dispose();
        };

        // bootstrap the injector against the root element
        $injector.bootstrap();

        // need to tell the context its absolute base URL so that relative paths will work as expected.
        var request = config.moduleOptions.request;
        var contextUrl = request.protocol + '//' + request.hostname + request.url;

        // Set window.location.href so that things that go directly to that layer will
        // work as expected.
        // However, we leave the context's *base* URL set to the default file:// URL,
        // since otherwise we can't make xmlhttprequest requests to the filesystem.
        if ($window.location) {
            Object.defineProperty($window.location, 'href', {
                value: contextUrl
            });
            Object.defineProperty($window.location, 'pathname', {
                value: request.url
            });
        }

        // Tell the context about our current request, so $location will work.
        var reqContext = $injector.get('serverRequestContext');
        reqContext.setRequest(request);

        callback(null, $injector);
    });
};