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
if (
    message?.type ===
    "SAVE_AND_RELOAD_UNOFFICIAL"
) {
    window.postMessage(
        {
            source:
                "ENTRY_UNLIMITED_BLOCKS",
            type:
                "EXPORT_PROJECT_FOR_UNOFFICIAL"
        },
        "*"
    );

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

/* =========================================
   비공식 블록 적용 전 작품 임시 저장
   ========================================= */

window.addEventListener("message", (event) => {

    if (
        event.source !== window ||
        event.data?.source !==
            "ENTRY_UNLIMITED_BLOCKS_PATCH" ||
        event.data?.type !==
            "EXPORTED_PROJECT_FOR_UNOFFICIAL"
    ) {
        return;
    }

    const project =
        event.data.project;

    if (!project) {
        return;
    }

    const match =
        window.location.pathname.match(
            /^\/ws\/([a-f0-9]{24})(?:\/|$)/i
        );

    const projectKey =
        match
            ? match[1]
            : "new";

    const storageKey =
        "unofficialTempProject_" +
        projectKey;

    chrome.storage.local.set(
        {
            [storageKey]: project
        },
        () => {

            console.log(
                "[비공식 블록] 현재 작품 임시 저장 완료",
                storageKey
            );
window.location.reload();
           
        }
    );
});
window.addEventListener("message", (event) => {

    if (
        event.source !== window ||
        event.data?.source !==
            "ENTRY_UNLIMITED_BLOCKS_PATCH" ||
        event.data?.type !==
            "TEMP_PROJECT_RESTORED_FOR_UNOFFICIAL"
    ) {
        return;
    }

    const storageKey =
        event.data.storageKey;

    if (!storageKey) {
        return;
    }

    chrome.storage.local.remove(
        [storageKey],
        () => {
            console.log(
                "[비공식 블록] 임시 작품 삭제 완료",
                storageKey
            );
        }
    );
});
function dismissEntryRecoveryPopup() {

    const match =
        window.location.pathname.match(
            /^\/ws\/([a-f0-9]{24}|new)(?:\/|$)/i
        );

    if (!match) {
        return;
    }

    const projectKey =
        match[1] === "new"
            ? "new"
            : match[1];

    const tempKey =
        "unofficialTempProject_" +
        projectKey;

    chrome.storage.local.get(
        [tempKey],
        (result) => {

            if (!result[tempKey]) {
                return;
            }

            let count = 0;

            const timer =
                setInterval(() => {

                    count++;

                    const documents = [
                        document
                    ];

                    document
                        .querySelectorAll("iframe")
                        .forEach((iframe) => {
                            try {
                                if (
                                    iframe.contentDocument
                                ) {
                                    documents.push(
                                        iframe.contentDocument
                                    );
                                }
                            } catch (_) {}
                        });

                    for (
                        const doc of documents
                    ) {

                        const elements =
                            [
                                ...doc.querySelectorAll(
                                    "button, [role='button'], div, span"
                                )
                            ];

                        const noElement =
                            elements.find(
                                (element) =>
                                    element.textContent
                                        ?.trim() === "아니요"
                            );

                        if (!noElement) {
                            continue;
                        }

                        const clickable =
                            noElement.closest(
                                "button, [role='button']"
                            ) ||
                            noElement;

                        clickable.click();

                        console.log(
                            "[비공식 블록] 작품 복구창 아니요 자동 클릭"
                        );

                        clearInterval(
                            timer
                        );

                        return;
                    }

                    if (count >= 150) {
                        clearInterval(
                            timer
                        );
                    }

                }, 100);
        }
    );
}

dismissEntryRecoveryPopup();
function restoreTempOrServerProject(projectId) {

    const tempKey =
        "unofficialTempProject_" +
        (projectId || "new");

    chrome.storage.local.get(
        [tempKey],
        (result) => {

            const tempProject =
                result[tempKey];

            if (tempProject) {

                window.postMessage(
                    {
                        source:
                            "ENTRY_UNLIMITED_BLOCKS",
                        type:
                            "RESTORE_TEMP_PROJECT_AFTER_UNOFFICIAL",
                        project:
                            tempProject,
                        projectId:
                            projectId || null,
                        storageKey:
                            tempKey
                    },
                    "*"
                );

                return;
            }

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
            }
        }
    );
}
function loadSavedUnofficialBlocks(projectId) {
  

   const loadOrder = [
    "unofficial/etc.js",
    "unofficial/nyang.js",
    "unofficial/express.js",
    "unofficial/strong.js",
    "unofficial/right_click.js",
    "unofficial/special.js",
    "unofficial/kris.js",
    "unofficial/magnet.js",
    "unofficial/block20.js",
    "unofficial/common.js",
    "unofficial/tecsu.js",
    "unofficial/mint.js",
    "unofficial/newblock.js",
    "unofficial/npi.js",
    "unofficial/dummy.js",
];

    const storageKey =
    projectId
        ? "unofficialBlockStates_" + projectId
        : "unofficialBlockStates_new";

chrome.storage.local.get(
    [storageKey],
    (result) => {

        const states =
            result[storageKey] || {};
         

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

    restoreTempOrServerProject(
        projectId
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

                            restoreTempOrServerProject(
                                projectId
                            );

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
   공개 작품 - SPA 이동 감지 + public runtime 주입
   ========================================= */

let lastPublicProjectId = null;
let wasPublicProject = false;

function checkPublicProject() {

    const match =
        window.location.pathname.match(
            /^\/project\/([a-f0-9]{24})(?:\/|$)/i
        );

    if (!match) {
        wasPublicProject = false;
        return;
    }

    const projectId = match[1];

    if (
        wasPublicProject &&
        lastPublicProjectId === projectId
    ) {
        return;
    }

    wasPublicProject = true;
    lastPublicProjectId = projectId;

    console.log(
        "[공개 작품] public-runtime 주입",
        projectId
    );

    const script =
        document.createElement("script");

    script.src =
        chrome.runtime.getURL(
            "unofficial/public-runtime.js"
        );

    script.onload = () => {

        console.log(
            "[공개 작품] public-runtime 로드 완료"
        );

        script.remove();
    };

    (
        document.head ||
        document.documentElement
    ).appendChild(script);
}


/*
 * 최초 접속
 */
checkPublicProject();


/*
 * Entry SPA 주소 변경 감지
 */
setInterval(
    checkPublicProject,
    300
);
const EXACT_NEW_PROJECT_URL =
    "https://playentry.org/ws/new?type=normal&mode=block&lang=ko";

const NEW_PROJECT_PENDING =
    "entryUnlimitedNewProjectPending";


/*
 * 진짜 새 작품 화면에 처음 들어옴
 */
if (
    window.top === window &&
    window.location.href === EXACT_NEW_PROJECT_URL
) {

    // 지금부터 만들어질 작품이라는 표시
    sessionStorage.setItem(
        NEW_PROJECT_PENDING,
        "1"
    );

    // 이전 새 작품의 찌꺼기 제거
    chrome.storage.local.remove(
        [
            "unofficialBlockStates_new",
            "unofficialTempProject_new"
        ],
        () => {
            console.log(
                "[새 작품] 이전 새 작품 설정 초기화"
            );
        }
    );
}


/*
 * /ws/new 에서 생성된 설정을
 * 실제 작품 ID로 이동
 */
function migrateNewProjectData(
    projectId,
    callback
) {

    if (
        !projectId ||
        sessionStorage.getItem(
            NEW_PROJECT_PENDING
        ) !== "1"
    ) {

        callback();
        return;
    }


    const oldStateKey =
        "unofficialBlockStates_new";

    const newStateKey =
        "unofficialBlockStates_" +
        projectId;

    const oldTempKey =
        "unofficialTempProject_new";

    const newTempKey =
        "unofficialTempProject_" +
        projectId;


    chrome.storage.local.get(
        [
            oldStateKey,
            oldTempKey
        ],
        (result) => {

            const saveData = {};


            if (
                result[
                    oldStateKey
                ]
            ) {

                saveData[
                    newStateKey
                ] =
                    result[
                        oldStateKey
                    ];
            }


            if (
                result[
                    oldTempKey
                ]
            ) {

                saveData[
                    newTempKey
                ] =
                    result[
                        oldTempKey
                    ];
            }


            const finish = () => {

                chrome.storage.local.remove(
                    [
                        oldStateKey,
                        oldTempKey
                    ],
                    () => {

                        sessionStorage.removeItem(
                            NEW_PROJECT_PENDING
                        );

                        console.log(
                            "[새 작품] 설정 이동 완료:",
                            projectId
                        );

                        callback();
                    }
                );
            };


            if (
                Object.keys(
                    saveData
                ).length
            ) {

                chrome.storage.local.set(
                    saveData,
                    finish
                );

            } else {

                finish();
            }
        }
    );
}
