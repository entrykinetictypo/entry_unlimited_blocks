(() => {
    "use strict";

    if (window.__UNOFFICIAL_RUNTIME_LOADED__) return;
    window.__UNOFFICIAL_RUNTIME_LOADED__ = true;

    console.log("🚀 Unofficial Runtime 시작");


    /* =========================================
       1. 엔트리 기본 카테고리만 처음에 기억
       ========================================= */

    const initialBlocks =
        Array.isArray(EntryStatic.getAllBlocks?.())
            ? EntryStatic.getAllBlocks()
            : [];

    const baseCategories =
        new Set(
            initialBlocks
                .filter(item => item?.category)
                .map(item => item.category)
        );


    /*
     * 비공식 카테고리 저장소
     */

    const savedCategories = new Map();


    /* =========================================
       2. 비공식 카테고리 기억
       ========================================= */

    function saveCategory(item) {

        if (
            !item ||
            !item.category ||
            baseCategories.has(item.category)
        ) {
            return;
        }

        const old =
            savedCategories.get(item.category);

        savedCategories.set(
            item.category,
            {
                ...(old || {}),
                ...item,

                blocks:
                    Array.isArray(item.blocks)
                        ? [...item.blocks]
                        : old?.blocks || []
            }
        );
    }


    function scanCategories() {

        const sources = [];


        /*
         * A / B / C
         */

        try {

            const all =
                EntryStatic.getAllBlocks?.();

            if (Array.isArray(all)) {
                sources.push(all);
            }

        } catch (e) {}


        /*
         * A / B
         */

        if (Array.isArray(Entry.staticBlocks)) {
            sources.push(
                Entry.staticBlocks
            );
        }


        /*
         * C / D
         */

        const categoryData =
            Entry.playground
                ?.blockMenu
                ?._categoryData;

        if (Array.isArray(categoryData)) {
            sources.push(categoryData);
        }


        sources.forEach(list => {

            list.forEach(item => {
                saveCategory(item);
            });

        });
    }


    /* =========================================
       3. 이름 / 스타일 기억
       ========================================= */

    function captureAppearance() {

        document
            .querySelectorAll(
                ".entryCategoryElementWorkspace[id^='entryCategory']"
            )
            .forEach(element => {

                const category =
                    element.id.replace(
                        "entryCategory",
                        ""
                    );

                if (
                    !category ||
                    baseCategories.has(category)
                ) {
                    return;
                }


                const data =
                    savedCategories.get(category) ||
                    {
                        category,
                        blocks: []
                    };


                const name =
                    element.textContent?.trim();

                if (name) {
                    data.__name = name;
                }


                const style =
                    element.getAttribute("style");

                if (style) {
                    data.__style = style;
                }


                savedCategories.set(
                    category,
                    data
                );
            });
    }


    /* =========================================
       4. staticBlocks에는
          "빠진 비공식"만 추가
       ========================================= */

    function restoreStaticBlocks() {

        if (!Array.isArray(Entry.staticBlocks)) {
            return;
        }


        let currentAll = [];

        try {

            const all =
                EntryStatic.getAllBlocks?.();

            if (Array.isArray(all)) {
                currentAll = all;
            }

        } catch (e) {}


        savedCategories.forEach(
            (data, category) => {

                const exists =
                    currentAll.some(
                        item =>
                            item?.category ===
                            category
                    );


                if (exists) return;


                const inStatic =
                    Entry.staticBlocks.some(
                        item =>
                            item?.category ===
                            category
                    );


                if (!inStatic) {

                    Entry.staticBlocks.push({
                        category,
                        blocks:
                            Array.isArray(data.blocks)
                                ? [...data.blocks]
                                : []
                    });

                }

            }
        );
    }


    /* =========================================
       5. _categoryData에도
          빠진 비공식만 추가
       ========================================= */

    function restoreCategoryData() {

        const menus = [
            Entry.playground?.blockMenu,
            Entry.playground
                ?.mainWorkspace
                ?.blockMenu
        ];


        menus.forEach(menu => {

            if (
                !menu ||
                !Array.isArray(menu._categoryData)
            ) {
                return;
            }


            savedCategories.forEach(
                (data, category) => {

                    const exists =
                        menu._categoryData.some(
                            item =>
                                item?.category ===
                                category
                        );


                    if (!exists) {

                        menu._categoryData.push({
                            category,
                            blocks:
                                Array.isArray(data.blocks)
                                    ? [...data.blocks]
                                    : []
                        });

                    }

                }
            );

        });
    }


    /* =========================================
       6. 화면에서 사라진
          비공식 카테고리만 다시 생성
       ========================================= */

    function restoreCategoryElements() {

        const menu =
            Entry.playground
                ?.mainWorkspace
                ?.blockMenu;

        if (!menu) return;


        savedCategories.forEach(
            (data, category) => {

                let element =
                    document.getElementById(
                        "entryCategory" +
                        category
                    );


                /*
                 * 이미 있으면 기본 메뉴는 절대 안 건드림
                 */

                if (!element) {

                    try {

                        const generated =
                            menu._generateCategoryElement?.(
                                category,
                                true
                            );


                        if (
                            generated &&
                            generated[0] &&
                            menu._categoryCol?.[0]
                        ) {

                            menu._categoryCol[0]
                                .appendChild(
                                    generated[0]
                                );

                        }

                    } catch (e) {

                        console.warn(
                            category +
                            " 카테고리 생성 실패",
                            e
                        );

                    }


                    element =
                        document.getElementById(
                            "entryCategory" +
                            category
                        );
                }


                if (!element) return;


                /*
                 * 이름 복구
                 */

                if (data.__name) {

                    element.innerText =
                        data.__name;
                }


                /*
                 * inline style 복구
                 */

                if (data.__style) {

                    element.setAttribute(
                        "style",
                        data.__style
                    );
                }

            }
        );
    }


    /* =========================================
       7. 블록 메뉴 코드 생성
       ========================================= */

    function restoreCategoryCode() {

        const menu =
            Entry.playground
                ?.blockMenu;

        if (!menu) return;


        savedCategories.forEach(
            (_, category) => {

                try {

                    menu._generateCategoryCode?.(
                        category
                    );

                } catch (e) {}

            }
        );
    }


    /* =========================================
       8. 통합 복구
       ========================================= */

    function reconcile() {

        /*
         * 현재 새로 로드된 카테고리 확보
         */

        scanCategories();

        captureAppearance();


        /*
         * 엔트리 기본 카테고리는
         * 여기서 절대 재작성하지 않음
         */

        restoreStaticBlocks();

        restoreCategoryData();

        restoreCategoryElements();

        restoreCategoryCode();


        console.log(
            "✅ 비공식 카테고리:",
            [...savedCategories.keys()]
        );
    }


    /* =========================================
       9. 비공식 블록 로드 완료
       ========================================= */

    window.addEventListener(
        "message",
        event => {

            if (
                event.source !== window ||
                event.data?.source !==
                    "ENTRY_UNLIMITED_BLOCKS" ||
                event.data?.type !==
                    "UNOFFICIAL_LOADED"
            ) {
                return;
            }


            console.log(
                "📥 로드:",
                event.data.file
            );


            /*
             * 일반 A/B/C
             */

            reconcile();


            /*
             * Block2.0 대기
             */

            setTimeout(
                reconcile,
                100
            );


            /*
             * Express / right_click reload 대응
             */

            setTimeout(
                reconcile,
                500
            );


            setTimeout(
                reconcile,
                1500
            );
        }
    );


    window.UnofficialRuntime = {
        reconcile,

        getCategories() {
            return [
                ...savedCategories.keys()
            ];
        }
    };


    console.log(
        "✅ Runtime 준비 완료"
    );

})();
