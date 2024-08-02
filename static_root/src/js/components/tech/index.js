import { preloadFonts } from './utils';
import { TypeShuffle } from './typeShuffle';

    document.body.classList.remove('loading');

    const textElement = document.querySelector('.content');
    
    const ts = new TypeShuffle(textElement);
    ts.trigger('fx1');

    [...document.querySelectorAll('.effects > button')].forEach(button => {
        button.addEventListener('click', () => {
            ts.trigger(`fx${button.dataset.fx}`);
        });
    });

