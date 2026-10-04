window.UnofficialRuntime = window.UnofficialRuntime || {};

UnofficialRuntime.registerPackage = function({
    id,
    name,
    blocks,
    icon = null
}) {
    const menu = Entry.playground.mainWorkspace.blockMenu;

    const exists = Entry.staticBlocks.some(
        item => item.category === id
    );

    if (!exists) {
        Entry.staticBlocks.push({
            category: id,
            blocks: blocks.map(block => block.name)
        });
    }

    Lang.Blocks[id.toUpperCase()] = name;

    menu._categoryData = Entry.staticBlocks;

    menu._generateCategoryView(
        Entry.staticBlocks.map(item => ({
            category: item.category,
            visible: item.category !== 'arduino'
        }))
    );

    menu._generateCategoryCode(id);

    if (icon) {
        const el = document.getElementById(`entryCategory${id}`);

        if (el) {
            el.style.backgroundImage = `url(${icon})`;
            el.style.backgroundRepeat = 'no-repeat';
        }
    }
};
