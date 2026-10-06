(() => {
    "use strict";

    const SOURCE = "ENTRY_UNLIMITED_BLOCKS";

    function sendState(enabled) {
        window.postMessage(
            {
                source: SOURCE,
                type: "SET_ENABLED",
                enabled: Boolean(enabled)
            },
            "*"
        );
    }

    function getCurrentState(callback) {
        chrome.storage.local.get(["enabled"], (result) => {
            const enabled =
                typeof result.enabled === "boolean"
                    ? result.enabled
                    : false;

            callback(enabled);
        });
    }

    getCurrentState((enabled) => {
        sendState(enabled);
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (
            areaName !== "local" ||
            !changes.enabled
        ) {
            return;
        }

        sendState(changes.enabled.newValue);
    });

    window.addEventListener(
        "message",
        (event) => {
            if (
                event.source !== window ||
                event.data?.source !== "ENTRY_UNLIMITED_BLOCKS_PATCH" ||
                event.data?.type !== "REQUEST_STATE"
            ) {
                return;
            }

            getCurrentState((enabled) => {
                sendState(enabled);
            });
        }
    );

    chrome.runtime.onMessage.addListener(
        (message, sender, sendResponse) => {

            if (message?.type === "ADD_ENTRY_BLOCK") {
                window.postMessage(
                    {
                        source: "ENTRY_UNLIMITED_BLOCKS",
                        type: "ADD_BLOCK",
                        blockId: message.blockId
                    },
                    "*"
                );

                sendResponse({
                    success: true
                });

                return;
            }

            if (message?.type === "LOAD_UNOFFICIAL_BLOCK") {
                const loadScript = (file, callback) => {
                    const script = document.createElement("script");

                    script.src = chrome.runtime.getURL(file);

                    script.onload = () => {
                        script.remove();

                        if (callback) {
                            callback();
                        }
                    };

                    document.documentElement.appendChild(script);
                };

              loadScript("unofficial/runtime.js", () => {
    loadScript(message.file, () => {
        window.postMessage({
            source: "ENTRY_UNLIMITED_BLOCKS",
            type: "UNOFFICIAL_LOADED",
            file: message.file
        }, "*");
    });
});

                sendResponse({
                    success: true
                });

                return;
            }

            if (message?.type === "ENTRY_ACTION") {
                window.postMessage(
                    {
                        source: "ENTRY_UNLIMITED_BLOCKS",
                        type: "ENTRY_ACTION",
                        action: message.action,
                        data: message.data || {}
                    },
                    "*"
                );

                sendResponse({
                    success: true
                });

                return;
            }
        }
    );

})();
function saveUnofficialBlock(projectId, file) {
    if (!projectId || !file) return;

    const key = `unofficial_${projectId}`;

    chrome.storage.local.get([key], (result) => {
        const files = result[key] || [];

        if (!files.includes(file)) {
            files.push(file);

            chrome.storage.local.set({
                [key]: files
            });

            console.log(
                "[비공식 블록 저장]",
                projectId,
                file
            );
        }
    });
}

window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    const data = event.data;

    if (
        !data ||
        data.source !== "ENTRY_UNLIMITED_BLOCKS" ||
        data.type !== "SAVE_UNOFFICIAL_BLOCK"
    ) {
        return;
    }

    saveUnofficialBlock(
        data.projectId,
        data.file
    );
});


function loadSavedUnofficialBlocks(projectId) {
   

    const loadOrder = [
        "unofficial/etc.js",
        "unofficial/right_click.js",
        "unofficial/nyang.js",
        "unofficial/express.js",
        "unofficial/special.js",
        "unofficial/kris.js",
        "unofficial/magnet.js",
        "unofficial/block20.js",
        "unofficial/common.js",
        "unofficial/tecsu.js",
        "unofficial/strong.js",
        "unofficial/mint.js",
        "unofficial/newblock.js",
        "unofficial/npi.js",
        "unofficial/dummy.js"
    ];

    chrome.storage.local.get(
        ["unofficialBlockStates"],
        (result) => {

            const states =
                result.unofficialBlockStates || {};

            const files =
                loadOrder.filter(
                    (file) => states[file] === true
                );

            console.log(
                "[비공식 블록 ON 목록]",
                files
            );

            if (!files.length) {
                console.log(
                    "[비공식 블록] 모두 OFF"
                );
                return;
            }

            const loadScript = (file, callback) => {
                const script =
                    document.createElement("script");

                script.src =
                    chrome.runtime.getURL(file);

                script.onload = () => {
                    script.remove();

                    if (callback) {
                        callback();
                    }
                };

                document.documentElement
                    .appendChild(script);
            };

            loadScript(
                "unofficial/runtime.js",
                () => {

                    let index = 0;

                    function loadNext() {

                       if (index >= files.length) {

    console.log(
        "[자동복원] 비공식 블록 정의 로드 완료"
    );


    /*
     * 저장된 작품일 때만
     * 서버 작품을 다시 불러옴
     */
    if (projectId) {

        window.postMessage(
            {
                source:
                    "ENTRY_UNLIMITED_BLOCKS",
                type:
                    "RESTORE_PROJECT_AFTER_UNOFFICIAL",
                projectId:
                    projectId
            },
            "*"
        );

    } else {

        console.log(
            "[새 작품] 작품 복원 없이 비공식 블록만 적용"
        );

    }


    return;
}

                        const file =
                            files[index++];

                        console.log(
                            "[자동복원] 불러오기:",
                            file
                        );

                        loadScript(
                            file,
                            () => {

                                window.postMessage(
                                    {
                                        source:
                                            "ENTRY_UNLIMITED_BLOCKS",
                                        type:
                                            "UNOFFICIAL_LOADED",
                                        file:
                                            file
                                    },
                                    "*"
                                );

                                loadNext();
                            }
                        );
                    }

                    loadNext();
                }
            );
        }
    );
}


window.addEventListener("message", (event) => {

    if (
        event.source !== window ||
        event.data?.source !==
            "ENTRY_UNLIMITED_BLOCKS_PATCH" ||
        event.data?.type !==
            "PROJECT_ID"
    ) {
        return;
    }

    loadSavedUnofficialBlocks(
        event.data.projectId
    );
});
/* =========================================
   공개 작품 - Block2.0 지원
   ========================================= */

const isPublicProjectPage =
    /^\/project\/[a-f0-9]{24}(?:\/|$)/i
        .test(window.location.pathname);

if (isPublicProjectPage) {

    chrome.storage.local.get(
        ["unofficialBlockStates"],
        (result) => {

            const states =
                result.unofficialBlockStates || {};

            if (
                states[
                    "unofficial/block20.js"
                ] !== true
            ) {
                return;
            }

            const script =
                document.createElement("script");

            script.src =
                chrome.runtime.getURL(
                    "unofficial/player20.js"
                );

            script.onload = () => {
                script.remove();
            };

            (
                document.head ||
                document.documentElement
            ).appendChild(script);
        }
    );
}
