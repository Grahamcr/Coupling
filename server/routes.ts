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
        onOpen();

        ws.on('message', function() {
            ws.send('There are ' + clients.size + ' connections currently.');
        });

        ws.on('close', function() {
            broadcast('Lost client connection. Total connections: ' + clients.size);
        });

        ws.on('error', function(error) {
            console.log('---------------ERROR---------------\n', error);
        });
    });

    app.ws('*', function(ws) {
        ws.close();
    });

    function onOpen() {
        broadcast('New client connection. Total connections: ' + clients.size);
    }

    function broadcast(message: string) {
        clients.forEach((ws) => ws.send(message));
    }

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