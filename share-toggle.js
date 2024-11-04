/**
 * Share Toggle 1.0.1
 * Copyright 2024 Pixelker
 * Released under the MIT License
 * Released on: November 4, 2024
 */

!function(e){"function"==typeof define&&define.amd?define(e):e()}(function(){"use strict";function e(){const e={default:{sms:"SMS",messenger:"Messenger",whatsapp:"WhatsApp",twitter:"Twitter",linkedin:"Linkedin",telegram:"Telegram",facebook:"Facebook",skype:"Skype"},zh:{shareTitle:"分享",cancel:"取消",copy:"複製連結",print:"列印",email:"E-mail",selectSms:"選擇聯絡人"},pt:{shareTitle:"Compartilhar",cancel:"Cancelar",copy:"Copiar",print:"Imprimir",email:"E-mail",selectSms:"Selecione um contato"},en:{shareTitle:"Share",cancel:"Cancel",copy:"Copy",print:"Print",email:"E-mail",selectSms:"Pick a contact"},es:{shareTitle:"Compartir",cancel:"Cancelar",copy:"Copiar",print:"Imprimir",email:"Correo",selectSms:"Seleccionar un contacto"},de:{shareTitle:"Teilen",cancel:"Abbrechen",copy:"Kopieren",print:"Drucken",email:"E-mail",selectSms:"Wählen Sie einen Kontakt aus"},nl:{shareTitle:"Delen",cancel:"Annuleren",copy:"Kopiëren",print:"Printen",email:"E-mail",selectSms:"Selecteer een contact"}};let t=navigator.userAgent.match(/Android/i),n=navigator.userAgent.match(/iPhone|iPad|iPod/i),o=navigator.userAgent.match(/iPhone|iPad|iPod|Macintosh/i);const i=!(n||t),a=o?'<svg class="the-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><g><path fill="#424242" d="M381.9,181l95.8-95.8v525.9c0,13.4,8.9,22.3,22.3,22.3c13.4,0,22.3-8.9,22.3-22.3V85.2l95.8,95.8c4.5,4.5,8.9,6.7,15.6,6.7c6.7,0,11.1-2.2,15.6-6.7c8.9-8.9,8.9-22.3,0-31.2L515.6,16.1c-2.2-2.2-4.5-4.5-6.7-4.5c-4.5-2.2-11.1-2.2-17.8,0c-2.2,2.2-4.5,2.2-6.7,4.5L350.7,149.8c-8.9,8.9-8.9,22.3,0,31.2C359.6,190,373,190,381.9,181z M812,276.9H633.7v44.6H812v624H188v-624h178.3v-44.6H188c-24.5,0-44.6,20.1-44.6,44.6v624c0,24.5,20.1,44.6,44.6,44.6h624c24.5,0,44.6-20.1,44.6-44.6v-624C856.6,296.9,836.5,276.9,812,276.9z"/></g></svg>':'<svg class="the-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="#424242" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>',l='<svg class="the-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"/><path fill="#424242" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/></svg>',s='<svg class="the-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#424242" d="M320 448v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V120c0-13.255 10.745-24 24-24h72v296c0 30.879 25.121 56 56 56h168zm0-344V0H152c-13.255 0-24 10.745-24 24v368c0 13.255 10.745 24 24 24h272c13.255 0 24-10.745 24-24V128H344c-13.2 0-24-10.8-24-24zm120.971-31.029L375.029 7.029A24 24 0 0 0 358.059 0H352v96h96v-6.059a24 24 0 0 0-7.029-16.97z"></path></svg>',r='<svg class="the-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#424242" d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',c='<svg class="the-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#424242" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',h='<svg class="the-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#0084ff" d="M224 32C15.9 32-77.5 278 84.6 400.6V480l75.7-42c142.2 39.8 285.4-59.9 285.4-198.7C445.8 124.8 346.5 32 224 32zm23.4 278.1L190 250.5 79.6 311.6l121.1-128.5 57.4 59.6 110.4-61.1-121.1 128.5z"></path></svg>',d='<svg class="the-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#3b5998" d="M448 56.7v398.5c0 13.7-11.1 24.7-24.7 24.7H309.1V306.5h58.2l8.7-67.6h-67v-43.2c0-19.6 5.4-32.9 33.5-32.9h35.8v-60.5c-6.2-.8-27.4-2.7-52.2-2.7-51.6 0-87 31.5-87 89.4v49.9h-58.4v67.6h58.4V480H24.7C11.1 480 0 468.9 0 455.3V56.7C0 43.1 11.1 32 24.7 32h398.5c13.7 0 24.8 11.1 24.8 24.7z"></path></svg>',p='<svg class="the-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#075e54" d="M224 122.8c-72.7 0-131.8 59.1-131.9 131.8 0 24.9 7 49.2 20.2 70.1l3.1 5-13.3 48.6 49.9-13.1 4.8 2.9c20.2 12 43.4 18.4 67.1 18.4h.1c72.6 0 133.3-59.1 133.3-131.8 0-35.2-15.2-68.3-40.1-93.2-25-25-58-38.7-93.2-38.7zm77.5 188.4c-3.3 9.3-19.1 17.7-26.7 18.8-12.6 1.9-22.4.9-47.5-9.9-39.7-17.2-65.7-57.2-67.7-59.8-2-2.6-16.2-21.5-16.2-41s10.2-29.1 13.9-33.1c3.6-4 7.9-5 10.6-5 2.6 0 5.3 0 7.6.1 2.4.1 5.7-.9 8.9 6.8 3.3 7.9 11.2 27.4 12.2 29.4s1.7 4.3.3 6.9c-7.6 15.2-15.7 14.6-11.6 21.6 15.3 26.3 30.6 35.4 53.9 47.1 4 2 6.3 1.7 8.6-1 2.3-2.6 9.9-11.6 12.5-15.5 2.6-4 5.3-3.3 8.9-2 3.6 1.3 23.1 10.9 27.1 12.9s6.6 3 7.6 4.6c.9 1.9.9 9.9-2.4 19.1zM400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM223.9 413.2c-26.6 0-52.7-6.7-75.8-19.3L64 416l22.5-82.2c-13.9-24-21.2-51.3-21.2-79.3C65.4 167.1 136.5 96 223.9 96c42.4 0 82.2 16.5 112.2 46.5 29.9 30 47.9 69.8 47.9 112.2 0 87.4-72.7 158.5-160.1 158.5z"></path></svg>',m='<svg class="the-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#1da1f2" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path></svg>',f='<svg class="the-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#0077b5" d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"></path></svg>',u='<svg class="the-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path fill="#0088cc" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm121.8 169.9l-40.7 191.8c-3 13.6-11.1 16.9-22.4 10.5l-62-45.7-29.9 28.8c-3.3 3.3-6.1 6.1-12.5 6.1l4.4-63.1 114.9-103.8c5-4.4-1.1-6.9-7.7-2.5l-142 89.4-61.2-19.1c-13.3-4.2-13.6-13.3 2.8-19.7l239.1-92.2c11.1-4 20.8 2.7 17.2 19.5z"></path></svg>',w='<svg class="the-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#00aff0" d="M424.7 299.8c2.9-14 4.7-28.9 4.7-43.8 0-113.5-91.9-205.3-205.3-205.3-14.9 0-29.7 1.7-43.8 4.7C161.3 40.7 137.7 32 112 32 50.2 32 0 82.2 0 144c0 25.7 8.7 49.3 23.3 68.2-2.9 14-4.7 28.9-4.7 43.8 0 113.5 91.9 205.3 205.3 205.3 14.9 0 29.7-1.7 43.8-4.7 19 14.6 42.6 23.3 68.2 23.3 61.8 0 112-50.2 112-112 .1-25.6-8.6-49.2-23.2-68.1zm-194.6 91.5c-65.6 0-120.5-29.2-120.5-65 0-16 9-30.6 29.5-30.6 31.2 0 34.1 44.9 88.1 44.9 25.7 0 42.3-11.4 42.3-26.3 0-18.7-16-21.6-42-28-62.5-15.4-117.8-22-117.8-87.2 0-59.2 58.6-81.1 109.1-81.1 55.1 0 110.8 21.9 110.8 55.4 0 16.9-11.4 31.8-30.3 31.8-28.3 0-29.2-33.5-75-33.5-25.7 0-42 7-42 22.5 0 19.8 20.8 21.8 69.1 33 41.4 9.3 90.7 26.8 90.7 77.6 0 59.1-57.1 86.5-112 86.5z"></path></svg>';return function(t={},n={}){return new Promise((g,y)=>{t.title&&"string"==typeof t.title&&t.text&&"string"==typeof t.text||y("Invalid Params");const{title:v,url:b,fbId:P,hashtags:k}=t,x={copy:!0,print:!0,email:!0,sms:!0,messenger:!0,facebook:!0,whatsapp:!0,twitter:!0,linkedin:!0,telegram:!0,skype:!0,language:"en",...n},A={...e.default,...e[x.language]?e[x.language]:e[navigator.language]||e[navigator.language.substr(0,2).toLowerCase()]||e.en},I=t.text||v;function $(){const e=()=>{S.removeEventListener("transitionend",e),document.body.removeChild(S)},t=()=>{z.removeEventListener("transitionend",t),document.body.removeChild(z),document.head.removeChild(document.querySelector("#shareAPIPolyfill-style")),document.removeEventListener("keyup",E)};S.classList.remove("visible"),z.classList.remove("visible"),S.addEventListener("transitionend",e),z.addEventListener("transitionend",t)}!function(e){var t=e,n=document.head||document.getElementsByTagName("head")[0],o=document.createElement("style");o.type="text/css",o.styleSheet?o.styleSheet.cssText=t:o.appendChild(document.createTextNode(t)),o.id="shareAPIPolyfill-style",n.appendChild(o)}(`           \n#shareAPIPolyfill-backdrop,#shareAPIPolyfill-container{opacity:0;pointer-events:none;position:fixed;left:0;top:0;bottom:0;right:0;margin:auto;width:100%;height:100%;will-change:opacity; z-index: 99999;}#shareAPIPolyfill-backdrop{transition:opacity linear 250ms;background-color:rgba(0,0,0,.6)}#shareAPIPolyfill-container{background-color:#f9f9f9;top:auto;max-width:400px;height:auto;transition-property:transform,opacity;transition-timing-function:linear;transition-duration:250ms;transition-delay:150ms;transform:translateY(100%);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",arial,sans-serif,"Microsoft JhengHei"}#shareAPIPolyfill-backdrop.visible,#shareAPIPolyfill-container.visible{opacity:1;pointer-events:all}#shareAPIPolyfill-container.visible{transform:translateY(0)}#shareAPIPolyfill-container .shareAPIPolyfill-header{background:#EEE}#shareAPIPolyfill-container .shareAPIPolyfill-header .shareAPIPolyfill-icons-container{display:flex}#shareAPIPolyfill-container .shareAPIPolyfill-header-title{background-color:#E0E0E0;padding:10px 18px;color:#424242;font-weight:600}#shareAPIPolyfill-container .shareAPIPolyfill-body{border-top:solid 1px #EEE}#shareAPIPolyfill-container .shareAPIPolyfill-footer{width:100%;display:block;border:none;transition:opacity ease-in 250ms;border-top:solid 1px #EEE;background-color:#EEE;text-align:center;padding:10px;font-size:13px;cursor:pointer;opacity:.5}#shareAPIPolyfill-container .shareAPIPolyfill-footer:hover{opacity:1}#shareAPIPolyfill-container .shareAPIPolyfill-icons-container{display:flex;flex-wrap:wrap}#shareAPIPolyfill-container .tool-icon{border:none;display:inline-block;width:25%;box-sizing:border-box;font-weight:400;font-size:12px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-align:center;cursor:pointer;background-color:transparent;padding:20px 0}#shareAPIPolyfill-container .tool-icon:hover{box-shadow:inset 0 0 20px rgba(0,0,0,.125)}#shareAPIPolyfill-container .the-icon-title{padding-top:10px;display:block}.shareAPIPolyfill-header-title .the-icon{display:inline-block;height:20px;width:20px;padding-right:5px;vertical-align:${o?"-2px":"-4px"}}.shareAPIPolyfill-icons-container.web-share-title .tool-icon .the-icon,.shareAPIPolyfill-icons-container.web-share-body .tool-icon .the-icon{display:block;margin:auto;width:42px;height:36px}.shareAPIPolyfill-icons-container.web-share-title .tool-icon .the-icon{height:24px}.shareAPIPolyfill-icons-container .hidden{display:none!important}[web-sharer-theme="dark"] #shareAPIPolyfill-container{background-color:#212121}[web-sharer-theme="dark"] #shareAPIPolyfill-container .shareAPIPolyfill-header{background:#212121}[web-sharer-theme="dark"] #shareAPIPolyfill-container .shareAPIPolyfill-header-title{background-color:#212121;color:white}[web-sharer-theme="dark"] #shareAPIPolyfill-container .shareAPIPolyfill-body{border-top:solid 1px #212121}[web-sharer-theme="dark"] #shareAPIPolyfill-container .shareAPIPolyfill-footer{color:white;border-top:solid 1px #212121;background-color:#212121}[web-sharer-theme="dark"] #shareAPIPolyfill-container .the-icon-title{color:white}\n`);const S=document.createElement("div"),z=document.createElement("div");function E(e){27===e.keyCode&&$()}S.id="shareAPIPolyfill-backdrop",z.id="shareAPIPolyfill-container",z.setAttribute("tabindex","0"),z.innerHTML=`\n<div class="shareAPIPolyfill-header">\n<div class="shareAPIPolyfill-header-title" tabindex="0">${a} ${A.shareTitle}</div>\n<div class="shareAPIPolyfill-icons-container web-share-title">\n<button class="${x.copy?"":"hidden"} tool-icon copy" data-tool="copy">\n${s}\n<span class="the-icon-title">${A.copy}</span>\n</button>\n<button class="${x.print?"":"hidden"} tool-icon print" data-tool="print">\n${r}\n<span class="the-icon-title">${A.print}</span>\n</button>\n<button class="${x.email?"":"hidden"} tool-icon email" data-tool="email">\n${l}\n<span class="the-icon-title">${A.email}</span>\n</button>\n<button class="${x.sms?"":"hidden"} tool-icon sms" data-tool="sms">\n${c}\n<span class="the-icon-title">${A.sms}</span>\n</button>\n</div>\n</div>\n<div class="shareAPIPolyfill-body">\n<div class="shareAPIPolyfill-icons-container web-share-body">\n${P?`\n<button class="tool-icon messenger ${x.messenger?"":"hidden"}" data-tool="messenger">\n${h}\n<span class="the-icon-title">${A.messenger}</span>\n</button>\n`:""}\n<button class="${x.facebook?"":"hidden"} tool-icon facebook" data-tool="facebook">\n${d}\n<span class="the-icon-title">${A.facebook}</span>\n</button>\n<button class="${x.whatsapp?"":"hidden"} tool-icon whatsapp" data-tool="whatsapp">\n${p}\n<span class="the-icon-title">${A.whatsapp}</span>\n</button>\n<button class="${x.twitter?"":"hidden"} tool-icon twitter" data-tool="twitter">\n${m}\n<span class="the-icon-title">${A.twitter}</span>\n</button>\n<button class="${x.linkedin?"":"hidden"} tool-icon linkedin" data-tool="linkedin">\n${f}\n<span class="the-icon-title">${A.linkedin}</span>\n</button>\n<button class="${x.telegram?"":"hidden"} tool-icon telegram" data-tool="telegram">\n${u}\n<span class="the-icon-title">${A.telegram}</span>\n</button>\n<button class="${x.skype?"":"hidden"} tool-icon skype skype-share" data-tool="skype" data-href="${b}" data-text="${v+": "+b}">\n${w}\n<span class="the-icon-title">${A.skype}</span>\n</button>\n</div>\n<button class="shareAPIPolyfill-footer">\n${A.cancel}\n</button>\n</div>\n`,S.addEventListener("click",()=>{$()}),!1!==x.skype&&function(e,t,n){e.loadSkypeWebSdkAsync=e.loadSkypeWebSdkAsync||function(e){var o,i=t.getElementsByTagName(n)[0];t.getElementById(e.id)||((o=t.createElement(n)).id=e.id,o.src=e.scriptToLoad,o.onload=e.callback,i.parentNode.insertBefore(o,i))},e.loadSkypeWebSdkAsync({scriptToLoad:"https://swx.cdn.skype.com/shared/v/latest/skypewebsdk.js",id:"skype_web_sdk"})}(window,document,"script"),requestAnimationFrame(e=>{document.body.appendChild(S),document.body.appendChild(z),document.addEventListener("keyup",E),Array.from(z.querySelectorAll(".tool-icon")).forEach(e=>{e.addEventListener("click",t=>{const n=I+": "+b;switch(e.dataset.tool){case"copy":navigator.clipboard.writeText(b);break;case"print":self.print();break;case"email":window.open("mailto:?subject="+v+"&body="+b);break;case"sms":location.href=`sms:${A.selectSms}?&body=${v}: ${b}`;break;case"messenger":window.open("http://www.facebook.com/dialog/send?app_id="+P+"&display=popup&href="+encodeURIComponent(b)+"&link="+encodeURIComponent(b)+"&redirect_uri="+encodeURIComponent(b)+"&quote="+v+": "+b);break;case"facebook":window.open(`https://www.facebook.com/sharer/sharer.php?u=${b}`);break;case"whatsapp":window.open((i?"https://api.whatsapp.com/send?text=":"whatsapp://send?text=")+n);break;case"twitter":window.open(`http://twitter.com/share?text=${I}&url=${b}&hashtags=${k||""}`);break;case"linkedin":window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${b}&title=${v}&summary=${I}&source=LinkedIn`);break;case"telegram":window.open(i?"https://telegram.me/share/msg?url="+b+"&text="+I:"tg://msg?text="+n)}g(),$()})}),z.querySelector(".shareAPIPolyfill-footer").addEventListener("click",$),requestAnimationFrame(()=>{S.classList.add("visible"),z.classList.add("visible")}),document.getElementById("shareAPIPolyfill-container").focus()})})}}var t=function(){function t(e){var t=this;switch(void 0===e&&(e="auto"),this.nativeSupport=navigator.share,this.mode=e,this.nativeSupport||this.polyfill(),this.mode){case"auto":!function(e){var t=window.matchMedia("(prefers-color-scheme: dark)").matches,n=window.matchMedia("(prefers-color-scheme: light)").matches,o=window.matchMedia("(prefers-color-scheme: no-preference)").matches,i=!t&&!n&&!o;window.matchMedia("(prefers-color-scheme: dark)").addListener(function(t){return t.matches&&e("dark")}),window.matchMedia("(prefers-color-scheme: light)").addListener(function(t){return t.matches&&e("light")}),t&&e("dark");n&&e("light");if(o||i){var a=new Date,l=a.getHours();e(l<4||l>=16?"dark":"light")}}(function(e){return t.enableTheme(e)});break;case"dark":this.enableTheme("dark");break;case"light":this.enableTheme("light")}}return t.prototype.enableTheme=function(e){document.body.setAttribute("web-sharer-theme",e)},t.prototype.share=function(e){this.nativeSupport?navigator.share(e):this.polyfilledSharer(e)},t.prototype.polyfill=function(){this.polyfilledSharer=new e},t}();var n=function(){return function(e,t){var n=this;if(this.sharer=t,e.closest(".w-dyn-item")){var o=e.closest(".w-dyn-item");o.querySelector('[web-share="title"]')?this.title=o.querySelector('[web-share="title"]').textContent||"":o.querySelector("h1, h2, h3, h4, h5, h6")&&(this.title=o.querySelector("h1, h2, h3, h4, h5, h6").textContent||""),o.querySelector('[web-share="description"]')?this.text=o.querySelector('[web-share="description"]').textContent||"":o.querySelector("p")&&(this.text=o.querySelector("p").textContent||""),this.url="#"==e.getAttribute("href")?document.location.href:e.getAttribute("href")||""}else{this.title=document.title;var i=document.querySelector('meta[name="description"]');this.text=i&&i.getAttribute("content")||"",this.url="#"==e.getAttribute("href")?document.location.href:e.getAttribute("href")||""}this.url?e.addEventListener("click",function(e){e.preventDefault();var t={url:n.url||""};""!=n.title&&(t.title=n.title),""!=n.text&&(t.text=n.text),n.sharer.share(t)}):e.remove()}}(),o=null;document.querySelectorAll("[udesly-web-share]").forEach(function(e){var i=e.getAttribute("udesly-web-share")||"auto";"auto"!==i&&"dark"!==i&&"light"!==i&&(i="auto"),o||(o=new t(i)),new n(e,o)})});