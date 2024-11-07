/**
 * Modal Toggle 1.2
 * Copyright 2024 Pixelker
 * Released under the MIT License
 * Released on: November 7, 2024
 */

"use strict";

(() => {
  const ATTRIBUTE_PREFIX = "fs-attributes";
  const MODAL = "modal";
  const SUPPORT = "support";
  const A11Y = "a11y";
  const ANIMATION = "animation";
  const CMS_ATTRIBUTE = "cmsattribute";

  const ALERTS = {
    activateAlerts() { this.alertsActivated = true; },
    alert(message, type) {
      if (this.alertsActivated && window.alert(message), type === "error") throw new Error(message);
    },
    alertsActivated: false,
  };

  const EVENT_UTILS = {
    attach: (element, event, handler, options) => {
      if (!element) return () => {};
      element.addEventListener(event, handler, options);
      return () => element.removeEventListener(event, handler, options);
    },
  };

  const UTILS = {
    isDefined: (value) => value != null,
    isString: (value) => typeof value === "string",
    parseIntFromSplit: (value) => {
      const parts = value.split("-");
      const num = parseInt(parts[parts.length - 1]);
      return !isNaN(num) ? num : undefined;
    },
    elementIsVisible: (element) => !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length),
    loadScript: (name, version = "1", format = "iife") => {
      const file = `${name}${format === "esm" ? ".esm" : ""}.js`;
      return `https://cdn.jsdelivr.net/npm/@finsweet/attributes-${name}@${version}/${file}`;
    },
  };

  // Attributes and configurations
  const ATTRIBUTES = {
    preventLoad: { key: `${ATTRIBUTE_PREFIX}-preventload` },
    debugMode: { key: `${ATTRIBUTE_PREFIX}-debug` },
    src: { key: "src", values: { finsweet: "@finsweet/attributes" } },
    dev: { key: `${ATTRIBUTE_PREFIX}-dev` },
  };

  const ANIMATIONS = {
    element: { key: `${ATTRIBUTE_PREFIX}-${MODAL}-element`, values: { modal: "modal", open: "open", close: "close" } },
    animation: { key: `${ATTRIBUTE_PREFIX}-animation` },
    easing: { key: `${ATTRIBUTE_PREFIX}-easing` },
    duration: { key: `${ATTRIBUTE_PREFIX}-duration` },
    display: { key: `${ATTRIBUTE_PREFIX}-display` },
  };

  const MODAL_VERSION = "1.1.3";

  const initModal = async () => {
    await loadCMSModule(CMS_ATTRIBUTE);

    const modals = queryAllByAttribute("modal", { operator: "prefixed", all: true });
    const animationSettings = await loadAnimationSettings();
    if (!animationSettings) return destroyModule(MODAL, modals);

    const modalFunctions = modals.map((modal) => configureModal(modal, animationSettings)).filter(UTILS.isDefined);
    loadA11y();

    return destroyModule(MODAL, modals, () => modalFunctions.forEach((fn) => fn()));
  };

  const setupModule = ({ version, attributeKey, init, scriptAttributes }) => {
    loadPreviousScripts();
    const fsAttributes = setupFsAttributes(scriptAttributes);
    fsAttributes[attributeKey] = { version, init };
    documentReady(init);
  };

  setupModule({
    init: initModal,
    version: MODAL_VERSION,
    attributeKey: MODAL,
    scriptAttributes: ATTRIBUTES,
  });

  loadAnimationSettings();

})();
