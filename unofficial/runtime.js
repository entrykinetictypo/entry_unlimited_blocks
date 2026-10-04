(() => {
    "use strict";

    if (window.__UNOFFICIAL_RUNTIME_LOADED__) return;
    window.__UNOFFICIAL_RUNTIME_LOADED__ = true;

    console.log("🚀 Unofficial Runtime 시작");


    /* ==================================================
       1. Entry 기본 상태 저장
       ================================================== */

    const menu =
        Entry.playground.mainWorkspace.blockMenu;

    const originalGenerateCategoryView =
        menu._generateCategoryView.bind(menu);


    function cloneCategory(item) {
        return {
            ...item,
            blocks: Array.isArray(item.blocks)
                ? [...item.blocks]
                : []
        };
    }


    const originalBlocks =
        Array.isArray(EntryStatic.getAllBlocks?.())
            ? EntryStatic.getAllBlocks().map(cloneCategory)
            : [];


    const baseCategoryIds =
        new Set(
            originalBlocks
                .filter(Boolean)
                .map(item => item.category)
        );


    /*
       현재 화면에 실제로 보이는
       공식 카테고리를 기억
    */

    const visibleBaseCategories =
        new Set();

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

            if (category) {
                visibleBaseCategories.add(category);
            }
        });


    console.log(
        "📦 기본 카테고리:",
        [...baseCategoryIds]
    );


    /* ==================================================
       2. 비공식 카테고리 저장소
       ================================================== */

    const unofficialCategories =
        new Map();


    function saveCategory(item) {

        if (
            !item ||
            !item.category ||
            baseCategoryIds.has(item.category)
        ) {
            return;
        }


        const old =
            unofficialCategories.get(
                item.category
            );


        const newBlocks =
            Array.isArray(item.blocks)
                ? item.blocks
                : [];


        unofficialCategories.set(
            item.category,
            {
                ...(old || {}),
                ...item,

                blocks:
                    newBlocks.length > 0
                        ? [...newBlocks]
                        : old?.blocks || []
            }
        );
    }


    /* ==================================================
       3. 현재 Entry 상태에서 비공식 카테고리 탐색
       ================================================== */

    function scanCategories() {

        const sources = [];


        /*
         * A형 / B형 / C형
         */

        try {

            const all =
                EntryStatic.getAllBlocks?.();

            if (Array.isArray(all)) {
                sources.push(all);
            }

        } catch (e) {
            console.warn(
                "getAllBlocks 읽기 실패",
                e
            );
        }


        /*
         * A형 / B형
         */

        if (Array.isArray(Entry.staticBlocks)) {
            sources.push(
                Entry.staticBlocks
            );
        }


        /*
         * C형 / D형
         */

        if (
            Array.isArray(
                Entry.playground
                    ?.blockMenu
                    ?._categoryData
            )
        ) {

            sources.push(
                Entry.playground
                    .blockMenu
                    ._categoryData
            );
        }


        sources.forEach(list => {

            list.forEach(item => {
                saveCategory(item);
            });

        });
    }


    /* ==================================================
       4. 카테고리 이름 / 스타일 기억
       ================================================== */

    function captureCategoryAppearance() {

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
                    baseCategoryIds.has(category)
                ) {
                    return;
                }


                const saved =
                    unofficialCategories.get(
                        category
                    ) || {
                        category,
                        blocks: []
                    };


                const text =
                    element.textContent
                        ?.trim();


                if (text) {
                    saved.__name = text;
                }


                const style =
                    element.getAttribute(
                        "style"
                    );


                if (style) {
                    saved.__style = style;
                }


                unofficialCategories.set(
                    category,
                    saved
                );
            });
    }


    function restoreCategoryAppearance() {

        unofficialCategories.forEach(
            (data, category) => {

                const element =
                    document.getElementById(
                        "entryCategory" +
                        category
                    );


                if (!element) return;


                if (data.__name) {

                    element.innerText =
                        data.__name;
                }


                if (data.__style) {

                    element.setAttribute(
                        "style",
                        data.__style
                    );
                }

            }
        );
    }


    /* ==================================================
       5. 통합 categoryData 생성
       ================================================== */

    function buildMergedCategories() {

        const result =
            originalBlocks.map(
                cloneCategory
            );


        unofficialCategories.forEach(
            data => {

                const copy =
                    cloneCategory(data);


                delete copy.__name;
                delete copy.__style;


                result.push(copy);

            }
        );


        return result;
    }


    /* ==================================================
       6. 카테고리 화면 생성용 목록
       ================================================== */

    function buildCategoryView() {

        const view = [];


        originalBlocks.forEach(item => {

            view.push({
                category: item.category,

                visible:
                    visibleBaseCategories
                        .has(item.category)
            });

        });


        unofficialCategories.forEach(
            (_, category) => {

                view.push({
                    category,
                    visible: true
                });

            }
        );


        return view;
    }


    /* ==================================================
       7. 핵심 복구
       ================================================== */

    function reconcile() {

        /*
         * redraw 전에
         * 현재 이름/스타일 확보
         */

        scanCategories();

        captureCategoryAppearance();


        const merged =
            buildMergedCategories();


        /*
         * canonical staticBlocks
         */

        Entry.staticBlocks =
            merged;


        /*
         * 이후 A형 등이 덮어써도
         * 다음 reconcile에서 다시 복구
         */

        EntryStatic.getAllBlocks =
            () => Entry.staticBlocks;


        /*
         * 메뉴 데이터 통합
         */

        if (
            Entry.playground
                ?.blockMenu
        ) {

            Entry.playground
                .blockMenu
                ._categoryData =
                merged;
        }


        /*
         * 메뉴 다시 그리기
         */

        try {

            originalGenerateCategoryView(
                buildCategoryView()
            );

        } catch (e) {

            console.error(
                "카테고리 redraw 실패",
                e
            );
        }


        /*
         * 이름 / inline style 복구
         */

        restoreCategoryAppearance();


        /*
         * 비공식 카테고리 코드 생성
         */

        unofficialCategories.forEach(
            (_, category) => {

                try {

                    menu._generateCategoryCode(
                        category
                    );

                } catch (e) {

                    console.warn(
                        category +
                        " category code 생성 실패",
                        e
                    );
                }

            }
        );


        console.log(
            "✅ Runtime 통합:",
            [...unofficialCategories.keys()]
        );
    }


    /* ==================================================
       8. content.js에서 보내는
          로드 완료 신호 받기
       ================================================== */

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
                "📥 로드 완료:",
                event.data.file
            );


            /*
             * A / B / C 즉시 처리
             */

            reconcile();


            /*
             * Block2.0처럼
             * setInterval을 사용하는 경우
             */

            setTimeout(
                reconcile,
                100
            );


            /*
             * Express / right_click처럼
             * 작품 재로드가 있는 경우
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


    /* ==================================================
       9. 디버그용
       ================================================== */

    window.UnofficialRuntime = {

        reconcile,

        getCategories() {
            return [
                ...unofficialCategories.keys()
            ];
        }

    };


    console.log(
        "✅ Unofficial Runtime 준비 완료"
    );

})();
