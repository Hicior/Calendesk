// Calendesk Subscription Renewal Feature
window.CalendeskRenewalFeature = (function () {
  // Private variables
  let initialized = false;
  let observer = null;
  let lastInitializedUrl = "";
  let stylesInjected = false;

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

      // Set up MutationObserver to watch for navigation changes
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

    // Clean up any existing observer
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    // Remove existing renewal containers to prevent duplicates
    const existingContainers = document.querySelectorAll('.renew-wrapper');
    existingContainers.forEach(wrapper => {
      const container = wrapper.closest('.container');
      if (container) {
        container.remove();
      } else {
        wrapper.remove();
      }
    });
  }

  function tryInitialize() {
    // Only run on subscriptions page
    if (window.location.pathname !== '/subscriptions') {
      return;
    }

    if (initialized) return;

    // Check if renewal section already exists to prevent duplicates
    if (document.querySelector('.renew-wrapper')) {
      initialized = true;
      return;
    }

    // Check if we have the required token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return;
    }

    initializeRenewalFeature(token);
  }

  function setupMutationObserver() {
    if (!window.MutationObserver) {
      return;
    }

    observer = new MutationObserver(function () {
      // Check if we navigated to subscriptions page
      if (window.location.pathname === '/subscriptions' && !initialized) {
        tryInitialize();
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  async function initializeRenewalFeature(token) {
    if (initialized) return;

    try {
      // Inject styles only once
      if (!stylesInjected) {
        injectStyles();
        stylesInjected = true;
      }

      // Fetch all subscriptions
      const resp = await fetch(
        'https://api.calendesk.com/api/v2/user/subscriptions?page=1&limit=100',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant': 'slawomir-mentzen-rvs',
            'Accept': 'application/json'
          }
        }
      );
      
      if (!resp.ok) {
        return;
      }
      
      const { data } = await resp.json();

      // Allowed IDs set
      const allowedIds = new Set([
        190, 191, 197, 196, 194, 195,
        234, 235, 269, 238, 239, 237,
        241, 242, 270, 198, 199
      ]);

      // Normalize & filter to only allowed subscriptions
      const subs = data
        .map(s => ({
          ...s,
          subscription_id: Number(s.subscription_id),
          status: s.status.toLowerCase()
        }))
        .filter(s => allowedIds.has(s.subscription_id));

      // Of the ones that are canceled, drop any whose ID also has an active
      const canceled = subs.filter(s => s.status === 'canceled');
      const toRenewById = {};
      canceled.forEach(sub => {
        const hasActive = subs.some(
          other => other.subscription_id === sub.subscription_id && other.status === 'active'
        );
        if (!hasActive) {
          toRenewById[sub.subscription_id] = sub;
        }
      });

      const renewList = Object.values(toRenewById);
      if (renewList.length === 0) {
        initialized = true;
        return; // nothing to show
      }

      // Build and insert the renewal UI
      buildRenewalUI(renewList);
      
      initialized = true;

    } catch (err) {
      // Silent fail in production
    }
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.id = 'calendesk-renewal-styles';
    style.textContent = `
      .renew-wrapper {
        background: #fff;
        padding: 1rem;
        padding-bottom: 0;
        max-width: 1200px;
      }
      .renew-buttons-container {
        display: grid;
        gap: 0.75rem;
        margin-top: 0.75rem;
        justify-content: left;
      }
      .renew-buttons-container a {
        display: block;
        padding: 0.6rem 1rem;
        background: #007BFF;
        color: #fff;
        text-align: center;
        text-decoration: none;
        border-radius: 4px;
        font-size: 0.9rem;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        transition: background 0.2s ease, transform 0.1s ease;
        width: 100%;
        box-sizing: border-box;
      }
      .renew-buttons-container a:hover {
        background: #0056b3;
        transform: translateY(-1px);
      }
    `;
    
    // Remove existing styles to prevent duplicates
    const existingStyles = document.getElementById('calendesk-renewal-styles');
    if (existingStyles) {
      existingStyles.remove();
    }
    
    document.head.appendChild(style);
  }

  function buildRenewalUI(renewList) {
    // Check if renewal UI already exists
    if (document.querySelector('.renew-wrapper')) {
      return;
    }

    // Build container > wrapper > grid
    const container = document.createElement('div');
    container.className = 'container';

    const wrapper = document.createElement('div');
    wrapper.className = 'renew-wrapper';

    const title = document.createElement('div');
    title.className = 'text-h4';
    title.textContent = 'Odnów subskrypcje';
    wrapper.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'renew-buttons-container';

    renewList.forEach(sub => {
      const a = document.createElement('a');
      a.href = `https://subskrypcje.mentzen.pl/subscription/${sub.subscription_id}`;
      a.textContent = `⟳ Odnów "${sub.subscription.name}"`;
      grid.appendChild(a);
    });

    wrapper.appendChild(grid);
    container.appendChild(wrapper);

    // Insert into DOM
    const navbar = document.querySelector('.navbar1');
    if (navbar) {
      navbar.insertAdjacentElement('afterend', container);
    } else {
      document.body.prepend(container);
    }
  }

  // Set up navigation detection
  function setupNavigationListeners() {
    let navigationTimeout;

    function handleNavigation() {
      clearTimeout(navigationTimeout);
      navigationTimeout = setTimeout(() => {
        publicAPI.reinitialize();
      }, 300);
    }

    // Monitor History API
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function () {
      originalPushState.apply(this, arguments);
      handleNavigation();
    };

    window.history.replaceState = function () {
      originalReplaceState.apply(this, arguments);
      handleNavigation();
    };

    // Handle back/forward navigation
    window.addEventListener("popstate", handleNavigation);

    // For hash-based routing
    window.addEventListener("hashchange", handleNavigation);
  }

  // Initialize navigation listeners
  setupNavigationListeners();

  return publicAPI;
})();

// Auto-initialize
window.CalendeskRenewalFeature.init();

// Helper function for debugging
window.checkRenewalFeature = function() {
  if (window.location.pathname === '/subscriptions') {
    const renewalWrapper = document.querySelector('.renew-wrapper');
    if (!renewalWrapper) {
      console.warn('Renewal feature not found, reinitializing...');
      window.CalendeskRenewalFeature.reinitialize();
      return false;
    }
    console.log('Renewal feature is working correctly');
    return true;
  } else {
    console.log('Not on subscriptions page');
    return true;
  }
};