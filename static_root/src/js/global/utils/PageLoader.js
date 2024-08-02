export default class AddLoader{
    constructor(options) {
        this._opt = options || {};
        this.container = this._opt.container;
        this.pageWrap = this._opt.wrapper;
        this.pages = [].slice.call(this.pageWrap.querySelectorAll('div.container-wrapper'));
        this.triggerLoading = [].slice.call(this.pageWrap.querySelectorAll('a.page-url'));
        this.currentPage = 0;
        this.show = false;
        this.loader = new SVGLoader(document.querySelector('.pageload-overlay'), { speedIn: 400, easingIn: mina.easeinout });
    }
    showLoader() {
        this.loader.show();
        this.show = true;
    }   
    
    hideLoader() {
        setTimeout(() => {
            this.loader.hide();
            this.show = false;
            classie.removeClass(this.pages[this.currentPage], 'show');
            classie.addClass(this.pages[this.currentPage], 'show');
        }, 3000);
    }
    switchState () {
        this.container.style.display = this.show == true ? "none" : "block";
    }   
}
