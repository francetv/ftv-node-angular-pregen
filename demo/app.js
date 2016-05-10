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

angular.module('app', [
    'templatescache',
    'config',
    'resource.data',
    'pages',
    'demo-directives'
])
.config(['$httpProvider', '$locationProvider', function ($httpProvider, $locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    $httpProvider.defaults.useXDomain = true;
}])
.controller('AppCtrl', [function () {
}]);

angular.module('app').run();

angular.module('pages', [
    'ngRoute',
    'config'
])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/other-page', {
            templateUrl: 'other-page.html',
            controller: 'OtherPageCtrl'
        })
        .when('/', {
            templateUrl: 'home.html',
            controller: 'HomeCtrl'
        })
        .otherwise({
            templateUrl: '/home.html',
            controller: 'HomeCtrl'
        });
}])

.controller('HomeCtrl', ['$scope', 'env', 'serverData', function ($scope, env, serverData) {
    $scope.content = "I'm the home page";
    $scope.envValue = env.specificEnvValue;
    $scope.serverDataValue = serverData.dummyField;
}])

.controller('OtherPageCtrl', ['$scope', 'env', 'serverData', function ($scope, env, serverData) {
    $scope.content = "I'm the other page";
    $scope.envValue = env.specificEnvValue;
    $scope.serverDataValue = serverData.dummyField;
}]);

angular.module('demo-directives', [])

.directive('layoutModuleWithSignature', [function(){
    return {
        restrict: 'E',
        scope: {},
        template: '<button ng-click="doAction()">Button with action (layout module with signature)</button>',
        link: function ($scope) {
            $scope.doAction = function(){
                alert('layout module with signature action worked !');
            }
        }
    }
}])

.directive('layoutModuleWithoutSignature', [function(){
    return {
        restrict: 'E',
        replace: true,
        scope: {},
        template: '<button ng-click="doAction()">Button with action (layout module WITHOUT signature) <i>Warning not working :(</i></button>',
        link: function ($scope) {
            $scope.doAction = function(){
                alert('layout module WITHOUT signature action worked !');
            }
        }
    }
}])

.directive('viewModuleWithoutSignature', [function(){
    return {
        restrict: 'E',
        replace: true,
        scope: {},
        template: '<button ng-click="doAction()">Button with action (view module without signature)</button>',
        link: function ($scope) {
            $scope.doAction = function(){
                alert('view module without signature action worked !');
            }
        }
    }
}]);
