import {module} from "angular";
import * as find from "ramda/src/find";
import * as propEq from "ramda/src/propEq";
import * as eqBy from "ramda/src/eqBy";
import * as prop from "ramda/src/prop";
import * as differenceWith from "ramda/src/differenceWith";
import * as flatten from "ramda/src/flatten";
import * as template from "./pair-assignments.pug";
import Tribe from "../../../../common/Tribe";
import PairAssignmentSet from "../../../../common/PairAssignmentSet";
import Player from "../../../../common/Player";
import * as Styles from "./styles.css";

export class PairAssignmentsController {
    static $inject = ['Coupling', '$location', '$websocket', '$scope'];
    tribe: Tribe;
    players: Player[];
    pairAssignments: PairAssignmentSet;
    isNew: boolean;
    styles: any;
    messages: string[];
    private _unpairedPlayers: Player[];
    private differenceOfPlayers = differenceWith(eqBy(prop('_id')));

    constructor(public Coupling, private $location, private $websocket, private $scope) {
        this.styles = Styles;
        this.messages = [];

        const dataStream = $websocket('ws://localhost:3000/helloSocket');

        dataStream.onOpen(() => this.messages.push('Connection opened'));
        dataStream.onMessage((message) => this.messages.push(message.data));
        dataStream.onClose(() => this.messages.push('Connection closed'));

        $scope.$on('$destroy', () => dataStream.close());
    }

    get unpairedPlayers(): Player[] {
        if (this._unpairedPlayers) {
            return this._unpairedPlayers;
        } else {
            this._unpairedPlayers = this.findUnpairedPlayers(this.players, this.pairAssignments);
            return this._unpairedPlayers;
        }
    }

    save() {
        const self = this;
        this.Coupling.saveCurrentPairAssignments(this.pairAssignments)
            .then(() => self.$location.path(`/${self.tribe.id}/pairAssignments/current`));
    }

    onDrop(draggedPlayer, droppedPlayer) {
        const pairWithDraggedPlayer = this.findPairContainingPlayer(draggedPlayer, this.pairAssignments.pairs);
        const pairWithDroppedPlayer = this.findPairContainingPlayer(droppedPlayer, this.pairAssignments.pairs);
        if (pairWithDraggedPlayer != pairWithDroppedPlayer) {
            this.swapPlayers(pairWithDraggedPlayer, draggedPlayer, droppedPlayer);
            this.swapPlayers(pairWithDroppedPlayer, droppedPlayer, draggedPlayer);
        }
    }

    private findPairContainingPlayer(player, pairs: Player[][]) {
        return find(find(propEq('_id', player._id)), pairs);
    }

    private swapPlayers(pair, swapOutPlayer, swapInPlayer) {
        pair.forEach(function (player: Player, index) {
            if (swapOutPlayer._id === player._id) {
                pair[index] = swapInPlayer;
            }
        });
    }

    private findUnpairedPlayers(players: Player[], pairAssignmentDocument: PairAssignmentSet): Player[] {
        if (!pairAssignmentDocument) {
            return players;
        }
        const currentlyPairedPlayers = flatten(pairAssignmentDocument.pairs);

        return this.differenceOfPlayers(players, currentlyPairedPlayers);
    }

}

export default module('coupling.pairAssignments', ['ngWebSocket'])
    .controller('PairAssignmentsController', PairAssignmentsController)
    .directive('pairAssignments', () => {
        return {
            controller: 'PairAssignmentsController',
            controllerAs: 'pairAssignments',
            bindToController: {
                tribe: '=',
                players: '=',
                pairAssignments: '=pairs',
                isNew: '='
            },
            restrict: 'E',
            template: template
        }
    });
