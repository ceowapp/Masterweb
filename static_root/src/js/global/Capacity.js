/**
 * demo.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2018, Codrops
 * http://www.codrops.com
 */
{
    // https://pawelgrzybek.com/page-scroll-in-vanilla-javascript/
    var docElem = window.document.documentElement,
    transEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'msTransition': 'MSTransitionEnd',
        'transition': 'transitionend'
    },
    transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
    support = {
        pointerevents : Modernizr.pointerevents,
        csstransitions : Modernizr.csstransitions,
        csstransforms3d : Modernizr.csstransforms3d
    };

function scrollX() {
    return window.pageXOffset || docElem.scrollLeft; 
}

function scrollY() {
    return window.pageYOffset || docElem.scrollTop;
}

function getOffset(el) {
    var offset = el.getBoundingClientRect();
    return { top : offset.top + scrollY(), left : offset.left + scrollX() };
}

// from http://responsejs.com/labs/dimensions/
function getViewportW() {
    var client = docElem['clientWidth'],
        inner = window['innerWidth'];
    
    if( client < inner )
        return inner;
    else
        return client;
}

function getViewportH() {
    var client = docElem['clientHeight'],
        inner = window['innerHeight'];
    
    if( client < inner )
        return inner;
    else
        return client;
}

function extend( a, b ) {
    for( var key in b ) { 
        if( b.hasOwnProperty( key ) ) {
            a[key] = b[key];
        }
    }
    return a;
}
    function scrollIt(destination, duration = 200, easing = 'linear', callback) {
        const easings = {
          linear(t) {
            return t;
          },
          easeInQuad(t) {
            return t * t;
          },
          easeOutQuad(t) {
            return t * (2 - t);
          },
          easeInOutQuad(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          },
          easeInCubic(t) {
            return t * t * t;
          },
          easeOutCubic(t) {
            return (--t) * t * t + 1;
          },
          easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
          },
          easeInQuart(t) {
            return t * t * t * t;
          },
          easeOutQuart(t) {
            return 1 - (--t) * t * t * t;
          },
          easeInOutQuart(t) {
            return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
          },
          easeInQuint(t) {
            return t * t * t * t * t;
          },
          easeOutQuint(t) {
            return 1 + (--t) * t * t * t * t;
          },
          easeInOutQuint(t) {
            return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
          }
        };
      
        const start = window.pageYOffset;
        const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();
      
        const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
        const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
        const destinationOffset = typeof destination === 'number' ? destination : destination.offsetTop;
        const destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ? documentHeight - windowHeight : destinationOffset);
      
        if ('requestAnimationFrame' in window === false) {
            window.scroll(0, destinationOffsetToScroll);
          if (callback) {
            callback();
          }
          return;
        }
      
        function scroll() {
          const now = 'now' in window.performance ? performance.now() : new Date().getTime();
          const time = Math.min(1, ((now - startTime) / duration));
          const timeFunction = easings[easing](time);
          window.scroll(0, Math.abs(Math.ceil((timeFunction * (destinationOffsetToScroll - start)) + start)));
          if (window.pageYOffset === destinationOffsetToScroll) {
            if (callback) {
              callback();
            }
            return;
          }
      
          requestAnimationFrame(scroll);
        }
      
        scroll();
    }

    // Generates a random float.
    const getRandom = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

    // from http://www.quirksmode.org/js/events_properties.html#position
    const getMousePos = (e) => {
        let posx = 0;
        let posy = 0;
        if (!e) e = window.event;
        if (e.pageX || e.pageY)     {
            posx = e.pageX;
            posy = e.pageY;
        }
        else if (e.clientX || e.clientY)    {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        return { x : posx, y : posy }
    };

    // Equation of a line (y = mx + b ).
    const lineEq = (y2, y1, x2, x1, currentVal) => {
        const m = (y2 - y1) / (x2 - x1);
        const b = y1 - m * x1;
        return m * currentVal + b;
    };

    const page = document.querySelector('.page')

    // Window sizes.
    let winsize;
    const calcWinsize = () => winsize = {width: page.clientWidth, height: page.clientHeight};
    calcWinsize();
    document.addEventListener('resize', calcWinsize);

    let allowTilt = true;

    class Grid {
        constructor(el) {
            this.DOM = {el: el};
            // Some configuration values.
            this.config = {
                // The min and max values to move each item (y-axis) when we move the mouse.
                titltOffset: {min: 5, max: 40}
            };
            // Grid items.
            this.DOM.items = Array.from(this.DOM.el.querySelectorAll('.grid__item'));
            // Total items.
            this.itemsTotal = this.DOM.items.length;
            // Spread the grid items.
            this.spread();
            //window.addEventListener('resize', () => this.spread());
        }
        spread() {
            // Randomly spread the grid items.
            this.DOM.items.forEach((item) => {
                // The min and max values to move each item (y-axis) when we move the mouse.
                const randnum = getRandom(this.config.titltOffset.min,this.config.titltOffset.max);
                item.dataset.minTy = -1*randnum;
                item.dataset.maxTy = randnum;

                const rect = item.getBoundingClientRect();
                // Item´s center point.
                const center = {x: rect.left+rect.width/2, y: rect.top+rect.height/2};
                // Calculate the item´s quadrant in the viewport.
                const quadrant = center.x >= winsize.width/2 ?
                                    center.y <= winsize.height/2 ? 1 : 4 :
                                    center.y <= winsize.height/2 ? 2 : 3;
                
                // Now calculate how much to translate the item.
                // The positions will be random but only in the area of the item´s quadrant.
                // Also, consider a margin so the item does not stay completely out of the viewport or its quadrant.
                const margins = {x: winsize.width*.05, y: winsize.height*.05}
                const tx = quadrant === 1 || quadrant === 4 ? 
                        getRandom(-1*center.x + winsize.width/2 + margins.x, winsize.width - center.x - margins.x) :
                        getRandom(-1*center.x + margins.x, winsize.width/2 - center.x - margins.x);
                const ty = quadrant === 1 || quadrant === 2 ?
                        getRandom(-1*center.y + margins.y, winsize.height/2 - center.y - margins.y) :
                        getRandom(-1*center.y + winsize.height/2 + margins.y, winsize.height - center.y - margins.y);

                // Save the current translation.
                item.dataset.ctx = tx;
                item.dataset.cty = ty;

                TweenMax.set(item, {
                    x: tx,
                    y: ty,
                    scale: 0.5
                });
            });
        }
        tilt(ev) {
            if ( !allowTilt ) return;
            const mousepos = getMousePos(ev);
            // Document scrolls.
            const docScrolls = {
                left : document.body.scrollLeft + document.documentElement.scrollLeft, 
                top : document.body.scrollTop + document.documentElement.scrollTop
            };
            // Mouse position relative to the main element.
            const relmousepos = { 
                x : mousepos.x - docScrolls.left, 
                y : mousepos.y - docScrolls.top 
            };
            // Movement settings for the tilt elements.
            this.DOM.items.forEach((item) => {
                TweenMax.to(item, 4, {
                    ease: Quint.easeOut,
                    y: Number(item.dataset.cty) + lineEq(item.dataset.maxTy,item.dataset.minTy,winsize.height,0,relmousepos.y)
                });
            });
        }
        hideItems(direction) {
            return this.toggleItems('hide', direction);
        }
        showItems(direction) {
            return this.toggleItems('show', direction);
        }
        toggleItems(action, direction) {
            return new Promise((resolve, reject) => {
                let cnt = 0;
                this.DOM.items.forEach((item) => {
                    const rect = item.getBoundingClientRect();
                    
                    // The speed and delay will depend on how much the item can be translated when moving the mouse (this.config.titltOffset).
                    // This will result in some items moving faster than others and also starting at different times.
                    const speed = lineEq(1.3,0.9,this.config.titltOffset.min,this.config.titltOffset.max,item.dataset.maxTy);
                    const delay = lineEq(0,0.4,this.config.titltOffset.min,this.config.titltOffset.max,item.dataset.maxTy);
    
                    TweenMax.to(item, speed, {
                        ease: Expo.easeInOut,
                        delay: delay,
                        startAt: action === 'show' ? {y: direction === 'up' ? `+=${winsize.height + rect.height}` : `-=${winsize.height + rect.height}`, opacity:1} : null,
                        y: action === 'show' ? item.dataset.cty : 
                            direction === 'up' ? `-=${winsize.height + rect.height}` : `+=${winsize.height + rect.height}`
                    });

                    TweenMax.to(item, action === 'show' ? speed*.55 : speed*.45, {
                        ease: action === 'show' ? Quad.easeIn : Expo.easeIn,
                        delay: delay,
                        scaleX: 0.45,
                        scaleY: getRandom(1,1.3),
                        opacity: 0.5,
                        onComplete: () => {
                            TweenMax.to(item, action === 'show' ? speed*.45 : speed*.55, {
                                ease: action === 'show' ? Expo.easeOut : Quad.easeOut,
                                scaleX: 0.5,
                                scaleY: 0.5,
                                opacity: 1,
                                onComplete: () => {
                                    if ( action === 'hide' ) {
                                        TweenMax.set(item, {opacity: 0, y: item.dataset.cty});
                                    }
                                    cnt++;
                                    if ( this.itemsTotal === cnt ) {
                                        resolve();
                                    }

                                    /*
                                    // If we want to shuffle the items again after the navigation:
                                    if ( action === 'hide' ) {
                                        TweenMax.set(item, {opacity: 0, y: 0});
                                    }
                                    cnt++;
                                    if ( this.itemsTotal === cnt ) {
                                        if ( action === 'hide' ) {
                                            this.spread();
                                        }
                                        resolve();
                                    }
                                    */
                                }
                            });    
                        }
                    });
                });
            });
        }
        open() {
            return new Promise((resolve, reject) => {
                this.DOM.el.classList.add('grid--open');

                TweenMax.to(this.DOM.items, 1, {
                    ease: Expo.easeInOut,
                    x: 0,
                    y: 0,
                    scale: 1.01,
                    onComplete: resolve
                });
            });
        }
        close() {
            return new Promise((resolve, reject) => {
                this.DOM.el.classList.remove('grid--open');

                this.DOM.items.forEach((item) => {
                    TweenMax.to(item, 1, {
                        ease: Expo.easeInOut,
                        x: item.dataset.ctx,
                        y: item.dataset.cty,
                        scale: 0.5,
                        onComplete: resolve
                    });
                });
            });
        }
    }

    class MenuItem {
        constructor(el) {
            this.DOM = {el: el};
            this.DOM.number = this.DOM.el.querySelector('.menu__item-number');
            this.DOM.textwrap = this.DOM.el.querySelector('.b');
            this.DOM.text = this.DOM.textwrap.querySelector('.menu__item-text');
            this.DOM.link = this.DOM.el.querySelector('.menu__item-link');
            this.DOM.backCtrl = document.querySelector('.close-button');
            this.DOM.wrapper = this.DOM.el.querySelector('.wrapper');

        }
        toggleCurrent(direction = 'up') {
            const isCurrent = this.DOM.el.classList.contains('menu__item--current');
            this.DOM.el.classList[isCurrent ? 'remove' : 'add']('menu__item--current');
            // Toggle the link element ("explore").
            TweenMax.to(this.DOM.link, 1, {
                ease: Expo.easeOut,
                startAt: isCurrent ? null : {opacity: 0, y: direction === 'up' ? 15 : -15},
                y: isCurrent ? direction === 'up' ? -15 : 15 : 0,
                opacity: isCurrent ? 0 : 1
            });
        }
        show() {
            this.toggle('show');
        }
        hide() {
            this.toggle('hide');
        }
        toggle(action) {
            // Slide in/out the text.
            TweenMax.to(this.DOM.text, action === 'hide' ? 0.5 : 1, {
                ease: action === 'hide' ? Expo.easeIn : Expo.easeInOut,
                startAt: action === 'hide' ? null : {y: '103%'},
                y: action === 'hide' ? '103%' : '0%'
            });
            
            // Fade in/out the number and link.
            let extraElems = [this.DOM.number, this.DOM.link, this.DOM.wrapper];
            if ( action === 'show' && !this.DOM.el.classList.contains('menu__item--current') ) {
                extraElems = [this.DOM.number, this.DOM.link, this.DOM.wrapper];
            }
            TweenMax.to(extraElems, action === 'hide' ? 0.5 : 1, {
                ease: action === 'hide' ? Quint.easeIn : Quint.easeInOut,
                startAt: action === 'hide' ? null : {opacity: 0},
                opacity: action === 'hide' ? 0 : 1
            });
        }
    }
    
    class ContentItem {
        constructor(el) {
            this.DOM = {el: el};
        }
        toggleCurrent() {
            this.DOM.el.classList[this.DOM.el.classList.contains('content__item--current') ? 'remove' : 'add']('content__item--current');
        }
    }

    class NavController {
        constructor(el) {
            this.bodyEl = document.body;
            this.DOM = {menu: el}; // Initialize with the menu element.
            // The Menu items instances.
            this.docElem = window.document.documentElement;
            this.menuItems = [];
            Array.from(this.DOM.menu.querySelectorAll('.menu__item')).forEach((item) => this.menuItems.push(new MenuItem(item)));
            // The page element (the grids and contents parent)
            this.DOM.page = document.querySelector('.page');
            // The grid´s wrap.
            this.DOM.gridWrap = this.DOM.page.querySelector('.gridwrap');
            // The back ctrl. For closing the grid/content view and go back to the main page.
            //this.DOM.backCtrl = this.DOM.page.querySelector('button.gridback');
            this.DOM.backCtrl = this.DOM.page.querySelector('.close-button');
            this.loader = this.DOM.page.querySelector( 'span.loading' );
            this.support = support.pointerevents && support.csstransitions && support.csstransforms3d;
            // The content items instances.
            this.contentEl = this.DOM.page.querySelector( 'div.content' );
            this.contentItems = [];
            Array.from(document.querySelectorAll('.content__item')).forEach((item) => this.contentItems.push(new ContentItem(item)));
            // The grid instances.
            this.grids = [];
            Array.from(this.DOM.gridWrap.querySelectorAll('.grid')).forEach((grid) => this.grids.push(new Grid(grid)));
                // transition end event name
            this.transEndEventNames = { 'WebkitTransition': 'webkitTransitionEnd', 'MozTransition': 'transitionend', 'OTransition': 'oTransitionEnd', 'msTransition': 'MSTransitionEnd', 'transition': 'transitionend' };
            this.transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ];
            this.onEndTransition = function( el, callback ) {
                var onEndCallbackFn = function( ev ) {
                    if( support.transitions ) {
                        if( ev.target != this ) return;
                        this.removeEventListener( transEndEventName, onEndCallbackFn );
                    }
                    if( callback && typeof callback === 'function' ) { callback.call(this); }
                };
                if( support.transitions ) {
                    el.addEventListener( transEndEventName, onEndCallbackFn );
                }
                else {
                    onEndCallbackFn();
                }
            };
            this.init();
        }
        init() {
            // Current nav menu item index (starting with the first one).
            this.current = 0;
            // Add current class to the first menu item.
            this.menuItems[this.current].toggleCurrent();
            // Also show the current grid items.
            this.grids[this.current].DOM.items.forEach((item) => TweenMax.set(item, {opacity: 1}));
            // Add current class to the first content item.
            //this.contentItems[this.current].toggleCurrent();
            this.initEvents();
        }
        initEvents() {
            // Move the current grid´s items on the y-axis as the user moves the mouse.
            this.mousemoveFn = (ev) => requestAnimationFrame(() => this.grids[this.current].tilt(ev));
            window.addEventListener('mousemove', this.mousemoveFn);

            // Clicking the menu item text and link. (navigation and show the grid/content).
            for (const [pos, item] of this.menuItems.entries()) {
                // Clicking on the menu item text will trigger the navigation: the current grid items move away and the new ones come in.
                item.DOM.textwrap.addEventListener('click', () => this.navigate(pos));
                // Clicking the view all will show the grid.
                item.DOM.link.addEventListener('click', () => {
                    this.showContent(pos, item);
                });
            }

            // Closing the grid/content view.
            this.DOM.backCtrl.addEventListener('click', () => this.hideContent());

             /*if( this.support ) {
            // window resize
            window.addEventListener( 'resize', function() { self._resizeHandler(); } );

            // trick to prevent scrolling when animation is running (opening only)
            // this prevents that the back of the placeholder does not stay positioned in a wrong way
           window.addEventListener( 'scroll', function() {
                if ( self.isAnimating ) {
                    window.scrollTo( self.scrollPosition ? self.scrollPosition.x : 0, self.scrollPosition ? self.scrollPosition.y : 0 );
                }
                else {
                    self.scrollPosition = { x : window.pageXOffset || docElem.scrollLeft, y : window.pageYOffset || docElem.scrollTop };
                    // change the grid perspective origin as we scroll the page
                    self._scrollHandler();
                }
            });
        }*/
        }
        navigate(pos) {
            if ( this.isAnimating || pos === this.current ) return;
            const direction = this.current < pos ? 'up' : 'down';
            this.menuItems[this.current].toggleCurrent(direction);
            //this.contentItems[this.current].toggleCurrent();
            this.isAnimating = true;
            // Disable the mousemove functionality.
            allowTilt = false;
            // Hide the current grid items.
            this.grids[this.current].hideItems(direction);
            // Update current value.
            this.current = pos;
            this.menuItems[this.current].toggleCurrent(direction);
            //this.contentItems[this.current].toggleCurrent();
            // Show the next grid items.
            this.grids[this.current].showItems(direction).then(() => {
                this.isAnimating = false;
                allowTilt = true;
            });
        }
        showContent(pos, item) {
            if ( this.isAnimating || this.grids[this.current].DOM.el.classList.contains('grid--open') ) return;
            this.isAnimating = true;
            // Disable the mousemove functionality.
            allowTilt = false;
            // Disable the menu.
            this.DOM.menu.classList.add('menu--closed');
            // Show the grid.
            //this.grids[this.current].open().then(() => this.isAnimating = false);
            // Hide the menu items.
            for (const item of this.menuItems) {
                item.hide();
            }
            // Allow scroll.
            this.DOM.page.classList.remove('page--preview');
            // Show back ctrl.
            TweenMax.to(this.DOM.backCtrl, 1, {
                ease: Expo.easeInOut,
                opacity: 1
            });

            // index of current item
            this.current = pos;
            // simulate loading time..
            classie.add(item.DOM.el, 'grid__item--loading');
            setTimeout(()=> {
                classie.add(item.DOM.el, 'grid__item--animate');
                // reveal/load content after the last element animates out (todo: wait for the last transition to finish)
                setTimeout(() => { this.loadContent(item.DOM.el, this.current); this.isAnimating = false;}, 500);

            }, 1000);

            //var self = this;
           /* var loadContent1 = function() {
                // simulating loading...
                setTimeout( function() {
                    // hide loader
                    classie.removeClass( self.loader, 'show' );
                    // in the end of the transition set class "show" to respective content item
                    classie.addClass( self.contentItems[ pos ], 'show' );
                }, 1000 );
                // show content area
                classie.addClass( self.contentEl, 'show' );
                // show loader
                classie.addClass( self.loader, 'show' );
                classie.addClass( document.body, 'noscroll' );
                self.isAnimating = false;
            }
            loadContent1();*/
        }

        getViewport( axis ) {
            var client, inner;
            if( axis === 'x' ) {
                client = this.docElem['clientWidth'];
                inner = window['innerWidth'];
            }
            else if( axis === 'y' ) {
                client = docElem['clientHeight'];
                inner = window['innerHeight'];
            }
            
            return client < inner ? inner : client;
        }
        scrollX() { return window.pageXOffset || this.docElem.scrollLeft; }
        scrollY() { return window.pageYOffset || this.docElem.scrollTop; }

        hideContent() {
            var contentItemsContainer = document.querySelector('div.content');
            var contentItems = contentItemsContainer.querySelectorAll('.content__item');
            this.isAnimating = true;
            // Hide back ctrl.
            TweenMax.to(this.DOM.backCtrl, 1, {
                ease: Expo.easeInOut,
                opacity: 0
            });
            classie.remove(contentItems[this.current], 'content__item--show');
            classie.remove(contentItemsContainer, 'content--show');
             // Hide the grid.
            this.grids[this.current].close().then(() => {
                // Enable the menu.
                this.DOM.menu.classList.remove('menu--closed');
                // Enable the mousemove functionality.
                allowTilt = true;
                this.isAnimating = false;
            });
            scrollIt(0, 300, 'easeOutQuad', () => {
                // Disabel scroll.
                this.DOM.page.classList.add('page--preview');
                // Show the menu items.
                for (const item of this.menuItems) {
                    item.show();
                } 
            });
        }


        loadContent(item, current) {
            // add expanding element/placeholder 
            var dummy = document.createElement('div');
            var gridItemsContainer = document.querySelector('.grid');
            var contentItemsContainer = document.querySelector('div.content');
            var contentItems = contentItemsContainer.querySelectorAll('.content__item');
            var bodyEl = document.body;
            dummy.className = 'placeholder';
            // set the width/heigth and position
            dummy.style.WebkitTransform = 'translate3d(' + (item.offsetLeft - 5) + 'px, ' + (item.offsetTop - 5) + 'px, 0px) scale3d(' + item.offsetWidth/gridItemsContainer.offsetWidth + ',' + item.offsetHeight/this.getViewport('y') + ',1)';
            dummy.style.transform = 'translate3d(' + (item.offsetLeft - 5) + 'px, ' + (item.offsetTop - 5) + 'px, 0px) scale3d(' + item.offsetWidth/gridItemsContainer.offsetWidth + ',' + item.offsetHeight/this.getViewport('y') + ',1)';
            // add transition class 
            classie.add(dummy, 'placeholder--trans-in');
            // insert it after all the grid items
            gridItemsContainer.appendChild(dummy);
             classie.add(this.bodyEl, 'view-full');

            setTimeout(function() {
                // expands the placeholder
                dummy.style.WebkitTransform = 'translate3d(-5px, ' + (scrollY() - 5) + 'px, 0px)';
                dummy.style.transform = 'translate3d(-5px, ' + (scrollY() - 5) + 'px, 0px)';
                // disallow scroll
                window.addEventListener('scroll', this.noscroll);
            }, 25);

            this.onEndTransition(dummy, function() {
                // add transition class 
                classie.remove(dummy, 'placeholder--trans-in');
                classie.add(dummy, 'placeholder--trans-out');
                // position the content container
                //contentItemsContainer.style.top = scrollY() + 'px';
                // show the main content container
                classie.add(contentItemsContainer, 'content--show');
                // show content item:
                classie.add(contentItems[current], 'content__item--show');
                // show close control
                //classie.add(closeCtrl, 'close-button--show');
                // sets overflow hidden to the body and allows the switch to the content scroll
                classie.addClass(bodyEl, 'noscroll');
            });

        }

        noscroll() {
            if(!lockScroll) {
                lockScroll = true;
                xscroll = scrollX();
                yscroll = scrollY();
            }
            window.scrollTo(xscroll, yscroll);
        }

}

    
    function grid3D( el, options ) {
        this.el = el;
        this.options = extend( {}, this.options );
        extend( this.options, options );
        this._init();
    }

    // any options you might want to configure
    grid3D.prototype.options = {};

    grid3D.prototype._init = function() {
        // content
        this.contentEl = document.querySelector( 'div.content' );
        // content items
        this.contentItems = [].slice.call( this.contentEl.children );
        // close content cross
        this.close = this.contentEl.querySelector( '.close-button' );
        // loading indicator
        this.loader = this.contentEl.querySelector( 'span.loading' );
        // support: support for pointer events, transitions and 3d transforms
        this.support = support.pointerevents && support.csstransitions && support.csstransforms3d;
        // init events
        this._initEvents();
    };

    grid3D.prototype._initEvents = function() {
        var self = this;
        this.DOM = {menu: document.querySelector('.menu')}; // Initialize with the menu element
        this.menuItems = [];
        Array.from(this.DOM.menu.querySelectorAll('.menu__item')).forEach((item) => this.menuItems.push(new MenuItem(item)));

        // Clicking the menu item text and link. (navigation and show the grid/content).
        for (const [pos, item] of this.menuItems.entries()) {
            // Clicking on the menu item text will trigger the navigation: the current grid items move away and the new ones come in.
            // Clicking the view all will show the grid.
            item.DOM.link.addEventListener('click', () => self._showContent(pos));
        }
        // open the content element when clicking on the main grid items
        /*this.gridItems.forEach( function( item, idx ) {
            item.addEventListener( 'click', function() {
                self._showContent( idx );
            } );
        });*/

        // close the content element
        this.close.addEventListener( 'click', function() {
            self._hideContent();
        } );

        if( this.support ) {
            // window resize
            window.addEventListener( 'resize', function() { self._resizeHandler(); } );

            // trick to prevent scrolling when animation is running (opening only)
            // this prevents that the back of the placeholder does not stay positioned in a wrong way
            window.addEventListener( 'scroll', function() {
                if ( self.isAnimating ) {
                    window.scrollTo( self.scrollPosition ? self.scrollPosition.x : 0, self.scrollPosition ? self.scrollPosition.y : 0 );
                }
                else {
                    self.scrollPosition = { x : window.pageXOffset || docElem.scrollLeft, y : window.pageYOffset || docElem.scrollTop };
                    // change the grid perspective origin as we scroll the page
                    self._scrollHandler();
                }
            });
        }
    };

    // creates placeholder and animates it to fullscreen
    // in the end of the animation the content is shown
    // a loading indicator will appear for 1 second to simulate a loading period
    grid3D.prototype._showContent = function( pos ) {
        if( this.isAnimating ) {
            return false;
        }
        this.isAnimating = true;
        var self = this,
            loadContent = function() {
                // simulating loading...
                setTimeout( function() {
                    // hide loader
                    classie.removeClass( self.loader, 'show' );
                    // in the end of the transition set class "show" to respective content item
                    classie.addClass( self.contentItems[ pos ], 'show' );
                }, 1000 );
                // show content area
                classie.addClass( self.contentEl, 'show' );
                // show loader
                classie.addClass( self.loader, 'show' );
                classie.addClass( document.body, 'noscroll' );
                self.isAnimating = false;
            };

        // if no support just load the content (simple fallback - no animation at all)
        if( !this.support ) {
            loadContent();
            return false;
        }

         if ( this.isAnimating || this.grids[this.current].DOM.el.classList.contains('grid--open') ) return;
            this.isAnimating = true;
            // Disable the mousemove functionality.
            allowTilt = false;
            // Disable the menu.
            this.DOM.menu.classList.add('menu--closed');
            // Hide the menu items.
            for (const item of this.menuItems) {
                item.hide();
            }
            // Allow scroll.
            this.DOM.page.classList.remove('page--preview');
            // Show back ctrl.
            TweenMax.to(this.DOM.backCtrl, 1, {
                ease: Expo.easeInOut,
                opacity: 1
            });

        var currentItem = this.gridItems[ pos ],
            itemContent = currentItem.innerHTML;
        
        // create the placeholder
        this.placeholder = this._createPlaceholder(itemContent );
        
        // set the top and left of the placeholder to the top and left of the clicked grid item (relative to the grid)
        this.placeholder.style.left = currentItem.offsetLeft + 'px';
        this.placeholder.style.top = currentItem.offsetTop + 'px';
        
        // append placeholder to the grid
        this.grid.appendChild( this.placeholder );

        // and animate it
        var animFn = function() {
            // give class "active" to current grid item (hides it)
            classie.addClass( currentItem, 'active' );
            // add class "view-full" to the grid-wrap
            classie.addClass( self.gridWrap, 'view-full' );
            // set width/height/left/top of placeholder
            self._resizePlaceholder();
            var onEndTransitionFn = function( ev ) {
                if( ev.propertyName.indexOf( 'transform' ) === -1 ) return false;
                this.removeEventListener( transEndEventName, onEndTransitionFn );
                loadContent();
            };
            self.placeholder.addEventListener( transEndEventName, onEndTransitionFn );
        };

        setTimeout( animFn, 25 );
    };

    grid3D.prototype._hideContent = function() {
        var self = this,
            contentItem = document.querySelector( 'div.content > .show' );
            //currentItem = this.gridItems[ this.contentItems.indexOf( contentItem ) ];
        
        classie.removeClass( contentItem, 'show' );
        classie.removeClass( this.contentEl, 'show' );
        // without the timeout there seems to be some problem in firefox
        setTimeout( function() { classie.removeClass( document.body, 'noscroll' ); }, 25 );
        // that's it for no support..
        if( !this.support ) return false;

        classie.removeClass( this.gridWrap, 'view-full' );

        // reset placeholder style values
        this.placeholder.style.left = currentItem.offsetLeft + 'px';
        this.placeholder.style.top = currentItem.offsetTop + 'px';
        this.placeholder.style.width = this.itemSize.width + 'px';
        this.placeholder.style.height = this.itemSize.height + 'px';

        var onEndPlaceholderTransFn = function( ev ) {
            this.removeEventListener( transEndEventName, onEndPlaceholderTransFn );
            // remove placeholder from grid
            self.placeholder.parentNode.removeChild( self.placeholder );
            // show grid item again
            classie.removeClass( currentItem, 'active' );
        };
        this.placeholder.addEventListener( transEndEventName, onEndPlaceholderTransFn );
    }

    // function to create the placeholder
    /*
    <div class="placeholder">
        <div class="front">[content]</div>
        <div class="back"></div>
    </div>
    */
    grid3D.prototype._createPlaceholder = function( content ) {
        var front = document.createElement( 'div' );
        front.className = 'front';
        front.innerHTML = content;
        var back = document.createElement( 'div' );
        back.className = 'back';
        back.innerHTML = '&nbsp;';
        var placeholder = document.createElement( 'div' );
        placeholder.className = 'placeholder';
        placeholder.appendChild( front );
        placeholder.appendChild( back );
        return placeholder;
    };

    grid3D.prototype._scrollHandler = function() {
        var self = this;
        if( !this.didScroll ) {
            this.didScroll = true;
            setTimeout( function() { self._scrollPage(); }, 60 );
        }
    };

    // changes the grid perspective origin as we scroll the page
    grid3D.prototype._scrollPage = function() {
        var perspY = scrollY() + getViewportH() / 2;
        this.gridWrap.style.WebkitPerspectiveOrigin = '50% ' + perspY + 'px';
        this.gridWrap.style.MozPerspectiveOrigin = '50% ' + perspY + 'px';
        this.gridWrap.style.perspectiveOrigin = '50% ' + perspY + 'px';
        this.didScroll = false;
    };

    grid3D.prototype._resizeHandler = function() {
        var self = this;
        function delayed() {
            self._resizePlaceholder();
            self._scrollPage();
            self._resizeTimeout = null;
        }
        if ( this._resizeTimeout ) {
            clearTimeout( this._resizeTimeout );
        }
        this._resizeTimeout = setTimeout( delayed, 50 );
    }

    grid3D.prototype._resizePlaceholder = function() {
        // need to recalculate all these values as the size of the window changes
        this.itemSize = { width : this.gridItems[0].offsetWidth, height : this.gridItems[0].offsetHeight };
        if( this.placeholder ) {
            // set the placeholders top to "0 - grid offsetTop" and left to "0 - grid offsetLeft"
            
            var gridOffset = getOffset( this.grid );
            
            this.placeholder.style.left = Number( -1 * ( gridOffset.left - scrollX() ) ) + 'px';
            this.placeholder.style.top = Number( -1 * ( gridOffset.top - scrollY() ) ) + 'px';
            // set the placeholders width to windows width and height to windows height
            this.placeholder.style.width = getViewportW() + 'px';
            this.placeholder.style.height = getViewportH() + 'px';
        }
    }


    // Initialize the nav controller.
    const controller = new NavController(document.querySelector('.menu-grid'));

    // Preload all the images in the page..
    imagesLoaded(document.querySelectorAll('.grid__item'), {background: true}, () => document.body.classList.remove('loading'));
}
