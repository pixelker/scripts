/**
 * My list Toggle 2.0.1
 * Copyright 2024 Pixelker
 * Released under the MIT License
 * Released on: November 4, 2024
 */

document.addEventListener("DOMContentLoaded", function() {
    const storedItems = JSON.parse(localStorage.getItem("myList") || "[]");

    function saveItem(itemId) {
        if (!storedItems.includes(itemId)) {
            storedItems.push(itemId);
            localStorage.setItem("myList", JSON.stringify(storedItems));
        }
        renderSavedList();
    }

    function removeItem(itemId) {
        const index = storedItems.indexOf(itemId);
        if (index !== -1) {
            storedItems.splice(index, 1);
            localStorage.setItem("myList", JSON.stringify(storedItems));
        }

        // Actualiza el botón en la página de la colección inmediatamente
        const itemInCollection = document.querySelector(`[pxl-mylist-item="${itemId}"]`);
        if (itemInCollection) {
            updateButtonVisibility(itemInCollection);
        }

        renderSavedList();
    }

    function updateButtonVisibility(itemElement) {
        const itemId = itemElement.getAttribute("pxl-mylist-item");
        const addButton = itemElement.querySelector('[pxl-mylist-trigger="save"]');
        const removeButton = itemElement.querySelector('[pxl-mylist-trigger="remove"]');

        if (storedItems.includes(itemId)) {
            if (addButton) addButton.style.display = "none";
            if (removeButton) removeButton.style.display = "flex";
        } else {
            if (addButton) addButton.style.display = "flex";
            if (removeButton) removeButton.style.display = "none";
        }
    }

    function initializeItems() {
        document.querySelectorAll('[pxl-mylist-element="list"] [pxl-mylist-item]').forEach(item => {
            updateButtonVisibility(item);

            item.querySelector('[pxl-mylist-trigger="save"]').addEventListener("click", function() {
                saveItem(item.getAttribute("pxl-mylist-item"));
                updateButtonVisibility(item);
            });

            item.querySelector('[pxl-mylist-trigger="remove"]').addEventListener("click", function() {
                removeItem(item.getAttribute("pxl-mylist-item"));
                updateButtonVisibility(item);
            });
        });
    }

    function initializeSavedItem(itemElement) {
        const addButton = itemElement.querySelector('[pxl-mylist-trigger="save"]');
        const removeButton = itemElement.querySelector('[pxl-mylist-trigger="remove"]');

        if (addButton) {
            addButton.addEventListener("click", function() {
                saveItem(itemElement.getAttribute("pxl-mylist-item"));
                updateButtonVisibility(itemElement);
            });
        }

        if (removeButton) {
            removeButton.addEventListener("click", function() {
                removeItem(itemElement.getAttribute("pxl-mylist-item"));
                updateButtonVisibility(itemElement);
            });
        }
    }

    function renderSavedList() {
        const savedContainer = document.querySelector('[pxl-mylist-saved="list"]');
        if (savedContainer) {
            savedContainer.innerHTML = "";
            storedItems.forEach(itemId => {
                const itemElement = document.querySelector(`[pxl-mylist-item="${itemId}"]`);
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
    const singleArticle = document.querySelector('[pxl-mylist-item]');
    if (singleArticle) {
        updateButtonVisibility(singleArticle);
        const addButton = singleArticle.querySelector('[pxl-mylist-trigger="save"]');
        const removeButton = singleArticle.querySelector('[pxl-mylist-trigger="remove"]');

        if (addButton) {
            addButton.addEventListener("click", function() {
                saveItem(singleArticle.getAttribute("pxl-mylist-item"));
                updateButtonVisibility(singleArticle);
            });
        }

        if (removeButton) {
            removeButton.addEventListener("click", function() {
                removeItem(singleArticle.getAttribute("pxl-mylist-item"));
                updateButtonVisibility(singleArticle);
            });
        }
    }
});
