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
