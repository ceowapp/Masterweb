const onFontActive = function(fvd) {
    fvd
    console.log(`load...`)
};

const onFontLoaded = function() {
    console.log(`loaded`)
};

const onFontLoadError = function() {
    console.error(`Could not load font`)
};

 // Preload images
const preloadFonts = (id) => {
    return new Promise((resolve) => {
        WebFont.load({
            typekit: {
                id: id
            },
            active: onFontActive(resolve),
            fontactive: onFontLoaded(),
            fontinactive: onFontLoadError(),
        });
    });
};

let menuConfig = {
    slotMachineTotalLetters: 8,
    displayVerticalTitle: 'OMNIBUS'
};


Splitting();

/**
 * Class representing the menu element (.menu)
 */
class Menu {
    // DOM elements
    DOM = {
        // Main element (.menu)
        el: null,
        // Menu items (.menu__item)
        items: null,
        // Menu button control
        menuCtrl: {
            el: null,
            lines: null,
            cross: null
        },
        // (.menu__bg)
        bg: null,
        // (.menu__tagline)
        tagline: null,
    }
    // The Menu Items instances array
    menuItems = [];
    // Checks if the menu is open or is currently animating
    menuStatus = {
        isOpen: false,
        isAnimating: false
    };
    
    /**
     * Constructor.
     * @param {Element} DOM_el - the .menu element
     */
    constructor(DOM_el) {
        this.DOM = {el: DOM_el};
        this.DOM.items = [...this.DOM.el.querySelectorAll('.menu__item')];
        this.DOM.menuItems = document.querySelector('.menu__items');
        this.tag$A = [].slice.call(this.DOM.menuItems.getElementsByTagName('a'));
        this.DOM.menuCtrl = {el: document.querySelector('.menu__button')};
        this.DOM.bg = this.DOM.el.querySelector('.menu__bg');
        this.DOM.items.forEach(item => this.menuItems.push(new MenuItem(item)));
        this.initEvents();
    }
    /**
     * Initializes some events.
     */
    initEvents() {
   

    this.controlEvent = ()=>{
        if ( !this.menuStatus.isOpen ) {
                this.open();
        }
        else {
                this.close();
         }
    };

    this.DOM.menuCtrl.el.addEventListener('change', () => {
            if ( this.menuStatus.isAnimating ) return;
              if (this.DOM.menuCtrl.el.checked) {
                this.menuStatus.isOpen = false;
                this.DOM.bg.style.display="block";
                this.DOM.menuItems.style.display="block";

             } else {
                this.menuStatus.isOpen = true;
                this.DOM.bg.style.display="none";
                this.DOM.menuItems.style.display="none";

            }
            this.controlEvent(); 
        });
    }
    /**
     * Opens the menu
     */
    open() {
        if ( this.menuStatus.isAnimating || this.menuStatus.isOpen ) return;
        this.menuStatus.isAnimating = true;
        this.menuStatus.isOpen = true;
        const gradient = {value: 'linear-gradient(to bottom, #2b192c, #1a191c)'};

        this.menuTimeline = gsap.timeline({
            defaults: {
                duration: 1.7,
                ease: 'expo.inOut'
            },
            onComplete: () => this.menuStatus.isAnimating = false
        })
        .addLabel('start', 0)
        .add(() => {
            this.DOM.el.classList.add('menu--open');
        }, 'start')
        .to(this.DOM.bg, {
            startAt: {x: -1*this.DOM.bg.offsetWidth + .2*window.innerWidth + .11*window.innerHeight},
            x: 0
        }, 'start')
        .to(gradient, {
            value: 'linear-gradient(rgb(68, 37, 61), rgb(29 24 39))',
            //value: 'linear-gradient(to bottom, #9b498a, #9b7749)',
            onUpdate: () => this.DOM.bg.style.backgroundImage = gradient.value
        }, 'start')
        .to(this.menuItems.map(item => item.DOM.slotMachine), {
            //ease: 'power3.inOut',
            y: `${100/menuConfig.slotMachineTotalLetters*(menuConfig.slotMachineTotalLetters-1)}%`,
            stagger: 0.03
        }, 'start')

        this.menuItems.forEach(item => {
            this.menuTimeline.to(item.DOM.chars, {
                startAt: {x: '100%', rotation: 10, opacity: 1},
                x: '0%',
                opacity: 1,
                rotation: 0,
                stagger: 0.04
            }, 'start');
        });
    }
    /**
     * Closes the menu
     */
    close() {
        if ( this.menuStatus.isAnimating || !this.menuStatus.isOpen ) return;
        this.menuStatus.isAnimating = true;
        this.menuStatus.isOpen = false;
        const gradient = {value: 'linear-gradient(rgb(68, 37, 61), rgb(29 24 39))'};
        this.menuTimeline = gsap.timeline({
            defaults: {
                duration: 1.3,
                ease: 'expo.inOut'
            },
            onComplete: () => this.menuStatus.isAnimating = false
        })
        .addLabel('start', 0)
        .add(() => {
            this.DOM.el.classList.remove('menu--open');
        }, 'start')
        .to(this.menuItems.map(item => item.DOM.slotMachine), {
            duration: 1.5,
            y: '0%',
            stagger: -0.01
        }, 'start')

        this.menuItems.forEach(item => {
            this.menuTimeline.to(item.DOM.chars, {
                x: '100%',
                rotation: 10, 
                stagger: -0.04
            }, 'start');
        });

        this.menuTimeline
        .to(this.DOM.bg, {
            x: -1*this.DOM.bg.offsetWidth + .2*window.innerWidth + .11*window.innerHeight,
            onComplete: () => {
                this.DOM.bg.style.transform = 'translateX(-100%) translateX(20vw) translateX(11vh)';
            }
        }, 'start+=0.2')
        .to(gradient, {
            value: 'linear-gradient(to bottom, #2b192c, #1a191c)',
            onUpdate: () => this.DOM.bg.style.backgroundImage = gradient.value
        }, 'start+=0.2')
    }
 }

class MenuItem {
    // DOM elements
    DOM = {
        // Main element (.menu__item)
        el: null,
        // The span.char created by calling Splitting
        chars: null,
        // the element that stores all the vertical letters (.letter-wrap__inner) and that will animate up/down before revealing the menu item tex
        slotMachine: null,
    }
    // The position of this item in the menu
    itemPosition;
    
    /**
     * Constructor.
     * @param {Element} DOM_el - the .menu__item element
     */
    constructor(DOM_el) {
        this.DOM = {el: DOM_el};
        this.DOM.chars = [...this.DOM.el.querySelectorAll('span.char')];
        this.itemPosition = [...this.DOM.el.parentNode.children].indexOf(this.DOM.el);
        // Creates the necessary DOM elements to store all the letters and the extra random letters for the slot machine effect
        this.layout();
    }
    /**
     * This DOM modification will happen for every menu item e.g. <a data-splitting href="#" class="menu__item">ABOUT</a>
     * 
     * The a.menu__item will get transformed into:
     * 
     * <a href="#" class="menu__item">
     *   <span class="letter-wrap">
     *     <span class="letter-wrap__inner">
     *       <span>A</span> // first letter in "ABOUT"
     *       <span>H</span> // random letter
     *       <span>W</span> // random letter
     *       <span>P</span> // random letter
     *       ...            // random letters
     *       <span>P</span> // first letter in "HAPUKU"
     *     </span>
     *   </span>
     *   <span class="letter-wrap"><span>B</span></span>
     *   <span class="letter-wrap"><span>O</span></span>
     *   <span class="letter-wrap"><span>U</span></span>
     *   <span class="letter-wrap"><span>T</span></span>
     * </a>
     */
    layout() {
        // We need slotMachineTotalLetters-2 random letters. 
        // The first span inside the .letter-wrap__inner is the first letter in the original link name 
        // The last span inside the .letter-wrap__inner is the nth letter (this menu item'position) in the menuConfig.displayVerticalTitle 
        const totalRandomChars = menuConfig.slotMachineTotalLetters-2;
        const allChars = 'ABCDEFGHIJKLMNOPRSTUVWXYZ';
        
        this.DOM.chars.forEach((char, charPosition) => {
            const wrapEl = document.createElement('span');
            wrapEl.classList = 'letter-wrap';
            char.parentNode.appendChild(wrapEl);
            wrapEl.appendChild(char);            
            // First char needs a vertical structure (slot machine)
            if ( charPosition === 0 ) {
                this.DOM.slotMachine = document.createElement('span');
                this.DOM.slotMachine.classList = 'letter-wrap__inner';
                wrapEl.appendChild(this.DOM.slotMachine);
                
                const randomCharsArray = Array.from({ length: totalRandomChars }, _ => allChars.charAt(Math.floor(Math.random() * allChars.length)));
                let htmlStr = `<span>${char.innerHTML}</span>`;
                for (let i = 0; i <= totalRandomChars-1; ++i ) {
                    htmlStr += i === totalRandomChars-1 ? `<span>${randomCharsArray[i]}</span><span>${menuConfig.displayVerticalTitle.charAt(this.itemPosition)}</span>` : `<span>${randomCharsArray[i]}</span>`
                };
                this.DOM.slotMachine.innerHTML = htmlStr;
                wrapEl.removeChild(char);
            }
        });
    }
 }

// Initialize Menu instance
var M = new Menu(document.querySelector('.menu-hidden'));

// Preloading webkit font
//preloadFonts('fxj1otx');


               
