"use strict";
var supertest = require('supertest');
var should = require('should');
var adapter = require('../../lib/CouplingDatabaseAdapter');
var config = require('./../../config');

describe('Routing', function () {

    it('players', function (done) {
        adapter(config.mongoUrl, function (players) {
            supertest('http://localhost:3000').get('/api/players').expect('Content-Type', /json/).end(function (error, response) {
                response.status.should.equal(200);
                JSON.stringify(response.body).should.equal(JSON.stringify(players));
                done();
            });
        }, function (error) {
            should.not.exist(error);
            done();
        });

    });

});