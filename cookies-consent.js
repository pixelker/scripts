/**
 * Universal Cookie Consent System 1.0
 * Copyright 2025 Pixelker
 * Released under the MIT License
 * Released on: August 15, 2025
 */

/*!
 * Universal Cookie Consent System - Fixed Version
 * Pixelker - Sistema de consentimiento de cookies universal
 * Compatible con Google Consent Mode v2, RGPD compliant
 * Versión: 1.1.0 - Corregido conflictos y switchers
 */

(function() {
  'use strict';

  class UniversalCookieConsent {
    constructor() {
      this.version = '1.1.0';
      this.config = {
        // Detectar endpoint desde atributo del script
        endpoint: this.detectEndpoint(),
        
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
        cookieExpiry: 120, // días
        
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
      this.isOnline = !!this.config.endpoint;
      
      // Evitar conflictos con otros scripts usando namespace único
      this.namespace = 'pxlCookieConsent_' + Date.now();
      
      console.log(`🍪 Universal Cookie Consent v${this.version} iniciado`);
      console.log(`🍪 Dominio: ${this.domain}`);
      console.log(`🍪 Endpoint: ${this.config.endpoint || 'Modo offline'}`);
      
      this.init();
    }
    
    // ===== DETECCIÓN DE CONFIGURACIÓN =====
    
    detectEndpoint() {
      const scripts = document.querySelectorAll('script[src*="consent"]');
      for (let script of scripts) {
        const endpoint = script.getAttribute('pxl-consent-endpoint');
        if (endpoint) {
          // Asegurar que el endpoint tiene la ruta correcta
          if (!endpoint.includes('/api/consent')) {
            return endpoint + '/api/consent';
          }
          return endpoint;
        }
      }
      return null;
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
        console.warn('🍪 gtag no disponible - asegúrate de que GA4 esté cargado en Webflow');
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
      
      // Actualizar Consent Mode (esto afectará a GA4/FB Pixel ya cargados por Webflow)
      this.updateConsentMode();
      
      // Ejecutar callbacks personalizados si existen
      this.executeCustomCallbacks();
      
      // Actualizar visualmente los switchers
      this.updateCheckboxStates();
      
      // Disparar evento personalizado
      this.dispatchConsentEvent();
      
      // Enviar al endpoint si está disponible
      if (this.isOnline) {
        this.sendToEndpoint('consent_updated', this.consent);
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
      console.log('🍪 Scroll desactivado');
    }
    
    enableScroll() {
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('position');
      document.body.style.removeProperty('top');
      document.body.style.removeProperty('width');
      
      if (this.scrollPosition !== undefined) {
        window.scrollTo(0, this.scrollPosition);
      }
      console.log('🍪 Scroll reactivado');
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
      
      this.addClickListener(selectors.checkboxAnalytics, () => {
        this.toggleCheckbox(selectors.checkboxAnalytics);
      });
      
      this.addClickListener(selectors.checkboxMarketing, () => {
        this.toggleCheckbox(selectors.checkboxMarketing);
      });
      
      this.addClickListener(selectors.checkboxFunctional, () => {
        this.toggleCheckbox(selectors.checkboxFunctional);
      });
    }
    
    toggleCheckbox(selector) {
      const checkbox = document.querySelector(selector);
      if (checkbox) {
        checkbox.classList.toggle('w--redirected-checked');
        console.log('🍪 Checkbox toggled:', selector, checkbox.classList.contains('w--redirected-checked'));
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
      
      if (this.isOnline) {
        this.sendToEndpoint('accept_all', this.consent);
      }
      
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
      
      if (this.isOnline) {
        this.sendToEndpoint('reject_all', this.consent);
      }
      
      console.log('🍪 Usuario rechazó cookies opcionales');
    }
    
    saveCustomConfig() {
      const { selectors } = this.config;
      
      this.consent = {
        necessary: true,
        analytics: document.querySelector(selectors.checkboxAnalytics)?.classList.contains('w--redirected-checked') || false,
        marketing: document.querySelector(selectors.checkboxMarketing)?.classList.contains('w--redirected-checked') || false,
        functional: document.querySelector(selectors.checkboxFunctional)?.classList.contains('w--redirected-checked') || false
      };
      
      this.saveConsent();
      this.applyConsent();
      this.hideBanner();
      
      if (this.isOnline) {
        this.sendToEndpoint('custom_config', this.consent);
      }
      
      console.log('🍪 Configuración personalizada guardada:', this.consent);
    }
    
    openPreferences() {
      const preferences = document.querySelector(this.config.selectors.preferences);
      if (preferences) {
        preferences.style.display = 'block';
        
        // Evitar conflictos con otros scripts añadiendo clase específica
        preferences.classList.add('pxl-cookies-modal-active');
        
        this.disableScroll();
        this.updateCheckboxStates();
        console.log('🍪 Panel de preferencias abierto');
      }
    }
    
    closePreferences() {
      const preferences = document.querySelector(this.config.selectors.preferences);
      if (preferences) {
        preferences.style.display = 'none';
        preferences.classList.remove('pxl-cookies-modal-active');
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
      
      // Actualizar estados visuales de checkboxes según consentimiento actual
      const analyticsCheckbox = document.querySelector(selectors.checkboxAnalytics);
      const marketingCheckbox = document.querySelector(selectors.checkboxMarketing);
      const functionalCheckbox = document.querySelector(selectors.checkboxFunctional);
      
      if (analyticsCheckbox) {
        if (this.consent.analytics) {
          analyticsCheckbox.classList.add('w--redirected-checked');
        } else {
          analyticsCheckbox.classList.remove('w--redirected-checked');
        }
      }
      
      if (marketingCheckbox) {
        if (this.consent.marketing) {
          marketingCheckbox.classList.add('w--redirected-checked');
        } else {
          marketingCheckbox.classList.remove('w--redirected-checked');
        }
      }
      
      if (functionalCheckbox) {
        if (this.consent.functional) {
          functionalCheckbox.classList.add('w--redirected-checked');
        } else {
          functionalCheckbox.classList.remove('w--redirected-checked');
        }
      }
      
      console.log('🍪 Estados de checkboxes actualizados:', this.consent);
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
      
      // Guardar en cookie
      document.cookie = `${this.config.cookieName}=${encodeURIComponent(JSON.stringify(consentData))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure`;
      
      // Backup en localStorage
      localStorage.setItem(this.config.cookieName, JSON.stringify(consentData));
      
      console.log(`🍪 Consentimiento guardado - expira en ${this.config.cookieExpiry} días`);
    }
    
    getSavedConsent() {
      const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(this.config.cookieName + '='));
      
      if (cookie) {
        try {
          const data = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
          
          // Verificar expiración
          const now = Date.now();
          const expiry = data.timestamp + (this.config.cookieExpiry * 24 * 60 * 60 * 1000);
          
          if (now < expiry) {
            return {
              necessary: data.necessary,
              analytics: data.analytics,
              marketing: data.marketing,
              functional: data.functional
            };
          } else {
            console.log(`🍪 Consentimiento expirado - ${this.config.cookieExpiry} días superados`);
            this.clearExpiredConsent();
            return null;
          }
        } catch (e) {
          console.error('🍪 Error parsing cookie consent:', e);
        }
      }
      
      return null;
    }
    
    clearExpiredConsent() {
      document.cookie = `${this.config.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      localStorage.removeItem(this.config.cookieName);
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
          console.log('🍪 Datos enviados al endpoint correctamente:', result);
        } else {
          console.warn('🍪 Error enviando al endpoint:', response.status, response.statusText);
        }
      } catch (error) {
        console.warn('🍪 Endpoint no disponible, funcionando en modo offline:', error.message);
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
    
    // Método para debugging
    getStatus() {
      return {
        version: this.version,
        domain: this.domain,
        endpoint: this.config.endpoint,
        isOnline: this.isOnline,
        consent: this.consent
      };
    }
  }
  
  // ===== INICIALIZACIÓN GLOBAL =====
  
  // Crear instancia global con namespace único para evitar conflictos
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
  
  console.log('🍪 Universal Cookie Consent System v1.1.0 cargado correctamente');
  
})();
