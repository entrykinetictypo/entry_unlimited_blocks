(() => {
    "use strict";

    if (
        window.__entryFileIOBlocksLoaded ||
        window.__entryFileIOBlocksLoading
    ) {
        return;
    }

    window.__entryFileIOBlocksLoading = true;

    const BLOCK_IDS = [
        "unofficial_file_ask",
        "unofficial_file_count",
        "unofficial_file_name",
        "unofficial_file_size",
        "unofficial_file_byte"
    ];

    let files = [];
    let uploadPopupOpen = false;

    function isReady() {
        return !!(
            window.Entry &&
            Entry.block &&
            Entry.engine &&
            Entry.playground &&
            Entry.playground.blockMenu &&
            typeof Entry.playground.blockMenu._buildCategoryCodes === "function"
        );
    }

    function init() {
        if (!isReady()) {
            return false;
        }

        /* =========================================
           파일 선택 팝업
           ========================================= */

        const POPUP_ID =
            "unofficialFileUploadPopup";

        const CLOSE_ID =
            "unofficialFileUploadClose";

        const IMAGE_ID =
            "unofficialFileUploadImage";

        const STOP_ID =
            "unofficialFileUploadStop";


        let uploadPopup =
            document.getElementById(
                POPUP_ID
            );


        if (!uploadPopup) {

            uploadPopup =
                document.createElement(
                    "div"
                );

            uploadPopup.id =
                POPUP_ID;


            uploadPopup.innerHTML = `
<div class="dimmed__c1156">
    <div class="center__c1156">
        <div class="modal__c1156"
             style="min-height:unset;">

            <div class="head__c1156">

                <div class="text__c1156">
                    파일 입력하기
                </div>

                <div
                    class="close__c1156"
                    id="${CLOSE_ID}">
                </div>

            </div>

            <div class="body__c1156">

                <img
                    src="https://raw.githack.com/vlzi/entryfile/main/upload.svg"
                    style="height:40vh;cursor:pointer;"
                    id="${IMAGE_ID}"
                >

                <p style="padding:0 0 25px 0;">
                    클릭하여 파일을 입력해주세요.
                </p>

            </div>

            <div class="footer__c1156">

                <div class="content__c1156">

                    <div
                        class="chart_button__c1156 stop__c1156"
                        id="${STOP_ID}">
                        작품 정지하기
                    </div>

                </div>

            </div>

        </div>
    </div>
</div>
`;

            uploadPopup.style.display =
                "none";

            document.body.appendChild(
                uploadPopup
            );
        }


        /* =========================================
           닫기
           ========================================= */

        const closeButton =
            document.getElementById(
                CLOSE_ID
            );

        if (closeButton) {

            closeButton.onclick =
                () => {

                    files = [];

                    uploadPopup.style.display =
                        "none";

                    uploadPopupOpen =
                        false;
                };
        }


        /* =========================================
           파일 선택
           ========================================= */

        const uploadImage =
            document.getElementById(
                IMAGE_ID
            );

        if (uploadImage) {

            uploadImage.onclick =
                () => {

                    const input =
                        document.createElement(
                            "input"
                        );

                    input.type =
                        "file";

                    input.multiple =
                        true;


                    input.onchange =
                        async () => {

                            try {

                                files =
                                    await Promise.all(
                                        Array.from(
                                            input.files || []
                                        ).map(
                                            (file) =>
                                                new Promise(
                                                    (
                                                        resolve,
                                                        reject
                                                    ) => {

                                                        const reader =
                                                            new FileReader();


                                                        reader.onload =
                                                            (
                                                                event
                                                            ) => {

                                                                resolve({
                                                                    name:
                                                                        file.name,

                                                                    bytes:
                                                                        new Uint8Array(
                                                                            event
                                                                                .target
                                                                                .result
                                                                        )
                                                                });
                                                            };


                                                        reader.onerror =
                                                            () => {

                                                                reject(
                                                                    reader.error
                                                                );
                                                            };


                                                        reader.readAsArrayBuffer(
                                                            file
                                                        );
                                                    }
                                                )
                                        )
                                    );


                                console.log(
                                    "[파일블록] 선택된 파일:",
                                    files
                                );

                            } catch (
                                error
                            ) {

                                console.error(
                                    "[파일블록] 파일 읽기 실패:",
                                    error
                                );

                                files = [];
                            }


                            uploadPopup.style.display =
                                "none";

                            uploadPopupOpen =
                                false;
                        };


                    input.click();
                };
        }


        /* =========================================
           작품 정지
           ========================================= */

        const stopButton =
            document.getElementById(
                STOP_ID
            );

        if (stopButton) {

            stopButton.onclick =
                async () => {

                    try {

                        if (
                            Entry.engine &&
                            Entry.engine.stopButton
                        ) {
                            await Entry.engine
                                .stopButton
                                .click();
                        }

                    } catch (
                        error
                    ) {

                        console.warn(
                            "[파일블록] 작품 정지 실패:",
                            error
                        );
                    }


                    files = [];

                    uploadPopup.style.display =
                        "none";

                    uploadPopupOpen =
                        false;
                };
        }


        /* =========================================
           1. 파일 요청하고 기다리기
           ========================================= */

        Entry.block.unofficial_file_ask = {

            color:
                "#dd47d8",

            outerLine:
                "#b819b3",

            skeleton:
                "basic",

            statements:
                [],

            events:
                {},

            class:
                "unofficial_file",

            params: [
                {
                    type:
                        "Text",

                    text:
                        "파일 요청하고 기다리기",

                    color:
                        "#FFF"
                },

                {
                    type:
                        "Indicator",

                    img:
                        "block_icon/variable_icon.svg",

                    size:
                        11
                }
            ],

            def: {

                params: [
                    null,
                    null
                ],

                type:
                    "unofficial_file_ask",

                category:
                    "variable",

                id:
                    "UFILE0"
            },

            template:
                "%1%2",

            isFor: [
                "category_variable"
            ],

            func: (
                spr,
                scr
            ) => {

                if (
                    scr.__unofficialFileWaiting
                ) {

                    if (
                        uploadPopupOpen
                    ) {
                        return scr;
                    }


                    delete scr
                        .__unofficialFileWaiting;

                    return;
                }


                if (
                    uploadPopupOpen
                ) {
                    throw new Error(
                        "이미 파일을 요청중입니다."
                    );
                }


                uploadPopup.style.display =
                    "block";

                uploadPopupOpen =
                    true;

                scr.__unofficialFileWaiting =
                    true;


                return scr;
            }
        };


        /* =========================================
           2. 파일 수
           ========================================= */

        Entry.block.unofficial_file_count = {

            color:
                "#dd47d8",

            outerLine:
                "#b819b3",

            skeleton:
                "basic_string_field",

            statements:
                [],

            events:
                {},

            class:
                "unofficial_file",

            params: [
                {
                    type:
                        "Text",

                    text:
                        " 파일 수 ",

                    color:
                        "#FFF"
                }
            ],

            def: {

                params: [
                    null
                ],

                type:
                    "unofficial_file_count",

                category:
                    "variable",

                id:
                    "UFILE1"
            },

            template:
                "%1",

            isFor: [
                "category_variable"
            ],

            func: () => {
                return files.length;
            }
        };


        /* =========================================
           3. 파일 이름
           ========================================= */

        Entry.block.unofficial_file_name = {

            color:
                "#dd47d8",

            outerLine:
                "#b819b3",

            skeleton:
                "basic_string_field",

            statements:
                [],

            events:
                {},

            class:
                "unofficial_file",

            params: [
                {
                    type:
                        "Block",

                    accept:
                        "string",

                    defaultType:
                        "number"
                },

                {
                    type:
                        "Text",

                    text:
                        "번째 파일의 이름",

                    color:
                        "#FFF"
                }
            ],

            def: {

                params: [
                    1,
                    null
                ],

                type:
                    "unofficial_file_name",

                category:
                    "variable",

                id:
                    "UFILE2"
            },

            paramsKeyMap: {
                index:
                    0
            },

            template:
                "%1%2",

            isFor: [
                "category_variable"
            ],

            func: (
                spr,
                scr
            ) => {

                const index =
                    parseInt(
                        scr.getValue(
                            "index",
                            scr
                        )
                    );


                if (
                    index < 1 ||
                    index > files.length
                ) {
                    throw new Error(
                        "범위 바깥입니다."
                    );
                }


                return files[
                    index - 1
                ].name;
            }
        };


        /* =========================================
           4. 파일 크기
           ========================================= */

        Entry.block.unofficial_file_size = {

            color:
                "#dd47d8",

            outerLine:
                "#b819b3",

            skeleton:
                "basic_string_field",

            statements:
                [],

            events:
                {},

            class:
                "unofficial_file",

            params: [
                {
                    type:
                        "Block",

                    accept:
                        "string",

                    defaultType:
                        "number"
                },

                {
                    type:
                        "Text",

                    text:
                        "번째 파일의 크기",

                    color:
                        "#FFF"
                }
            ],

            def: {

                params: [
                    1,
                    null
                ],

                type:
                    "unofficial_file_size",

                category:
                    "variable",

                id:
                    "UFILE3"
            },

            paramsKeyMap: {
                index:
                    0
            },

            template:
                "%1%2",

            isFor: [
                "category_variable"
            ],

            func: (
                spr,
                scr
            ) => {

                const index =
                    parseInt(
                        scr.getValue(
                            "index",
                            scr
                        )
                    );


                if (
                    index < 1 ||
                    index > files.length
                ) {
                    throw new Error(
                        "범위 바깥입니다."
                    );
                }


                return files[
                    index - 1
                ].bytes.length;
            }
        };


        /* =========================================
           5. 파일 바이트
           ========================================= */

        Entry.block.unofficial_file_byte = {

            color:
                "#dd47d8",

            outerLine:
                "#b819b3",

            skeleton:
                "basic_string_field",

            statements:
                [],

            events:
                {},

            class:
                "unofficial_file",

            params: [
                {
                    type:
                        "Block",

                    accept:
                        "string",

                    defaultType:
                        "number"
                },

                {
                    type:
                        "Text",

                    text:
                        "번째 파일의",

                    color:
                        "#FFF"
                },

                {
                    type:
                        "Block",

                    accept:
                        "string",

                    defaultType:
                        "number"
                },

                {
                    type:
                        "Text",

                    text:
                        "번째 바이트",

                    color:
                        "#FFF"
                }
            ],

            def: {

                params: [
                    {
                        type:
                            "number",

                        params: [
                            1
                        ],

                        id:
                            "ufile_p1"
                    },

                    null,

                    {
                        type:
                            "number",

                        params: [
                            1
                        ],

                        id:
                            "ufile_p2"
                    },

                    null
                ],

                type:
                    "unofficial_file_byte",

                category:
                    "variable",

                id:
                    "UFILE4"
            },

            paramsKeyMap: {

                fileIndex:
                    0,

                byteIndex:
                    2
            },

            template:
                "%1%2%3%4",

            isFor: [
                "category_variable"
            ],

            func: (
                spr,
                scr
            ) => {

                const fileIndex =
                    parseInt(
                        scr.getValue(
                            "fileIndex",
                            scr
                        )
                    );


                if (
                    fileIndex < 1 ||
                    fileIndex > files.length
                ) {
                    throw new Error(
                        "파일 범위 바깥입니다."
                    );
                }


                const bytes =
                    files[
                        fileIndex - 1
                    ].bytes;


                const byteIndex =
                    parseInt(
                        scr.getValue(
                            "byteIndex",
                            scr
                        )
                    );


                if (
                    byteIndex < 1 ||
                    byteIndex > bytes.length
                ) {
                    throw new Error(
                        "바이트 범위 바깥입니다."
                    );
                }


                return bytes[
                    byteIndex - 1
                ];
            }
        };


        /* =========================================
           변수 카테고리에 블록 추가
           ========================================= */

        const blockMenu =
            Entry.playground.blockMenu;


        const codes =
            blockMenu._buildCategoryCodes(
                BLOCK_IDS,
                "variable"
            );


        codes.forEach(
            (thread) => {

                if (
                    !thread ||
                    !thread[0]
                ) {
                    return;
                }


                blockMenu._createThread(
                    thread
                );
            }
        );


        if (
            blockMenu.code &&
            blockMenu.code.changeEvent
        ) {
            blockMenu.code
                .changeEvent
                .notify();
        }


        window.__entryFileIOBlocksLoaded =
            true;

        window.__entryFileIOBlocksLoading =
            false;


        console.log(
            "[파일블록] 등록 완료"
        );


        return true;
    }


    /* =========================================
       Entry 준비 대기
       ========================================= */

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
                            .__entryFileIOBlocksLoaded
                    ) {

                        window
                            .__entryFileIOBlocksLoading =
                            false;


                        console.warn(
                            "[파일블록] Entry 준비 시간 초과"
                        );
                    }
                }

            },
            100
        );

})();
