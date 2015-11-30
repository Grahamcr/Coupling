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

  var tribeResolution = ['$route', 'Coupling', function ($route, Coupling) {
    return Coupling.requestSpecificTribe($route.current.params.tribeId);
  }];

  routeProvider
    .when('/', {redirectTo: '/tribes/'})
    .when('/tribes/', {
      template: '<tribelist tribes="main.tribes">',
      controllerAs: 'main',
      controller: ['tribes', function (tribes) {
        this.tribes = tribes;
      }],
      resolve: {
        tribes: ['Coupling', function (Coupling) {
          return Coupling.getTribes();
        }]
      }
    })
    .when('/new-tribe/', {
      template: '<tribe-config tribe="main.tribe" is-new=true>',
      controllerAs: 'main',
      controller: ['Coupling', function (Coupling) {
        this.tribe = new Coupling.Tribe();
        this.tribe.name = 'New Tribe';
      }]
    })
    .when('/:tribeId/', {
      redirectTo: '/:tribeId/pairAssignments/current/'
    })
    .when('/:tribeId/prepare/', {
      template: '<prepare tribe="main.tribe" players="main.players">',
      controllerAs: 'main',
      controller: ['tribe', 'players', function (tribe, players) {
        this.tribe = tribe;
        this.players = players;
      }],
      resolve: {
        tribe: tribeResolution,
        players: ['$route', 'Coupling', function ($route, Coupling) {
          return Coupling.requestPlayersPromise($route.current.params.tribeId,
            Coupling.requestHistoryPromise($route.current.params.tribeId));
        }]
      }
    })
    .when('/:tribeId/edit/', {
      template: '<tribe-config tribe="main.tribe" is-new=false>',
      controllerAs: 'main',
      controller: ['tribe', function (tribe) {
        this.tribe = tribe;
      }],
      resolve: {
        tribe: tribeResolution
      }
    })
    .when('/:tribeId/history/', {
      template: '<history tribe="main.tribe" history="main.history">',
      controllerAs: 'main',
      controller: ['tribe', 'history', function (tribe, history) {
        this.tribe = tribe;
        this.history = history;
      }],
      resolve: {
        tribe: tribeResolution,
        history: ['$route', 'Coupling', function ($route, Coupling) {
          return Coupling.requestHistoryPromise($route.current.params.tribeId);
        }]
      }
    })
    .when('/:tribeId/pins', {
      template: '<pin-list pins="main.pins">',
      controllerAs: 'main',
      controller: ['pins', function (pins) {
        this.pins = pins;
      }],
      resolve: {
        pins: ['$route', 'Coupling', function ($route, Coupling) {
          return Coupling.promisePins($route.current.params.tribeId);
        }]
      }
    })
    .when('/:tribeId/pairAssignments/current/', {
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
    })
    .when('/:tribeId/pairAssignments/new/', {
      templateUrl: '/partials/pairAssignments/',
      controller: "NewPairAssignmentsController",
      resolve: {
        tribe: tribeResolution,
        players: ['$route', 'Coupling', function ($route, Coupling) {
          return Coupling.requestPlayersPromise($route.current.params.tribeId,
            Coupling.requestHistoryPromise($route.current.params.tribeId));
        }]
      }
    })
    .when('/:tribeId/player/new/', {
      template: '<player-config>',
      controller: ['$scope', 'tribe', 'players', function ($scope, tribe, players) {
        $scope.tribe = tribe;
        $scope.players = players;
        $scope.player = {
          tribe: tribe._id
        };
      }],
      resolve: {
        tribe: tribeResolution,
        players: ['$route', 'Coupling', function ($route, Coupling) {
          return Coupling.requestPlayersPromise($route.current.params.tribeId,
            Coupling.requestHistoryPromise($route.current.params.tribeId));
        }]
      }
    })
    .when('/:tribeId/player/:id/', {
      template: '<player-config>',
      controller: ['$scope', '$route', 'tribe', 'players', function ($scope, $route, tribe, players) {
        $scope.tribe = tribe;
        $scope.players = players;
        var playerId = $route.current.params.id;
        $scope.player = _.findWhere(players, {_id: playerId});
      }],
      resolve: {
        tribe: tribeResolution,
        players: ['$route', 'Coupling', function ($route, Coupling) {
          return Coupling.requestPlayersPromise($route.current.params.tribeId,
            Coupling.requestHistoryPromise($route.current.params.tribeId));
        }]
      }
    })
    .when('/auth/google', {
      redirectTo: '/auth/google'
    });
}]);

angular.module('ui.gravatar')
  .config([
    'gravatarServiceProvider',
    function (gravatarServiceProvider) {
      gravatarServiceProvider.defaults = {
        size: 100,
        "default": 'mm'
      };
      gravatarServiceProvider.secure = true;
    }
  ]);

angular.module("coupling.directives", []);