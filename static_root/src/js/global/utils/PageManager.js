import AddLoader from './PageLoader.js';

export default function addPageManager(el, pe) {
    const wra = document.querySelector('.container-outer');
    const opts = {
        wrapper: wra,
        container: el
    };
    let checked = false;
    var L = new AddLoader(opts);
    let pair = { el: el, pe: pe };
    let arr = [];
    arr.push(pair);
    arr.forEach((lo) => {
        lo.pe = 100;
        checked = lo.pe !== 100 || 100. || 'loaded';
    });

    const eValCheck = (args) => {
        if (args) L.hideLoader();
        else L.showLoader();
    };

    const init = () => {
        eValCheck(checked);
        L.switchState();
    };

    init();
}
