(function () {
  "use strict";

  const searchInput = document.getElementById("post-search");
  const categoryPills = document.querySelectorAll(".category-pill");
  const postCards = document.querySelectorAll(".post-card");
  const noResults = document.getElementById("no-results");

  if (!searchInput && categoryPills.length === 0) return;

  const activeCategories = new Set();

  function matchesSearch(element, query) {
    if (!query.trim()) return true;
    const title = (element.dataset.postTitle || "").toLowerCase();
    const categories = (element.dataset.postCategories || "").toLowerCase();
    const q = query.toLowerCase().trim();
    return title.includes(q) || categories.includes(q);
  }

  function matchesCategory(element) {
    if (activeCategories.size === 0) return true;
    const postCats = (element.dataset.postCategories || "").toLowerCase().split("|").map((c) => c.trim());
    return activeCategories.size > 0 && postCats.some((c) => activeCategories.has(c));
  }

  function updatePillStates() {
    categoryPills.forEach((pill) => {
      const cat = pill.dataset.category || "all";
      if (cat === "all") {
        pill.classList.toggle("active", activeCategories.size === 0);
      } else {
        pill.classList.toggle("active", activeCategories.has(cat));
      }
    });
  }

  function updateVisibility() {
    const query = searchInput ? searchInput.value : "";
    let visibleCount = 0;

    postCards.forEach((card) => {
      const show =
        matchesSearch(card, query) && matchesCategory(card);
      card.style.display = show ? "" : "none";
      if (show) visibleCount++;
    });

    if (noResults) {
      noResults.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", updateVisibility);
    searchInput.addEventListener("keyup", updateVisibility);
  }

  categoryPills.forEach((pill) => {
    pill.addEventListener("click", function () {
      const cat = pill.dataset.category || "all";
      if (cat === "all") {
        activeCategories.clear();
      } else {
        if (activeCategories.has(cat)) {
          activeCategories.delete(cat);
        } else {
          activeCategories.add(cat);
        }
      }
      updatePillStates();
      updateVisibility();
    });
  });
})();
