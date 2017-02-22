import apiGuard from "./routes/api-guard";
import * as passport from "passport";
import * as routes from "./routes/index";
import tribeRoute from './routes/tribeRoute'
import tribeListRoute from './routes/tribeListRoute'

const config = require('./../config');

module.exports = function (wsInstance, userDataService, couplingDataService) {

    const app = wsInstance.app;
    const clients = wsInstance.getWss().clients;

    app.ws('/api/:tribeId/pairAssignments/current', function(ws) {
        onOpen(ws);

        ws.on('message', function() {
            ws.send(buildMessage(ws));
        });

        ws.on('close', function() {
            broadcast(ws, buildMessage(ws));
        });

        ws.on('error', function(error) {
            console.log('---------------ERROR---------------\n', error);
        });
    });

    function buildMessage(ws) {
        return 'There are currently ' + countClientsOnThisRoute(ws) + ' clients on this channel.';
    }


    function onOpen(ws) {
        broadcast(ws, buildMessage(ws));
    }

    function countClientsOnThisRoute(ws) {
        let clientCount = 0;
        clients.forEach(client => {
            if(isOnSameChannelAsCurrentClient(client, ws)) {
                clientCount++;
            }
        });
        return clientCount;
    }

    function broadcast(ws, message: string) {
        clients.forEach((client) => {
            if(isOnSameChannelAsCurrentClient(client, ws)) {
                client.send(message)
            }
        });
    }

    function isOnSameChannelAsCurrentClient(client, ws) {
        return client.upgradeReq.url === ws.upgradeReq.url;
    }

    app.ws('*', function(ws) {
        ws.close();
    });

    app.get('/welcome', routes.welcome);
    app.get('/auth/google', passport.authenticate('google'));
    app.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/auth/google'
    }));
    if ('development' == app.get('env') || 'test' == app.get('env')) {
        app.get('/test-login', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'}));
    }

    app.get('/', routes.index);
    app.all('/api/*', apiGuard(couplingDataService));
    app.use('/api/tribes', tribeListRoute);
    app.use('/api/:tribeId', tribeRoute);
    app.get('/app/*.html', routes.components);
    app.get('/partials/:name', routes.partials);

    app.get('*', routes.index);
};