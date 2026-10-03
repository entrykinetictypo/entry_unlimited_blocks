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
{name:"특수블록",file:"unofficial/special2.js"},
{name:"2.0블록",file:"unofficial/block20.js"}
];

unofficialBlocks.forEach((item) => {
    const button = document.createElement("button");

    button.textContent = item.name;

    button.style.display = "block";
    button.style.width = "100%";
    button.style.marginBottom = "6px";
    button.style.padding = "8px";
    button.style.cursor = "pointer";

    button.addEventListener("click", async () => {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (
            !tab ||
            !tab.id ||
            !tab.url ||
            !tab.url.startsWith("https://playentry.org/ws/")
        ) {
            alert("엔트리 작품 만들기 페이지가 아닙니다.");
            return;
        }

        chrome.tabs.sendMessage(
            tab.id,
            {
                type: "LOAD_UNOFFICIAL_BLOCK",
                file: item.file
            }
        );
    });

    unofficialBlocksBox.appendChild(button);
});
const unloadUnofficialButton =
document.getElementById("unloadUnofficial");

unloadUnofficialButton.addEventListener("click", async () => {
const [tab] = await chrome.tabs.query({
active: true,
currentWindow: true
});

if (
!tab ||
!tab.id ||
!tab.url ||
!tab.url.startsWith("https://playentry.org/ws/")
) {
alert("엔트리 작품 만들기 페이지가 아닙니다.");
return;
}

chrome.tabs.reload(tab.id);
});



async function runEntryCode(code) {
const [tab] = await chrome.tabs.query({
active: true,
currentWindow: true
});

if (
!tab ||
!tab.id ||
!tab.url ||
!tab.url.startsWith("https://playentry.org/ws/")
) {
alert("엔트리 작품 만들기 페이지가 아닙니다.");
return;
}

chrome.tabs.sendMessage(
tab.id,
{
type: "RUN_ENTRY_CODE",
code: code
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

runEntryCode(`
for (let i of Entry.playground.blockMenu._bannedClass) {
Entry.playground.blockMenu.unbanClass(i);
console.log(i);
}
`);

});


// 2. 장면 제한 제거

document
.getElementById("removeSceneLimit")
.addEventListener("click", () => {

runEntryCode(`
Entry.scene.maxCount = NaN;
`);

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

let code = "";

if (name !== "") {
code += `
Entry.engine.projectTimer.setName(${JSON.stringify(name)});
`;
}

if (x !== "") {
code += `
Entry.engine.projectTimer.setX(${Number(x)});
`;
}

if (y !== "") {
code += `
Entry.engine.projectTimer.setY(${Number(y)});
`;
}

if (code === "") {
alert("설정할 값을 입력하세요.");
return;
}

runEntryCode(code);

});


document
.getElementById("showTimer")
.addEventListener("click", () => {

runEntryCode(`
Entry.engine.projectTimer.setVisible(true);
`);

});


document
.getElementById("hideTimer")
.addEventListener("click", () => {

runEntryCode(`
Entry.engine.projectTimer.setVisible(false);
`);

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

runEntryCode(`
if (
!Entry.Func ||
!Entry.Func.targetFunc
) {
alert("함수 편집창을 먼저 열어주세요.");
} else {
for (let i = 0; i < ${count}; i++) {
const v =
Entry.Func.targetFunc.defaultLocalVariable();

v.name = "변수" + (i + 1);

Entry.Func.targetFunc.appendLocalVariable(v);
}
}
`);

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

runEntryCode(`
const selectedId =
Entry.container.selectedObject?.id;

const project =
Entry.exportProject();

project.speed = ${speed};

Entry.clearProject();
Entry.loadProject(project);

setTimeout(() => {
if (selectedId) {
Entry.container.selectObject(selectedId);
}
}, 100);
`);

});
