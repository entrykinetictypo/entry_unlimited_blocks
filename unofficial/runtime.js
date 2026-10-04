console.log("runtime.js loaded");

window.UnofficialRuntime = window.UnofficialRuntime || {};

window.UnofficialRuntime.categories =
    window.UnofficialRuntime.categories || [];

if (!window.UnofficialRuntime.baseGetAllBlocks) {
    window.UnofficialRuntime.baseGetAllBlocks =
        EntryStatic.getAllBlocks.bind(EntryStatic);

    EntryStatic.getAllBlocks = function() {
        return [
            ...window.UnofficialRuntime.baseGetAllBlocks(),
            ...window.UnofficialRuntime.categories
        ];
    };
}

window.UnofficialRuntime.registerPackage = function({
    id,
    name,
    blocks,
    icon = null
}) {
    console.log("registerPackage called", id, name);

    const exists = window.UnofficialRuntime.categories.some(
        item => item.category === id
    );

    if (!exists) {
        window.UnofficialRuntime.categories.push({
            category: id,
            blocks: blocks.map(block => block.name)
        });
    }

    Lang.Blocks[id.toUpperCase()] = name;

   const menu = Entry.playground.mainWorkspace.blockMenu;

const categoryExists = menu._categoryData.some(
    item => item.category === id
);

if (!categoryExists) {
    menu._categoryData.push({
        category: id,
        blocks: []
    });
}

menu._generateCategoryView(menu._categoryData);
menu._generateCategoryCode(id);
menu.setMenu();

    if (icon) {
        const el = document.getElementById(
            `entryCategory${id}`
        );

        if (el) {
            el.style.backgroundImage = `url(${icon})`;
            el.style.backgroundRepeat = "no-repeat";
        }
    }
};
