import apiGuard from "./routes/api-guard";
import * as passport from "passport";
import * as routes from "./routes/index";
import tribeRoute from './routes/tribeRoute'
import tribeListRoute from './routes/tribeListRoute'

const config = require('./../config');

module.exports = function (wsInstance, userDataService, couplingDataService) {

    const app = wsInstance.app;
    const clients = wsInstance.getWss().clients;

    app.all('/api/*', apiGuard(couplingDataService));

    app.ws('/api/:tribeId/pairAssignments/current', function(ws) {
        onOpen(ws);

        ws.on('message', function() {
            if(isOpen(ws)) {
                ws.send(buildMessage(ws));
            }
        });

        ws.on('close', function() {
            broadcast(ws, buildMessage(ws));
        });

        ws.on('error', function(error) {
            console.log('---------------ERROR---------------\n', error);
        });
    });

    function onOpen(ws) {
        broadcast(ws, buildMessage(ws));
    }


    function buildMessage(ws) {
        return 'There are currently ' + countClientsOnThisRoute(ws) + ' clients on this channel.';
    }

    function isOpen(ws) {
        return ws.readyState === WebSocket.OPEN;
    }

    function countClientsOnThisRoute(ws) {
        let clientCount = 0;
        clients.forEach(client => {
            if(isOpenConnectionOnSameChannel(client, ws)) {
                clientCount++;
            }
        });
        return clientCount;
    }

    function broadcast(ws, message: string) {
        clients.forEach((client) => {
            if(isOnSameChannelAsCurrentClient(client, ws) && isOpen(client)) {
                client.send(message)
            }
        });
    }

    function isOpenConnectionOnSameChannel(client, ws) {
        return isOnSameChannelAsCurrentClient(client, ws) && isOpen(client);
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
    app.use('/api/tribes', tribeListRoute);
    app.use('/api/:tribeId', tribeRoute);
    app.get('/app/*.html', routes.components);
    app.get('/partials/:name', routes.partials);

    app.get('*', routes.index);
};