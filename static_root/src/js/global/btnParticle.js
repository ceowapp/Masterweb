(function() {
    const arrOpts = [
        {},
        {
            type: 'triangle',
            easing: 'easeOutQuart',
            size: 6,
            particlesAmountCoefficient: 4,
            oscillationCoefficient: 2,
            color: function() {
                return Math.random() < 0.5 ? '#000000' : '#ffffff'; 
            }
        },
        {
            type: 'rectangle',
            duration: 500,
            easing: 'easeOutQuad',
            color: '#091388',
            direction: 'top',
            size: 8
        },
        {
            direction: 'right',
            size: 4,
            speed: 1,
            color: '#e85577',
            particlesAmountCoefficient: 1.5,
            oscillationCoefficient: 1
        },
        {
            duration: 1300,
            easing: 'easeInExpo',
            size: 3,
            speed: 1,
            particlesAmountCoefficient: 10,
            oscillationCoefficient: 1
        },
        {
            direction: 'bottom',
            duration: 1000,
            easing: 'easeInExpo',
        },
        {
            type: 'rectangle',
            style: 'stroke',
            size: 15,
            color: '#e87084',
            duration: 600,
            easing: [0.2,1,0.7,1],
            oscillationCoefficient: 5,
            particlesAmountCoefficient: 2,
            direction: 'right'
        },
        {
            type: 'triangle',
            style: 'stroke',
            direction: 'top',
            size: 5,
            color: 'blue',
            duration: 1400,
            speed: 1.5,
            oscillationCoefficient: 15,
            direction: 'right'
        },
        {
            duration: 500,
            easing: 'easeOutQuad',
            speed: .1,
            particlesAmountCoefficient: 10,
            oscillationCoefficient: 80
        },
        {
            direction: 'right',
            size: 4,
            color: '#969696',
            duration: 1200,
            easing: 'easeInCubic',
            particlesAmountCoefficient: 8,
            speed: 0.4,
            oscillationCoefficient: 1
        },
        {
            style: 'stroke',
            color: '#1b81ea',
            direction: 'bottom',
            duration: 1200,
            easing: 'easeOutSine',
            speed: .7,
            oscillationCoefficient: 5
        },
        {
            type: 'triangle',
            easing: 'easeOutSine',
            size: 3,
            duration: 800,
            particlesAmountCoefficient: 7,
            speed: 3,
            oscillationCoefficient: 1
        }
    ];
    var parentElements = document.querySelectorAll(".particles-button");
    var btnElements = Array.prototype.slice.call(parentElements);
    btnElements.forEach((bttn, pos) => {
    //const bttnBack = document.querySelector('.action');
    let particlesOpts = arrOpts[0];
    const particles = new Particles(bttn, particlesOpts);

    let buttonVisible = true;
    bttn.addEventListener('click', () => {
        if ( !particles.isAnimating() && buttonVisible ) {
            particles.disintegrate();
            setTimeout(() => {
                const url = bttn.getAttribute("data-url");
                window.location.href = url;
            }, 2000); // Delay in milliseconds (2 seconds)            
            buttonVisible = !buttonVisible;
        } else {
          particles.integrate({
            duration: 800,
            easing: 'easeOutSine'
        });
        }
    });

window.addEventListener(
  "click",
  () => {
    const currentPageUrl = window.location.href;
    if (currentPageUrl.endsWith('AI.html/') && !buttonVisible) {
        particles.integrate({
            duration: 800,
            easing: 'easeOutSine'
        });
        buttonVisible = !buttonVisible;
    }
  });  
});
})();