(function() {let btn=document.querySelector(".button-submit"),qr_code_element=document.querySelector(".qr-code");function generate(e){document.querySelector(".error").style="display: none;";new QRCode(qr_code_element,{text:`${e.value}`,width:250,height:250,colorDark:"#000000",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.H});let t=document.createElement("button");qr_code_element.appendChild(t);let r=document.createElement("a");r.setAttribute("download","qr_code.png"),r.innerHTML='Download <i class="fa-solid fa-download"></i>',t.appendChild(r);let n=document.querySelector(".qr-code img"),o=document.querySelector("canvas");null==n.getAttribute("src")?setTimeout((()=>{r.setAttribute("href",`${o.toDataURL()}`)}),300):setTimeout((()=>{r.setAttribute("href",`${n.getAttribute("src")}`)}),300)}var cameraId;btn.addEventListener("click",(()=>{let e=document.querySelector("#input_text");""!=e.value?(0==qr_code_element.childElementCount||(qr_code_element.innerHTML=""),generate(e)):(document.querySelector(".error").style="",document.querySelector(".error").innerHTML="Invalid Input!")})),generate({value:"https://qr-codes.vercel.app"}),document.querySelectorAll(".select-section button").forEach((e=>{e.addEventListener("click",(e=>{document.querySelector(`.${e.target.classList[1]}-sec`).style="",null==e.target.nextElementSibling?document.querySelector(`.${e.target.previousElementSibling.classList[1]}-sec`).style="display: none;":document.querySelector(`.${e.target.nextElementSibling.classList[1]}-sec`).style="display: none;",document.querySelector(`.${e.target.classList[1]}`).style="border-color: #F0F4EF",null==e.target.nextElementSibling?document.querySelector(`.${e.target.previousElementSibling.classList[1]}`).style="":document.querySelector(`.${e.target.nextElementSibling.classList[1]}`).style=""}))})),"serviceWorker"in navigator&&window.addEventListener("load",(function(){navigator.serviceWorker.register("../QR/services/serviceWorker.js").then((e=>console.log("service worker registered"))).catch((e=>console.log("service worker not registered",e)))}));let scanner=new Html5Qrcode("reader");function scan(){Html5Qrcode.getCameras().then((e=>{if(document.querySelector(".scan-btn").style="display: none;",document.querySelector(".scan-btn").innerHTML="Allow access to camera",document.querySelector("#camera").style="",document.querySelector(".scan").style="",e&&e.length){let t=document.querySelector("#camera");for(let r=0;r<e.length;r++){let n=document.createElement("option");n.value=e[r].id,n.innerHTML=e[r].label,t.appendChild(n)}document.querySelector(".scan").addEventListener("click",(()=>{""!==(cameraId=t.options[t.selectedIndex].value)?(document.querySelector("#camera").style="display: none;",scanner.start(cameraId,{fps:24,qrbox:{width:300,height:300}},((e,t)=>{document.querySelector(".res").innerText=`${e}`,document.querySelector(".res").style="",document.querySelector(".copy-btn").style="",console.log(`Code matched = ${t}`),document.querySelector(".res").scrollIntoView({behavior:"smooth"}),scanner.pause(!0)}),(e=>{})).then((()=>{console.log("camera started"),document.querySelector(".scan").disabled=!0,document.querySelector(".stop-btn").disabled=!1,document.querySelector(".stop-btn").style=""})).catch((e=>{console.error(e)}))):document.querySelector("#camera").focus()}))}})).catch((e=>{console.error(e),document.querySelector(".scan-btn").style="",document.querySelector(".scan-btn").disabled=!0,document.querySelector(".error-msg").style=""}))}function stopScan(){scanner.stop().then((e=>{console.log("Scan stopped"),document.querySelector(".res").style="display: none;",document.querySelector(".copy-btn").style="display: none;",document.querySelector(".scan").disabled=!1,document.querySelector(".stop-btn").disabled=!0,document.querySelector(".stop-btn").style="display: none",document.querySelector("#camera").style=""})).catch((e=>{console.log(e)}))}document.querySelector(".scan-btn").addEventListener("click",(()=>{scan()})),document.querySelector(".stop-btn").addEventListener("click",(()=>{stopScan()})),document.querySelector(".copy-btn").addEventListener("click",(e=>{navigator.clipboard?navigator.clipboard.writeText(e.target.previousElementSibling.innerText).then((()=>{e.target.innerHTML='Copied <i class="fa-solid fa-check"></i>',setTimeout((()=>{e.target.innerHTML="Copy"}),1500)})).catch((t=>{console.error(t),e.target.innerHTML='Copy failed <i class="fa-solid fa-xmark"></i>',setTimeout((()=>{e.target.innerHTML="Copy"}),1500)})):(e.target.innerHTML='Copy failed <i class="fa-solid fa-xmark"></i>',setTimeout((()=>{e.target.innerHTML="Copy"}),1500))}));})();