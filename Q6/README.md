# User Tracking System - Q6 Implementation

## Overview
This directory contains a comprehensive JavaScript-based user tracking system that captures all click events and page views across HTML tags and CSS objects. The system provides detailed console logging of user interactions for analysis and debugging purposes.

## Files Included

### 1. `user-tracking.js`
The main comprehensive tracking script with advanced features:
- **Click Tracking**: Captures all click events with detailed element information
- **Page View Tracking**: Records page loads with browser and device information
- **CSS Object Tracking**: Monitors CSS animations, transitions, and style changes
- **Form Interaction Tracking**: Logs form inputs, submissions, and changes
- **Keyboard Event Tracking**: Records key presses and combinations
- **Mouse Movement Tracking**: Monitors significant mouse movements
- **Scroll Tracking**: Records scroll positions and percentages
- **Session Management**: Generates unique session IDs and tracks session duration
- **Data Export**: Allows exporting tracking data as JSON files

### 2. `universal-tracker.js`
A lightweight version designed for easy integration into existing pages:
- Minimal footprint for existing Q1-Q5 implementations
- Essential click and interaction tracking
- Visual feedback for tracked elements
- Console-based reporting
- Easy integration with single script include

### 3. `index.html`
Comprehensive demo page showcasing all tracking capabilities:
- Various interactive elements (buttons, forms, animations)
- Navigation to Q1-Q5 pages
- Real-time tracking demonstration
- Control buttons for data export and reporting

### 4. `styles.css`
Complete styling for the demo page:
- Responsive design
- Interactive animations
- Visual feedback for user interactions
- Modern UI components

## Features

### Comprehensive Event Tracking
- **Click Events**: Every click is logged with element details, position, CSS selector, and timing
- **Form Interactions**: Input changes, form submissions, and field focus events
- **Keyboard Events**: Key presses, combinations, and special keys
- **Mouse Events**: Movement patterns, hover states, and right-clicks
- **Scroll Events**: Scroll position, percentage, and scroll speed
- **Page Events**: Page loads, visibility changes, and navigation

### Detailed Element Information
For each tracked interaction, the system captures:
- Element type, ID, class, and text content
- CSS selector and element path
- Computed styles and visual properties
- Position and size information
- Data attributes and custom properties
- Parent element information
- Timestamp and session context

### CSS Object Monitoring
- CSS animation start/end events
- CSS transition tracking
- Style attribute changes
- Class attribute modifications
- Pseudo-element interactions

### Console Output
All tracking information is output to the browser console with:
- Structured table format for easy reading
- Color-coded event types
- Hierarchical information display
- Periodic summary reports
- Session statistics and analytics

## Usage Instructions

### For Q6 Demo Page
1. Open `Q6/index.html` in your browser
2. Open Developer Console (F12)
3. Interact with various elements on the page
4. Observe detailed tracking information in console
5. Use control buttons to export data or generate reports

### For Integration with Q1-Q5 Pages
Add the following script tag to any existing page:

```html
<script src="../Q6/universal-tracker.js"></script>
```

Or for the full-featured version:

```html
<script src="../Q6/user-tracking.js"></script>
```

### Integration Examples

#### Q1 Integration (Basic HTML Page)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Q1 Page</title>
</head>
<body>
    <!-- Your existing Q1 content -->
    
    <!-- Add tracking at the bottom -->
    <script src="../Q6/universal-tracker.js"></script>
</body>
</html>
```

#### Q2 Integration (News Page)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Q2 News Page</title>
    <!-- Your existing styles -->
</head>
<body>
    <!-- Your existing Q2 content -->
    
    <!-- Add tracking -->
    <script src="../Q6/universal-tracker.js"></script>
</body>
</html>
```

#### Q3 Integration (Interactive Page)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Q3 Interactive Page</title>
    <!-- Your existing styles -->
</head>
<body>
    <!-- Your existing Q3 content -->
    
    <!-- Your existing scripts -->
    <script src="your-existing-script.js"></script>
    
    <!-- Add tracking -->
    <script src="../Q6/universal-tracker.js"></script>
</body>
</html>
```

#### Q4 Integration (Stoplight Game)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Stoplight Game</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Your existing Q4 game content -->
    
    <!-- Your existing game script -->
    <script src="script.js"></script>
    
    <!-- Add tracking -->
    <script src="../Q6/universal-tracker.js"></script>
</body>
</html>
```

#### Q5 Integration (Database Tool)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Database Data Dictionary Tool</title>
    <link rel="stylesheet" href="styles.css">
    <!-- External libraries -->
    <script src="https://d3js.org/d3.v7.min.js"></script>
</head>
<body>
    <!-- Your existing Q5 content -->
    
    <!-- Your existing scripts -->
    <script src="script.js"></script>
    
    <!-- Add tracking -->
    <script src="../Q6/universal-tracker.js"></script>
</body>
</html>
```

## Console Commands

Once the tracking script is loaded, the following commands are available in the browser console:

### For Full Tracking System (`user-tracking.js`)
- `exportTrackingData()` - Export all tracking data as JSON file
- `getTrackingData()` - Get current tracking data object
- `userTracker.generateSummaryReport()` - Generate immediate summary report

### For Universal Tracker (`universal-tracker.js`)
- `getTrackingSummary()` - Get session summary
- `exportUniversalTrackingData()` - Export all tracking data to console

## Data Structure

### Click Event Data
```javascript
{
    clickNumber: 1,
    timestamp: 1703123456789,
    timeFromPageLoad: 5432,
    pageName: "Q4 - Stoplight Game",
    elementType: "button",
    elementId: "go-btn",
    elementClass: "action-btn go",
    elementText: "Go",
    clickPosition: { x: 150, y: 200 },
    cssSelector: "#go-btn",
    elementAttributes: { type: "button", role: "button" }
}
```

### Page View Data
```javascript
{
    timestamp: 1703123456789,
    pageName: "Q5 - Database Tool",
    url: "http://localhost/Q5/index.html",
    title: "Database Data Dictionary Tool",
    referrer: "http://localhost/Q4/index.html",
    viewportSize: "1920x1080",
    userAgent: "Mozilla/5.0..."
}
```

## Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Considerations
- Minimal impact on page performance
- Efficient event delegation
- Throttled scroll and mouse movement tracking
- Automatic cleanup of old data
- Configurable reporting intervals

## Privacy and Security
- All data is processed locally in the browser
- No data is sent to external servers
- Data export is user-initiated only
- Session data is cleared on page refresh
- No personal information is collected

## Troubleshooting

### Common Issues
1. **Console not showing tracking data**
   - Ensure Developer Console is open (F12)
   - Check that script is loaded without errors
   - Verify script path is correct

2. **Tracking not working on specific elements**
   - Check if elements are dynamically created after script load
   - Verify elements are not in iframes
   - Ensure elements are not prevented from bubbling events

3. **Performance issues**
   - Use `universal-tracker.js` for lighter footprint
   - Adjust reporting intervals if needed
   - Clear console regularly for large sessions

### Debug Mode
To enable additional debug information, add this to console:
```javascript
window.userTracker.debugMode = true;
```

## Future Enhancements
- Heat map visualization
- User journey mapping
- A/B testing integration
- Real-time analytics dashboard
- Server-side data collection option
- Advanced filtering and search capabilities

## License
This tracking system is provided for educational and development purposes. Please ensure compliance with privacy regulations when implementing in production environments.