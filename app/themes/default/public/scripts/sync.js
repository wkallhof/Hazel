var SELECTORS = {
    PAGE_CONTAINER: ".js-sync",
    CANCEL_BUTTON: ".js-cancel",
    START_BUTTON: ".js-start",
    SYNC_KEY_INPUT: "#key",
    SERVER_INPUT: "#server",
    RESULT_CONTAINER: ".js-resultContainer",
    RESULT_LIST: ".js-resultList"
};

/**
 * Page script that handles the syncing functionality
 * for the Sync page
 */
var SyncPage = function($scope) {
    this.$scope = $scope;
    this.$cancelButton = $scope.find(SELECTORS.CANCEL_BUTTON);
    this.$startButton = $scope.find(SELECTORS.START_BUTTON);
    this.$keyInput = $scope.find(SELECTORS.SYNC_KEY_INPUT);
    this.$serverInput = $scope.find(SELECTORS.SERVER_INPUT);
    this.$resultContainer = $scope.find(SELECTORS.RESULT_CONTAINER);
    this.$resultList = $scope.find(SELECTORS.RESULT_LIST);

    this.messages = [];
    this.requests = [];

    this.singleRequestCount = 0;
    this.singleWriteCount = 0;

    this.syncUrl = "";

    this.bind();
};

SyncPage.constructor = SyncPage;
SyncPage.prototype = {
    bind: function() {
        this.$cancelButton.on("click", this.onCancelClick.bind(this));
        this.$startButton.on("click", this.onStartClick.bind(this));
    },

    /**
     * Handles the event when the user clicks the start button
     */
    onStartClick: function(e) {
        e.preventDefault();
        this.$startButton.prop("disabled", "disabled");
        this.$startButton.addClass("disabled");

        this.$cancelButton.show();
        this.$resultList.html("");
        this.singleRequestCount = 0;
        this.singleWriteCount = 0;

        this.$resultContainer.show();

        var server = this.$serverInput.val();
        var key = this.$keyInput.val();

        var baseUrl = window.location.protocol + "//" + window.location.host;
        this.syncUrl = baseUrl + "/sync-request/" + encodeURIComponent(key) + "/" + btoa(server);

        var request = $.get(this.syncUrl, this.requestListResponse.bind(this))
            .fail(function(error) {
                this.addMessage("Unable to reach the provided endpoint: " +
                     error.responseText +
                    " Status: " + error.status + " " + error.statusText);
                this.finish();
            }.bind(this));

        this.requests.push(request);
    },

    /**
     * Handles the event when the user clicks the cancel button
     */
    onCancelClick: function(e) {
        e.preventDefault();
        $.each(this.requests, function(index, request) {
            request.abort();
        });
    },

    /**
     * Handles the response from the target server when requesting
     * the list of documents
     */
    requestListResponse: function(data) {
        if (data.success) {
            // for each result, make a single request
            $.each(data.results, function(i, slug) {
                this.requestSingle(slug);
            }.bind(this));
        } else {
            this.addMessage("Server Error: " + data.message);
        }
    },

    /**
     * Makes a request to the target server to get a document
     * based on the given slug
     */
    requestSingle: function(slug) {
        var endpoint = this.syncUrl + "/" + slug;

        var request = $.get(endpoint, this.requestSingleResponse.bind(this))
            .fail(function() {
                this.addMessage("Unable to fetch the document: " + slug);
            }.bind(this));

        this.requests.push(request);
        this.singleRequestCount++;
    },

    /**
     * Handles the response back from the target server
     * when requesting a single document
     */
    requestSingleResponse: function(data) {
        if (data.success) {
            this.writeSingle(data.result);
        } else {
            this.addMessage("Server Error: " + data.message);
        }
        this.singleRequestCount--;
    },

    /**
     * Makes a request to write the given document to
     * the server
     */
    writeSingle: function(document) {
        var key = this.$keyInput.val();

        // build up URL
        var baseUrl = window.location.protocol + "//" + window.location.host;
        var writeUrl = baseUrl + "/sync-write/" + encodeURIComponent(key);

        // make the request
        var request = $.post(writeUrl, document, this.writeSingleResponse.bind(this))
            .fail(function() {
                this.addMessage("Unable to write the document: " + document.slug);
            }.bind(this));

        // keep track of requests and counts
        this.requests.push(request);
        this.singleWriteCount++;
    },

    /**
     * Handles the single write response back from
     * the server
     */
    writeSingleResponse: function(data) {
        this.addMessage(data.message);
        this.singleWriteCount--;

        if (this.singleWriteCount === 0 && this.singleRequestCount === 0) {
            this.finish();
        }
    },

    /**
     * Handles adding messages to the output window
     */
    addMessage: function(message) {
        var $el = $("<li>");
        $el.text(message);
        $el.appendTo(this.$resultList);
    },

    /**
     * Handles finishing up the request and doing some
     * element cleanup.
     */
    finish() {
        this.$startButton.removeClass("disabled");
        this.$startButton.removeProp("disabled");
        this.$cancelButton.hide();
    }
};

$(function() {
    var page = new SyncPage($(SELECTORS.PAGE_CONTAINER));
});