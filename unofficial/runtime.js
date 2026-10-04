UnofficialRuntime.registerPackage = function({
    id,
    name,
    blocks,
    icon = null
}) {
    if (!window.Entry || !Entry.block || !Entry.staticBlocks) return;

    // 1. 블록 등록
    for (const block of blocks) {
        Entry.block[block.name] = block.definition;
    }

    // 2. 카테고리 중복 방지
    const exists = Entry.staticBlocks.some(
        item => item.category === id
    );

    if (!exists) {
        Entry.staticBlocks.push({
            category: id,
            blocks: blocks.map(block => block.name)
        });
    }

    // 3. 카테고리 이름 등록
    Lang.Blocks[id.toUpperCase()] = name;

    // 4. 현재 존재하는 전체 카테고리 다시 그림
    const menu = Entry.playground.mainWorkspace.blockMenu;

    menu._categoryData = Entry.staticBlocks;

    menu._generateCategoryView(
        Entry.staticBlocks.map(item => ({
            category: item.category,
            visible: item.category !== 'arduino'
        }))
    );

    menu._generateCategoryCode(id);

    // 5. 아이콘
    if (icon) {
        const el = document.getElementById(`entryCategory${id}`);

        if (el) {
            el.style.backgroundImage = `url(${icon})`;
            el.style.backgroundRepeat = 'no-repeat';
        }
    }
};
