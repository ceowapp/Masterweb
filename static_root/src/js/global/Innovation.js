var c = document.getElementById('innov-container'),
    boxes = [];

makeBoxes(30);

function makeBoxes(n){
  for (var i=0; i<n; i++){
    var b = document.createElement('div');
    boxes.push(b);
    c.appendChild(b);
  }
}

gsap.to(c, 0.4, {perspective:200, backgroundColor:'#fff'});

for (var i=0; i<boxes.length; i++){
  var b = boxes[i];
  gsap.set(b, {
    left:'50%',
    top:'50%',
    margin:-150,
    width:300,
    height:300,
    borderRadius:'20%',
    backgroundImage:'url(https://picsum.photos/300/?image='+String(i+50),
    clearProps:'transform',
    backfaceVisibility:'hidden'    
  });

  b.tl = gsap.timeline({paused:true, defaults:{immediateRender:true}})
      .fromTo(b, {
        scale:0.3,    
        rotationX:i/boxes.length*360,// - 90,
        transformOrigin:String("50% 50% -500%")
      },{
        rotationX:'+=360',
        ease:'none'
      })
      .timeScale(0.05)
  
  b.addEventListener('mouseover', (e)=>{ gsap.to(e.currentTarget, {opacity:0.5, scale:0.36, duration:0.4, ease:'expo'}) });
  b.addEventListener('mouseout', (e)=>{ gsap.to(e.currentTarget, {opacity:1, scale:0.3, duration:0.2, ease:'back.out(3)', overwrite:'auto'}) });
  b.addEventListener('click', (e)=>{ window.open(e.currentTarget.style.backgroundImage.slice(5,-2), '_blank') });
}

ScrollTrigger.create({ 
  trigger: '#scrollDist',
  start: "top top",
  end:"bottom bottom",
  onRefresh: self => {
    boxes.forEach((b, i) =>{ gsap.set(b.tl, {progress:self.progress}); })
  },
  onUpdate: self => { console.log(self.progress)
    boxes.forEach((b, i) =>{ gsap.to(b.tl, {progress:self.progress}); })
  }
});  