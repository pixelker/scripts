/**
 * Share Toggle 1.5
 * Copyright 2024 Pixelker
 * Released under the MIT License
 * Released on: November 4, 2024
 */

document.addEventListener("DOMContentLoaded", () => {
  const shareButtons = document.querySelectorAll("[pxl-share]");
  const urlDisplay = document.querySelector("[pxl-share='url']"); // Selecciona el elemento para mostrar la URL

  // Muestra la URL en el elemento al cargar la página
  if (urlDisplay) {
    urlDisplay.textContent = window.location.href;
  }

  shareButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const shareType = event.target.getAttribute("pxl-share");
      console.log(`Botón clicado: ${shareType}`); // Depuración

      switch (shareType) {
        case "whatsapp":
          shareOnWhatsApp();
          break;
        case "copy":
          copyLink();
          break;
        case "email":
          shareByEmail();
          break;
        case "x":
          shareOnX();
          break;
        case "facebook":
          shareOnFacebook();
          break;
        case "reddit":
          shareOnReddit();
          break;
        case "linkedin":
          shareOnLinkedIn();
          break;
        default:
          console.log("No action defined for this share type.");
      }
    });
  });

  function shareOnWhatsApp() {
    const url = window.location.href;
    window.open(`https://wa.me/?text=Creo%20que%20podría%20interesarte,%20échale%20un%20vistazo:%20${encodeURIComponent(url)}`);
  }

  function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => alert("¡Enlace copiado al portapapeles!"))
      .catch(err => console.error("Error al copiar el enlace: ", err));
  }

  function shareByEmail() {
    const url = window.location.href;
    window.open(`mailto:?subject=¡Echa un vistazo a esto!&body=Hola,%0A%0ACreo que podría interesarte, échale un vistazo: ${encodeURIComponent(url)}`);
  }

  function shareOnX() {
    const url = window.location.href;
    window.open(`https://x.com/intent/tweet?text=Contenido%20muy%20interesante,%20echarle%20un%20vistazo:%20${encodeURIComponent(url)}`);
  }

  function shareOnFacebook() {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  }

  function shareOnReddit() {
    const url = window.location.href;
    window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=Contenido%20muy%20interesante,%20echarle%20un%20vistazo:%20`);
  }

  function shareOnLinkedIn() {
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
  }
});
