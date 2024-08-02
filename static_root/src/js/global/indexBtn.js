import Cursor from './cursor.js';
import ButtonCtrl from './ButtonCtrl.js';

// initialize custom cursor
const button = new ButtonCtrl(document.querySelector('.button-magnetic'));

console.log("this is fired from index btn", cursor)
console.log("this is fired from index btn", button)

button.on('enter', () => cursor.enter());
button.on('leave', () => cursor.leave());