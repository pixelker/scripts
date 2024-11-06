/**
 * Wishlist Toggle 1.0.2
 * Copyright 2024 Pixelker
 * Released under the MIT License
 * Released on: November 4, 2024
 */

document.addEventListener("DOMContentLoaded", function() {
    const storedItems = JSON.parse(localStorage.getItem("miListaLectura") || "[]");

    function saveItem(itemId) {
        if (!storedItems.includes(itemId)) {
            storedItems.push(itemId);
            localStorage.setItem("miListaLectura", JSON.stringify(storedItems));
        }
        renderSavedList();
    }

    function removeItem(itemId) {
        const index = storedItems.indexOf(itemId);
        if (index !== -1) {
            storedItems.splice(index, 1);
            localStorage.setItem("miListaLectura", JSON.stringify(storedItems));
        }

        // Actualiza el botón en la página de la colección inmediatamente
        const itemInCollection = document.querySelector(`[pxl-item-id="${itemId}"]`);
        if (itemInCollection) {
            updateButtonVisibility(itemInCollection);
        }

        renderSavedList();
    }

    function updateButtonVisibility(itemElement) {
        const itemId = itemElement.getAttribute("pxl-item-id");
        const addButton = itemElement.querySelector('[pxl-action="guardar"]');
        const removeButton = itemElement.querySelector('[pxl-action="eliminar"]');

        if (storedItems.includes(itemId)) {
            if (addButton) addButton.style.display = "none";
            if (removeButton) removeButton.style.display = "flex";
        } else {
            if (addButton) addButton.style.display = "flex";
            if (removeButton) removeButton.style.display = "none";
        }
    }

    function initializeItems() {
        document.querySelectorAll('[pxl-collection="articulos"] [pxl-item-id]').forEach(item => {
            updateButtonVisibility(item);

            item.querySelector('[pxl-action="guardar"]').addEventListener("click", function() {
                saveItem(item.getAttribute("pxl-item-id"));
                updateButtonVisibility(item);
            });

            item.querySelector('[pxl-action="eliminar"]').addEventListener("click", function() {
                removeItem(item.getAttribute("pxl-item-id"));
                updateButtonVisibility(item);
            });
        });
    }

    function initializeSavedItem(itemElement) {
        const addButton = itemElement.querySelector('[pxl-action="guardar"]');
        const removeButton = itemElement.querySelector('[pxl-action="eliminar"]');

        if (addButton) {
            addButton.addEventListener("click", function() {
                saveItem(itemElement.getAttribute("pxl-item-id"));
                updateButtonVisibility(itemElement);
            });
        }

        if (removeButton) {
            removeButton.addEventListener("click", function() {
                removeItem(itemElement.getAttribute("pxl-item-id"));
                updateButtonVisibility(itemElement);
            });
        }
    }

    function renderSavedList() {
        const savedContainer = document.querySelector('[pxl-saved-list="articulos"]');
        if (savedContainer) {
            savedContainer.innerHTML = "";
            storedItems.forEach(itemId => {
                const itemElement = document.querySelector(`[pxl-item-id="${itemId}"]`);
                if (itemElement) {
                    const clone = itemElement.cloneNode(true);
                    updateButtonVisibility(clone);
                    savedContainer.appendChild(clone);
                    initializeSavedItem(clone);
                }
            });
        }
    }

    // Inicializar los artículos en la página de listado
    initializeItems();

    // Actualizar la lista guardada después de que la página esté cargada
    renderSavedList();

    // Manejar botones en la página del artículo individual
    const singleArticle = document.querySelector('[pxl-item-id]');
    if (singleArticle) {
        updateButtonVisibility(singleArticle);
        const addButton = singleArticle.querySelector('[pxl-action="guardar"]');
        const removeButton = singleArticle.querySelector('[pxl-action="eliminar"]');

        if (addButton) {
            addButton.addEventListener("click", function() {
                saveItem(singleArticle.getAttribute("pxl-item-id"));
                updateButtonVisibility(singleArticle);
            });
        }

        if (removeButton) {
            removeButton.addEventListener("click", function() {
                removeItem(singleArticle.getAttribute("pxl-item-id"));
                updateButtonVisibility(singleArticle);
            });
        }
    }
});
