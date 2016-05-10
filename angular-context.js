/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 France Télévisions
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var jsdom = require('jsdom');

var virtualConsole = jsdom.createVirtualConsole().sendTo(console);

exports.createContext = function(template, files, src, callback) {
    jsdom.env(template, {
        src: src,
        scripts: files,
        done: function (err, window) {
            if (err) {
                return callback(err);
            }

            callback(null, new Context(window));
        },
        features: {
            // Don't do anything with external resources, since we're not actually
            // trying to emulate a browser here, just a DOM.
            FetchExternalResources: false,
            ProcessExternalResources: false,
            SkipExternalResources: false
        },
        virtualConsole
    });
};

function Context (window) {
    window.scrollTo = function () {};

    this.window = window;
    this.rawContext = window;
    this.document = window.document;
    this.disposeCallbacks = [];
}

Context.prototype.getAngular = function () {
    return this.rawContext.angular;
};

Context.prototype.module = function () {
    return this.rawContext.angular.module.apply(
        this.rawContext.angular.module,
        arguments
    );
};

Context.prototype.injector = function (modules) {
    // In 'normal' angular the $rootElement isn't provided unless you go through
    // angular.bootstrap, but we deviate from that here and register a provider
    // for $rootElement that will only succeed if the bootstrap extension method
    // has been called on the injector before use. This allows callers to selectively
    // 'upgrade' injectors to have root elements when needed, while skipping template
    // compilation altogether when not needed.
    var $rootElement; // only available if we subsequently bootstrap
    var self = this;

    modules.unshift(
        function ($provide) {
            $provide.provider(
                '$rootElement',
                function () {
                    return {
                        $get: function () {
                            if ($rootElement) {
                                return $rootElement;
                            }
                            else {
                                throw new Error(
                                    '$rootElement not available: injector not bootstrapped'
                                );
                            }
                        }
                    };
                }
            );
        }
    );

    var $injector = this.rawContext.angular.injector(modules);

    $injector.bootstrap = function bootstrap(element) {
        if (! element) {
            element = self.document;
        }
        element = self.rawContext.angular.element(element);
        $rootElement = element;
        $injector.invoke(
            function ($rootScope, $compile) {
                element.data('$injector', $injector);
                $compile(element)($rootScope);
            }
        );
    };

    return $injector;
};

Context.prototype.onDispose = function (cb) {
    this.disposeCallbacks.push(cb);
};

Context.prototype.dispose = function () {
    // First call the dispose callbacks to give callers an opportunity to clean up
    // any pending async events. (If they don't do this then the app can crash
    // when the operations complete, since their state has been freed.)
    for (var i = 0; i < this.disposeCallbacks.length; i++) {
        this.disposeCallbacks[i](this);
    }
    this.rawContext.close();
};