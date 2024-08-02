// Map number x from range [a, b] to [c, d]
const map = (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c;

// Linear interpolation
const lerp = (a, b, n) => (1 - n) * a + n * b;

const calcWinsize = () => {
    return {width: window.innerWidth, height: window.innerHeight};
};

// Gets the mouse position
const getMousePos = e => {
    return { 
        x : e.clientX, 
        y : e.clientY 
    };
};

// Gets the mouse position
const getMousePos1 = e => {
    return { 
        x : e.pageX, 
        y : e.pageY 
    };
};

 const calculateDistance = (elem, mouseX, mouseY) => {
    return Math.floor(Math.sqrt(Math.pow(mouseX - (elem.offset().left+(elem.width()/2)), 2) + Math.pow(mouseY - (elem.offset().top+(elem.height()/2)), 2)));
}

const distance = (x1,y1,x2,y2) => {
    var a = x1 - x2;
    var b = y1 - y2;

    return Math.hypot(a,b);
}

// Generate a random float.
const getRandomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

export { 
    map, 
    lerp, 
    calcWinsize, 
    getMousePos,
    getMousePos1,
    calculateDistance,
    distance,
    getRandomFloat
};