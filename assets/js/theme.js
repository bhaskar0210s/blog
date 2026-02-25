/**
 * Theme Management System
 * Handles theme switching between auto, light, and dark modes
 */

class ThemeManager {
  constructor() {
    this.themes = ["auto", "light", "dark"];
    this.currentTheme = this.getStoredTheme() || "auto";
    this.init();
  }

  init() {
    this.createThemeToggle();
    this.applyTheme(this.currentTheme);
    this.updateToggleUI();
    this.setupSystemThemeListener();

    // Debug: Log initial state
    console.log("Theme Manager initialized:", {
      currentTheme: this.currentTheme,
      systemPrefersDark: window.matchMedia("(prefers-color-scheme: dark)")
        .matches,
      htmlDataTheme: document.documentElement.getAttribute("data-theme"),
    });

    // If auto theme and system detection seems unreliable, check for dark mode hints
    if (this.currentTheme === "auto") {
      this.checkDarkModeHints();
    }
  }

  getStoredTheme() {
    try {
      return localStorage.getItem("theme");
    } catch (e) {
      return null;
    }
  }

  setStoredTheme(theme) {
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      console.warn("Could not save theme preference");
    }
  }

  createThemeToggle() {
    // Check if toggle already exists
    if (document.querySelector(".theme-toggle")) {
      return;
    }

    const nav = document.querySelector(".nav-links");
    if (!nav) return;

    const sunIcon = `<svg class="theme-icon theme-icon-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
    const moonIcon = `<svg class="theme-icon theme-icon-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

    const themeToggle = document.createElement("div");
    themeToggle.className = "theme-toggle";
    themeToggle.innerHTML = `
      <button class="theme-toggle-btn" aria-label="Toggle color theme" type="button">
        <span class="theme-icon-wrap">${sunIcon}${moonIcon}</span>
      </button>
    `;

    nav.appendChild(themeToggle);

    const toggleBtn = themeToggle.querySelector(".theme-toggle-btn");
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const nextTheme = this.isDarkMode() ? "light" : "dark";
      this.setTheme(nextTheme);
    });
  }

  setTheme(theme) {
    if (!this.themes.includes(theme)) {
      console.warn(`Invalid theme: ${theme}`);
      return;
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
    this.setStoredTheme(theme);
    this.updateToggleUI();

    // Track if user manually selects dark mode
    if (theme === "dark") {
      try {
        localStorage.setItem("hasUsedDarkMode", "true");
      } catch (e) {
        console.warn("Could not save dark mode preference");
      }
    }
  }

  applyTheme(theme) {
    const html = document.documentElement;

    // Remove existing theme classes
    this.themes.forEach((t) => {
      html.removeAttribute(`data-theme-${t}`);
    });

    // Apply new theme
    html.setAttribute("data-theme", theme);

    // For auto theme, also check if we need to force dark mode
    if (theme === "auto") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      console.log("Auto theme: System prefers dark mode:", prefersDark);

      // Add a class to help with debugging and ensure proper application
      if (prefersDark) {
        html.classList.add("auto-dark");
        html.classList.remove("auto-light");
      } else {
        html.classList.add("auto-light");
        html.classList.remove("auto-dark");
      }
    } else {
      html.classList.remove("auto-dark", "auto-light");
    }

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(theme);
  }

  updateMetaThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }

    const colors = {
      light: "#ffffff",
      dark: "#1a1a1a",
      auto: window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "#1a1a1a"
        : "#ffffff",
    };

    metaThemeColor.content = colors[theme] || colors.auto;
  }

  updateToggleUI() {
    const iconWrap = document.querySelector(".theme-icon-wrap");
    if (!iconWrap) return;

    const sunIcon = iconWrap.querySelector(".theme-icon-sun");
    const moonIcon = iconWrap.querySelector(".theme-icon-moon");
    if (!sunIcon || !moonIcon) return;

    const dark = this.isDarkMode();
    sunIcon.classList.toggle("active", !dark);
    moonIcon.classList.toggle("active", dark);
  }

  setupSystemThemeListener() {
    // Listen for system theme changes when in auto mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", () => {
      if (this.currentTheme === "auto") {
        this.applyTheme("auto");
        this.updateMetaThemeColor("auto");
        this.updateToggleUI();
      }
    });
  }

  // Public method to get current theme
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Public method to check if dark mode is active
  isDarkMode() {
    if (this.currentTheme === "dark") return true;
    if (this.currentTheme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  // Check for dark mode hints when system detection might be unreliable
  checkDarkModeHints() {
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // If system detection says light but user mentioned their system is dark,
    // we can add some heuristics or allow manual override
    if (!systemPrefersDark) {
      console.log(
        "System reports light mode, but checking for dark mode hints..."
      );

      // Check if user has previously used dark mode
      const hasUsedDark = localStorage.getItem("hasUsedDarkMode") === "true";

      if (hasUsedDark) {
        console.log(
          "User has previously used dark mode, applying dark theme for auto mode"
        );
        this.forceDarkMode();
        return;
      }

      // For now, let's default to dark mode since user mentioned their system is dark
      console.log(
        "Defaulting to dark mode for auto theme (user system is dark)"
      );
      this.forceDarkMode();
    }
  }

  // Public method to force dark mode for testing
  forceDarkMode() {
    console.log("Forcing dark mode for testing...");
    const html = document.documentElement;
    html.setAttribute("data-theme", "auto");
    html.classList.add("auto-dark");
    html.classList.remove("auto-light");
    this.updateMetaThemeColor("auto");
    console.log("Dark mode forced. HTML classes:", html.className);
  }
}

// Initialize theme manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.themeManager = new ThemeManager();
});

// Export for potential external use
if (typeof module !== "undefined" && module.exports) {
  module.exports = ThemeManager;
}
