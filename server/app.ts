import CouplingDataService from "./lib/CouplingDataService";
import UserDataService from "./lib/UserDataService";
import * as Promise from "bluebird";
import * as express from "express";
import * as expressWs from "express-ws";
import * as EventEmitter from "events";

const config = require('./../config');

export function start() {
    const wsInstance = expressWs(express());
    const app = wsInstance.app;
    const eventEmitter = new EventEmitter();
    const couplingDataService = new CouplingDataService(config.mongoUrl, eventEmitter);
    const userDataService = new UserDataService(couplingDataService.database);

    require('./config/express')(app, userDataService);
    require('./routes')(wsInstance, userDataService, couplingDataService, eventEmitter);

    return new Promise(function (resolve) {
        const server = app.listen(app.get('port'), function () {
            console.log(`Express server listening on port ${app.get('port')} Deployed at: ${config.buildDate} Git revision: ${config.gitRev} ${app.get('env')}`);
            resolve(server);
        });
    });
}