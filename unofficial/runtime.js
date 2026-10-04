(() => {
    "use strict";

    if (window.__ENTRY_UNOFFICIAL_RUNTIME__) {
        return;
    }

    window.__ENTRY_UNOFFICIAL_RUNTIME__ = true;

    const originalBlocks = (() => {
        let blocks = [];

        if (
            typeof EntryStatic !== "undefined" &&
            typeof EntryStatic.getAllBlocks === "function"
        ) {
            blocks = EntryStatic.getAllBlocks();
        }

        if (!Array.isArray(blocks) && Array.isArray(Entry.staticBlocks)) {
            blocks = Entry.staticBlocks;
        }

        if (!Array.isArray(blocks)) {
            blocks = [];
        }

        return blocks.map((item) => ({
            ...item,
            blocks: Array.isArray(item.blocks)
                ? [...item.blocks]
                : item.blocks
        }));
    })();

    const packages = new Map();

    function getAllBlocks() {
        const result = originalBlocks.map((item) => ({
            ...item,
            blocks: Array.isArray(item.blocks)
                ? [...item.blocks]
                : item.blocks
        }));

        packages.forEach((pkg) => {
            result.push({
                category: pkg.id,
                visible: true,
                blocks: [...pkg.blocks]
            });
        });

        return result;
    }

    function refresh(selectedCategory) {
        const allBlocks = getAllBlocks();

        Entry.staticBlocks = allBlocks;

        EntryStatic.getAllBlocks = () => {
            return getAllBlocks();
        };

        packages.forEach((pkg) => {
            if (
                typeof Lang !== "undefined" &&
                Lang.Blocks
            ) {
                Lang.Blocks[pkg.id.toUpperCase()] = pkg.name;
            }
        });

        const menu =
            Entry.playground.mainWorkspace.blockMenu;

        menu._categoryData = allBlocks;

        menu._generateCategoryView(
            allBlocks.map((item) => ({
                category: item.category,
                visible:
                    item.category === "arduino"
                        ? false
                        : item.visible !== false
            }))
        );

        packages.forEach((pkg) => {
            menu._generateCategoryCode(pkg.id);
        });

        packages.forEach((pkg) => {
            const el = document.getElementById(
                `entryCategory${pkg.id}`
            );

            if (!el) {
                return;
            }

            if (
                pkg.name &&
                !el.textContent.includes(pkg.name)
            ) {
                el.append(
                    document.createTextNode(pkg.name)
                );
            }

            if (pkg.icon) {
                el.style.backgroundImage =
                    `url(${pkg.icon})`;

                el.style.backgroundRepeat =
                    "no-repeat";
            }
        });

        if (selectedCategory) {
            setTimeout(() => {
                const el = document.getElementById(
                    `entryCategory${selectedCategory}`
                );

                if (el) {
                    el.click();
                }
            }, 0);
        }
    }

    window.UnofficialRuntime = {
        registerPackage({
            id,
            name,
            blocks,
            icon = null
        }) {
            if (!id || !Array.isArray(blocks)) {
                return;
            }

            packages.set(id, {
                id,
                name: name || id,
                blocks: [...blocks],
                icon
            });

            refresh(id);
        },

        refresh,

        getAllBlocks
    };

    console.log("UnofficialRuntime ready");
})();
