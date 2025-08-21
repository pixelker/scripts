/**
 * Universal Cookie Consent System 4.4
 * Copyright 2025 Pixelker
 * Released under the MIT License
 * Released on: August 18, 2025
 */

(function() {
    'use strict';
    
    class UniversalCookieConsent {
        constructor() {
            this.version = '4.4';
            this.config = {
                // Endpoint dinámico con fallback inteligente
                endpoint: this.buildEndpoint(),
                fallbackEndpoints: this.buildFallbackEndpoints(),
                
                // Configuración de performance
                performance: {
                    maxInitTime: 500,
                    healthCheckInterval: 300000,
                    cacheExpiry: 3600000,
                    maxRetries: 3
                },
                
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
            this.webflowSwitchers = new Map(); // Cache de switchers detectados
            
            // Debug mode
            this.debug = this.isDebugMode();
            
            this.log(`🍪 Universal Cookie Consent v.${this.version} iniciado`);
            this.log(`🍪 Dominio: ${this.domain}`);
            this.log(`🍪 Endpoint: ${this.config.endpoint}`);
            
            this.init();
        }
        
        // ===== UTILIDADES Y DEBUGGING =====
        
        isDebugMode() {
            return window.location.hostname === 'localhost' || 
                   window.location.search.includes('debug=true') ||
                   window.location.search.includes('pxl-debug=true');
        }
        
        log(message, type = 'info') {
            if (!this.debug) return;
            const timestamp = new Date().toISOString();
            console[type](`[${timestamp}] ${message}`);
        }
        
        // ===== CONSTRUCCIÓN DINÁMICA DE ENDPOINTS =====
        
        buildEndpoint() {
            const protocol = window.location.protocol;
            const hostname = window.location.hostname;
            
            // 1. Buscar atributo personalizado en el script
            const scripts = document.querySelectorAll('script[src*="consent"]');
            for (let script of scripts) {
                const customEndpoint = script.getAttribute('pxl-consent-endpoint');
                if (customEndpoint) {
                    this.log(`🍪 Endpoint personalizado encontrado: ${customEndpoint}`);
                    return customEndpoint;
                }
            }
            
            // 2. Buscar en localStorage (para persistencia)
            try {
                const savedEndpoint = localStorage.getItem('pxl_consent_endpoint');
                if (savedEndpoint) {
                    this.log(`🍪 Endpoint desde localStorage: ${savedEndpoint}`);
                    return savedEndpoint;
                }
            } catch (e) {
                // localStorage no disponible
            }
            
            // 3. Por defecto: mismo dominio + /kv/cookies
            const defaultEndpoint = `${protocol}//${hostname}/kv/cookies`;
            this.log(`🍪 Endpoint por defecto: ${defaultEndpoint}`);
            return defaultEndpoint;
        }
        
        buildFallbackEndpoints() {
            const primary = this.buildEndpoint();
            const fallbacks = [];
            
            const defaultEndpoint = `${window.location.protocol}//${window.location.hostname}/kv/cookies`;
            if (primary !== defaultEndpoint) {
                fallbacks.push(defaultEndpoint);
            }
            
            const backupDomains = [
                'cookies-api.yourdomain.com',
                'consent.pixelker.com'
            ];
            
            backupDomains.forEach(domain => {
                fallbacks.push(`https://${domain}/kv/cookies`);
            });
            
            this.log(`🍪 Endpoints de fallback configurados: ${fallbacks.length}`);
            return fallbacks;
        }
        
        // ===== INICIALIZACIÓN OPTIMIZADA =====
        
        async init() {
            const initStartTime = performance.now();
            
            try {
                // Configurar Google Consent Mode v2 ANTES de todo
                this.setupConsentMode();
                
                // Verificar consentimiento existente
                const savedConsent = this.getSavedConsent();
                if (savedConsent) {
                    this.consent = savedConsent;
                    this.log('🍪 Consentimiento existente encontrado:', this.consent);
                    this.hideBanner();
                } else {
                    // Primera visita o consentimiento expirado
                    this.showBanner();
                    this.log('🍪 Primera visita - mostrando banner');
                }
                
                // Configurar event listeners cuando DOM esté listo
                await this.waitForDOM();
                
                // Esperar un poco más para que Webflow termine de renderizar
                await this.waitForWebflow();
                
                this.setupEventListeners();
                
                // Aplicar consentimiento DESPUÉS de setupEventListeners
                if (savedConsent) {
                    this.applyConsent();
                }
                
                const initTime = performance.now() - initStartTime;
                this.log(`✅ Inicialización completa en ${initTime.toFixed(2)}ms`);
                
                // Disparar evento de inicialización
                this.dispatchCustomEvent('pxlCookieConsentInitialized', {
                    version: this.version,
                    initTime: initTime,
                    consent: this.consent
                });
                
            } catch (error) {
                this.log(`❌ Error en inicialización: ${error.message}`, 'error');
                
                // Fallback a modo básico
                this.initBasicMode();
            }
        }
        
        async waitForDOM() {
            return new Promise((resolve) => {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', resolve);
                } else {
                    // DOM ya está listo, pequeño delay para otros scripts
                    setTimeout(resolve, 100);
                }
            });
        }
        
        async waitForWebflow() {
            return new Promise((resolve) => {
                // Esperar a que Webflow termine de inicializar
                if (window.Webflow) {
                    // Si Webflow ya está cargado, esperar un poco más para el rendering
                    setTimeout(resolve, 300);
                } else {
                    // Esperar a que Webflow se cargue
                    let attempts = 0;
                    const checkWebflow = () => {
                        attempts++;
                        if (window.Webflow || attempts > 10) {
                            setTimeout(resolve, 300);
                        } else {
                            setTimeout(checkWebflow, 100);
                        }
                    };
                    checkWebflow();
                }
            });
        }
        
        initBasicMode() {
            this.log('🔧 Inicializando en modo básico (fallback)', 'warn');
            
            this.setupConsentMode();
            
            const savedConsent = this.getSavedConsent();
            if (savedConsent) {
                this.consent = savedConsent;
                this.applyConsent();
                this.hideBanner();
            } else {
                this.showBanner();
            }
            
            // Event listeners básicos
            setTimeout(() => this.setupEventListeners(), 1000);
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
            
            this.log('🍪 Consent Mode actualizado:', this.consent);
        }
        
        // ===== APLICACIÓN DE CONSENTIMIENTO =====
        
        applyConsent() {
            this.log('🍪 Aplicando consentimiento:', this.consent);
            
            // Actualizar Consent Mode
            this.updateConsentMode();
            
            // Ejecutar callbacks personalizados si existen
            this.executeCustomCallbacks();
            
            // Actualizar visualmente los checkboxes/switchers
            this.updateWebflowElements();
            
            // Disparar evento personalizado
            this.dispatchConsentEvent();
            
            // Enviar al endpoint (con throttling)
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
        
        // ===== GESTIÓN DE UI OPTIMIZADA PARA WEBFLOW =====
        
        setupEventListeners() {
            const { selectors } = this.config;
            
            this.log('🍪 Configurando event listeners...');
            
            try {
                // Detectar y cachear switchers de Webflow
                this.detectWebflowSwitchers();
                
                // Primero actualizar los elementos con el estado guardado
                this.updateWebflowElements();
                
                // Usar event delegation para mejor performance
                document.addEventListener('click', this.handleGlobalClick.bind(this));
                
                // Configurar listeners específicos para switchers
                this.setupWebflowSwitcherListeners();
                
                // Actualizar estado después de configurar listeners
                setTimeout(() => {
                    this.updateWebflowElements();
                    this.forceWebflowRerender();
                }, 200);
                
                this.log('🍪 Event listeners configurados');
                
            } catch (error) {
                this.log(`Error configurando event listeners: ${error.message}`, 'error');
            }
        }
        
        // ===== DETECCIÓN INTELIGENTE DE SWITCHERS WEBFLOW =====
        
        detectWebflowSwitchers() {
            const { selectors } = this.config;
            const categories = [
                { selector: selectors.checkboxAnalytics, category: 'analytics' },
                { selector: selectors.checkboxMarketing, category: 'marketing' },
                { selector: selectors.checkboxFunctional, category: 'functional' }
            ];
            
            this.log('🍪 Iniciando detección de switchers...');
            
            categories.forEach(({ selector, category }) => {
                this.log(`🍪 Buscando elemento con selector: ${selector}`);
                const element = document.querySelector(selector);
                if (!element) {
                    this.log(`🍪 ❌ No se encontró elemento para ${category} con selector ${selector}`, 'warn');
                    return;
                }
                
                this.log(`🍪 ✅ Elemento encontrado para ${category}:`, element);
                
                // Detectar estructura de Webflow
                const switcherInfo = this.analyzeWebflowStructure(element, category);
                this.webflowSwitchers.set(category, switcherInfo);
                
                this.log(`🍪 Switcher ${category} configurado:`, switcherInfo);
            });
            
            this.log(`🍪 Detección completada. Switchers encontrados: ${this.webflowSwitchers.size}`);
        }
        
        analyzeWebflowStructure(element, category) {
            // Buscar input real
            let input = element;
            if (!input.matches('input[type="checkbox"]')) {
                input = element.querySelector('input[type="checkbox"]');
            }
            
            // Buscar wrapper de checkbox
            const wrapper = input ? input.closest('.w-checkbox') : null;
            
            // Buscar elemento visual
            const visual = wrapper ? wrapper.querySelector('.w-checkbox-input:not(input)') : null;
            
            // Detectar si es switcher vs checkbox
            const isSwitcher = wrapper && (
                wrapper.classList.contains('w-checkbox-switch') ||
                wrapper.querySelector('.w-checkbox-switch') ||
                visual && visual.classList.contains('w-checkbox-switch')
            );
            
            this.log(`🍪 Detectando estructura para ${category}...`);
            this.log(`🍪 ${category}: input=${!!input}, wrapper=${!!wrapper}, visual=${!!visual}, isSwitcher=${isSwitcher}`);
            
            if (input) {
                this.log(`🍪 Input encontrado para ${category}:`, input.tagName + (input.id ? '#' + input.id : ''));
            }
            
            return {
                input: input,
                wrapper: wrapper,
                visual: visual,
                isSwitcher: isSwitcher,
                isValid: !!input
            };
        }
        
        // ===== SETUP DE LISTENERS PARA SWITCHERS =====
        
        setupWebflowSwitcherListeners() {
            for (const [category, switcherInfo] of this.webflowSwitchers.entries()) {
                if (!switcherInfo.isValid) continue;
                
                this.setupSingleWebflowSwitcher(category, switcherInfo);
            }
        }
        
        setupSingleWebflowSwitcher(category, switcherInfo) {
            const { input, wrapper, visual } = switcherInfo;
            
            // Establecer el estado inicial
            input.checked = this.consent[category];
            
            // Actualizar el elemento visual
            this.updateWebflowSwitcherVisual(switcherInfo, this.consent[category]);
            
            // Event listener optimizado para input real
            const handleInputChange = (e) => {
                this.consent[category] = e.target.checked;
                this.updateWebflowSwitcherVisual(switcherInfo, e.target.checked);
                this.log(`🍪 Checkbox visual ${category} cambiado a: ${e.target.checked}`);
            };
            
            // Limpiar listeners previos
            input.removeEventListener('change', handleInputChange);
            input.addEventListener('change', handleInputChange);
            
            // Manejar clicks en elementos visuales
            if (visual) {
                const handleVisualClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Toggle el input real
                    input.checked = !input.checked;
                    
                    // Disparar evento change
                    const changeEvent = new Event('change', { bubbles: true });
                    input.dispatchEvent(changeEvent);
                };
                
                visual.style.cursor = 'pointer';
                visual.removeEventListener('click', handleVisualClick);
                visual.addEventListener('click', handleVisualClick);
            }
            
            // También manejar clicks en el wrapper
            if (wrapper && wrapper !== visual) {
                const handleWrapperClick = (e) => {
                    // Solo si no se clickeó directamente el input o visual
                    if (e.target === input || e.target === visual) return;
                    
                    e.preventDefault();
                    e.stopPropagation();
                    
                    input.checked = !input.checked;
                    const changeEvent = new Event('change', { bubbles: true });
                    input.dispatchEvent(changeEvent);
                };
                
                wrapper.style.cursor = 'pointer';
                wrapper.removeEventListener('click', handleWrapperClick);
                wrapper.addEventListener('click', handleWrapperClick);
            }
            
            this.log(`🍪 Switcher ${category} configurado, estado inicial: ${this.consent[category]}`);
        }
        
        // ===== ACTUALIZACIÓN VISUAL DE SWITCHERS =====
        
        updateWebflowSwitcherVisual(switcherInfo, isChecked) {
            const { input, wrapper, visual, isSwitcher } = switcherInfo;
            
            if (!input) return;
            
            // Actualizar input real
            input.checked = isChecked;
            
            // Actualizar clases de Webflow
            if (isChecked) {
                input.classList.add('w--redirected-checked');
                input.setAttribute('data-w-redirected', 'true');
                
                if (visual) {
                    visual.classList.add('w--redirected-checked');
                    visual.setAttribute('data-w-redirected', 'true');
                }
                
                if (wrapper) {
                    wrapper.classList.add('w--redirected-checked');
                    wrapper.setAttribute('data-w-redirected', 'true');
                }
            } else {
                input.classList.remove('w--redirected-checked');
                input.setAttribute('data-w-redirected', 'false');
                
                if (visual) {
                    visual.classList.remove('w--redirected-checked');
                    visual.setAttribute('data-w-redirected', 'false');
                }
                
                if (wrapper) {
                    wrapper.classList.remove('w--redirected-checked');
                    wrapper.setAttribute('data-w-redirected', 'false');
                }
            }
            
            // Para switchers, aplicar estados adicionales
            if (isSwitcher) {
                if (isChecked) {
                    if (visual) visual.classList.add('w-checkbox-switch--checked');
                    if (wrapper) wrapper.classList.add('w-checkbox-switch--checked');
                } else {
                    if (visual) visual.classList.remove('w-checkbox-switch--checked');
                    if (wrapper) wrapper.classList.remove('w-checkbox-switch--checked');
                }
            }
        }
        
        // ===== ACTUALIZACIÓN GLOBAL DE ELEMENTOS WEBFLOW =====
        
        updateWebflowElements() {
            this.log('🍪 Actualizando elementos Webflow con estado:', this.consent);
            this.log(`🍪 Switchers disponibles: ${Array.from(this.webflowSwitchers.keys()).join(', ')}`);
            
            // Usar requestAnimationFrame para mejor performance
            requestAnimationFrame(() => {
                let updated = 0;
                for (const [category, switcherInfo] of this.webflowSwitchers.entries()) {
                    if (switcherInfo.isValid) {
                        this.log(`🍪 Actualizando ${category} a estado: ${this.consent[category]}`);
                        this.updateWebflowSwitcherVisual(switcherInfo, this.consent[category]);
                        this.log(`🍪 ✅ Elemento ${category} actualizado a: ${this.consent[category]}`);
                        updated++;
                    } else {
                        this.log(`🍪 ❌ Switcher ${category} no es válido`, 'warn');
                    }
                }
                
                this.log(`🍪 Actualizados ${updated} elementos de ${this.webflowSwitchers.size} disponibles`);
                
                // Forzar re-render después de todas las actualizaciones
                setTimeout(() => {
                    this.forceWebflowRerender();
                    this.log('🍪 Re-render de Webflow completado');
                }, 50);
            });
        }
        
        // ===== FORCE WEBFLOW RE-RENDER =====
        
        forceWebflowRerender() {
            try {
                // 1. Trigger Webflow IX2 re-initialization
                if (window.Webflow && window.Webflow.require) {
                    const ix2 = window.Webflow.require('ix2');
                    if (ix2 && ix2.refresh) {
                        ix2.refresh();
                        this.log('🍪 Webflow IX2 refreshed');
                    }
                }
                
                // 2. Trigger Webflow form refresh
                if (window.Webflow && window.Webflow.forms) {
                    window.Webflow.forms.refresh();
                    this.log('🍪 Webflow forms refreshed');
                }
                
                // 3. Trigger generic Webflow refresh
                if (window.Webflow && window.Webflow.refresh) {
                    window.Webflow.refresh();
                    this.log('🍪 Webflow refreshed');
                }
                
                // 4. Force CSS reflow
                this.forceReflow();
                
                this.log('🍪 Webflow re-render forzado completado');
                
            } catch (error) {
                this.log(`Error en Webflow re-render: ${error.message}`, 'warn');
            }
        }
        
        forceReflow() {
            // Forzar reflow para que los cambios CSS se apliquen
            for (const [category, switcherInfo] of this.webflowSwitchers.entries()) {
                if (switcherInfo.visual) {
                    // Trigger reflow reading offsetHeight
                    const height = switcherInfo.visual.offsetHeight;
                    
                    // Force repaint
                    switcherInfo.visual.style.transform = 'translateZ(0)';
                    setTimeout(() => {
                        switcherInfo.visual.style.transform = '';
                    }, 10);
                }
            }
        }
        
        // ===== CONTROL DE EVENTOS GLOBALES =====
        
        handleGlobalClick(event) {
            const target = event.target.closest('[pxl-cookies-consent]');
            if (!target) return;
            
            const action = target.getAttribute('pxl-cookies-consent');
            event.preventDefault();
            event.stopPropagation();
            
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
            this.updateWebflowElements();
            
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
            // Leer estado de los inputs reales
            const newConsent = {
                necessary: true,
                analytics: false,
                marketing: false,
                functional: false
            };
            
            for (const [category, switcherInfo] of this.webflowSwitchers.entries()) {
                if (switcherInfo.isValid && switcherInfo.input) {
                    newConsent[category] = switcherInfo.input.checked;
                }
            }
            
            this.consent = newConsent;
            
            this.saveConsent();
            this.applyConsent();
            this.hideBanner();
            
            this.sendToEndpoint('custom_config', this.consent);
            this.log('🍪 Configuración personalizada guardada:', this.consent);
        }
        
        openPreferences() {
            const preferences = document.querySelector(this.config.selectors.preferences);
            if (preferences) {
                this.log('🍪 Abriendo panel de preferencias...');
                
                // Guardar estado original COMPLETO para restaurar después
                this.originalBodyState = {
                    className: document.body.className,
                    style: {
                        overflow: document.body.style.overflow,
                        position: document.body.style.position,
                        top: document.body.style.top,
                        width: document.body.style.width,
                        height: document.body.style.height
                    }
                };
                this.originalHtmlState = {
                    className: document.documentElement.className
                };
                
                // Mostrar modal
                preferences.style.display = 'block';
                preferences.classList.add('pxl-cookies-modal-active');
                
                // Aplicar scroll lock SIN modificar clases de color
                this.disableScrollPreserveStyles();
                
                // Actualizar switchers después de mostrar con delay adicional
                setTimeout(() => {
                    this.updateWebflowElements();
                    this.log('🍪 Elementos actualizados después de abrir preferencias');
                }, 150);
                
                this.log('🍪 Panel de preferencias abierto');
            }
        }
        
        closePreferences() {
            const preferences = document.querySelector(this.config.selectors.preferences);
            if (preferences) {
                this.log('🍪 Cerrando panel de preferencias...');
                
                preferences.style.display = 'none';
                preferences.classList.remove('pxl-cookies-modal-active');
                
                // Restaurar estado COMPLETO del body y html
                this.restoreOriginalStyles();
                
                this.log('🍪 Panel de preferencias cerrado');
            }
        }
        
        // ===== CONTROL DE SCROLL MEJORADO SIN AFECTAR COLORES =====
        
        disableScrollPreserveStyles() {
            this.scrollPosition = window.pageYOffset;
            
            // Solo modificar propiedades de posición, NO clases de color
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${this.scrollPosition}px`;
            document.body.style.width = '100%';
            document.body.style.height = '100%';
            
            // NO tocar className para preservar colores/temas
            this.log('🍪 Scroll deshabilitado preservando estilos');
        }
        
        restoreOriginalStyles() {
            // Restaurar clases originales EXACTAS
            if (this.originalBodyState) {
                document.body.className = this.originalBodyState.className;
                
                // Restaurar estilos originales
                Object.keys(this.originalBodyState.style).forEach(prop => {
                    if (this.originalBodyState.style[prop]) {
                        document.body.style[prop] = this.originalBodyState.style[prop];
                    } else {
                        document.body.style.removeProperty(prop);
                    }
                });
            }
            
            if (this.originalHtmlState) {
                document.documentElement.className = this.originalHtmlState.className;
            }
            
            // Restaurar posición de scroll
            if (this.scrollPosition !== undefined) {
                window.scrollTo(0, this.scrollPosition);
            }
            
            this.log('🍪 Estilos originales restaurados completamente');
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
        
        // ===== CONTROL DE SCROLL MEJORADO =====
        
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
        
        // ===== GESTIÓN DE ALMACENAMIENTO OPTIMIZADA =====
        
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
                // Guardar también endpoint personalizado si existe
                const customEndpoint = document.querySelector('script[pxl-consent-endpoint]')?.getAttribute('pxl-consent-endpoint');
                if (customEndpoint) {
                    localStorage.setItem('pxl_consent_endpoint', customEndpoint);
                }
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
        
        // ===== COMUNICACIÓN CON ENDPOINT OPTIMIZADA =====
        
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
                this.log(`🍪 Payload:`, payload);
                
                const response = await fetch(this.config.endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    mode: 'cors'
                });
                
                if (response.ok) {
                    const result = await response.json();
                    this.log(`✅ Datos enviados correctamente:`, result);
                } else {
                    this.log(`❌ Error enviando al endpoint: ${response.status}`, 'warn');
                }
            } catch (error) {
                this.log(`❌ Error enviando al endpoint: ${error.message}`, 'warn');
            }
        }
        
        // ===== EVENTOS PERSONALIZADOS =====
        
        dispatchConsentEvent() {
            this.dispatchCustomEvent('pxlCookieConsentUpdated', {
                consent: this.consent,
                timestamp: Date.now(),
                domain: this.domain,
                version: this.version
            });
        }
        
        dispatchCustomEvent(eventName, detail) {
            const event = new CustomEvent(eventName, { detail });
            window.dispatchEvent(event);
        }
        
        // ===== API PÚBLICA EXTENDIDA =====
        
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
                webflowSwitchers: Array.from(this.webflowSwitchers.keys())
            };
        }
        
        forceUpdateWebflowElements() {
            this.log('🍪 Forzando actualización de elementos Webflow...');
            this.updateWebflowElements();
        }
    }
    
    // ===== INICIALIZACIÓN GLOBAL OPTIMIZADA =====
    
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
        window.forceUpdateCookieCheckboxes = () => window.PxlCookieConsent?.forceUpdateWebflowElements();
        
        console.log(`🍪 Universal Cookie Consent System v.4.4 Enterprise cargado correctamente`);
    }
    
    // Inicialización inmediata si DOM está listo, sino esperar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initCookieConsent, 100));
    } else {
        setTimeout(initCookieConsent, 100);
    }
    
})();
