// 언차티드 블록 bridge
// 체크된 작품에서만 MAIN world에 언차티드 로드

(function () {

    console.log(
        "[언차티드 블록/bridge] 시작"
    );


    /* =========================
       현재 작품 storage key
       ========================= */

    function getProjectStorageKey() {

        let path =
            window.location.pathname;

        try {

            if (
                window.top &&
                window.top.location
            ) {
                path =
                    window.top.location.pathname;
            }

        } catch (_) {}


        const match =
            path.match(
                /^\/(?:ws|project)\/([a-f0-9]{24})(?:\/|$)/i
            );


        if (match) {

            return (
                "unofficialBlockStates_" +
                match[1]
            );

        }


        if (
            path === "/ws" ||
            path.startsWith("/ws/new")
        ) {

            return "unofficialBlockStates_new";

        }


        return null;
    }


    /* =========================
       MAIN world JS 로더
       ========================= */

    function loadMainScript(file) {

        return new Promise(
            (resolve, reject) => {

                function tryLoad() {

                    const parent =
                        document.documentElement ||
                        document.head ||
                        document.body;


                    if (!parent) {

                        setTimeout(
                            tryLoad,
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


                    script.onload = () => {

                        script.remove();

                        console.log(
                            "[언차티드 블록] 로드 완료:",
                            file
                        );

                        resolve();
                    };


                    script.onerror = () => {

                        script.remove();

                        console.error(
                            "[언차티드 블록] 로드 실패:",
                            file
                        );

                        reject(
                            new Error(
                                "로드 실패: " +
                                file
                            )
                        );
                    };


                    parent.appendChild(
                        script
                    );
                }


                tryLoad();
            }
        );
    }


    /* =========================
       체크 여부 확인 후 로드
       ========================= */

    function loadUnchartedIfEnabled() {

        const storageKey =
            getProjectStorageKey();


        if (!storageKey) {

            return;

        }


        chrome.storage.local.get(
            [storageKey],
            async (result) => {

                const states =
                    result[storageKey] || {};


                const enabled =
                    states[
                        "uncharted/inject.js"
                    ] === true;


                if (!enabled) {

                    console.log(
                        "[언차티드 블록] OFF"
                    );

                    return;
                }


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

                    console.error(
                        "[언차티드 블록] 로드 중 오류",
                        error
                    );

                }
            }
        );
    }


    loadUnchartedIfEnabled();


    /* =========================
       inject.js ↔ storage 통신
       ========================= */

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
