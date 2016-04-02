var expect = require("chai").expect;
var DocumentParserUtility = require("../../app/utilities/documentParserUtility");
var Document = require("../../app/models/document");

var _c = null;

describe("Document Parser Utility", function() {
    /* SETUP */
    beforeEach(function (done) {
        _c = new TestContainer();
        done();
    });

    describe("getDocumentFromFileContent(fileContent)", function() {
        it("handles null fileContent", function() {
            var result = _c.utility.getDocumentFromFileContent(null);
            expect(result).to.equal(null);
        });

        it("handles empty fileContent", function() {
            var result = _c.utility.getDocumentFromFileContent("");
            expect(result).to.equal(null);
        });

        it("properly extracts meta data and handles missing markdown content", function() {
            _c.doc.markdown = "";

            var fileContent = "<!--META {0} -->".replace("{0}", JSON.stringify(_c.metaData));

            var result = _c.utility.getDocumentFromFileContent(fileContent);
            expect(result).to.eql(_c.doc);
        });

        it("handles missing meta data and properly extracts markdown content", function() {
            var doc = new Document();
            doc.markdown = "## Test Title";

            var result = _c.utility.getDocumentFromFileContent(doc.markdown);
            expect(result).to.eql(doc);
        });

        it("handles parsing both metadata and markdown", function() {
            var result = _c.utility.getDocumentFromFileContent(_c.fileContent);
            expect(result).to.eql(_c.doc);
        });
    });

    describe("convertDocumentToFileContent(document)", function() {
        it("handles null document", function() {
            var result = _c.utility.convertDocumentToFileContent(null);
            expect(result).to.eql(null);
        });

        it("properly creates file content", function() {
            var result = _c.utility.convertDocumentToFileContent(_c.doc);
            expect(result).to.equal(_c.fileContent);
        });
    });

    describe("fetchMissingLinksFromMarkdown(markdown)", function() {
        it("handles null markdown", function() {
            var result = _c.utility.fetchMissingLinksFromMarkdown(null);
            expect(result).to.eql([]);
        });

        it("handles empty markdown", function() {
            var result = _c.utility.fetchMissingLinksFromMarkdown("");
            expect(result).to.eql([]);
        });

        it("properly returns missing links if they exist", function() {
            var markdown = "## Test \n [Test Link]() [Test Link2](/link)";
            var result = _c.utility.fetchMissingLinksFromMarkdown(markdown);
            expect(result[0]).to.equal("[Test Link]()");
            expect(result[1]).to.equal("Test Link");
        });

        it("properly returns empty list if missings links do not exist", function() {
            var markdown = "## Test \n [Test Link2](/link)";
            var result = _c.utility.fetchMissingLinksFromMarkdown(markdown);
            expect(result).to.eql([]);
        });
    });
});

/* TEST CONTAINER */
var TestContainer = function() {
    this.utility = new DocumentParserUtility();
    this.metaData = {
        title: "Example Title",
        tags: ["Example Tag"],
        createDate: 1459310452001,
        updateDate: 1459310452001
    };

    this.doc = new Document();
    this.doc.title = this.metaData.title;
    this.doc.tags = this.metaData.tags;
    this.doc.createDate = this.metaData.createDate;
    this.doc.updateDate = this.metaData.updateDate;
    this.doc.markdown = "## Example Title";

    this.fileContent = "<!--META {0} -->".replace("{0}", JSON.stringify(this.metaData));
    this.fileContent += "\n" + this.doc.markdown;
};