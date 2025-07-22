# Implementing Scripts in Calendesk Websites

## Introduction

Calendesk websites utilize dynamic content loading, which presents unique challenges when implementing custom JavaScript. This guide provides a comprehensive approach to successfully integrating scripts into Calendesk websites, ensuring they function correctly despite the platform's dynamic content loading behavior.

## Core Challenges with Calendesk

1. **Dynamic DOM Loading**: Content loads asynchronously, meaning your elements might not exist when scripts first execute
2. **Single Page Application (SPA) Navigation**: Page transitions destroy and recreate DOM elements without full page reloads
3. **State Persistence Issues**: JavaScript state persists during navigation while DOM elements are recreated
4. **Head-Only Script Placement**: Scripts can often only be added to the `<head>`, not at the end of body
5. **Platform Restrictions**: Potential API limitations and conflicts with Calendesk's own JavaScript

## Implementation Strategy

### Script Architecture

Always use a namespaced approach with encapsulated code:

```javascript
window.YourNamespace = (function () {
  // Private variables and methods
  let initialized = false;
  let lastInitializedUrl = ""; // Track URL for navigation detection

  // Public API
  return {
    init: function () {
      // Initialization code
    },
    reinitialize: function () {
      // Clean reset and re-initialization logic
    },
  };
})();
```

### Element Detection Methods

#### Using MutationObserver (Recommended)

MutationObserver watches for DOM changes and executes your code when target elements appear:

```javascript
function setupMutationObserver() {
  observer = new MutationObserver(function (mutations) {
    for (let mutation of mutations) {
      if (mutation.type === "childList" && mutation.addedNodes.length) {
        for (let node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (
              node.classList &&
              node.classList.contains("your-target-class")
            ) {
              initializeYourFeature(node);
              observer.disconnect();
              return;
            }
          }
        }
      }
    }
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });
}
```

#### Multiple Loading Events

Cover all possible loading scenarios:

```javascript
// Try immediate initialization
if (document.readyState !== "loading") {
  tryInitialize();
}

// Set up standard DOM listeners
document.addEventListener("DOMContentLoaded", tryInitialize);
window.addEventListener("load", tryInitialize);

// Fallback with timeout
setTimeout(tryInitialize, 1000);
```

### Event Delegation

Always use event delegation for dynamically added elements:

```javascript
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("your-button-class")) {
    handleButtonClick(event);
  }
});
```

### Handling SPA Navigation

For proper functionality across page transitions, implement navigation detection:

```javascript
function setupNavigationListeners() {
  // Monitor History API changes
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  window.history.pushState = function () {
    originalPushState.apply(this, arguments);
    yourNamespace.reinitialize();
  };

  window.history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    yourNamespace.reinitialize();
  };

  // Listen for back/forward navigation
  window.addEventListener("popstate", function () {
    yourNamespace.reinitialize();
  });

  // For hash-based routing
  window.addEventListener("hashchange", function () {
    yourNamespace.reinitialize();
  });
}
```

### State Management During Navigation

Implement proper state reset and tracking:

```javascript
// Track current URL to detect navigation
let lastInitializedUrl = "";

function init() {
  const currentUrl = window.location.href;
  const needsReinitialization = currentUrl !== lastInitializedUrl;

  if (initialized && !needsReinitialization) return;

  if (initialized && needsReinitialization) {
    resetState();
  }

  lastInitializedUrl = currentUrl;
  // Continue initialization...
}

function resetState() {
  // Reset all state variables
  initialized = false;

  // Clean up event listeners to prevent duplication
  const elements = document.querySelectorAll(".your-elements");
  elements.forEach((el) => {
    el.removeEventListener("click", yourHandler);
  });

  // Clean up observers
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
```

### Defensive Coding Practices

Always check for element existence before operating on them:

```javascript
function updateElement() {
  const element = document.getElementById("your-element");
  if (!element) {
    console.warn("Element not found");
    return;
  }

  // Now it's safe to use the element
  element.textContent = "Updated content";
}
```

## Comprehensive Implementation Example

Below is a complete example based on a successful implementation with navigation handling:

```javascript
// Create a global namespace for your functionality
window.YourFeature = (function () {
  // Private variables
  let initialized = false;
  let observer = null;
  let lastInitializedUrl = ""; // Track the URL for navigation detection

  // State variables for your feature
  let stateData = [];

  // Public API
  const publicAPI = {
    init: function () {
      // Check if URL changed to handle navigation
      const currentUrl = window.location.href;
      const needsReinitialization = currentUrl !== lastInitializedUrl;

      if (initialized && !needsReinitialization) return;

      // If already initialized but URL changed, reset and reinitialize
      if (initialized && needsReinitialization) {
        resetState();
      }

      // Update last initialized URL
      lastInitializedUrl = currentUrl;

      // Try immediate initialization
      if (document.readyState !== "loading") {
        tryInitialize();
      }

      // Standard DOM ready listeners
      document.addEventListener("DOMContentLoaded", tryInitialize);
      window.addEventListener("load", tryInitialize);

      // Set up MutationObserver to watch for elements
      setupMutationObserver();
    },

    // Method to force reinitialization
    reinitialize: function () {
      resetState();
      this.init();
    },
  };

  function resetState() {
    initialized = false;
    stateData = [];

    // Clean up any existing observer
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    // Remove event listeners to prevent duplication
    const elements = document.querySelectorAll(".your-elements");
    elements.forEach((el) => {
      el.removeEventListener("change", yourChangeHandler);
    });
  }

  function tryInitialize() {
    if (initialized) return;

    const targetElement = document.querySelector(".your-target-element");
    if (targetElement) {
      initializeFeature(targetElement);

      // Clean up observer
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }
  }

  function setupMutationObserver() {
    if (!window.MutationObserver) {
      console.warn("MutationObserver not supported");
      return;
    }

    observer = new MutationObserver(function (mutations) {
      for (let mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length) {
          for (let node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (
                node.classList &&
                node.classList.contains("your-target-element")
              ) {
                initializeFeature(node);
                observer.disconnect();
                observer = null;
                return;
              } else if (
                node.querySelector &&
                node.querySelector(".your-target-element")
              ) {
                const target = node.querySelector(".your-target-element");
                initializeFeature(target);
                observer.disconnect();
                observer = null;
                return;
              }
            }
          }
        }
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function initializeFeature(element) {
    if (initialized) return;

    try {
      // Your initialization code
      setupEventListeners();

      initialized = true;
    } catch (error) {
      console.error("Error initializing:", error);
    }
  }

  function setupEventListeners() {
    // Use event delegation for dynamic elements
    document.addEventListener("click", function (event) {
      if (event.target.classList.contains("your-button")) {
        handleButtonClick(event);
      }
    });
  }

  // Set up navigation detection
  function setupNavigationListeners() {
    // Monitor History API
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function () {
      originalPushState.apply(this, arguments);
      publicAPI.reinitialize();
    };

    window.history.replaceState = function () {
      originalReplaceState.apply(this, arguments);
      publicAPI.reinitialize();
    };

    // Handle back/forward navigation
    window.addEventListener("popstate", function () {
      publicAPI.reinitialize();
    });

    // For hash-based routing
    window.addEventListener("hashchange", function () {
      publicAPI.reinitialize();
    });
  }

  // Initialize navigation listeners
  setupNavigationListeners();

  return publicAPI;
})();

// Auto-initialize
window.YourFeature.init();

// Helper function to manually check and reinitialize if needed
function checkFeatureFunctionality() {
  const featureElement = document.querySelector(".your-feature-element");
  if (!featureElement) {
    console.warn("Feature element not found, reinitializing");
    window.YourFeature.reinitialize();
    return false;
  }
  return true;
}
```

## Adding Scripts to Calendesk

1. **In Calendesk Admin Panel**:

   - Navigate to your website settings
   - Find the "Custom Code" or "Scripts" section
   - Paste your script or add a reference to your external script file

2. **External Script Reference**:

   ```html
   <script src="https://your-domain.com/your-script.js"></script>
   ```

3. **Inline Script**:

   ```html
   <script>
     // Your script code
   </script>
   ```

4. **Manual Trigger in HTML**:
   ```html
   <script>
     // Force initialization after page load
     window.addEventListener("load", function () {
       setTimeout(function () {
         if (window.YourFeature) {
           window.YourFeature.reinitialize();
         }
       }, 1000);
     });
   </script>
   ```

## Troubleshooting

If your script isn't working as expected:

1. **Check Console for Errors**: Open browser developer tools (F12) and check for errors
2. **Add Debug Logging**: Insert console.log statements at key points to track execution
3. **Verify Element Classes/IDs**: Ensure your selectors match the actual elements in the DOM
4. **URL Navigation Issues**: Check if your script breaks after page navigation; implement navigation tracking
5. **Element Initialization Problems**: Ensure elements are properly reinitialized after navigation
6. **Event Listener Duplication**: Make sure old event listeners are removed before adding new ones
7. **Increase Timeout Values**: Try longer timeouts for initialization attempts
8. **Check File Loading**: Verify your script is actually loaded by checking Network tab
9. **Test Manual Reinitialization**: Add a button to manually trigger your reinitialize function for testing

## Advanced Troubleshooting

### Navigation State Problems

If your functionality breaks after navigation:

1. **Add URL tracking** to detect navigation changes
2. **Implement proper reset functions** that clean up all state variables and event listeners
3. **Monitor all navigation methods**: history API, popstate, and hashchange
4. **Add debug console logs** showing navigation events and reinitialization attempts
5. **Create a manual reinitialize function** that can be called from the console for testing

### DOM Element Disconnection

If elements become disconnected from event handlers:

1. **Use event delegation** at the document level where possible
2. **Store DOM references in a clean way** that can be fully reset
3. **Add feature detection helpers** that can verify if everything is working properly
4. **Implement element existence checks** before any DOM operations

## Best Practices

1. **Minimize Dependencies**: Avoid relying on external libraries when possible
2. **Keep it Lightweight**: Heavy scripts can slow down the site
3. **Clear Error Messages**: Log descriptive error messages to aid troubleshooting
4. **Clean up Resources**: Remove event listeners and observers when they're no longer needed
5. **Use Feature Detection**: Check if browser features are available before using them
6. **Implement URL Tracking**: Monitor URL changes to detect navigation
7. **Proper State Reset**: Ensure complete state reset between page navigations
8. **Manual Reinitialize Method**: Provide a public method to manually trigger reinitialization

## Case Study: File Upload Feature in Calendesk

Our example implementation successfully handles file uploads in Calendesk by:

1. Using MutationObserver to detect when form elements are added to the DOM
2. Tracking URL changes to detect navigation between pages
3. Properly resetting state when returning to the upload page
4. Implementing history API monitoring to catch all navigation events
5. Using clean state management to prevent duplication of event handlers
6. Providing utility functions to check and repair functionality if needed

This approach ensures that functionality works consistently both on initial page load and when navigating away and returning to the page later.

## Conclusion

Successfully implementing JavaScript in Calendesk requires addressing both the platform's dynamic content loading and SPA navigation behavior. By combining MutationObserver, navigation event monitoring, state management, and defensive coding practices, you can create robust scripts that work reliably across the entire user journey.
