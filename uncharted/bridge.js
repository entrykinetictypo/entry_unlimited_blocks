// isolated world
(function () {
    "use strict";

    console.log(
        "[언차티드 블록/bridge] 로드됨"
    );

    const UNCHARTED_FILE =
        "uncharted/inject.js";

    const NEW_STATE_KEY =
        "unofficialBlockStates_new";

    const NEW_PROJECT_PENDING =
        "entryUnlimitedNewProjectPending";

    const EXACT_NEW_PROJECT_URL =
        "https://playentry.org/ws/new?type=normal&mode=block&lang=ko";

    let loadStarted = false;


    /* =========================================
       현재 최상위 페이지 주소
       ========================================= */

    function getTopUrl() {
        try {
            return window.top.location.href;
        } catch (_) {
            return window.location.href;
        }
    }


    function getTopPath() {
        try {
            return window.top.location.pathname;
        } catch (_) {
            return window.location.pathname;
        }
    }


    /* =========================================
       현재 작품 storage key
       ========================================= */

    function getProjectStorageKey() {

        const path =
            getTopPath();

        const match =
            path.match(
                /^\/(?:ws|project)\/([a-f0-9]{24})(?:\/|$)/i
            );

        if (match) {
            return {
                key:
                    "unofficialBlockStates_" +
                    match[1],

                projectId:
                    match[1]
            };
        }

        if (
            path === "/ws/new" ||
            path.startsWith("/ws/new/")
        ) {
            return {
                key:
                    NEW_STATE_KEY,

                projectId:
                    null
            };
        }

        return null;
    }


    /* =========================================
       MAIN world script 로더
       ========================================= */

    function loadMainScript(file) {

        return new Promise(
            (resolve, reject) => {

                function inject() {

                    const root =
                        document.head ||
                        document.documentElement;

                    if (!root) {
                        setTimeout(
                            inject,
                            10
                        );
                        return;
                    }

                    const script =
                        document.createElement(
                            "script"
                        );

                    script.src =
                        chrome.runtime.getURL(
                            file
                        );

                    script.onload =
                        () => {

                            console.log(
                                "[언차티드 블록] 로드 완료:",
                                file
                            );

                            script.remove();

                            resolve();
                        };

                    script.onerror =
                        () => {

                            script.remove();

                            reject(
                                new Error(
                                    "로드 실패: " +
                                    file
                                )
                            );
                        };

                    root.appendChild(
                        script
                    );
                }

                inject();
            }
        );
    }


    /* =========================================
       체크 상태 확인 후 언차티드 로드
       ========================================= */

    function loadUnchartedIfEnabled() {

        if (loadStarted) {
            return;
        }


        const topUrl =
            getTopUrl();


        /*
         * 새 작품 최초 진입
         *
         * 이전 _new 설정을 절대 사용하면 안 됨.
         */
        if (
            topUrl ===
            EXACT_NEW_PROJECT_URL
        ) {

            if (
                window.top === window
            ) {

                sessionStorage.setItem(
                    NEW_PROJECT_PENDING,
                    "1"
                );

                chrome.storage.local.remove(
                    [
                        NEW_STATE_KEY,
                        "unofficialTempProject_new"
                    ],
                    () => {

                        console.log(
                            "[언차티드 블록] 새 작품 - 이전 _new 상태 초기화"
                        );
                    }
                );
            }

            console.log(
                "[언차티드 블록] 새 작품 최초 진입 - 로드 대기"
            );

            return;
        }


        const info =
            getProjectStorageKey();

        if (!info) {
            return;
        }


        const keys = [
            info.key
        ];


        /*
         * /ws/new에서 비공식 블록 선택 후
         * 실제 작품 ID가 생성된 직후라면
         *
         * content.js가 아직 _new → 작품ID 이동하기 전일 수 있음.
         */
        const pending =
            sessionStorage.getItem(
                NEW_PROJECT_PENDING
            ) === "1";


        if (
            info.projectId &&
            pending
        ) {
            keys.push(
                NEW_STATE_KEY
            );
        }


        chrome.storage.local.get(
            keys,
            async (result) => {

                let states =
                    result[
                        info.key
                    ];


                /*
                 * 작품 ID용 설정이 아직 없으면
                 * 방금 만든 새 작품의 _new 설정 사용
                 */
                if (
                    (!states ||
                        Object.keys(
                            states
                        ).length === 0) &&
                    info.projectId &&
                    pending
                ) {

                    states =
                        result[
                            NEW_STATE_KEY
                        ] || {};

                    console.log(
                        "[언차티드 블록] 새 작품 _new 상태 임시 사용"
                    );
                }


                states =
                    states || {};


                if (
                    states[
                        UNCHARTED_FILE
                    ] !== true
                ) {

                    console.log(
                        "[언차티드 블록] OFF"
                    );

                    return;
                }


                loadStarted =
                    true;


                console.log(
                    "[언차티드 블록] ON - 로드 시작"
                );


                try {

                    await loadMainScript(
                        "uncharted/matter.min.js"
                    );

                    await loadMainScript(
                        "uncharted/three.min.js"
                    );

                    await loadMainScript(
                        "uncharted/inject.js"
                    );


                    console.log(
                        "[언차티드 블록] 전체 로드 완료"
                    );

                } catch (error) {

                    loadStarted =
                        false;

                    console.error(
                        "[언차티드 블록] 로드 실패:",
                        error
                    );
                }
            }
        );
    }


    loadUnchartedIfEnabled();


    /* =========================================
       커스텀 코드 전달
       ========================================= */

    window.addEventListener(
        "message",
        function (event) {

            if (
                event.source !== window
            ) {
                return;
            }

            if (
                !event.data ||
                !event.data.type
            ) {
                return;
            }


            if (
                event.data.type ===
                "__UNCHARTED_REQUEST_SNIPPETS__"
            ) {

                chrome.storage.local.get(
                    "unchartedCustomSnippets",
                    function (result) {

                        const snippets =
                            result
                                .unchartedCustomSnippets ||
                            [];

                        window.postMessage(
                            {
                                type:
                                    "__UNCHARTED_SNIPPETS_RESPONSE__",

                                snippets:
                                    snippets
                            },
                            "*"
                        );
                    }
                );
            }


            if (
                event.data.type ===
                "__UNCHARTED_REQUEST_GROQ_KEY__"
            ) {

                chrome.storage.local.get(
                    "unchartedGroqApiKey",
                    function (result) {

                        window.postMessage(
                            {
                                type:
                                    "__UNCHARTED_GROQ_KEY_RESPONSE__",

                                apiKey:
                                    result
                                        .unchartedGroqApiKey ||
                                    ""
                            },
                            "*"
                        );
                    }
                );
            }
        }
    );

})();
