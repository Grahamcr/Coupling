"use strict";

describe('Service: ', function () {
    beforeEach(function () {
        module('coupling.services');
    });

    describe('Coupling', function () {

        var httpBackend;
        var Coupling;

        beforeEach(function () {
            inject(function (_Coupling_, $httpBackend) {
                httpBackend = $httpBackend;
                Coupling = _Coupling_;
            });
        });

        it('can request tribes successfully', function () {
            var expectedTribes = [
                {_id: 'one'},
                {_id: 'two'}
            ];

            httpBackend.whenGET('/api/tribes').respond(200, expectedTribes);

            var returnedTribes = null;
            Coupling.getTribes(function (resultTribes) {
                returnedTribes = resultTribes;
            });

            httpBackend.flush();

            expect(returnedTribes).toEqual(expectedTribes);
        });


    });
});