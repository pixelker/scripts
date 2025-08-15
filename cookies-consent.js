/**
 * Universal Cookie Consent System 3.0
 * Copyright 2025 Pixelker
 * Released under the MIT License
 * Released on: August 15, 2025
 */

(function() {
    'use strict';
    
    class UniversalCookieConsent {
        constructor() {
            this.version = '3.0';
            this.config = {
                // Endpoint dinámico basado en el dominio actual
                endpoint: this.buildEndpoint(),
                
                // Selectores usando atributos personalizados
                selectors: {
                    banner: '[pxl-cookies-consent="banner"]',
                    preferences: '[pxl-cookies-consent="preferences"]',
                    form: '[pxl-cookies-consent="form"]',
                    acceptAllBtn: '[pxl-cookies-consent="allow"]',
                    rejectAllBtn: '[pxl-cookies-consent="deny"]',
                    openPreferencesBtn: '[pxl-cookies-consent="open-preferences"]',
                    savePreferencesBtn: '[pxl-cookies-consent="save-preferences"]',
                    closeBtn: '[pxl-cookies-consent="close"]',
                    checkboxAnalytics: '[pxl-cookies-consent="checkbox-analytics"]',
                    checkboxMarketing: '[pxl-cookies-consent="checkbox-marketing"]',
                    checkboxFunctional: '[pxl-cookies-consent="checkbox-functional"]',
                    formContainer: '#cookies-consent'
                },
                
                // Configuración de cookies
                cookieName: 'pxl_cookie_consent',
                cookieExpiry: 365, // días
                
                // Estados por defecto
                defaultConsent: {
                    necessary: true,
                    analytics: false,
                    marketing: false,
                    functional: false
                }
            };
            
            this.consent = { ...this.config.defaultConsent };
            this.domain = window.location.hostname;
            this.scrollPosition = 0;
            
            console.log(`🍪 Universal Cookie Consent v${this.version} iniciado`);
            console.log(`🍪 Dominio: ${this.domain}`);
            console.log(`🍪 Endpoint: ${this.config.endpoint}`);
            
            this.init();
        }
        
        // ===== CONSTRUCCIÓN DINÁMICA DEL ENDPOINT =====
        
        buildEndpoint() {
            const protocol = window.location.protocol;
            const hostname = window.location.hostname;
            
            // Buscar atributo personalizado en el script
            const scripts = document.querySelectorAll('script[src*="consent"]');
            for (let script of scripts) {
                const customEndpoint = script.getAttribute('pxl-consent-endpoint');
                if (customEndpoint) {
                    return customEndpoint;
                }
            }
            
            // Por defecto: mismo dominio + /kv/cookies
            return `${protocol}//${hostname}/kv/cookies`;
        }
        
        // ===== INICIALIZACIÓN =====
        
        init() {
            // Configurar Google Consent Mode v2 ANTES de todo
            this.setupConsentMode();
            
            // Verificar consentimiento existente
            const savedConsent = this.getSavedConsent();
            if (savedConsent) {
                this.consent = savedConsent;
                this.applyConsent();
                this.hideBanner();
                console.log('🍪 Consentimiento existente encontrado:', this.consent);
            } else {
                // Primera visita o consentimiento expirado
                this.showBanner();
                console.log('🍪 Primera visita - mostrando banner');
            }
            
            // Configurar event listeners cuando DOM esté listo
            // Delay mayor para asegurar que Webflow haya inicializado
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => this.setupEventListeners(), 800);
                });
            } else {
                setTimeout(() => this.setupEventListeners(), 800);
            }
        }
        
        // ===== GOOGLE CONSENT MODE V2 =====
        
        setupConsentMode() {
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function() { dataLayer.push(arguments); };
            
            // Configurar Consent Mode v2 - DENEGAR TODO INICIALMENTE
            gtag('consent', 'default', {
                'ad_storage': 'denied',
                'analytics_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'personalization_storage': 'denied',
                'functionality_storage': 'denied',
                'security_storage': 'granted',
                'wait_for_update': 500
            });
            
            console.log('🍪 Google Consent Mode v2 configurado');
        }
        
        updateConsentMode() {
            if (typeof gtag === 'undefined') {
                console.warn('🍪 gtag no disponible - asegúrate de que GA4 esté cargado');
                return;
            }
            
            gtag('consent', 'update', {
                'ad_storage': this.consent.marketing ? 'granted' : 'denied',
                'analytics_storage': this.consent.analytics ? 'granted' : 'denied',
                'ad_user_data': this.consent.marketing ? 'granted' : 'denied',
                'ad_personalization': this.consent.marketing ? 'granted' : 'denied',
                'personalization_storage': this.consent.functional ? 'granted' : 'denied',
                'functionality_storage': this.consent.functional ? 'granted' : 'denied'
            });
            
            console.log('🍪 Consent Mode actualizado:', this.consent);
        }
        
        // ===== APLICACIÓN DE CONSENTIMIENTO =====
        
        applyConsent() {
            console.log('🍪 Aplicando consentimiento:', this.consent);
            
            // Actualizar Consent Mode
            this.updateConsentMode();
            
            // Ejecutar callbacks personalizados si existen
            this.executeCustomCallbacks();
            
            // Actualizar visualmente los checkboxes (con delay para asegurar DOM listo)
            setTimeout(() => {
                this.updateCheckboxStates();
            }, 100);
            
            // Disparar evento personalizado
            this.dispatchConsentEvent();
            
            // Enviar al endpoint (solo una vez, no duplicar)
            if (!this.consentSent) {
                this.sendToEndpoint('consent_updated', this.consent);
                this.consentSent = true;
                setTimeout(() => { this.consentSent = false; }, 1000);
            }
        }
        
        executeCustomCallbacks() {
            // Permitir callbacks personalizados para cada categoría
            if (window.pxlCookieCallbacks) {
                const callbacks = window.pxlCookieCallbacks;
                
                if (this.consent.analytics && callbacks.analytics) {
                    callbacks.analytics();
                }
                if (this.consent.marketing && callbacks.marketing) {
                    callbacks.marketing();
                }
                if (this.consent.functional && callbacks.functional) {
                    callbacks.functional();
                }
            }
        }
        
        // ===== CONTROL DE SCROLL =====
        
        disableScroll() {
            this.scrollPosition = window.pageYOffset;
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${this.scrollPosition}px`;
            document.body.style.width = '100%';
        }
        
        enableScroll() {
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('position');
            document.body.style.removeProperty('top');
            document.body.style.removeProperty('width');
            
            if (this.scrollPosition !== undefined) {
                window.scrollTo(0, this.scrollPosition);
            }
        }
        
        // ===== GESTIÓN DE UI =====
        
        setupEventListeners() {
            const { selectors } = this.config;
            
            console.log('🍪 Configurando event listeners...');
            
            // Primero actualizar los checkboxes con el estado guardado
            this.updateCheckboxStates();
            
            // Botón aceptar todas
            this.addClickListener(selectors.acceptAllBtn, () => {
                this.acceptAll();
                this.closePreferences();
            });
            
            // Botón rechazar todas
            this.addClickListener(selectors.rejectAllBtn, () => {
                this.rejectAll();
                this.closePreferences();
            });
            
            // Botón abrir configuración
            this.addClickListener(selectors.openPreferencesBtn, () => {
                this.openPreferences();
            });
            
            // Botón guardar configuración
            this.addClickListener(selectors.savePreferencesBtn, () => {
                this.saveCustomConfig();
                this.closePreferences();
            });
            
            // Botones cerrar
            this.addClickListener(selectors.closeBtn, () => {
                this.closePreferences();
            });
            
            // Checkboxes
            this.setupCheckboxListeners();
            
            // Actualizar estado de checkboxes nuevamente después de configurar listeners
            setTimeout(() => {
                console.log('🍪 Actualizando checkboxes después de configurar listeners...');
                this.updateCheckboxStates();
            }, 500);
            
            console.log('🍪 Event listeners configurados');
        }
        
        addClickListener(selector, callback) {
            const elements = document.querySelectorAll(selector);
            if (elements.length === 0) {
                console.warn(`🍪 No se encontraron elementos con selector: ${selector}`);
                return;
            }
            
            elements.forEach(element => {
                // Remover listeners previos para evitar duplicados
                element.removeEventListener('click', this.handleClick);
                
                const boundCallback = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    callback();
                };
                
                element.addEventListener('click', boundCallback);
            });
        }
        
        setupCheckboxListeners() {
            const { selectors } = this.config;
            
            // Para checkboxes de Webflow (input + div wrapper)
            this.setupWebflowCheckbox(selectors.checkboxAnalytics, 'analytics');
            this.setupWebflowCheckbox(selectors.checkboxMarketing, 'marketing');
            this.setupWebflowCheckbox(selectors.checkboxFunctional, 'functional');
        }
        
        setupWebflowCheckbox(selector, category) {
            const wrapper = document.querySelector(selector);
            if (!wrapper) {
                console.warn(`🍪 No se encontró wrapper para ${category}`);
                return;
            }
            
            // Buscar el input real dentro del wrapper
            const input = wrapper.querySelector('input[type="checkbox"]');
            const customCheckbox = wrapper.querySelector('.w-checkbox-input');
            
            if (!input) {
                console.warn(`🍪 No se encontró input para ${category}`);
                return;
            }
            
            // Establecer el estado inicial desde el consentimiento guardado
            input.checked = this.consent[category];
            
            // Actualizar el checkbox visual de Webflow
            if (customCheckbox) {
                if (this.consent[category]) {
                    customCheckbox.classList.add('w--redirected-checked');
                    customCheckbox.dataset.wRedirected = 'true';
                } else {
                    customCheckbox.classList.remove('w--redirected-checked');
                    customCheckbox.dataset.wRedirected = 'false';
                }
            }
            
            // Limpiar listeners previos
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            // Añadir listener al nuevo input
            newInput.addEventListener('change', (e) => {
                this.consent[category] = e.target.checked;
                
                // Actualizar visual del custom checkbox
                if (customCheckbox) {
                    if (e.target.checked) {
                        customCheckbox.classList.add('w--redirected-checked');
                        customCheckbox.dataset.wRedirected = 'true';
                    } else {
                        customCheckbox.classList.remove('w--redirected-checked');
                        customCheckbox.dataset.wRedirected = 'false';
                    }
                }
                
                console.log(`🍪 Checkbox ${category} cambiado a:`, e.target.checked);
            });
            
            // Manejar clicks en el checkbox visual
            if (customCheckbox) {
                customCheckbox.style.cursor = 'pointer';
                customCheckbox.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    newInput.checked = !newInput.checked;
                    newInput.dispatchEvent(new Event('change', { bubbles: true }));
                });
            }
            
            // Manejar clicks en el label
            const label = wrapper.querySelector('.w-checkbox-label');
            if (label) {
                label.style.cursor = 'pointer';
                label.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    newInput.checked = !newInput.checked;
                    newInput.dispatchEvent(new Event('change', { bubbles: true }));
                });
            }
            
            console.log(`🍪 Checkbox ${category} configurado, estado inicial:`, this.consent[category]);
        }
        
        // ===== ACCIONES DEL USUARIO =====
        
        acceptAll() {
            this.consent = {
                necessary: true,
                analytics: true,
                marketing: true,
                functional: true
            };
            
            this.saveConsent();
            this.applyConsent();
            this.hideBanner();
            
            // Actualizar checkboxes inmediatamente
            this.updateCheckboxStates();
            
            this.sendToEndpoint('accept_all', this.consent);
            
            console.log('🍪 Usuario aceptó todas las cookies');
        }
        
        rejectAll() {
            this.consent = {
                necessary: true,
                analytics: false,
                marketing: false,
                functional: false
            };
            
            this.saveConsent();
            this.applyConsent();
            this.hideBanner();
            
            this.sendToEndpoint('reject_all', this.consent);
            
            console.log('🍪 Usuario rechazó cookies opcionales');
        }
        
        saveCustomConfig() {
            const { selectors } = this.config;
            
            // Leer estado de los inputs reales
            const analyticsInput = document.querySelector(selectors.checkboxAnalytics + ' input[type="checkbox"]');
            const marketingInput = document.querySelector(selectors.checkboxMarketing + ' input[type="checkbox"]');
            const functionalInput = document.querySelector(selectors.checkboxFunctional + ' input[type="checkbox"]');
            
            this.consent = {
                necessary: true,
                analytics: analyticsInput?.checked || false,
                marketing: marketingInput?.checked || false,
                functional: functionalInput?.checked || false
            };
            
            this.saveConsent();
            this.applyConsent();
            this.hideBanner();
            
            this.sendToEndpoint('custom_config', this.consent);
            
            console.log('🍪 Configuración personalizada guardada:', this.consent);
        }
        
        openPreferences() {
            const preferences = document.querySelector(this.config.selectors.preferences);
            if (preferences) {
                // Guardar las clases originales para evitar conflictos con dark mode
                this.originalBodyClasses = document.body.className;
                this.originalHtmlClasses = document.documentElement.className;
                
                preferences.style.display = 'block';
                preferences.classList.add('pxl-cookies-modal-active');
                
                this.disableScroll();
                
                // Forzar actualización de checkboxes después de mostrar
                setTimeout(() => {
                    this.updateCheckboxStates();
                }, 100);
                
                console.log('🍪 Panel de preferencias abierto');
            }
        }
        
        closePreferences() {
            const preferences = document.querySelector(this.config.selectors.preferences);
            if (preferences) {
                preferences.style.display = 'none';
                preferences.classList.remove('pxl-cookies-modal-active');
                
                // Restaurar clases originales si fueron guardadas
                if (this.originalBodyClasses !== undefined) {
                    document.body.className = this.originalBodyClasses;
                }
                if (this.originalHtmlClasses !== undefined) {
                    document.documentElement.className = this.originalHtmlClasses;
                }
                
                this.enableScroll();
                console.log('🍪 Panel de preferencias cerrado');
            }
        }
        
        showBanner() {
            const banner = document.querySelector(this.config.selectors.banner);
            if (banner) {
                banner.style.display = 'block';
                banner.classList.add('pxl-cookies-banner-active');
                console.log('🍪 Banner mostrado');
            }
        }
        
        hideBanner() {
            const banner = document.querySelector(this.config.selectors.banner);
            if (banner) {
                banner.style.display = 'none';
                banner.classList.remove('pxl-cookies-banner-active');
                console.log('🍪 Banner ocultado');
            }
        }
        
        updateCheckboxStates() {
            const { selectors } = this.config;
            
            console.log('🍪 Actualizando checkboxes con estado:', this.consent);
            
            // Usar requestAnimationFrame para asegurar que el DOM esté actualizado
            requestAnimationFrame(() => {
                // Actualizar inputs reales y checkboxes visuales
                this.updateWebflowCheckbox(selectors.checkboxAnalytics, this.consent.analytics);
                this.updateWebflowCheckbox(selectors.checkboxMarketing, this.consent.marketing);
                this.updateWebflowCheckbox(selectors.checkboxFunctional, this.consent.functional);
                
                // Forzar re-render de Webflow si está disponible
                if (window.Webflow && window.Webflow.require) {
                    try {
                        const ix2 = window.Webflow.require('ix2');
                        if (ix2 && ix2.init) {
                            ix2.init();
                        }
                    } catch (e) {
                        // Webflow IX2 no disponible, no es crítico
                    }
                }
            });
        }
        
        updateWebflowCheckbox(selector, isChecked) {
            const wrapper = document.querySelector(selector);
            if (!wrapper) {
                console.warn(`🍪 No se encontró el wrapper para: ${selector}`);
                return;
            }
            
            const input = wrapper.querySelector('input[type="checkbox"]');
            const customCheckbox = wrapper.querySelector('.w-checkbox-input');
            
            if (input) {
                input.checked = isChecked;
                // Disparar evento change para que Webflow lo detecte
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            if (customCheckbox) {
                // Forzar actualización visual
                if (isChecked) {
                    customCheckbox.classList.add('w--redirected-checked');
                    customCheckbox.dataset.wRedirected = 'true';
                } else {
                    customCheckbox.classList.remove('w--redirected-checked');
                    customCheckbox.dataset.wRedirected = 'false';
                }
            }
            
            console.log(`🍪 Checkbox ${selector} actualizado a: ${isChecked}`);
        }
        
        // ===== GESTIÓN DE ALMACENAMIENTO LOCAL =====
        
        saveConsent() {
            const consentData = {
                ...this.consent,
                timestamp: Date.now(),
                version: this.version,
                domain: this.domain
            };
            
            const expires = new Date();
            expires.setTime(expires.getTime() + (this.config.cookieExpiry * 24 * 60 * 60 * 1000));
            
            // Guardar en cookie con path y dominio correctos
            const cookieString = `${this.config.cookieName}=${encodeURIComponent(JSON.stringify(consentData))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
            
            document.cookie = cookieString;
            
            // Backup en localStorage
            try {
                localStorage.setItem(this.config.cookieName, JSON.stringify(consentData));
            } catch (e) {
                console.warn('🍪 No se pudo guardar en localStorage:', e);
            }
            
            console.log(`🍪 Consentimiento guardado - expira en ${this.config.cookieExpiry} días`);
        }
        
        getSavedConsent() {
            // Intentar obtener de cookie primero
            const cookies = document.cookie.split('; ');
            const cookiePrefix = this.config.cookieName + '=';
            
            for (let cookie of cookies) {
                if (cookie.startsWith(cookiePrefix)) {
                    try {
                        const data = JSON.parse(decodeURIComponent(cookie.substring(cookiePrefix.length)));
                        
                        // Verificar expiración
                        const now = Date.now();
                        const expiry = data.timestamp + (this.config.cookieExpiry * 24 * 60 * 60 * 1000);
                        
                        if (now < expiry) {
                            console.log('🍪 Cookie encontrada y válida');
                            return {
                                necessary: data.necessary !== undefined ? data.necessary : true,
                                analytics: data.analytics || false,
                                marketing: data.marketing || false,
                                functional: data.functional || false
                            };
                        } else {
                            console.log('🍪 Cookie expirada');
                            this.clearExpiredConsent();
                            return null;
                        }
                    } catch (e) {
                        console.error('🍪 Error parsing cookie:', e);
                        this.clearExpiredConsent();
                        return null;
                    }
                }
            }
            
            // Si no hay cookie, intentar localStorage como backup
            try {
                const stored = localStorage.getItem(this.config.cookieName);
                if (stored) {
                    const data = JSON.parse(stored);
                    const now = Date.now();
                    const expiry = data.timestamp + (this.config.cookieExpiry * 24 * 60 * 60 * 1000);
                    
                    if (now < expiry) {
                        console.log('🍪 Datos encontrados en localStorage');
                        // Restaurar la cookie desde localStorage
                        this.consent = {
                            necessary: data.necessary !== undefined ? data.necessary : true,
                            analytics: data.analytics || false,
                            marketing: data.marketing || false,
                            functional: data.functional || false
                        };
                        this.saveConsent(); // Recrear la cookie
                        return this.consent;
                    }
                }
            } catch (e) {
                console.warn('🍪 No se pudo leer localStorage:', e);
            }
            
            console.log('🍪 No se encontró consentimiento guardado');
            return null;
        }
        
        clearExpiredConsent() {
            // Limpiar cookie
            document.cookie = `${this.config.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            
            // Limpiar localStorage
            try {
                localStorage.removeItem(this.config.cookieName);
            } catch (e) {
                console.warn('🍪 No se pudo limpiar localStorage:', e);
            }
        }
        
        // ===== COMUNICACIÓN CON ENDPOINT =====
        
        async sendToEndpoint(action, data) {
            if (!this.config.endpoint) return;
            
            const payload = {
                action: action,
                domain: this.domain,
                consent: data,
                timestamp: Date.now(),
                version: this.version,
                userAgent: navigator.userAgent,
                url: window.location.href,
                referrer: document.referrer
            };
            
            try {
                console.log('🍪 Enviando al endpoint:', this.config.endpoint);
                console.log('🍪 Payload:', payload);
                
                const response = await fetch(this.config.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                    mode: 'cors'
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('🍪 Datos enviados correctamente:', result);
                } else {
                    console.warn('🍪 Error enviando al endpoint:', response.status);
                }
            } catch (error) {
                console.warn('🍪 Error enviando al endpoint:', error.message);
            }
        }
        
        // ===== EVENTOS PERSONALIZADOS =====
        
        dispatchConsentEvent() {
            const event = new CustomEvent('pxlCookieConsentUpdated', {
                detail: {
                    consent: this.consent,
                    timestamp: Date.now(),
                    domain: this.domain,
                    version: this.version
                }
            });
            
            window.dispatchEvent(event);
        }
        
        // ===== API PÚBLICA =====
        
        showPreferences() {
            this.openPreferences();
        }
        
        getConsent() {
            return { ...this.consent };
        }
        
        hasConsent(category) {
            return this.consent[category] === true;
        }
        
        revokeConsent() {
            this.rejectAll();
        }
        
        getStatus() {
            return {
                version: this.version,
                domain: this.domain,
                endpoint: this.config.endpoint,
                consent: this.consent
            };
        }
        
        // Método público para forzar actualización de checkboxes
        forceUpdateCheckboxes() {
            console.log('🍪 Forzando actualización de checkboxes...');
            this.updateCheckboxStates();
        }
    }
    
    // ===== INICIALIZACIÓN GLOBAL =====
    
    // Esperar a que el DOM esté listo para evitar conflictos
    function initCookieConsent() {
        // Crear instancia global
        window.PxlCookieConsent = new UniversalCookieConsent();
        
        // ===== FUNCIONES GLOBALES DE CONVENIENCIA =====
        
        window.showCookiePreferences = function() {
            if (window.PxlCookieConsent) {
                window.PxlCookieConsent.showPreferences();
            }
        };
        
        window.hasCookieConsent = function(category) {
            if (window.PxlCookieConsent) {
                return window.PxlCookieConsent.hasConsent(category);
            }
            return false;
        };
        
        window.getCookieConsentStatus = function() {
            if (window.PxlCookieConsent) {
                return window.PxlCookieConsent.getStatus();
            }
            return null;
        };
        
        window.forceUpdateCookieCheckboxes = function() {
            if (window.PxlCookieConsent) {
                window.PxlCookieConsent.forceUpdateCheckboxes();
            }
        };
        
        // Event listener global para cambios de consentimiento
        window.addEventListener('pxlCookieConsentUpdated', function(event) {
            console.log('🍪 Consentimiento actualizado:', event.detail);
        });
        
        console.log('🍪 Universal Cookie Consent System v2.10 cargado correctamente');
    }
    
    // Inicializar cuando el DOM esté listo y Webflow haya cargado
    function waitForWebflow() {
        // Esperar a que Webflow esté listo
        if (window.Webflow && window.Webflow.ready) {
            window.Webflow.ready(function() {
                console.log('🍪 Webflow está listo, inicializando cookies consent...');
                initCookieConsent();
            });
        } else if (document.readyState === 'complete') {
            // Si Webflow no está disponible pero el DOM está completo
            setTimeout(initCookieConsent, 1000);
        } else {
            // Esperar un poco más
            setTimeout(waitForWebflow, 100);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForWebflow);
    } else {
        waitForWebflow();
    }
    
})();
