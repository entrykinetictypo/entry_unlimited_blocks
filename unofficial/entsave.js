(() => {
    "use strict";

    if (
        window.__entryEntSaveLoaded ||
        window.__entryEntSaveLoading
    ) {
        return;
    }

    window.__entryEntSaveLoading = true;

    const CATEGORY =
        "unofficial_entsave";

    const CATEGORY_NAME =
        "ES";

    const PREFIX =
        "unofficial_entsave_";

    const saveColor =
        "#00CC66";

    const getColor =
        "#373737";


    function ready() {
        return !!(
            window.Entry &&
            window.EntryStatic &&
            Entry.block &&
            Array.isArray(Entry.staticBlocks) &&
            Entry.playground &&
            Entry.playground.mainWorkspace &&
            Entry.playground.mainWorkspace.blockMenu &&
            typeof window.$ === "function"
        );
    }


    function getStorageKey(
        projectId,
        key
    ) {
        /*
         * 원본 EntSave와 저장 데이터 호환 유지
         */
        return String(projectId) +
            String(key);
    }


    function updateCategory(
        category
    ) {
        const blockMenu =
            Entry.playground
                .mainWorkspace
                .blockMenu;

        const categoryList = [];

        const seen =
            new Set();


        Entry.staticBlocks.forEach(
            (item) => {

                if (
                    !item ||
                    !item.category ||
                    seen.has(
                        item.category
                    )
                ) {
                    return;
                }

                seen.add(
                    item.category
                );

                categoryList.push({
                    category:
                        item.category,

                    visible:
                        item.category !==
                        "arduino"
                });
            }
        );


        if (
            !seen.has(
                category
            )
        ) {
            categoryList.push({
                category:
                    category,

                visible:
                    true
            });
        }


        blockMenu
            ._generateCategoryView(
                categoryList
            );


        for (
            let i = 0;
            i <
            $(".entryCategoryElementWorkspace")
                .length;
            i++
        ) {

            const element =
                $(".entryCategoryElementWorkspace")[
                    i
                ];

            if (
                $(element)
                    .attr("id") !==
                "entryCategorytext"
            ) {

                $(element)
                    .attr(
                        "class",
                        "entryCategoryElementWorkspace"
                    );
            }
        }


        blockMenu._categoryData =
            Entry.staticBlocks;

        blockMenu
            ._generateCategoryCode(
                category
            );
    }


    function addBlock(
        name,
        block
    ) {

        Entry.block[
            name
        ] = {

            color:
                block.color.default,

            outerLine:
                block.color.darken ??
                block.color.default,

            fontColor:
                block.color.font,

            skeleton:
                block.skeleton,

            statement:
                [],

            params:
                block.params,

            events:
                {},

            def: {
                params:
                    block.def,

                type:
                    name
            },

            paramsKeyMap:
                block.map,

            class:
                block.class ||
                "default",

            func:
                block.func,

            template:
                block.template
        };
    }


    function init() {

        if (
            !ready()
        ) {
            return false;
        }


        const blocks = [

            /* =====================================
               안내
               ===================================== */

            {
                name:
                    PREFIX +
                    "text_introduce",

                template:
                    "%1",

                skeleton:
                    "basic_text",

                color: {
                    default:
                        EntryStatic
                            .colorSet
                            .common
                            .TRANSPARENT,

                    darken:
                        EntryStatic
                            .colorSet
                            .common
                            .TRANSPARENT
                },

                params: [
                    {
                        type:
                            "Text",

                        text:
                            "EntSave\n차원이다른 저장을 경험해보세요",

                        color:
                            EntryStatic
                                .colorSet
                                .common
                                .TEXT,

                        align:
                            "center"
                    }
                ],

                def:
                    [],

                map:
                    {},

                class:
                    "unofficial_entsave_text"
            },


            /* =====================================
               저장하기 제목
               ===================================== */

            {
                name:
                    PREFIX +
                    "save_title",

                template:
                    "%1",

                skeleton:
                    "basic_text",

                color: {
                    default:
                        EntryStatic
                            .colorSet
                            .common
                            .TRANSPARENT,

                    darken:
                        EntryStatic
                            .colorSet
                            .common
                            .TRANSPARENT
                },

                params: [
                    {
                        type:
                            "Text",

                        text:
                            "저장하기",

                        color:
                            EntryStatic
                                .colorSet
                                .common
                                .TEXT,

                        class:
                            "bold",

                        align:
                            "center"
                    }
                ],

                def:
                    [],

                map:
                    {},

                class:
                    "unofficial_entsave_save"
            },


            /* =====================================
               값 저장
               ===================================== */

            {
                name:
                    PREFIX +
                    "save",

                template:
                    "%1 : %2 를 사용자의컴퓨터에 저장하기%3",

                skeleton:
                    "basic",

                color: {
                    default:
                        saveColor,

                    darken:
                        saveColor
                },

                params: [
                    {
                        type:
                            "Block",

                        accept:
                            "string",

                        value:
                            "안녕"
                    },

                    {
                        type:
                            "Block",

                        accept:
                            "string",

                        value:
                            "엔트리"
                    },

                    {
                        type:
                            "Indicator",

                        img:
                            "block_icon/hardware_icon.svg",

                        size:
                            11
                    }
                ],

                def:
                    [],

                map: {
                    KEY:
                        0,

                    VALUE:
                        1
                },

                class:
                    "unofficial_entsave_save",

                func:
                    async (
                        sprite,
                        script
                    ) => {

                        const key =
                            script.getValue(
                                "KEY",
                                script
                            );

                        const value =
                            script.getValue(
                                "VALUE",
                                script
                            );


                        localStorage.setItem(
                            getStorageKey(
                                Entry.projectId,
                                key
                            ),
                            value
                        );
                    }
            },


            /* =====================================
               값 삭제
               ===================================== */

            {
                name:
                    PREFIX +
                    "remove",

                template:
                    "%1key와 value를 삭제하기%2",

                skeleton:
                    "basic",

                color: {
                    default:
                        saveColor,

                    darken:
                        saveColor
                },

                params: [
                    {
                        type:
                            "Block",

                        accept:
                            "string",

                        value:
                            "안녕"
                    },

                    {
                        type:
                            "Indicator",

                        img:
                            "block_icon/hardware_icon.svg",

                        size:
                            11
                    }
                ],

                def:
                    [],

                map: {
                    KEY:
                        0
                },

                class:
                    "unofficial_entsave_save",

                func:
                    async (
                        sprite,
                        script
                    ) => {

                        const key =
                            script.getValue(
                                "KEY",
                                script
                            );


                        localStorage.removeItem(
                            getStorageKey(
                                Entry.projectId,
                                key
                            )
                        );
                    }
            },


            /* =====================================
               가져오기 제목
               ===================================== */

            {
                name:
                    PREFIX +
                    "get_title",

                template:
                    "%1",

                skeleton:
                    "basic_text",

                color: {
                    default:
                        EntryStatic
                            .colorSet
                            .common
                            .TRANSPARENT,

                    darken:
                        EntryStatic
                            .colorSet
                            .common
                            .TRANSPARENT
                },

                params: [
                    {
                        type:
                            "Text",

                        text:
                            "가져오기",

                        color:
                            EntryStatic
                                .colorSet
                                .common
                                .TEXT,

                        align:
                            "center"
                    }
                ],

                def:
                    [],

                map:
                    {},

                class:
                    "unofficial_entsave_get"
            },


            /* =====================================
               현재 작품 값 가져오기
               ===================================== */

            {
                name:
                    PREFIX +
                    "get_value",

                template:
                    "%1key를 가진 value값",

                skeleton:
                    "basic_string_field",

                color: {
                    default:
                        getColor,

                    darken:
                        getColor
                },

                params: [
                    {
                        type:
                            "Block",

                        accept:
                            "string",

                        value:
                            "안녕"
                    }
                ],

                def:
                    [],

                map: {
                    KEY:
                        0
                },

                class:
                    "unofficial_entsave_get",

                func:
                    async (
                        sprite,
                        script
                    ) => {

                        const key =
                            script.getValue(
                                "KEY",
                                script
                            );


                        return localStorage
                            .getItem(
                                getStorageKey(
                                    Entry.projectId,
                                    key
                                )
                            );
                    }
            },


            /* =====================================
               다른 작품 값 가져오기
               ===================================== */

            {
                name:
                    PREFIX +
                    "get_project",

                template:
                    "%1id를 가진 작품의 %2key를 가진 value값",

                skeleton:
                    "basic_string_field",

                color: {
                    default:
                        getColor,

                    darken:
                        getColor
                },

                params: [
                    {
                        type:
                            "Block",

                        accept:
                            "string",

                        value:
                            "10"
                    },

                    {
                        type:
                            "Block",

                        accept:
                            "string",

                        value:
                            "안녕"
                    }
                ],

                def:
                    [],

                map: {
                    ID:
                        0,

                    KEY:
                        1
                },

                class:
                    "unofficial_entsave_get",

                func:
                    async (
                        sprite,
                        script
                    ) => {

                        const id =
                            script.getValue(
                                "ID",
                                script
                            );

                        const key =
                            script.getValue(
                                "KEY",
                                script
                            );


                        return localStorage
                            .getItem(
                                getStorageKey(
                                    id,
                                    key
                                )
                            );
                    }
            },


            /* =====================================
               작품 ID
               ===================================== */

            {
                name:
                    PREFIX +
                    "get_id",

                template:
                    "이 작품의 아이디",

                skeleton:
                    "basic_string_field",

                color: {
                    default:
                        getColor,

                    darken:
                        getColor
                },

                params:
                    [],

                def:
                    [],

                map:
                    {},

                class:
                    "unofficial_entsave_get",

                func:
                    async () => {

                        return Entry.projectId;
                    }
            }
        ];


        const blockIds =
            [];


        blocks.forEach(
            (block) => {

                blockIds.push(
                    block.name
                );

                addBlock(
                    block.name,
                    block
                );
            }
        );


        /* =========================================
           기존 동일 카테고리 제거
           ========================================= */

        for (
            let i =
                Entry.staticBlocks.length - 1;
            i >= 0;
            i--
        ) {

            if (
                Entry.staticBlocks[i]
                    ?.category ===
                CATEGORY
            ) {

                Entry.staticBlocks.splice(
                    i,
                    1
                );
            }
        }


        /* =========================================
           EntSave 카테고리 추가
           ========================================= */

        Entry.staticBlocks.push({
            category:
                CATEGORY,

            blocks:
                blockIds
        });


        updateCategory(
            CATEGORY
        );


        /* =========================================
           아이콘
           ========================================= */

        if (
            !document.getElementById(
                "unofficial-entsave-style"
            )
        ) {

            $("head").append(`
<style id="unofficial-entsave-style">

#entryCategory${CATEGORY} {
    background-image:
        url(/lib/entry-js/images/variable.svg);

    background-repeat:
        no-repeat;

    margin-bottom:
        1px;
}

.entrySelectedCategory#entryCategory${CATEGORY} {
    background-image:
        url(/lib/entry-js/images/variable_on.svg);

    background-color:
        #8c22e3;

    color:
        #fff;
}

</style>
            `);
        }


        const categoryElement =
            $(
                `#entryCategory${CATEGORY}`
            );


        if (
            categoryElement.length &&
            !categoryElement
                .text()
                .includes(
                    CATEGORY_NAME
                )
        ) {

            categoryElement.append(
                CATEGORY_NAME
            );
        }


        window.__entryEntSaveLoaded =
            true;

        window.__entryEntSaveLoading =
            false;


        console.log(
            "[EntSave] 등록 완료"
        );


        return true;
    }


    if (
        init()
    ) {
        return;
    }


    let retryCount =
        0;


    const timer =
        setInterval(
            () => {

                retryCount++;


                if (
                    init() ||
                    retryCount >= 200
                ) {

                    clearInterval(
                        timer
                    );


                    if (
                        !window
                            .__entryEntSaveLoaded
                    ) {

                        window
                            .__entryEntSaveLoading =
                            false;


                        console.warn(
                            "[EntSave] Entry 준비 시간 초과"
                        );
                    }
                }

            },
            100
        );

})();
