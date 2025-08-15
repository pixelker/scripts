/**
 * Universal Cookie Consent System 2.8
 * Copyright 2025 Pixelker
 * Released under the MIT License
 * Released on: August 15, 2025
 */

(function() {
    'use strict';
    
    class UniversalCookieConsent {
        constructor() {
            this.version = '2.8';
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
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
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
            
            // Actualizar estado inicial de checkboxes
            setTimeout(() => this.updateCheckboxStates(), 200);
            
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
            if (!wrapper) return;
            
            // Buscar el input real dentro del wrapper
            const input = wrapper.querySelector('input[type="checkbox"]');
            const customCheckbox = wrapper.querySelector('.w-checkbox-input');
            
            if (input) {
                // Remover listeners previos
                const newInput = input.cloneNode(true);
                input.parentNode.replaceChild(newInput, input);
                
                // Añadir nuevo listener al input
                newInput.addEventListener('change', (e) => {
                    this.consent[category] = e.target.checked;
                    
                    // Actualizar visual del custom checkbox
                    if (customCheckbox) {
                        if (e.target.checked) {
                            customCheckbox.classList.add('w--redirected-checked');
                        } else {
                            customCheckbox.classList.remove('w--redirected-checked');
                        }
                    }
                    
                    console.log(`🍪 Checkbox ${category} cambiado:`, e.target.checked);
                });
            }
            
            // También añadir listener al wrapper para clicks en el label
            wrapper.addEventListener('click', (e) => {
                // Solo procesar si no es el input mismo
                if (e.target.tagName !== 'INPUT') {
                    e.preventDefault();
                    if (input) {
                        input.checked = !input.checked;
                        input.dispatchEvent(new Event('change'));
                    }
                }
            });
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
                // Guardar estado actual del dark mode
                this.darkModeState = document.documentElement.classList.contains('dark-mode');
                
                preferences.style.display = 'block';
                preferences.classList.add('pxl-cookies-modal-active');
                
                // Añadir clase para prevenir cambios de dark mode
                document.documentElement.classList.add('pxl-cookies-preferences-open');
                
                this.disableScroll();
                
                // Forzar actualización de checkboxes después de mostrar
                setTimeout(() => this.updateCheckboxStates(), 50);
                
                console.log('🍪 Panel de preferencias abierto');
            }
        }
        
        closePreferences() {
            const preferences = document.querySelector(this.config.selectors.preferences);
            if (preferences) {
                preferences.style.display = 'none';
                preferences.classList.remove('pxl-cookies-modal-active');
                
                // Remover clase de prevención
                document.documentElement.classList.remove('pxl-cookies-preferences-open');
                
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
            
            // Actualizar inputs reales y checkboxes visuales
            this.updateWebflowCheckbox(selectors.checkboxAnalytics, this.consent.analytics);
            this.updateWebflowCheckbox(selectors.checkboxMarketing, this.consent.marketing);
            this.updateWebflowCheckbox(selectors.checkboxFunctional, this.consent.functional);
            
            console.log('🍪 Estados de checkboxes actualizados:', this.consent);
        }
        
        updateWebflowCheckbox(selector, isChecked) {
            const wrapper = document.querySelector(selector);
            if (!wrapper) return;
            
            const input = wrapper.querySelector('input[type="checkbox"]');
            const customCheckbox = wrapper.querySelector('.w-checkbox-input');
            
            if (input) {
                input.checked = isChecked;
            }
            
            if (customCheckbox) {
                if (isChecked) {
                    customCheckbox.classList.add('w--redirected-checked');
                } else {
                    customCheckbox.classList.remove('w--redirected-checked');
                }
            }
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
        
        // Event listener global para cambios de consentimiento
        window.addEventListener('pxlCookieConsentUpdated', function(event) {
            console.log('🍪 Consentimiento actualizado:', event.detail);
        });
        
        console.log('🍪 Universal Cookie Consent System v2.8.0 cargado correctamente');
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCookieConsent);
    } else {
        // DOM ya está listo
        initCookieConsent();
    }
    
})();
