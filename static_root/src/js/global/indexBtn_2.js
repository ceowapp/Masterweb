import Cursor from './cursor.js';
import ButtonCtrl1 from './ButtonCtrl.js';
import ButtonCtrl2 from './ButtonCtrl_2.js';


// initialize custom cursor
const cursor = new Cursor(document.querySelector('.cursor-bottom'));
const button2 = new ButtonCtrl2(document.querySelector('.button-contact'));
const buttons = Array.from(document.querySelectorAll('.button-magnetic'));
buttons.map((button)=>{
	const button1 = new ButtonCtrl1(button);
	button1.on('enter', () => cursor.enter());
	button1.on('leave', () => cursor.leave());
})

button2.on('enter', () => cursor.enter());
button2.on('leave', () => cursor.leave());



