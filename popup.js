document.documentElement.style.display = "none";

(async () => {

    const [tab] =
        await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

    const url =
        tab?.url || "";
const isEntryPage =
    /^https:\/\/playentry\.org\/(?:ws|project)(?:\/|$)/i
        .test(url) ||
    /^https:\/\/playentry\.org\/community\/tips\/list(?:\?|$)/i
        .test(url);
   

    if (!isEntryPage) {
        window.close();
        return;
    }

    document.documentElement.style.display = "";

})();
const statusText = document.getElementById("status");
const toggleButton = document.getElementById("toggle");


function updateUI(enabled) {
    if (enabled) {
        statusText.textContent = "현재 상태: 켜짐";
        toggleButton.textContent = "끄기";
    } else {
        statusText.textContent = "현재 상태: 꺼짐";
        toggleButton.textContent = "켜기";
    }
}

chrome.storage.local.get(["enabled"], (result) => {
    const enabled =
        typeof result.enabled === "boolean"
            ? result.enabled
            : false;

    updateUI(enabled);
});

toggleButton.addEventListener("click", () => {
    chrome.storage.local.get(["enabled"], (result) => {
        const current =
            typeof result.enabled === "boolean"
                ? result.enabled
                : false;

        const next = !current;

        chrome.storage.local.set(
            {
                enabled: next
            },
            () => {
                updateUI(next);
            }
        );
    });
});

const blockIdInput = document.getElementById("blockId");
const addBlockButton = document.getElementById("addBlock");
const addResult = document.getElementById("addResult");

addBlockButton.addEventListener("click", async () => {
    const blockId = blockIdInput.value.trim();

    if (!blockId) {
        alert("블록 ID를 입력하세요.");
        return;
    }

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    if (!tab || !tab.id) {
        alert("현재 탭을 찾을 수 없습니다.");
        return;
    }

    if (
        !tab.url ||
        !tab.url.startsWith("https://playentry.org/ws/")
    ) {
        alert("엔트리 작품 만들기 페이지가 아닙니다.");
        return;
    }

    chrome.tabs.sendMessage(
        tab.id,
        {
            type: "ADD_ENTRY_BLOCK",
            blockId: blockId
        },
        (response) => {
            if (chrome.runtime.lastError) {
    alert("엔트리 작품 만들기 페이지가 아닙니다.");
    return;
}

if (response?.success) {
    saveRecentBlock(blockId);
    addResult.textContent = `추가 요청 완료: ${blockId}`;
} else {
    alert("블록 추가에 실패했습니다.");
}
        }
    );
});
function saveRecentBlock(blockId) {
    chrome.storage.local.get(["recentBlocks"], (result) => {
        let recentBlocks = Array.isArray(result.recentBlocks)
            ? result.recentBlocks
            : [];

        recentBlocks = recentBlocks.filter(
            (id) => id !== blockId
        );

        recentBlocks.unshift(blockId);

        recentBlocks = recentBlocks.slice(0, 10);

        chrome.storage.local.set({
            recentBlocks: recentBlocks
        }, () => {
            renderRecentBlocks();
        });
    });
}
const recentBlocksBox = document.getElementById("recentBlocks");

function renderRecentBlocks() {
    chrome.storage.local.get(["recentBlocks"], (result) => {
        const recentBlocks = Array.isArray(result.recentBlocks)
            ? result.recentBlocks
            : [];

        recentBlocksBox.innerHTML = "";

        recentBlocks.forEach((blockId) => {
    const button = document.createElement("button");

    button.textContent = blockId;

    button.style.display = "block";
    button.style.width = "100%";
    button.style.marginBottom = "6px";
    button.style.padding = "8px";
    button.style.cursor = "pointer";

    button.addEventListener("click", () => {
        blockIdInput.value = blockId;
        addBlockButton.click();
    });

    recentBlocksBox.appendChild(button);
});
    });
}

renderRecentBlocks();
const unofficialBlocksBox = document.getElementById("unofficialBlocks");

const unofficialBlocks = [
{name:"더미데이터",file:"unofficial/dummy.js"},
{name:"강력크블록",file:"unofficial/strong.js"},
{name:"공용블록",file:"unofficial/common.js"},
{name:"기타블록",file:"unofficial/etc.js"},
{name:"냥냥블록",file:"unofficial/nyang.js"},
{name:"뉴블록",file:"unofficial/newblock.js"},
{name:"매그넛블록",file:"unofficial/magnet.js"},
{name:"민트블록",file:"unofficial/mint.js"},
{name:"스페셜블록",file:"unofficial/special.js"},
{name:"엔피아이블록 (NPI+)",file:"unofficial/npi.js"},
{name:"우클릭블록",file:"unofficial/right_click.js"},
{name:"크리스블록",file:"unofficial/kris.js"},
{name:"특급블록",file:"unofficial/express.js"},
{name:"특수블록",file:"unofficial/tecsu.js"},
{name:"2.0블록",file:"unofficial/block20.js"},
{name:"언차티드 블록",file:"uncharted/inject.js"}
];


async function getUnofficialProjectKey() {

    const [tab] =
        await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

    if (
        !tab ||
        !tab.url
    ) {
        return null;
    }

    const match =
        tab.url.match(
            /\/(?:ws|project)\/([a-f0-9]{24})(?:\/|$|\?)/i
        );

    if (match) {
        return "unofficialBlockStates_" + match[1];
    }

    if (
        tab.url.startsWith(
            "https://playentry.org/ws"
        )
    ) {
        return "unofficialBlockStates_new";
    }

    return null;
}

(async () => {

    const storageKey =
        await getUnofficialProjectKey();

    if (!storageKey) {
        return;
    }

    chrome.storage.local.get(
        [storageKey],
        (result) => {

            const states =
                result[storageKey] || {};

            unofficialBlocks.forEach((item) => {

                const label =
                    document.createElement("label");

                label.style.display = "flex";
                label.style.alignItems = "center";
                label.style.gap = "8px";
                label.style.padding = "7px 2px";
                label.style.cursor = "pointer";

                const checkbox =
                    document.createElement("input");

                checkbox.type = "checkbox";

                checkbox.style.width = "auto";
                checkbox.style.margin = "0";
                checkbox.style.padding = "0";

                checkbox.checked =
                    states[item.file] === true;

                const text =
                    document.createElement("span");

                text.textContent =
                    item.name;

                checkbox.addEventListener(
                    "change",
                    () => {

                        chrome.storage.local.get(
                            [storageKey],
                            (result) => {

                                const newStates = {
                                    ...(result[storageKey] || {})
                                };

                                newStates[item.file] =
                                    checkbox.checked;

                                chrome.storage.local.set({
                                    [storageKey]:
                                        newStates
                                });
                            }
                        );
                    }
                );

                label.appendChild(
                    checkbox
                );

                label.appendChild(
                    text
                );

                unofficialBlocksBox.appendChild(
                    label
                );
            });
        }
    );

})();


const selectAllUnofficialButton =
    document.getElementById("selectAllUnofficial");
const applyUnofficialButton =
    document.getElementById("applyUnofficial");

applyUnofficialButton.addEventListener(
    "click",
    async () => {

        const [tab] =
            await chrome.tabs.query({
                active: true,
                currentWindow: true
            });

        const isWorkspace =
    tab?.url?.startsWith(
        "https://playentry.org/ws/"
    );

const isTips =
    tab?.url?.startsWith(
        "https://playentry.org/community/tips/list"
    );
if (
    !tab ||
    !tab.id ||
    !tab.url ||
    !tab.url.startsWith(
        "https://playentry.org/ws/"
    )
) {
    alert(
        "엔트리 작품 만들기 페이지가 아닙니다."
    );
    return;
}


        chrome.tabs.sendMessage(
    tab.id,
    {
        type:
            "SAVE_AND_RELOAD_UNOFFICIAL"
    },
    () => {

        if (chrome.runtime.lastError) {
            alert(
                "엔트리 페이지를 새로고침해 주세요."
            );
        }
    }
);
    }
);
const unloadUnofficialButton =
    document.getElementById("unloadUnofficial");


selectAllUnofficialButton.addEventListener(
    "click",
    async () => {

        const storageKey =
            await getUnofficialProjectKey();

        if (!storageKey) {
            return;
        }

        const allStates = {};

        unofficialBlocks.forEach((item) => {
            allStates[item.file] = true;
        });

        chrome.storage.local.set(
            {
                [storageKey]: allStates
            },
            () => {

                const checkboxes =
                    unofficialBlocksBox.querySelectorAll(
                        'input[type="checkbox"]'
                    );

                checkboxes.forEach((checkbox) => {
                    checkbox.checked = true;
                });
            }
        );
    }
);


unloadUnofficialButton.addEventListener(
    "click",
    async () => {

        const [tab] =
            await chrome.tabs.query({
                active: true,
                currentWindow: true
            });

        if (
            !tab ||
            !tab.id ||
            !tab.url ||
            !tab.url.startsWith(
                "https://playentry.org/ws/"
            )
        ) {
            alert(
                "엔트리 작품 만들기 페이지가 아닙니다."
            );
            return;
        }

        const storageKey =
            await getUnofficialProjectKey();

        if (!storageKey) {
            return;
        }

        chrome.storage.local.set(
            {
                [storageKey]: {}
            },
            () => {

                const checkboxes =
                    unofficialBlocksBox.querySelectorAll(
                        'input[type="checkbox"]'
                    );

                checkboxes.forEach((checkbox) => {
                    checkbox.checked = false;
                });

                chrome.tabs.reload(tab.id);
            }
        );
    }
);

async function runEntryAction(action, data = {}) {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

  const isWorkspace =
    tab?.url?.startsWith(
        "https://playentry.org/ws/"
    );

const isTips =
    tab?.url?.startsWith(
        "https://playentry.org/community/tips/list"
    );

if (
    !tab ||
    !tab.id ||
    !tab.url ||
    (!isWorkspace && !isTips)
) {
    alert(
        "지원하는 엔트리 페이지가 아닙니다."
    );
    return;
}

    chrome.tabs.sendMessage(
        tab.id,
        {
            type: "ENTRY_ACTION",
            action: action,
            data: data
        },
        () => {
            if (chrome.runtime.lastError) {
                alert("엔트리 페이지를 새로고침해 주세요.");
            }
        }
    );
}

// 1. 모든 블록 불러오기

document
.getElementById("unbanBlocks")
.addEventListener("click", () => {

runEntryAction("UNBAN_BLOCKS");

});

// 3. 초시계 설정

document
.getElementById("applyTimer")
.addEventListener("click", () => {

const name =
document.getElementById("timerName").value;

const x =
document.getElementById("timerX").value;

const y =
document.getElementById("timerY").value;

runEntryAction(
"SET_TIMER",
{
name: name,
x: x,
y: y
}
);

});


document
.getElementById("showTimer")
.addEventListener("click", () => {

runEntryAction("SHOW_TIMER");

});


document
.getElementById("hideTimer")
.addEventListener("click", () => {

runEntryAction("HIDE_TIMER");

});


// 4. 함수 지역변수 추가

document
.getElementById("addLocalVariable")
.addEventListener("click", () => {

const count =
Number(
document.getElementById("localVariableCount").value
);

if (
!Number.isInteger(count) ||
count <= 0
) {
alert("추가할 개수를 입력하세요.");
return;
}

runEntryAction(
"ADD_LOCAL_VARIABLE",
{
count: count
}
);

});


// 5. 프레임 속도 설정

document
.getElementById("applyFrameSpeed")
.addEventListener("click", () => {

const speed =
Number(
document.getElementById("frameSpeed").value
);

if (
!Number.isFinite(speed) ||
speed <= 0
) {
alert("올바른 프레임 속도를 입력하세요.");
return;
}

runEntryAction(
"SET_FRAME_SPEED",
{
speed: speed
}
);

});

// 6. 변수 랜덤 이동

document
.getElementById("startVariableMove")
.addEventListener("click", () => {

    runEntryAction(
        "START_VARIABLE_MOVE"
    );

});


document
.getElementById("stopVariableMove")
.addEventListener("click", () => {

    runEntryAction(
        "STOP_VARIABLE_MOVE"
    );

});
document
.getElementById("openTipsDate")
.addEventListener(
    "click",
    () => {

        const date =
            document
                .getElementById(
                    "tipsDate"
                )
                .value;

        if (!date) {
            alert(
                "날짜를 입력하세요."
            );
            return;
        }

        runEntryAction(
            "OPEN_TIPS_DATE",
            {
                date: date
            }
        );
    }
);
document
.getElementById("lockSelectedParams")
.addEventListener("click", () => {

    runEntryAction(
        "LOCK_SELECTED_PARAMS"
    );

});
/* =========================================================
   언차티드 확장 설정
   ========================================================= */

const toggleUnchartedPanel =
    document.getElementById(
        "toggleUnchartedPanel"
    );

const unchartedPanel =
    document.getElementById(
        "unchartedPanel"
    );


toggleUnchartedPanel.addEventListener(
    "click",
    () => {

        const isOpen =
            unchartedPanel.style.display !==
            "none";

        unchartedPanel.style.display =
            isOpen
                ? "none"
                : "block";

        toggleUnchartedPanel.textContent =
            isOpen
                ? "🧭 언차티드 확장 보기"
                : "🧭 언차티드 확장 닫기";
    }
);


/* =========================
   다시 등록하기
   ========================= */

document
.getElementById(
    "unchartedReapplyBtn"
)
.addEventListener(
    "click",
    async () => {

        const status =
            document.getElementById(
                "unchartedStatus"
            );

        status.textContent =
            "재등록 중...";

        try {

            const [tab] =
                await chrome.tabs.query({
                    active: true,
                    currentWindow: true
                });

            const resultArray =
                await chrome.scripting.executeScript({
                    target: {
                        tabId: tab.id
                    },
                    world: "MAIN",
                    func: () => {

                        if (
                            typeof window
                                .__unchartedForceReapply ===
                            "function"
                        ) {

                            return window
                                .__unchartedForceReapply();
                        }

                        return (
                            "언차티드가 현재 작품에서 " +
                            "로드되지 않았습니다."
                        );
                    }
                });

            const result =
                resultArray?.[0]?.result;

            status.textContent =
                result || "완료";

        } catch (error) {

            status.textContent =
                "오류: " +
                error.message;
        }
    }
);
/* =========================
   Groq 개인 API 키
   ========================= */

const UNCHARTED_AI_KEY =
    "unchartedGroqApiKey";


function updateUnchartedAiKeyStatus(
    hasKey
) {

    const status =
        document.getElementById(
            "unchartedAiKeyStatus"
        );

    status.textContent =
        hasKey
            ? "✅ 키가 설정되어 있습니다."
            : "키가 설정되지 않았습니다.";
}


chrome.storage.local.get(
    [UNCHARTED_AI_KEY],
    (result) => {

        updateUnchartedAiKeyStatus(
            Boolean(
                result[
                    UNCHARTED_AI_KEY
                ]
            )
        );
    }
);


document
.getElementById(
    "unchartedAiKeySaveBtn"
)
.addEventListener(
    "click",
    () => {

        const input =
            document.getElementById(
                "unchartedAiKeyInput"
            );

        const key =
            input.value.trim();

        if (!key) {

            alert(
                "API 키를 입력하세요."
            );

            return;
        }

        chrome.storage.local.set(
            {
                [UNCHARTED_AI_KEY]:
                    key
            },
            () => {

                input.value = "";

                updateUnchartedAiKeyStatus(
                    true
                );
            }
        );
    }
);


document
.getElementById(
    "unchartedAiKeyClearBtn"
)
.addEventListener(
    "click",
    () => {

        chrome.storage.local.remove(
            [UNCHARTED_AI_KEY],
            () => {

                updateUnchartedAiKeyStatus(
                    false
                );
            }
        );
    }
);
/* =========================
   작품용 공유 키
   ========================= */

function updateUnchartedSharedKeyStatus(
    hasKey
) {

    const status =
        document.getElementById(
            "unchartedSharedKeyStatus"
        );

    status.textContent =
        hasKey
            ? "✅ 이 작품에 공유 키가 설정되어 있습니다."
            : "공유 키가 설정되지 않았습니다.";
}


async function refreshUnchartedSharedKey() {

    try {

        const [tab] =
            await chrome.tabs.query({
                active: true,
                currentWindow: true
            });

        const resultArray =
            await chrome.scripting.executeScript({
                target: {
                    tabId: tab.id
                },
                world: "MAIN",
                func: () => {

                    if (
                        typeof window
                            .__unchartedGetSharedGroqKeyStatus !==
                        "function"
                    ) {

                        return false;
                    }

                    return window
                        .__unchartedGetSharedGroqKeyStatus();
                }
            });

        updateUnchartedSharedKeyStatus(
            Boolean(
                resultArray?.[0]?.result
            )
        );

    } catch (_) {

        updateUnchartedSharedKeyStatus(
            false
        );
    }
}


refreshUnchartedSharedKey();


document
.getElementById(
    "unchartedSharedKeySaveBtn"
)
.addEventListener(
    "click",
    async () => {

        const input =
            document.getElementById(
                "unchartedSharedKeyInput"
            );

        const key =
            input.value.trim();

        if (!key) {

            alert(
                "공유 키를 입력하세요."
            );

            return;
        }


        const confirmed =
            confirm(
                "이 키는 작품 데이터에 저장됩니다.\n" +
                "작품을 공유하면 키가 노출될 수 있습니다.\n\n" +
                "계속할까요?"
            );

        if (!confirmed) {
            return;
        }


        try {

            const [tab] =
                await chrome.tabs.query({
                    active: true,
                    currentWindow: true
                });

            const resultArray =
                await chrome.scripting.executeScript({
                    target: {
                        tabId: tab.id
                    },
                    world: "MAIN",
                    args: [
                        key
                    ],
                    func: (keyValue) => {

                        if (
                            typeof window
                                .__unchartedSetSharedGroqKey !==
                            "function"
                        ) {

                            return false;
                        }

                        window
                            .__unchartedSetSharedGroqKey(
                                keyValue
                            );

                        return true;
                    }
                });

            if (
                resultArray?.[0]?.result
            ) {

                input.value = "";

                updateUnchartedSharedKeyStatus(
                    true
                );

            } else {

                alert(
                    "언차티드가 현재 작품에서 로드되지 않았습니다."
                );
            }

        } catch (error) {

            alert(
                "오류: " +
                error.message
            );
        }
    }
);


document
.getElementById(
    "unchartedSharedKeyClearBtn"
)
.addEventListener(
    "click",
    async () => {

        try {

            const [tab] =
                await chrome.tabs.query({
                    active: true,
                    currentWindow: true
                });

            await chrome.scripting.executeScript({
                target: {
                    tabId: tab.id
                },
                world: "MAIN",
                func: () => {

                    if (
                        typeof window
                            .__unchartedRemoveSharedGroqKey ===
                        "function"
                    ) {

                        window
                            .__unchartedRemoveSharedGroqKey();
                    }
                }
            });

            updateUnchartedSharedKeyStatus(
                false
            );

        } catch (error) {

            alert(
                "오류: " +
                error.message
            );
        }
    }
);
/* =========================
   커스텀 코드
   ========================= */

const UNCHARTED_SNIPPET_KEY =
    "unchartedCustomSnippets";


function loadUnchartedSnippets(
    callback
) {

    chrome.storage.local.get(
        [UNCHARTED_SNIPPET_KEY],
        (result) => {

            callback(
                result[
                    UNCHARTED_SNIPPET_KEY
                ] || []
            );
        }
    );
}


function saveUnchartedSnippets(
    snippets,
    callback
) {

    chrome.storage.local.set(
        {
            [UNCHARTED_SNIPPET_KEY]:
                snippets
        },
        callback
    );
}


function renderUnchartedSnippets(
    snippets
) {

    const list =
        document.getElementById(
            "unchartedSnippetList"
        );

    const empty =
        document.getElementById(
            "unchartedSnippetEmpty"
        );

    list.innerHTML = "";


    if (
        snippets.length === 0
    ) {

        empty.style.display =
            "block";

        return;
    }


    empty.style.display =
        "none";


    snippets.forEach(
        (snippet, index) => {

            const row =
                document.createElement(
                    "div"
                );

            row.style.display =
                "flex";

            row.style.gap =
                "6px";

            row.style.alignItems =
                "center";

            row.style.marginBottom =
                "6px";


            const name =
                document.createElement(
                    "span"
                );

            name.textContent =
                snippet.title;

            name.style.flex =
                "1";

            name.style.fontSize =
                "12px";


            const remove =
                document.createElement(
                    "button"
                );

            remove.textContent =
                "삭제";

            remove.style.width =
                "auto";

            remove.style.marginTop =
                "0";


            remove.addEventListener(
                "click",
                () => {

                    const next =
                        snippets.filter(
                            (_, i) =>
                                i !== index
                        );

                    saveUnchartedSnippets(
                        next,
                        () => {
                            renderUnchartedSnippets(
                                next
                            );
                        }
                    );
                }
            );


            row.appendChild(
                name
            );

            row.appendChild(
                remove
            );

            list.appendChild(
                row
            );
        }
    );
}


document
.getElementById(
    "unchartedAddSnippetBtn"
)
.addEventListener(
    "click",
    () => {

        const title =
            document
                .getElementById(
                    "unchartedSnippetTitle"
                )
                .value
                .trim();

        const code =
            document
                .getElementById(
                    "unchartedSnippetCode"
                )
                .value
                .trim();


        if (
            !title ||
            !code
        ) {

            alert(
                "제목과 코드를 입력하세요."
            );

            return;
        }


        loadUnchartedSnippets(
            (snippets) => {

                snippets.push({
                    title:
                        title,

                    code:
                        code
                });


                saveUnchartedSnippets(
                    snippets,
                    () => {

                        document
                            .getElementById(
                                "unchartedSnippetTitle"
                            )
                            .value =
                            "";

                        document
                            .getElementById(
                                "unchartedSnippetCode"
                            )
                            .value =
                            "";

                        renderUnchartedSnippets(
                            snippets
                        );
                    }
                );
            }
        );
    }
);


loadUnchartedSnippets(
    renderUnchartedSnippets
);
/* =========================
   언차티드 업데이트 확인
   ========================= */

const UNCHARTED_CURRENT_VERSION =
    "1.4.0";


document
.getElementById(
    "unchartedCheckUpdateBtn"
)
.addEventListener(
    "click",
    async () => {

        const status =
            document.getElementById(
                "unchartedUpdateStatus"
            );

        status.textContent =
            "확인 중...";


        try {

            const url =
                "https://raw.githubusercontent.com/" +
                "KoreaIsNotAvailable/" +
                "uncharted-blocks/" +
                "main/manifest.json";


            const response =
                await fetch(
                    url,
                    {
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "GitHub 응답 오류 (" +
                    response.status +
                    ")"
                );
            }


            const manifest =
                await response.json();


            const latestVersion =
                manifest.version;


            if (!latestVersion) {

                throw new Error(
                    "최신 버전을 읽을 수 없습니다."
                );
            }


            const result =
                compareUnchartedVersions(
                    latestVersion,
                    UNCHARTED_CURRENT_VERSION
                );


            if (result > 0) {

                status.innerHTML =
                    "🆕 새 버전 " +
                    latestVersion +
                    "이 있습니다.<br>" +
                    "현재 버전: " +
                    UNCHARTED_CURRENT_VERSION +
                    "<br><br>" +
                    '<a href="' +
                    'https://github.com/' +
                    'KoreaIsNotAvailable/' +
                    'uncharted-blocks' +
                    '" target="_blank">' +
                    "GitHub에서 확인하기 ↗" +
                    "</a>";

                status.style.color =
                    "#d97706";

            } else {

                status.textContent =
                    "✅ 최신 버전입니다. " +
                    "(v" +
                    UNCHARTED_CURRENT_VERSION +
                    ")";

                status.style.color =
                    "#16a34a";
            }

        } catch (error) {

            status.textContent =
                "확인 실패: " +
                error.message;

            status.style.color =
                "#dc2626";
        }
    }
);


function compareUnchartedVersions(
    latest,
    current
) {

    const a =
        String(latest)
            .split(".")
            .map(Number);

    const b =
        String(current)
            .split(".")
            .map(Number);


    const length =
        Math.max(
            a.length,
            b.length
        );


    for (
        let i = 0;
        i < length;
        i++
    ) {

        const av =
            a[i] || 0;

        const bv =
            b[i] || 0;


        if (av > bv) {
            return 1;
        }

        if (av < bv) {
            return -1;
        }
    }


    return 0;
}
