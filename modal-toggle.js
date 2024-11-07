/**
 * Modal Toggle 1.1
 * Copyright 2024 Pixelker
 * Released under the MIT License
 * Released on: November 7, 2024
 */

"use strict";

(() => {
    // Definir propiedades del módulo y utilidades generales
    const fsAttributes = "fs-attributes";
    const alertTypes = ["a11y", "animation", "cmsattribute", "modal", "support"];
    const alertMessages = async (...modules) => {
        let results = [];
        for (let mod of modules) {
            let loadedModule = await window.fsAttributes[mod]?.loading;
            results.push(loadedModule);
        }
        return results;
    };

    // Definición de clase para activar alertas
    class Alert {
        static activateAlerts() { this.alertsActivated = true; }
        static alert(message, type) {
            if (this.alertsActivated && window.alert(message)) {
                if (type === "error") throw new Error(message);
            }
        }
    }
    Alert.alertsActivated = false;

    // Utilidades para manipulación de eventos y condiciones
    const noop = () => {};
    const addEvent = (element, event, handler, options) => {
        if (!element) return noop;
        element.addEventListener(event, handler, options);
        return () => element.removeEventListener(event, handler, options);
    };
    const isString = value => typeof value === "string";
    const isElementVisible = el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    const retrieveModule = (module, version = "1", type = "iife") => 
        `https://cdn.jsdelivr.net/npm/@finsweet/attributes-${module}@${version}/${module}${type === "esm" ? ".esm" : ""}.js`;

    // Configuración inicial de importación del módulo de animación
    const importAnimationModule = async () => {
        const { fsAttributes } = window;
        if (!fsAttributes.animation) fsAttributes.animation = {};
        let animation = fsAttributes.animation;
        if (animation.import) return animation.import;
        try {
            return (animation.import = import(retrieveModule("animation", "1", "esm")));
        } catch (error) {
            Alert.alert(`${error}`, "error");
        }
    };

    // Función para inicializar los atributos
    const initializeAttributes = ({ scriptAttributes, attributeKey, version, init }) => {
        const scriptSettings = detectScriptSettings();
        const moduleData = window.fsAttributes[attributeKey] || (window.fsAttributes[attributeKey] = {});
        const { preventsLoad, attributes } = parseScriptSettings(scriptAttributes);
        moduleData.version = version;
        moduleData.init = init;
        if (!preventsLoad) {
            window.Webflow = window.Webflow || [];
            window.Webflow.push(() => init(attributes));
        }
    };

    // Funciones de inicialización y configuración
    const detectScriptSettings = () => {
        const customScripts = [
            selectScriptAttributes("src", "finsweet", { operator: "contains" }),
            selectScriptAttributes("dev"),
        ];
        return [...document.querySelectorAll(`script${customScripts.join(",")}`)].reduce((acc, script) => {
            let name = script.getAttribute(fsAttributes.dev.key) || (script.src.match(/[\w-. ]+(?=(\.js)$)/) || [])[0];
            if (name && !acc.includes(name)) acc.push(name);
            return acc;
        }, []);
    };

    // Aplicación de la configuración de inicialización del módulo de modal con nuevos nombres de atributo
    const modalAttributes = {
        element: {
            key: `pxl-modal-element`,
            values: { modal: "pxl-modal", open: "pxl-modal-open", close: "pxl-modal-close" }
        },
        animation: { key: `pxl-modal-animation` },
        easing: { key: `pxl-modal-easing` },
        duration: { key: `pxl-modal-duration` },
        display: { key: `pxl-modal-display` }
    };

    initializeAttributes({
        scriptAttributes: modalAttributes,
        attributeKey: "modal",
        version: "1.1.3",
        init: async () => {
            await alertMessages("cmsattribute");
            const modals = selectElements("modal", { operator: "prefixed", all: true });
            const animationConfig = await importAnimationModule();
            if (!animationConfig) return initializeModule("modal", modals);
            const cleanupHandlers = modals.map(modal => setupModal(modal, animationConfig)).filter(Boolean);
            const alertModule = async () => {
                const { import: importAlert } = window.fsAttributes;
                await importAlert("a11y", "1");
            };
            initializeModule("modal", modals, () => cleanupHandlers.forEach(handler => handler()));
        },
    });
})();
