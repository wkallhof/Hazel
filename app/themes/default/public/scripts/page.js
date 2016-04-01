var SELECTORS = {
    TOC_SELECTOR: ".toc",
    TOC_CONTAINER: ".js-page",
    TOC_SELECTORS: "h2, h3"
};

var DetailPage = function($scope) {
    this.$tocSelector = $scope.find(SELECTORS.TOC_SELECTOR);
    this.$tocContainer = $scope;
    this.$tocSelectors = $scope.find(SELECTORS.TOC_SELECTORS);

    this.init();
};
DetailPage.constructor = DetailPage;
DetailPage.prototype = {
    init: function() {
        // build TOC
        if (this.$tocSelector.length > 0 && this.$tocContainer.length > 0 && this.$tocSelectors.length > 0) {
            this.$tocSelector.show();
            this.$tocSelector.toc({
                "container": SELECTORS.TOC_CONTAINER,
                "selectors": SELECTORS.TOC_SELECTORS
            });
        }

        // highlight code
        hljs.initHighlightingOnLoad();
    }
};

$(function() {
    var page = new DetailPage($(SELECTORS.TOC_CONTAINER));
});