/**
 * Comprehensive User Interaction Tracking System
 * Captures all click events and page views across HTML tags and CSS objects
 * Outputs detailed tracking information to browser console
 */

class UserTracker {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.pageLoadTime = Date.now();
        this.clickCount = 0;
        this.interactions = [];
        this.pageViews = [];
        this.cssObjectInteractions = [];
        
        console.log('🔍 User Tracker Initialized');
        console.log(`📊 Session ID: ${this.sessionId}`);
        console.log(`⏰ Page Load Time: ${new Date(this.pageLoadTime).toISOString()}`);
        
        this.init();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    init() {
        this.trackPageView();
        this.setupClickTracking();
        this.setupCSSObjectTracking();
        this.setupPageVisibilityTracking();
        this.setupScrollTracking();
        this.setupFormTracking();
        this.setupKeyboardTracking();
        this.setupMouseMovementTracking();
        this.startPeriodicReporting();
    }

    trackPageView() {
        const pageView = {
            timestamp: Date.now(),
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            colorDepth: screen.colorDepth,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onlineStatus: navigator.onLine
        };

        this.pageViews.push(pageView);
        
        console.log('📄 PAGE VIEW TRACKED:');
        console.log('═══════════════════════════════════════');
        console.table(pageView);
        console.log('═══════════════════════════════════════');
    }

    setupClickTracking() {
        // Track all click events on any element
        document.addEventListener('click', (event) => {
            this.trackClickEvent(event);
        }, true); // Use capture phase to catch all events

        // Track contextmenu (right-click) events
        document.addEventListener('contextmenu', (event) => {
            this.trackRightClickEvent(event);
        }, true);
    }

    trackClickEvent(event) {
        this.clickCount++;
        
        const element = event.target;
        const clickData = {
            clickNumber: this.clickCount,
            timestamp: Date.now(),
            timeFromPageLoad: Date.now() - this.pageLoadTime,
            elementType: element.tagName.toLowerCase(),
            elementId: element.id || 'no-id',
            elementClass: element.className || 'no-class',
            elementText: element.textContent?.trim().substring(0, 100) || 'no-text',
            elementValue: element.value || 'no-value',
            elementName: element.name || 'no-name',
            elementHref: element.href || 'no-href',
            elementSrc: element.src || 'no-src',
            elementAlt: element.alt || 'no-alt',
            elementTitle: element.title || 'no-title',
            elementRole: element.getAttribute('role') || 'no-role',
            elementDataAttributes: this.getDataAttributes(element),
            clickPosition: {
                clientX: event.clientX,
                clientY: event.clientY,
                pageX: event.pageX,
                pageY: event.pageY,
                screenX: event.screenX,
                screenY: event.screenY
            },
            elementPosition: this.getElementPosition(element),
            elementSize: this.getElementSize(element),
            computedStyles: this.getRelevantComputedStyles(element),
            parentElement: {
                tagName: element.parentElement?.tagName.toLowerCase() || 'no-parent',
                id: element.parentElement?.id || 'no-parent-id',
                className: element.parentElement?.className || 'no-parent-class'
            },
            path: this.getElementPath(element),
            cssSelector: this.generateCSSSelector(element),
            eventType: 'click',
            modifierKeys: {
                ctrlKey: event.ctrlKey,
                altKey: event.altKey,
                shiftKey: event.shiftKey,
                metaKey: event.metaKey
            },
            button: event.button, // 0: left, 1: middle, 2: right
            detail: event.detail // click count for multiple clicks
        };

        this.interactions.push(clickData);
        
        console.log(`🖱️ CLICK EVENT #${this.clickCount} TRACKED:`);
        console.log('═══════════════════════════════════════');
        console.log(`Element: <${clickData.elementType}>`);
        console.log(`ID: ${clickData.elementId}`);
        console.log(`Class: ${clickData.elementClass}`);
        console.log(`Text: ${clickData.elementText}`);
        console.log(`Position: (${clickData.clickPosition.clientX}, ${clickData.clickPosition.clientY})`);
        console.log(`CSS Selector: ${clickData.cssSelector}`);
        console.log(`Time from page load: ${clickData.timeFromPageLoad}ms`);
        console.table(clickData);
        console.log('═══════════════════════════════════════');
    }

    trackRightClickEvent(event) {
        const element = event.target;
        const rightClickData = {
            timestamp: Date.now(),
            elementType: element.tagName.toLowerCase(),
            elementId: element.id || 'no-id',
            elementClass: element.className || 'no-class',
            eventType: 'rightclick',
            position: {
                clientX: event.clientX,
                clientY: event.clientY
            }
        };

        console.log('🖱️ RIGHT CLICK EVENT TRACKED:');
        console.table(rightClickData);
    }

    setupCSSObjectTracking() {
        // Track interactions with CSS pseudo-elements and styled objects
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    this.trackCSSObjectChange(mutation.target, 'style-change');
                }
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    this.trackCSSObjectChange(mutation.target, 'class-change');
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['style', 'class']
        });

        // Track CSS animations and transitions
        document.addEventListener('animationstart', (event) => {
            this.trackCSSAnimation(event, 'animation-start');
        });

        document.addEventListener('animationend', (event) => {
            this.trackCSSAnimation(event, 'animation-end');
        });

        document.addEventListener('transitionstart', (event) => {
            this.trackCSSAnimation(event, 'transition-start');
        });

        document.addEventListener('transitionend', (event) => {
            this.trackCSSAnimation(event, 'transition-end');
        });
    }

    trackCSSObjectChange(element, changeType) {
        const cssChange = {
            timestamp: Date.now(),
            changeType: changeType,
            elementType: element.tagName.toLowerCase(),
            elementId: element.id || 'no-id',
            elementClass: element.className || 'no-class',
            computedStyles: this.getRelevantComputedStyles(element),
            cssSelector: this.generateCSSSelector(element)
        };

        this.cssObjectInteractions.push(cssChange);
        
        console.log('🎨 CSS OBJECT CHANGE TRACKED:');
        console.table(cssChange);
    }

    trackCSSAnimation(event, animationType) {
        const animationData = {
            timestamp: Date.now(),
            animationType: animationType,
            animationName: event.animationName || event.propertyName,
            elementType: event.target.tagName.toLowerCase(),
            elementId: event.target.id || 'no-id',
            elementClass: event.target.className || 'no-class',
            duration: event.elapsedTime || 0
        };

        console.log('🎬 CSS ANIMATION TRACKED:');
        console.table(animationData);
    }

    setupPageVisibilityTracking() {
        document.addEventListener('visibilitychange', () => {
            const visibilityData = {
                timestamp: Date.now(),
                visibilityState: document.visibilityState,
                hidden: document.hidden
            };

            console.log('👁️ PAGE VISIBILITY CHANGE:');
            console.table(visibilityData);
        });
    }

    setupScrollTracking() {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollData = {
                    timestamp: Date.now(),
                    scrollX: window.scrollX,
                    scrollY: window.scrollY,
                    scrollPercentage: {
                        x: (window.scrollX / (document.body.scrollWidth - window.innerWidth)) * 100,
                        y: (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
                    }
                };

                console.log('📜 SCROLL EVENT:');
                console.table(scrollData);
            }, 100);
        });
    }

    setupFormTracking() {
        // Track form interactions
        document.addEventListener('input', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
                const formData = {
                    timestamp: Date.now(),
                    eventType: 'form-input',
                    elementType: event.target.tagName.toLowerCase(),
                    elementId: event.target.id || 'no-id',
                    elementName: event.target.name || 'no-name',
                    inputType: event.target.type || 'no-type',
                    valueLength: event.target.value ? event.target.value.length : 0
                };

                console.log('📝 FORM INPUT TRACKED:');
                console.table(formData);
            }
        });

        document.addEventListener('submit', (event) => {
            const submitData = {
                timestamp: Date.now(),
                eventType: 'form-submit',
                formId: event.target.id || 'no-id',
                formAction: event.target.action || 'no-action',
                formMethod: event.target.method || 'no-method'
            };

            console.log('📤 FORM SUBMIT TRACKED:');
            console.table(submitData);
        });
    }

    setupKeyboardTracking() {
        document.addEventListener('keydown', (event) => {
            const keyData = {
                timestamp: Date.now(),
                eventType: 'keydown',
                key: event.key,
                code: event.code,
                keyCode: event.keyCode,
                modifierKeys: {
                    ctrlKey: event.ctrlKey,
                    altKey: event.altKey,
                    shiftKey: event.shiftKey,
                    metaKey: event.metaKey
                },
                targetElement: event.target.tagName.toLowerCase()
            };

            console.log('⌨️ KEYBOARD EVENT:');
            console.table(keyData);
        });
    }

    setupMouseMovementTracking() {
        let mouseTimeout;
        let lastMousePosition = { x: 0, y: 0 };

        document.addEventListener('mousemove', (event) => {
            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => {
                const distance = Math.sqrt(
                    Math.pow(event.clientX - lastMousePosition.x, 2) + 
                    Math.pow(event.clientY - lastMousePosition.y, 2)
                );

                if (distance > 50) { // Only track significant mouse movements
                    const mouseData = {
                        timestamp: Date.now(),
                        eventType: 'mouse-move',
                        position: {
                            clientX: event.clientX,
                            clientY: event.clientY
                        },
                        distance: Math.round(distance),
                        targetElement: event.target.tagName.toLowerCase()
                    };

                    lastMousePosition = { x: event.clientX, y: event.clientY };
                    
                    console.log('🖱️ MOUSE MOVEMENT:');
                    console.table(mouseData);
                }
            }, 200);
        });
    }

    getDataAttributes(element) {
        const dataAttrs = {};
        for (let attr of element.attributes) {
            if (attr.name.startsWith('data-')) {
                dataAttrs[attr.name] = attr.value;
            }
        }
        return Object.keys(dataAttrs).length > 0 ? dataAttrs : 'no-data-attributes';
    }

    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom
        };
    }

    getElementSize(element) {
        const rect = element.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height
        };
    }

    getRelevantComputedStyles(element) {
        const computedStyle = window.getComputedStyle(element);
        return {
            display: computedStyle.display,
            position: computedStyle.position,
            backgroundColor: computedStyle.backgroundColor,
            color: computedStyle.color,
            fontSize: computedStyle.fontSize,
            fontFamily: computedStyle.fontFamily,
            border: computedStyle.border,
            margin: computedStyle.margin,
            padding: computedStyle.padding,
            zIndex: computedStyle.zIndex,
            opacity: computedStyle.opacity,
            visibility: computedStyle.visibility
        };
    }

    getElementPath(element) {
        const path = [];
        let current = element;
        
        while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            if (current.id) {
                selector += `#${current.id}`;
            }
            if (current.className) {
                selector += `.${current.className.split(' ').join('.')}`;
            }
            path.unshift(selector);
            current = current.parentElement;
        }
        
        return path.join(' > ');
    }

    generateCSSSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }
        
        let selector = element.tagName.toLowerCase();
        
        if (element.className) {
            selector += `.${element.className.split(' ').join('.')}`;
        }
        
        // Add nth-child if no unique identifier
        if (!element.id && !element.className) {
            const parent = element.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children);
                const index = siblings.indexOf(element) + 1;
                selector += `:nth-child(${index})`;
            }
        }
        
        return selector;
    }

    startPeriodicReporting() {
        setInterval(() => {
            this.generateSummaryReport();
        }, 30000); // Report every 30 seconds
    }

    generateSummaryReport() {
        const report = {
            sessionId: this.sessionId,
            sessionDuration: Date.now() - this.pageLoadTime,
            totalClicks: this.clickCount,
            totalInteractions: this.interactions.length,
            totalPageViews: this.pageViews.length,
            cssObjectInteractions: this.cssObjectInteractions.length,
            mostClickedElements: this.getMostClickedElements(),
            clickHeatmap: this.generateClickHeatmap(),
            userBehaviorPatterns: this.analyzeUserBehavior()
        };

        console.log('📊 PERIODIC SUMMARY REPORT:');
        console.log('═══════════════════════════════════════');
        console.table(report);
        console.log('═══════════════════════════════════════');
    }

    getMostClickedElements() {
        const elementCounts = {};
        this.interactions.forEach(interaction => {
            const key = `${interaction.elementType}${interaction.elementId ? '#' + interaction.elementId : ''}${interaction.elementClass ? '.' + interaction.elementClass.split(' ')[0] : ''}`;
            elementCounts[key] = (elementCounts[key] || 0) + 1;
        });

        return Object.entries(elementCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([element, count]) => ({ element, count }));
    }

    generateClickHeatmap() {
        const heatmapData = this.interactions.map(interaction => ({
            x: interaction.clickPosition.clientX,
            y: interaction.clickPosition.clientY,
            timestamp: interaction.timestamp
        }));

        return heatmapData.slice(-20); // Last 20 clicks
    }

    analyzeUserBehavior() {
        const totalTime = Date.now() - this.pageLoadTime;
        const avgTimeBetweenClicks = this.clickCount > 1 ? totalTime / this.clickCount : 0;
        
        return {
            avgTimeBetweenClicks: Math.round(avgTimeBetweenClicks),
            clicksPerMinute: Math.round((this.clickCount / totalTime) * 60000),
            sessionDurationMinutes: Math.round(totalTime / 60000),
            mostActiveTimeRange: this.getMostActiveTimeRange()
        };
    }

    getMostActiveTimeRange() {
        if (this.interactions.length === 0) return 'no-activity';
        
        const timeRanges = {};
        this.interactions.forEach(interaction => {
            const minute = Math.floor((interaction.timestamp - this.pageLoadTime) / 60000);
            timeRanges[minute] = (timeRanges[minute] || 0) + 1;
        });

        const mostActiveMinute = Object.entries(timeRanges)
            .sort(([,a], [,b]) => b - a)[0];

        return mostActiveMinute ? `Minute ${mostActiveMinute[0]} (${mostActiveMinute[1]} interactions)` : 'no-activity';
    }

    // Public methods for external access
    getSessionData() {
        return {
            sessionId: this.sessionId,
            pageViews: this.pageViews,
            interactions: this.interactions,
            cssObjectInteractions: this.cssObjectInteractions,
            summary: {
                totalClicks: this.clickCount,
                sessionDuration: Date.now() - this.pageLoadTime,
                mostClickedElements: this.getMostClickedElements()
            }
        };
    }

    exportData() {
        const data = this.getSessionData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-tracking-${this.sessionId}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('💾 Tracking data exported successfully!');
    }
}

// Initialize the tracker when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.userTracker = new UserTracker();
    });
} else {
    window.userTracker = new UserTracker();
}

// Add global functions for easy access
window.exportTrackingData = () => {
    if (window.userTracker) {
        window.userTracker.exportData();
    }
};

window.getTrackingData = () => {
    if (window.userTracker) {
        return window.userTracker.getSessionData();
    }
    return null;
};

// Console commands for users
console.log('🎯 User Tracking System Commands:');
console.log('• exportTrackingData() - Export all tracking data as JSON');
console.log('• getTrackingData() - Get current tracking data object');
console.log('• userTracker.generateSummaryReport() - Generate immediate summary report');