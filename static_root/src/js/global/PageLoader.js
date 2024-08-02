(function() {
    var pageWrap = document.querySelector('.container-outer'),
        pages = [].slice.call(pageWrap.querySelectorAll('div.container-wrapper')),
        triggerLoading = [].slice.call(pageWrap.querySelectorAll('a.page-url')),
        currentPage = 0,
        loader = new SVGLoader(document.querySelector('.pageload-overlay'), { speedIn: 400, easingIn: mina.easeinout });

    function init() {
        triggerLoading.forEach(function(trigger) {
            trigger.addEventListener('click', function(ev) {
                ev.preventDefault();
                const baseUrl = window.location.origin;
                const string = ev.srcElement.accessKey;
                const currentPageUrl = baseUrl + '/' + string + '.html'; // Fixed concatenation
                window.location.href = currentPageUrl;
                loader.show();
                // after some time hide loader
                setTimeout(function() {
                    loader.hide();
                    classie.removeClass(pages[currentPage], 'show');
                    // update..
                    classie.addClass(pages[currentPage], 'show');
                }, 3000);
            });
        });
    }

    init();
})();
