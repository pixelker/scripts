/**
 * Share Toggle 1.0.2
 * Copyright 2024 Pixelker
 * Released under the MIT License
 * Released on: November 4, 2024
 */

document.addEventListener("DOMContentLoaded", () => {
  const shareButtons = document.querySelectorAll("[pxl-share]");

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
        case "linkedin": // Nuevo caso para LinkedIn
          shareOnLinkedIn();
          break;
        default:
          console.log("No action defined for this share type.");
      }
    });
  });

  function shareOnWhatsApp() {
    const url = window.location.href;
    const message = "Creo que podría interesarte, échale un vistazo: ";
    const fullMessage = `${message}${encodeURIComponent(url)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(fullMessage)}`);
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
    const message = "Contenido muy interesante, echarle un vistazo: ";
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(message)}${encodeURIComponent(url)}`);
  }

  function shareOnFacebook() {
    const url = window.location.href;
    const message = "Contenido muy interesante, echarle un vistazo: ";
    const fullMessage = `${message}${url}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullMessage)}`);
  }

  function shareOnReddit() {
    const url = window.location.href;
    const message = "Contenido muy interesante, echarle un vistazo: ";
    const fullMessage = `${message}${url}`;
    window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(fullMessage)}`);
  }

  function shareOnLinkedIn() {
    const url = window.location.href;
    const message = "Contenido muy interesante, echarle un vistazo: ";
    const fullMessage = `${message}${url}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullMessage)}`);
  }
});
