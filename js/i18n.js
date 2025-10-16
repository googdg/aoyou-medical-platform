/**
 * Internationalization (i18n) Manager
 * Handles language switching and text translation
 */

class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.isLoaded = false;
        this.observers = [];
    }

    /**
     * Load translation data from JSON file
     * @returns {Promise<boolean>} Success status
     */
    async loadTranslations() {
        try {
            const response = await fetch('./data/i18n.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.translations = await response.json();
            
            // Set language from localStorage or browser preference
            const savedLanguage = localStorage.getItem('preferred-language');
            const browserLanguage = navigator.language.startsWith('zh') ? 'zh' : 'en';
            
            this.currentLanguage = savedLanguage || browserLanguage;
            this.isLoaded = true;
            
            return true;
        } catch (error) {
            console.error('Error loading translations:', error);
            this.isLoaded = false;
            return false;
        }
    }

    /**
     * Get translation for a key
     * @param {string} key - Translation key (dot notation supported)
     * @param {string} language - Language code (optional)
     * @returns {string} Translated text
     */
    t(key, language = null) {
        const lang = language || this.currentLanguage;
        const langData = this.translations[lang];
        
        if (!langData) {
            console.warn(`Language '${lang}' not found`);
            return key;
        }
        
        // Support dot notation (e.g., 'site.title')
        const keys = key.split('.');
        let value = langData;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key '${key}' not found for language '${lang}'`);
                return key;
            }
        }
        
        return typeof value === 'string' ? value : key;
    }

    /**
     * Set current language
     * @param {string} language - Language code
     */
    setLanguage(language) {
        if (this.translations[language]) {
            this.currentLanguage = language;
            localStorage.setItem('preferred-language', language);
            this.notifyObservers();
            this.updatePageContent();
        } else {
            console.warn(`Language '${language}' not available`);
        }
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get available languages
     * @returns {Array} Array of available language codes
     */
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }

    /**
     * Add observer for language changes
     * @param {Function} callback - Callback function
     */
    addObserver(callback) {
        this.observers.push(callback);
    }

    /**
     * Remove observer
     * @param {Function} callback - Callback function to remove
     */
    removeObserver(callback) {
        this.observers = this.observers.filter(obs => obs !== callback);
    }

    /**
     * Notify all observers of language change
     */
    notifyObservers() {
        this.observers.forEach(callback => {
            try {
                callback(this.currentLanguage);
            } catch (error) {
                console.error('Error in i18n observer:', error);
            }
        });
    }

    /**
     * Update page content with current language
     */
    updatePageContent() {
        // Update elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update elements with data-i18n-html attribute (for HTML content)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.t(key);
            element.innerHTML = translation;
        });

        // Update meta tags
        this.updateMetaTags();
        
        // Update document title
        document.title = this.t('site.title') + ' - Personal Blog';
    }

    /**
     * Update meta tags for SEO
     */
    updateMetaTags() {
        // Update description meta tag
        const descriptionMeta = document.querySelector('meta[name="description"]');
        if (descriptionMeta) {
            descriptionMeta.setAttribute('content', this.t('site.description'));
        }

        // Update Open Graph tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.setAttribute('content', this.t('site.title') + ' - Personal Blog');
        }

        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
            ogDescription.setAttribute('content', this.t('site.tagline'));
        }

        // Update Twitter tags
        const twitterTitle = document.querySelector('meta[property="twitter:title"]');
        if (twitterTitle) {
            twitterTitle.setAttribute('content', this.t('site.title') + ' - Personal Blog');
        }

        const twitterDescription = document.querySelector('meta[property="twitter:description"]');
        if (twitterDescription) {
            twitterDescription.setAttribute('content', this.t('site.tagline'));
        }
    }

    /**
     * Initialize i18n system
     */
    async init() {
        const success = await this.loadTranslations();
        if (success) {
            this.setupLanguageSwitcher();
            this.updatePageContent();
        }
        return success;
    }

    /**
     * Setup language switcher in footer
     */
    setupLanguageSwitcher() {
        const footer = document.querySelector('.site-footer .footer-content');
        if (!footer) return;

        // Create language switcher container
        const langSwitcher = document.createElement('div');
        langSwitcher.className = 'language-switcher';
        langSwitcher.innerHTML = `
            <div class="lang-switcher-container">
                <span class="lang-label" data-i18n="footer.languageSwitch">Language</span>
                <div class="lang-buttons">
                    <button class="lang-switch-btn ${this.currentLanguage === 'en' ? 'active' : ''}" 
                            data-lang="en" 
                            aria-label="Switch to English">
                        English
                    </button>
                    <button class="lang-switch-btn ${this.currentLanguage === 'zh' ? 'active' : ''}" 
                            data-lang="zh" 
                            aria-label="切换到中文">
                        中文
                    </button>
                </div>
            </div>
        `;

        // Insert before tech-info
        const techInfo = footer.querySelector('.tech-info');
        if (techInfo) {
            footer.insertBefore(langSwitcher, techInfo);
        } else {
            footer.appendChild(langSwitcher);
        }

        // Bind click events
        langSwitcher.querySelectorAll('.lang-switch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const newLang = btn.getAttribute('data-lang');
                if (newLang !== this.currentLanguage) {
                    this.setLanguage(newLang);
                    this.updateLanguageSwitcherState();
                }
            });
        });
    }

    /**
     * Update language switcher button states
     */
    updateLanguageSwitcherState() {
        document.querySelectorAll('.lang-switch-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === this.currentLanguage) {
                btn.classList.add('active');
            }
        });
    }

    /**
     * Format text with variables
     * @param {string} key - Translation key
     * @param {Object} variables - Variables to replace
     * @returns {string} Formatted text
     */
    tf(key, variables = {}) {
        let text = this.t(key);
        
        Object.keys(variables).forEach(varKey => {
            const placeholder = `{${varKey}}`;
            text = text.replace(new RegExp(placeholder, 'g'), variables[varKey]);
        });
        
        return text;
    }

    /**
     * Check if data is loaded
     * @returns {boolean} Load status
     */
    isDataLoaded() {
        return this.isLoaded;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
} else if (typeof window !== 'undefined') {
    window.I18nManager = I18nManager;
}