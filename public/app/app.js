"use strict";
var app = angular.module('coupling', ["ngRoute",
  'ngFitText',
  'ui.gravatar',
  'ang-drag-drop',
  'coupling.controllers',
  'coupling.filters',
  'coupling.directives',
  'coupling.animations']);

app.config(['$locationProvider', function ($locationProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
}]);
app.config(['$routeProvider', function (routeProvider) {
  routeProvider.when('/', {redirectTo: '/tribes/'});
  routeProvider.when('/tribes/', {
    templateUrl: '/partials/tribe-list/',
    controller: "TribeListController",
    resolve: {
      tribes: ['Coupling', function (Coupling) {
        return Coupling.getTribes();
      }]
    }
  });
  routeProvider.when('/new-tribe/', {
    templateUrl: '/partials/tribe/',
    controller: "NewTribeController"
  });
  var tribeResolution = ['$route', 'Coupling', function ($route, Coupling) {
    return Coupling.requestSpecificTribe($route.current.params.tribeId);
  }];
  routeProvider.when('/:tribeId/', {
    redirectTo: '/:tribeId/pairAssignments/current/'
  });

  routeProvider.when('/:tribeId/prepare/', {
    templateUrl: '/partials/prepare/',
    controller: 'PrepareController',
    resolve: {
      tribe: tribeResolution,
      players: ['$route', 'Coupling', function ($route, Coupling) {
        return Coupling.requestPlayersPromise($route.current.params.tribeId,
          Coupling.requestHistoryPromise($route.current.params.tribeId));
      }]
    }
  });

  routeProvider.when('/:tribeId/edit/', {
    templateUrl: '/partials/tribe/',
    controller: "EditTribeController",
    resolve: {
      tribe: tribeResolution
    }
  });
  routeProvider.when('/:tribeId/history/', {
    templateUrl: '/partials/history/',
    controller: "HistoryController",
    resolve: {
      tribe: tribeResolution,
      history: ['$route', 'Coupling', function ($route, Coupling) {
        return Coupling.requestHistoryPromise($route.current.params.tribeId);
      }]
    }
  });

  routeProvider.when('/:tribeId/pins', {
    templateUrl: '/partials/pin-list/',
    controller: 'PinListController'
  });
  routeProvider.when('/:tribeId/pairAssignments/current/', {
    templateUrl: '/partials/pairAssignments/',
    controller: "CurrentPairAssignmentsController",
    resolve: {
      pairAssignmentDocument: ['$route', 'Coupling', function ($route, Coupling) {
        return Coupling.requestHistoryPromise($route.current.params.tribeId).then(function (history) {
          return history[0];
        });
      }],
      tribe: tribeResolution,
      players: ['$route', 'Coupling', function ($route, Coupling) {
        return Coupling.requestPlayersPromise($route.current.params.tribeId,
          Coupling.requestHistoryPromise($route.current.params.tribeId));
      }]
    }
  });
  routeProvider.when('/:tribeId/pairAssignments/new/', {
    templateUrl: '/partials/pairAssignments/',
    controller: "NewPairAssignmentsController",
    resolve: {
      tribe: tribeResolution,
      players: ['$route', 'Coupling', function ($route, Coupling) {
        return Coupling.requestPlayersPromise($route.current.params.tribeId,
          Coupling.requestHistoryPromise($route.current.params.tribeId));
      }]
    }
  });
  routeProvider.when('/:tribeId/player/new/', {
    templateUrl: '/partials/player/',
    controller: "NewPlayerController",
    resolve: {
      tribe: tribeResolution,
      players: ['$route', 'Coupling', function ($route, Coupling) {
        return Coupling.requestPlayersPromise($route.current.params.tribeId,
          Coupling.requestHistoryPromise($route.current.params.tribeId));
      }]
    }
  });
  routeProvider.when('/:tribeId/player/:id/', {
    templateUrl: '/partials/player/',
    controller: "EditPlayerController",
    resolve: {
      tribe: tribeResolution,
      players: ['$route', 'Coupling', function ($route, Coupling) {
        return Coupling.requestPlayersPromise($route.current.params.tribeId,
          Coupling.requestHistoryPromise($route.current.params.tribeId));
      }]
    }
  });
  routeProvider.when('/auth/google', {
    redirectTo: '/auth/google'
  });
}]);

angular.module('ui.gravatar').config([
  'gravatarServiceProvider',
  function (gravatarServiceProvider) {
    gravatarServiceProvider.defaults = {
      size: 100,
      "default": 'mm'
    };
    gravatarServiceProvider.secure = true;
  }
]);
