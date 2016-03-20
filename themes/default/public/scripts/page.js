$(function() {
    //Calls the tocify method on your HTML div.
    $('.toc').toc({
        "container": ".js-page",
        "selectors": "h2,h3" //elements to use as headings
    });
    
    hljs.initHighlightingOnLoad();
});