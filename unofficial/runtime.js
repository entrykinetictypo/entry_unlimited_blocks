(() => {
    "use strict";

    if (window.__UNOFFICIAL_RUNTIME_LOADED__) {
        return;
    }

    window.__UNOFFICIAL_RUNTIME_LOADED__ = true;

    const menu = Entry.playground.mainWorkspace.blockMenu;

    const originalGenerateCategoryView =
        menu._generateCategoryView.bind(menu);

    const savedCategories = new Map();

    menu._generateCategoryView = function(categories) {

        if (!Array.isArray(categories)) {
            return originalGenerateCategoryView(categories);
        }

        categories.forEach((item) => {
            if (!item || !item.category) {
                return;
            }

            savedCategories.set(
                item.category,
                {
                    ...item
                }
            );
        });

        const merged = Array.from(
            savedCategories.values()
        );

        return originalGenerateCategoryView(merged);
    };

    console.log("Unofficial category runtime loaded");
})();
