import apiGuard from "./routes/api-guard";
import * as passport from "passport";
import * as routes from "./routes/index";
import tribeRoute from './routes/tribeRoute'
import tribeListRoute from './routes/tribeListRoute'

const config = require('./../config');

module.exports = function (app, userDataService, couplingDataService) {

    let numClients = 0;

    app.ws('/helloSocket', function(ws) {
        ws.on('open', function open() {
            console.log('arguments for open: ', arguments)
            numClients++;
            console.log('Connected clients:', numClients);
            ws.send({ numClients: numClients });
        });

        ws.on('close', function close() {
            console.log('arguments for close: ', arguments)
            numClients--;
            console.log('Connected clients:', numClients);
            ws.send({ numClients: numClients });
        });

        ws.on('message', function message(data) {
            console.log('Client message: ', data);
        });

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