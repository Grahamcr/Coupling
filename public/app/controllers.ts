/// <reference path="../../typescript-libraries/typings/tsd.d.ts" />
/// <reference path="services.ts" />

function findUnpairedPlayers(players, pairAssignmentDocument:PairSet) {
    if (!pairAssignmentDocument) {
        return players;
    }
    var currentlyPairedPlayers = _.flatten(pairAssignmentDocument.pairs);
    return _.filter(players, function (value:Player) {
        var found = _.findWhere(currentlyPairedPlayers, {_id: value._id});
        return found == undefined;
    });
}

angular.module('coupling.controllers')
    .controller('NewPairAssignmentsController',
    ['$scope', '$location', 'Coupling', '$routeParams', 'tribe', 'players',
        function ($scope, $location, Coupling, $routeParams, tribe, players:[Player]) {
            this.tribe = tribe;

            var selectedPlayers = _.filter(players, function (player) {
                return player.isAvailable;
            });

            var controller = this;

            Coupling.spin(selectedPlayers, tribe._id)
                .then(function (pairAssignments) {
                    controller.currentPairAssignments = pairAssignments;
                    controller.unpairedPlayers = findUnpairedPlayers(players, pairAssignments);
                });

            this.save = function () {
                Coupling.saveCurrentPairAssignments(tribe._id, controller.currentPairAssignments)
                    .then(function () {
                        $location.path("/" + $routeParams.tribeId + "/pairAssignments/current");
                    });
            };

            function findPairContainingPlayer(player, pairs:[[Player]]) {
                return _.find(pairs, function (pair) {
                    return _.findWhere(pair, {
                        _id: player._id
                    });
                });
            }

            function swapPlayers(pair, swapOutPlayer, swapInPlayer) {
                _.each(pair, function (player:Player, index) {
                    if (swapOutPlayer._id === player._id) {
                        pair[index] = swapInPlayer;
                    }
                });
            }

            this.onDrop = function ($event, draggedPlayer, droppedPlayer) {
                var pairWithDraggedPlayer = findPairContainingPlayer(draggedPlayer, controller.currentPairAssignments.pairs);
                var pairWithDroppedPlayer = findPairContainingPlayer(droppedPlayer, controller.currentPairAssignments.pairs);

                if (pairWithDraggedPlayer != pairWithDroppedPlayer) {
                    swapPlayers(pairWithDraggedPlayer, draggedPlayer, droppedPlayer);
                    swapPlayers(pairWithDroppedPlayer, droppedPlayer, draggedPlayer);
                }
            }
        }
    ])
    .controller('CurrentPairAssignmentsController',
    ['pairAssignmentDocument', 'tribe', 'players', function (pairAssignmentDocument, tribe, players) {
        this.tribe = tribe;
        this.players = players;
        this.currentPairAssignments = pairAssignmentDocument;
        this.unpairedPlayers = findUnpairedPlayers(players, pairAssignmentDocument)
    }]);
