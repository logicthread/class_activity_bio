/**
 * Universal User Tracking Script for Q1-Q5 Integration
 * This script can be added to any existing page to enable comprehensive tracking
 * Simply include this script at the bottom of any HTML page
 */

(function() {
    'use strict';
    
    // Check if tracking is already initialized
    if (window.universalTracker) {
        console.log('🔍 Universal Tracker already initialized');
        return;
    }

    // Lightweight version of the tracker for integration
    class UniversalTracker {
        constructor() {
            this.sessionId = this.generateSessionId();
            this.pageLoadTime = Date.now();
            this.clickCount = 0;
            this.interactions = [];
            this.pageName = this.getPageName();
            
            console.log('🎯 Universal Tracker Initialized for:', this.pageName);
            console.log(`📊 Session ID: ${this.sessionId}`);
            
            this.init();
        }

        generateSessionId() {
            return 'universal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        getPageName() {
            const path = window.location.pathname;
            if (path.includes('Q1')) return 'Q1 - Basic HTML Page';
            if (path.includes('Q2')) return 'Q2 - News Page';
            if (path.includes('Q3')) return 'Q3 - Interactive Page';
            if (path.includes('Q4')) return 'Q4 - Stoplight Game';
            if (path.includes('Q5')) return 'Q5 - Database Tool';
            if (path.includes('Q6')) return 'Q6 - Tracking Demo';
            return 'Unknown Page';
        }

        init() {
            this.trackPageView();
            this.setupUniversalClickTracking();
            this.setupFormTracking();
            this.setupKeyboardTracking();
            this.setupScrollTracking();
            this.addTrackingIndicator();
        }

        trackPageView() {
            const pageView = {
                timestamp: Date.now(),
                pageName: this.pageName,
                url: window.location.href,
                title: document.title,
                referrer: document.referrer,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
                userAgent: navigator.userAgent.substring(0, 100) + '...'
            };

            console.log('📄 PAGE VIEW TRACKED:');
            console.log('═══════════════════════════════════════');
            console.table(pageView);
            console.log('═══════════════════════════════════════');
        }

        setupUniversalClickTracking() {
            document.addEventListener('click', (event) => {
                this.trackUniversalClick(event);
            }, true);
        }

        trackUniversalClick(event) {
            this.clickCount++;
            
            const element = event.target;
            const clickData = {
                clickNumber: this.clickCount,
                timestamp: Date.now(),
                timeFromPageLoad: Date.now() - this.pageLoadTime,
                pageName: this.pageName,
                elementType: element.tagName.toLowerCase(),
                elementId: element.id || 'no-id',
                elementClass: element.className || 'no-class',
                elementText: (element.textContent || '').trim().substring(0, 50) || 'no-text',
                clickPosition: {
                    x: event.clientX,
                    y: event.clientY
                },
                cssSelector: this.generateSimpleSelector(element),
                elementAttributes: this.getKeyAttributes(element)
            };

            this.interactions.push(clickData);
            
            // Visual feedback
            this.highlightClickedElement(element);
            
            console.log(`🖱️ CLICK #${this.clickCount} on ${this.pageName}:`);
            console.log('═══════════════════════════════════════');
            console.log(`Element: <${clickData.elementType}>`);
            console.log(`ID: ${clickData.elementId}`);
            console.log(`Class: ${clickData.elementClass}`);
            console.log(`Text: ${clickData.elementText}`);
            console.log(`Position: (${clickData.clickPosition.x}, ${clickData.clickPosition.y})`);
            console.log(`Selector: ${clickData.cssSelector}`);
            console.table(clickData);
            console.log('═══════════════════════════════════════');
        }

        setupFormTracking() {
            document.addEventListener('input', (event) => {
                if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
                    const formData = {
                        timestamp: Date.now(),
                        pageName: this.pageName,
                        eventType: 'form-input',
                        elementType: event.target.tagName.toLowerCase(),
                        elementId: event.target.id || 'no-id',
                        elementName: event.target.name || 'no-name',
                        inputType: event.target.type || 'no-type',
                        valueLength: event.target.value ? event.target.value.length : 0
                    };

                    console.log('📝 FORM INPUT on', this.pageName + ':');
                    console.table(formData);
                }
            });

            document.addEventListener('submit', (event) => {
                const submitData = {
                    timestamp: Date.now(),
                    pageName: this.pageName,
                    eventType: 'form-submit',
                    formId: event.target.id || 'no-id',
                    formAction: event.target.action || 'no-action'
                };

                console.log('📤 FORM SUBMIT on', this.pageName + ':');
                console.table(submitData);
            });
        }

        setupKeyboardTracking() {
            document.addEventListener('keydown', (event) => {
                // Only track special keys to avoid spam
                if (event.key === 'Enter' || event.key === 'Escape' || event.key === 'Tab' || 
                    event.ctrlKey || event.altKey || event.metaKey) {
                    const keyData = {
                        timestamp: Date.now(),
                        pageName: this.pageName,
                        key: event.key,
                        code: event.code,
                        ctrlKey: event.ctrlKey,
                        altKey: event.altKey,
                        shiftKey: event.shiftKey,
                        metaKey: event.metaKey
                    };

                    console.log('⌨️ KEY EVENT on', this.pageName + ':');
                    console.table(keyData);
                }
            });
        }

        setupScrollTracking() {
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    const scrollData = {
                        timestamp: Date.now(),
                        pageName: this.pageName,
                        scrollY: window.scrollY,
                        scrollPercentage: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
                    };

                    console.log('📜 SCROLL on', this.pageName + ':');
                    console.table(scrollData);
                }, 500);
            });
        }

        generateSimpleSelector(element) {
            if (element.id) {
                return `#${element.id}`;
            }
            
            let selector = element.tagName.toLowerCase();
            
            if (element.className) {
                const classes = element.className.split(' ').filter(c => c.trim());
                if (classes.length > 0) {
                    selector += `.${classes[0]}`;
                }
            }
            
            return selector;
        }

        getKeyAttributes(element) {
            const attrs = {};
            ['href', 'src', 'alt', 'title', 'value', 'name', 'type'].forEach(attr => {
                if (element.hasAttribute(attr)) {
                    attrs[attr] = element.getAttribute(attr);
                }
            });
            return Object.keys(attrs).length > 0 ? attrs : 'no-key-attributes';
        }

        highlightClickedElement(element) {
            // Add temporary highlight
            const originalStyle = element.style.cssText;
            element.style.cssText += 'outline: 3px solid #ff6b6b !important; outline-offset: 2px !important;';
            
            setTimeout(() => {
                element.style.cssText = originalStyle;
            }, 1000);
        }

        addTrackingIndicator() {
            // Add a small indicator that tracking is active
            const indicator = document.createElement('div');
            indicator.innerHTML = '🔍';
            indicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 12px;
                z-index: 10000;
                pointer-events: none;
                opacity: 0.7;
            `;
            indicator.title = 'User tracking is active - check console for details';
            document.body.appendChild(indicator);

            // Pulse animation
            setInterval(() => {
                indicator.style.opacity = indicator.style.opacity === '0.7' ? '1' : '0.7';
            }, 2000);
        }

        // Public methods
        getSummary() {
            return {
                sessionId: this.sessionId,
                pageName: this.pageName,
                totalClicks: this.clickCount,
                sessionDuration: Date.now() - this.pageLoadTime,
                interactions: this.interactions.length
            };
        }

        exportData() {
            const data = {
                ...this.getSummary(),
                allInteractions: this.interactions
            };
            
            console.log('💾 TRACKING DATA EXPORT:');
            console.log('═══════════════════════════════════════');
            console.table(data);
            console.log('Full data:', data);
            console.log('═══════════════════════════════════════');
            
            return data;
        }
    }

    // Initialize the universal tracker
    window.universalTracker = new UniversalTracker();

    // Add global functions
    window.getTrackingSummary = () => {
        return window.universalTracker ? window.universalTracker.getSummary() : null;
    };

    window.exportUniversalTrackingData = () => {
        return window.universalTracker ? window.universalTracker.exportData() : null;
    };

    // Log available commands
    console.log('🎯 Universal Tracking Commands Available:');
    console.log('• getTrackingSummary() - Get session summary');
    console.log('• exportUniversalTrackingData() - Export all tracking data');
    
    // Auto-report every 30 seconds
    setInterval(() => {
        if (window.universalTracker) {
            const summary = window.universalTracker.getSummary();
            console.log('📊 AUTO REPORT for', summary.pageName + ':');
            console.table(summary);
        }
    }, 30000);

})();