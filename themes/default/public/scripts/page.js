$(function() {
    //Calls the tocify method on your HTML div.
    $('.toc').toc({
        'container': '.js-page'
    });
    
    hljs.initHighlightingOnLoad();
});