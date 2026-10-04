(() => {
    "use strict";

    if (window.__UNOFFICIAL_RUNTIME_LOADED__) return;
    window.__UNOFFICIAL_RUNTIME_LOADED__ = true;

    const BASE_CATEGORIES = new Set([
        "start",
        "flow",
        "moving",
        "looks",
        "brush",
        "text",
        "sound",
        "judgement",
        "calc",
        "variable",
        "func",
        "analysis",
        "ai_utilize",
        "expansion",
        "arduino"
    ]);

    /* ================================
       1. Entry.staticBlocks 통합 관리
       ================================ */

    let staticBlocks = Array.isArray(Entry.staticBlocks)
        ? Entry.staticBlocks
        : [];

    const unofficialCategories = new Map();

    function rememberUnofficialCategories(list) {
        if (!Array.isArray(list)) return;

        list.forEach(item => {
            if (!item || !item.category) return;

            if (!BASE_CATEGORIES.has(item.category)) {
                unofficialCategories.set(
                    item.category,
                    {
                        ...item,
                        blocks: Array.isArray(item.blocks)
                            ? [...item.blocks]
                            : []
                    }
                );
            }
        });
    }

    function mergeStaticBlocks(newBlocks) {
        if (!Array.isArray(newBlocks)) return newBlocks;

        rememberUnofficialCategories(staticBlocks);
        rememberUnofficialCategories(newBlocks);

        const base = newBlocks.filter(item =>
            item &&
            item.category &&
            BASE_CATEGORIES.has(item.category)
        );

        return [
            ...base,
            ...Array.from(unofficialCategories.values())
        ];
    }

    Object.defineProperty(Entry, "staticBlocks", {
        configurable: true,

        get() {
            return staticBlocks;
        },

        set(value) {
            staticBlocks = mergeStaticBlocks(value);
        }
    });


    /* ================================
       2. push되는 비공식 카테고리 기억
       ================================ */

    const originalPush = Array.prototype.push;

    function watchStaticBlocks() {
        if (!Array.isArray(staticBlocks)) return;

        if (staticBlocks.__UNOFFICIAL_WATCHED__) return;

        Object.defineProperty(
            staticBlocks,
            "__UNOFFICIAL_WATCHED__",
            {
                value: true,
                enumerable: false
            }
        );

        staticBlocks.push = function(...items) {
            items.forEach(item => {
                if (
                    item &&
                    item.category &&
                    !BASE_CATEGORIES.has(item.category)
                ) {
                    unofficialCategories.set(
                        item.category,
                        {
                            ...item,
                            blocks: Array.isArray(item.blocks)
                                ? [...item.blocks]
                                : []
                        }
                    );
                }
            });

            return originalPush.apply(this, items);
        };
    }

    watchStaticBlocks();


    /* ================================
       3. staticBlocks 재대입 후에도 감시
       ================================ */

    const entryDescriptor =
        Object.getOwnPropertyDescriptor(Entry, "staticBlocks");

    Object.defineProperty(Entry, "staticBlocks", {
        configurable: true,

        get() {
            return staticBlocks;
        },

        set(value) {
            staticBlocks = mergeStaticBlocks(value);
            watchStaticBlocks();
        }
    });


    /* ================================
       4. 카테고리 글씨 기억
       ================================ */

    const categoryNames = new Map();

    function rememberCategoryNames() {
        document
            .querySelectorAll(
                ".entryCategoryElementWorkspace[id^='entryCategory']"
            )
            .forEach(element => {

                const id = element.id;

                if (!id.startsWith("entryCategory")) return;

                const category =
                    id.substring("entryCategory".length);

                if (!category) return;

                const text =
                    element.textContent?.trim();

                if (text) {
                    categoryNames.set(category, text);
                }
            });
    }

    function restoreCategoryNames() {
        categoryNames.forEach((name, category) => {

            const element =
                document.getElementById(
                    "entryCategory" + category
                );

            if (!element) return;

            if (!element.textContent.trim()) {
                element.append(name);
            }
        });
    }


    /* ================================
       5. generateCategoryView 통합
       ================================ */

    const menu =
        Entry.playground.mainWorkspace.blockMenu;

    const originalGenerateCategoryView =
        menu._generateCategoryView.bind(menu);

    menu._generateCategoryView = function(categories) {

        rememberCategoryNames();

        if (!Array.isArray(categories)) {
            return originalGenerateCategoryView(categories);
        }

        categories.forEach(item => {
            if (
                item &&
                item.category &&
                !BASE_CATEGORIES.has(item.category)
            ) {
                const old =
                    unofficialCategories.get(item.category);

                unofficialCategories.set(
                    item.category,
                    {
                        ...(old || {}),
                        ...item
                    }
                );
            }
        });

        const existing =
            new Set(
                categories
                    .filter(Boolean)
                    .map(item => item.category)
            );

        const merged = [...categories];

        unofficialCategories.forEach(
            (data, category) => {

                if (!existing.has(category)) {
                    merged.push({
                        category,
                        visible: true
                    });
                }
            }
        );

        const result =
            originalGenerateCategoryView(merged);

        restoreCategoryNames();

        return result;
    };


    /* ================================
       6. getAllBlocks 항상 통합 결과
       ================================ */

    EntryStatic.getAllBlocks = () => {
        rememberUnofficialCategories(staticBlocks);

        const base =
            staticBlocks.filter(item =>
                item &&
                item.category &&
                BASE_CATEGORIES.has(item.category)
            );

        return [
            ...base,
            ...Array.from(
                unofficialCategories.values()
            )
        ];
    };


    console.log(
        "✅ Unofficial Runtime A-type loaded"
    );
})();
