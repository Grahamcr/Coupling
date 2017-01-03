import "angular";
import "angular-resource";
import * as _ from "underscore";
import Player from "../../common/Player";
import * as common from "../../common/index";
import Randomizer from "./Randomizer";
import IPromise = angular.IPromise;
import IResource = angular.resource.IResource;
import IResourceClass = angular.resource.IResourceClass;
import IResourceService = angular.resource.IResourceService;
import IResourceArray = angular.resource.IResourceArray;
import IQService = angular.IQService;
import IHttpService = angular.IHttpService;
import IHttpPromiseCallbackArg = angular.IHttpPromiseCallbackArg;

interface SelectablePlayerMap {
    [id: string]: SelectablePlayer;
}

class CouplingData {
    selectablePlayers: SelectablePlayerMap
}

interface Tribe extends IResource<Tribe>, common.Tribe {
}

interface TribeResource extends IResourceClass<Tribe> {
}

interface PairAssignmentSetResource extends IResourceClass<PairAssignmentSet> {
}

interface PairAssignmentSet extends IResource<PairAssignmentSet>, common.PairAssignmentSet {
}

class Pin {
}

class SelectablePlayer {
    constructor(public isSelected: boolean, public player: Player) {
    }
}

const makeTribeResource = function ($resource: angular.resource.IResourceService) {
    return <TribeResource>$resource('/api/tribes/:tribeId', {tribeId: '@id'});
};


const makePairAssignmentResource = function ($resource: angular.resource.IResourceService) {
    return <PairAssignmentSetResource>$resource('/api/:tribeId/history/:id', {
        id: '@_id',
        tribeId: '@tribe'
    });
};

class Coupling {
    static $inject = ['$http', '$q', '$resource'];

    data: CouplingData;
    Tribe: TribeResource;
    PairAssignmentSet: PairAssignmentSetResource;

    constructor(public $http: IHttpService, public $q: IQService, $resource: IResourceService) {
        this.Tribe = makeTribeResource($resource);
        this.PairAssignmentSet = makePairAssignmentResource($resource);
        this.data = new CouplingData();
        this.data.selectablePlayers = {};
    }

    public getTribes(): IPromise<IResourceArray<Tribe>> {
        return this.Tribe
            .query()
            .$promise;
    }

    getTribe(tribeId): IPromise<Tribe> {
        return this.Tribe
            .get({tribeId: tribeId})
            .$promise;
    }

    getHistory(tribeId): IPromise<[PairAssignmentSet]> {
        return this.PairAssignmentSet
            .query({tribeId: tribeId})
            .$promise;
    }

    spin(players, tribeId): IPromise<PairAssignmentSet> {
        return this.$http.post(`/api/${tribeId}/spin`, players)
            .then(result => new this.PairAssignmentSet(result.data));
    }

    saveCurrentPairAssignments(pairAssignments: PairAssignmentSet) {
        return pairAssignments.$save();
    }

    getPlayers(tribeId) {
        return this.$http.get(`/api/${tribeId}/players`)
            .then(response => response.data);
    }

    savePlayer(player) {
        return this.post(`/api/${player.tribe}/players`, player);
    }

    removePlayer(player) {
        return this.httpDelete(`/api/${player.tribe}/players/${player._id}`);
    }

    getSelectedPlayers(players: Player[], history) {
        const selectablePlayers = _.map(players, (player) => {
            const selected = this.playerShouldBeSelected(player, history);
            return [player._id, new SelectablePlayer(selected, player)];
        });

        this.data.selectablePlayers = <SelectablePlayerMap>_.object(selectablePlayers);
        return this.data.selectablePlayers;
    }

    getPins(tribeId): IPromise<[Pin]> {
        return this.$http.get(`/api/${tribeId}/pins`)
            .then(response => response.data);
    }

    private post<T>(url, object: T): IPromise<T> {
        return this.$http.post(url, object)
            .then(response => response.data);
    }

    private httpDelete(url): IPromise<void> {
        return this.$http.delete(url)
            .then(() => undefined);
    }

    private isInLastSetOfPairs(player, history) {
        const result = _.find(history[0].pairs, function (pairSet: [{}]) {
            if (_.findWhere(pairSet, {_id: player._id})) {
                return true;
            }
        });
        return !!result;
    }

    private playerShouldBeSelected(player, history) {
        if (this.data.selectablePlayers[player._id]) {
            return this.data.selectablePlayers[player._id].isSelected
        } else if (history.length > 0) {
            return this.isInLastSetOfPairs(player, history);
        } else {
            return true;
        }
    }

}

angular.module("coupling.services", ['ngResource'])
    .service("Coupling", Coupling)
    .service('randomizer', Randomizer);

export {Player, Tribe, PairAssignmentSet, SelectablePlayer, Coupling, Randomizer}