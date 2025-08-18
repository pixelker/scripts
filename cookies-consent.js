/**
 * Universal Cookie Consent System 3.1
 * Copyright 2025 Pixelker
 * Released under the MIT License
 * Released on: August 18, 2025
 */

(function() {
    'use strict';
    
    class UniversalCookieConsent {
        constructor() {
            this.version = '3.1';
            this.config = {
                // Endpoint dinámico con fallback inteligente
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
                cookieExpiry: 365,
                
                // Estados por defecto
                defaultConsent: {
                    necessary: true,
                    analytics: false,
                    marketing: false,
                    functional: false
                }
            };
            
            // Estado de la aplicación
            this.consent = { ...this.config.defaultConsent };
            this.domain = window.location.hostname;
            this.scrollPosition = 0;
            
            // Cache para elementos encontrados
            this.checkboxElements = {
                analytics: null,
                marketing: null,
                functional: null
            };
            
            this.log(`🍪 Universal Cookie Consent v${this.version} iniciado`);
            this.log(`🍪 Dominio: ${this.domain}`);
            this.log(`🍪 Endpoint: ${this.config.endpoint}`);
            
            this.init();
        }
        
        log(message, type = 'info') {
            if (typeof console[type] === 'function') {
                console[type](message);
            } else {
                console.log(message);
            }
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
                    this.log(`🍪 Endpoint personalizado encontrado: ${customEndpoint}`);
                    return customEndpoint;
                }
            }
            
            // Por defecto: mismo dominio + /kv/cookies
            const defaultEndpoint = `${protocol}//${hostname}/kv/cookies`;
            this.log(`🍪 Endpoint por defecto: ${defaultEndpoint}`);
            return defaultEndpoint;
        }
        
        // ===== INICIALIZACIÓN =====
        
        async init() {
            // Configurar Google Consent Mode v2 ANTES de todo
            this.setupConsentMode();
            
            // Verificar consentimiento existente
            const savedConsent = this.getSavedConsent();
            if (savedConsent) {
                this.consent = savedConsent;
                this.applyConsent();
                this.hideBanner();
                this.log('🍪 Consentimiento existente encontrado: ' + JSON.stringify(this.consent));
            } else {
                // Primera visita o consentimiento expirado
                this.showBanner();
                this.log('🍪 Primera visita - mostrando banner');
            }
            
            // Configurar event listeners cuando DOM esté listo
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => this.setupEventListeners(), 100);
                });
            } else {
                setTimeout(() => this.setupEventListeners(), 100);
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
            
            this.log('🍪 Google Consent Mode v2 configurado');
        }
        
        updateConsentMode() {
            if (typeof gtag === 'undefined') {
                this.log('🍪 gtag no disponible - asegúrate de que GA4 esté cargado', 'warn');
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
            
            this.log('🍪 Consent Mode actualizado: ' + JSON.stringify(this.consent));
        }
        
        // ===== APLICACIÓN DE CONSENTIMIENTO =====
        
        applyConsent() {
            this.log('🍪 Aplicando consentimiento: ' + JSON.stringify(this.consent));
            
            // Actualizar Consent Mode
            this.updateConsentMode();
            
            // Ejecutar callbacks personalizados si existen
            this.executeCustomCallbacks();
            
            // Actualizar visualmente los checkboxes
            this.updateCheckboxStates();
            
            // Disparar evento personalizado
            this.dispatchConsentEvent();
            
            // Enviar al endpoint
            this.sendToEndpoint('consent_updated', this.consent);
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
            document.body.style.height = '100%';
        }
        
        enableScroll() {
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('position');
            document.body.style.removeProperty('top');
            document.body.style.removeProperty('width');
            document.body.style.removeProperty('height');
            
            if (this.scrollPosition !== undefined) {
                window.scrollTo(0, this.scrollPosition);
            }
        }
        
        // ===== GESTIÓN DE UI MEJORADA =====
        
        setupEventListeners() {
            const { selectors } = this.config;
            
            this.log('🍪 Configurando event listeners...');
            
            try {
                // Detectar y cachear elementos de checkbox
                this.detectWebflowCheckboxes();
                
                // Configurar botones principales
                this.setupButtonListeners();
                
                // Configurar checkboxes específicos
                this.setupCheckboxListeners();
                
                // Actualizar estado inicial de checkboxes
                setTimeout(() => {
                    this.updateCheckboxStates();
                }, 200);
                
                this.log('🍪 Event listeners configurados');
                
            } catch (error) {
                this.log(`Error configurando event listeners: ${error.message}`, 'error');
            }
        }
        
        detectWebflowCheckboxes() {
            const categories = ['analytics', 'marketing', 'functional'];
            
            categories.forEach(category => {
                const selector = this.config.selectors[`checkbox${category.charAt(0).toUpperCase() + category.slice(1)}`];
                const wrapper = document.querySelector(selector);
                
                if (wrapper) {
                    this.log(`🍪 Detectando estructura para ${category}...`);
                    
                    // Estrategia 1: Buscar input directo dentro del wrapper
                    let input = wrapper.querySelector('input[type="checkbox"]');
                    let customCheckbox = wrapper.querySelector('.w-checkbox-input');
                    
                    // Estrategia 2: Buscar input hermano
                    if (!input) {
                        input = wrapper.parentElement?.querySelector('input[type="checkbox"]');
                        customCheckbox = wrapper.parentElement?.querySelector('.w-checkbox-input');
                    }
                    
                    // Estrategia 3: Buscar input en contenedor padre
                    if (!input) {
                        const container = wrapper.closest('.w-form, .form-block, .checkbox-wrapper');
                        if (container) {
                            input = container.querySelector('input[type="checkbox"]');
                            customCheckbox = container.querySelector('.w-checkbox-input');
                        }
                    }
                    
                    // Estrategia 4: Si el wrapper es directamente el checkbox visual
                    if (!customCheckbox && wrapper.classList.contains('w-checkbox-input')) {
                        customCheckbox = wrapper;
                        input = wrapper.parentElement?.querySelector('input[type="checkbox"]');
                    }
                    
                    this.checkboxElements[category] = {
                        wrapper: wrapper,
                        input: input,
                        customCheckbox: customCheckbox
                    };
                    
                    this.log(`🍪 ${category}: input=${!!input}, customCheckbox=${!!customCheckbox}`);
                    
                    if (input) {
                        this.log(`🍪 Input encontrado para ${category}: ${input.tagName}${input.id ? '#' + input.id : ''}`);
                    } else {
                        this.log(`🍪 No se encontró input para ${category}`, 'warn');
                    }
                } else {
                    this.log(`🍪 No se encontró wrapper para ${category}`, 'warn');
                }
            });
        }
        
        setupButtonListeners() {
            const { selectors } = this.config;
            
            // Usar event delegation para mejor compatibilidad
            document.addEventListener('click', (e) => {
                const target = e.target.closest('[pxl-cookies-consent]');
                if (!target) return;
                
                const action = target.getAttribute('pxl-cookies-consent');
                e.preventDefault();
                e.stopPropagation();
                
                switch (action) {
                    case 'allow':
                        this.acceptAll();
                        this.closePreferences();
                        break;
                    case 'deny':
                        this.rejectAll();
                        this.closePreferences();
                        break;
                    case 'open-preferences':
                        this.openPreferences();
                        break;
                    case 'save-preferences':
                        this.saveCustomConfig();
                        this.closePreferences();
                        break;
                    case 'close':
                        this.closePreferences();
                        break;
                }
            });
        }
        
        setupCheckboxListeners() {
            const categories = ['analytics', 'marketing', 'functional'];
            
            categories.forEach(category => {
                const elements = this.checkboxElements[category];
                if (!elements) return;
                
                // Listener en el input real (si existe)
                if (elements.input) {
                    elements.input.addEventListener('change', (e) => {
                        this.consent[category] = e.target.checked;
                        this.updateWebflowCheckboxVisual(elements.customCheckbox, e.target.checked);
                        this.log(`🍪 Checkbox ${category} cambiado a: ${e.target.checked}`);
                    });
                }
                
                // Listener en el checkbox visual (para casos donde no hay input real)
                if (elements.customCheckbox) {
                    elements.customCheckbox.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Togglear el estado
                        this.consent[category] = !this.consent[category];
                        
                        // Actualizar input real si existe
                        if (elements.input) {
                            elements.input.checked = this.consent[category];
                        }
                        
                        // Actualizar visual
                        this.updateWebflowCheckboxVisual(elements.customCheckbox, this.consent[category]);
                        
                        this.log(`🍪 Checkbox visual ${category} cambiado a: ${this.consent[category]}`);
                    });
                }
                
                // Listener en el wrapper como fallback
                if (elements.wrapper && !elements.input && !elements.customCheckbox) {
                    elements.wrapper.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        this.consent[category] = !this.consent[category];
                        this.updateWebflowCheckboxVisual(elements.wrapper, this.consent[category]);
                        
                        this.log(`🍪 Checkbox wrapper ${category} cambiado a: ${this.consent[category]}`);
                    });
                }
            });
        }
        
        updateWebflowCheckboxVisual(element, isChecked) {
            if (!element) return;
            
            if (isChecked) {
                element.classList.add('w--redirected-checked');
                element.setAttribute('data-w-redirected', 'true');
            } else {
                element.classList.remove('w--redirected-checked');
                element.setAttribute('data-w-redirected', 'false');
            }
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
            this.updateCheckboxStates();
            
            this.sendToEndpoint('accept_all', this.consent);
            this.log('🍪 Usuario aceptó todas las cookies');
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
            this.log('🍪 Usuario rechazó cookies opcionales');
        }
        
        saveCustomConfig() {
            // Leer estado directamente del objeto consent que se actualiza en tiempo real
            const newConsent = {
                necessary: true,
                analytics: this.consent.analytics,
                marketing: this.consent.marketing,
                functional: this.consent.functional
            };
            
            // Solo actualizar si hay cambios
            let hasChanges = false;
            Object.keys(newConsent).forEach(key => {
                if (this.consent[key] !== newConsent[key]) {
                    hasChanges = true;
                }
            });
            
            this.consent = newConsent;
            
            this.saveConsent();
            this.applyConsent();
            this.hideBanner();
            
            this.sendToEndpoint('custom_config', this.consent);
            this.log('🍪 Configuración personalizada guardada: ' + JSON.stringify(this.consent));
        }
        
        openPreferences() {
            const preferences = document.querySelector(this.config.selectors.preferences);
            if (preferences) {
                // Guardar estado original para restaurar después
                this.originalBodyClasses = document.body.className;
                this.originalHtmlClasses = document.documentElement.className;
                
                preferences.style.display = 'block';
                preferences.classList.add('pxl-cookies-modal-active');
                
                this.disableScroll();
                
                // Actualizar checkboxes después de mostrar
                setTimeout(() => this.updateCheckboxStates(), 100);
                
                this.log('🍪 Panel de preferencias abierto');
            }
        }
        
        closePreferences() {
            const preferences = document.querySelector(this.config.selectors.preferences);
            if (preferences) {
                preferences.style.display = 'none';
                preferences.classList.remove('pxl-cookies-modal-active');
                
                // Restaurar clases originales
                if (this.originalBodyClasses !== undefined) {
                    document.body.className = this.originalBodyClasses;
                }
                if (this.originalHtmlClasses !== undefined) {
                    document.documentElement.className = this.originalHtmlClasses;
                }
                
                this.enableScroll();
                this.log('🍪 Panel de preferencias cerrado');
            }
        }
        
        showBanner() {
            const banner = document.querySelector(this.config.selectors.banner);
            if (banner) {
                banner.style.display = 'block';
                banner.classList.add('pxl-cookies-banner-active');
                this.log('🍪 Banner mostrado');
            }
        }
        
        hideBanner() {
            const banner = document.querySelector(this.config.selectors.banner);
            if (banner) {
                banner.style.display = 'none';
                banner.classList.remove('pxl-cookies-banner-active');
                this.log('🍪 Banner ocultado');
            }
        }
        
        updateCheckboxStates() {
            this.log('🍪 Actualizando checkboxes con estado: ' + JSON.stringify(this.consent));
            
            const categories = ['analytics', 'marketing', 'functional'];
            
            categories.forEach(category => {
                const elements = this.checkboxElements[category];
                if (!elements) return;
                
                const isChecked = this.consent[category];
                
                // Actualizar input real
                if (elements.input) {
                    elements.input.checked = isChecked;
                }
                
                // Actualizar checkbox visual
                if (elements.customCheckbox) {
                    this.updateWebflowCheckboxVisual(elements.customCheckbox, isChecked);
                }
                
                // Fallback al wrapper
                if (!elements.input && !elements.customCheckbox && elements.wrapper) {
                    this.updateWebflowCheckboxVisual(elements.wrapper, isChecked);
                }
                
                this.log(`🍪 Checkbox ${category} actualizado a: ${isChecked}`);
            });
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
            
            // Cookie con configuración optimizada
            const cookieString = `${this.config.cookieName}=${encodeURIComponent(JSON.stringify(consentData))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
            
            document.cookie = cookieString;
            
            // Backup en localStorage
            try {
                localStorage.setItem(this.config.cookieName, JSON.stringify(consentData));
            } catch (e) {
                this.log(`No se pudo guardar en localStorage: ${e.message}`, 'warn');
            }
            
            this.log(`🍪 Consentimiento guardado - expira en ${this.config.cookieExpiry} días`);
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
                            this.log('🍪 Cookie encontrada y válida');
                            return {
                                necessary: data.necessary !== undefined ? data.necessary : true,
                                analytics: data.analytics || false,
                                marketing: data.marketing || false,
                                functional: data.functional || false
                            };
                        } else {
                            this.log('🍪 Cookie expirada');
                            this.clearExpiredConsent();
                            return null;
                        }
                    } catch (e) {
                        this.log(`Error parsing cookie: ${e.message}`, 'error');
                        this.clearExpiredConsent();
                        return null;
                    }
                }
            }
            
            // Fallback a localStorage
            try {
                const stored = localStorage.getItem(this.config.cookieName);
                if (stored) {
                    const data = JSON.parse(stored);
                    const now = Date.now();
                    const expiry = data.timestamp + (this.config.cookieExpiry * 24 * 60 * 60 * 1000);
                    
                    if (now < expiry) {
                        this.log('🍪 Datos encontrados en localStorage');
                        // Restaurar la cookie
                        this.consent = {
                            necessary: data.necessary !== undefined ? data.necessary : true,
                            analytics: data.analytics || false,
                            marketing: data.marketing || false,
                            functional: data.functional || false
                        };
                        this.saveConsent();
                        return this.consent;
                    }
                }
            } catch (e) {
                this.log(`Error leyendo localStorage: ${e.message}`, 'warn');
            }
            
            this.log('🍪 No se encontró consentimiento guardado');
            return null;
        }
        
        clearExpiredConsent() {
            // Limpiar cookie
            document.cookie = `${this.config.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            
            // Limpiar localStorage
            try {
                localStorage.removeItem(this.config.cookieName);
            } catch (e) {
                this.log(`Error limpiando localStorage: ${e.message}`, 'warn');
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
                this.log(`🍪 Enviando al endpoint: ${this.config.endpoint}`);
                this.log(`🍪 Payload: ${JSON.stringify(payload)}`);
                
                const response = await fetch(this.config.endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    mode: 'cors'
                });
                
                if (response.ok) {
                    const result = await response.json();
                    this.log('🍪 Datos enviados correctamente: ' + JSON.stringify(result));
                } else {
                    this.log(`🍪 Error enviando al endpoint: ${response.status}`, 'warn');
                }
            } catch (error) {
                this.log(`🍪 Error enviando al endpoint: ${error.message}`, 'warn');
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
            this.log('🍪 Consentimiento actualizado: ' + JSON.stringify(event.detail));
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
                consent: this.consent,
                checkboxElements: this.checkboxElements
            };
        }
        
        forceUpdateCheckboxes() {
            this.log('🍪 Forzando actualización de checkboxes...');
            this.updateCheckboxStates();
        }
    }
    
    // ===== INICIALIZACIÓN GLOBAL =====
    
    function initCookieConsent() {
        if (window.PxlCookieConsent) {
            console.log('⚠️ Cookie consent ya inicializado');
            return;
        }
        
        window.PxlCookieConsent = new UniversalCookieConsent();
        
        // API global simplificada
        window.showCookiePreferences = () => window.PxlCookieConsent?.showPreferences();
        window.hasCookieConsent = (category) => window.PxlCookieConsent?.hasConsent(category) || false;
        window.getCookieConsentStatus = () => window.PxlCookieConsent?.getStatus() || null;
        window.forceUpdateCookieCheckboxes = () => window.PxlCookieConsent?.forceUpdateCheckboxes();
        
        console.log('🍪 Universal Cookie Consent System v3.1 cargado correctamente');
    }
    
    // Inicialización inmediata si DOM está listo, sino esperar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initCookieConsent, 100));
    } else {
        setTimeout(initCookieConsent, 100);
    }
    
})();
