var expect = require("chai").expect;
var AnalyticsService = require("../../app/services/analyticsService");

var _c = null;

describe("Analytics Service", function() {
    /* SETUP */
    beforeEach(function (done) {
        _c = new TestContainer();
        done();
    });

    describe("updateViewCount(slug)", function() {
        it("handles empty slug", function() {
            var result = _c.service.updateViewCount();
            expect(result).to.equal(null);
        });

        it("properly stores new view count", function() {
            _c.service.updateViewCount("test");
            expect(_c.service._pageVisits["test"]).to.equal(1);
        });

        it("properly updates existing view count", function() {
            _c.service.updateViewCount("test");
            _c.service.updateViewCount("test");

            expect(_c.service._pageVisits["test"]).to.equal(2);
        });
    });

    describe("getViewCount(slug)", function() {
        it("returns correct view count", function() {
            _c.service._pageVisits = { "test": 1 };

            var visits = _c.service.getViewCount("test");
            expect(visits).to.equal(1);
        });

        it("returns 0 when requesting view count of missing document", function() {
            _c.service._pageVisits = { };

            var visits = _c.service.getViewCount("test");
            expect(visits).to.equal(0);
        });
    });
});

/* TEST CONTAINER */
var TestContainer = function() {
    this.storageProvider = testStorageProvider;
    this.service = new AnalyticsService(testStorageProvider);
};

/* MOCK STORAGE PROVIDER */
var testStorageProvider = {
    storeObject: function(name, data) { },

    readObject: function(name) {
        return null;
    }
};