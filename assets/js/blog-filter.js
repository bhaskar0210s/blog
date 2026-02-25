(function () {
  "use strict";

  const searchInput = document.getElementById("post-search");
  const categoryPills = document.querySelectorAll(".category-pill");
  const featuredPost = document.querySelector(".featured-post");
  const postCards = document.querySelectorAll(".post-card");
  const noResults = document.getElementById("no-results");

  if (!searchInput && categoryPills.length === 0) return;

  let activeCategory = "all";

  function matchesSearch(element, query) {
    if (!query.trim()) return true;
    const title = (element.dataset.postTitle || "").toLowerCase();
    const categories = (element.dataset.postCategories || "").toLowerCase();
    const q = query.toLowerCase().trim();
    return title.includes(q) || categories.includes(q);
  }

  function matchesCategory(element, category) {
    if (category === "all") return true;
    const categories = (element.dataset.postCategories || "").toLowerCase().split(/\s+/);
    return categories.includes(category.toLowerCase());
  }

  function updateVisibility() {
    const query = searchInput ? searchInput.value : "";
    let visibleCount = 0;

    if (featuredPost) {
      const showFeatured =
        matchesSearch(featuredPost, query) &&
        matchesCategory(featuredPost, activeCategory);
      featuredPost.style.display = showFeatured ? "" : "none";
      if (showFeatured) visibleCount++;
    }

    postCards.forEach((card) => {
      const show =
        matchesSearch(card, query) && matchesCategory(card, activeCategory);
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
      categoryPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      activeCategory = pill.dataset.category || "all";
      updateVisibility();
    });
  });
})();
