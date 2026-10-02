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
            : true;

    updateUI(enabled);
});

toggleButton.addEventListener("click", () => {
    chrome.storage.local.get(["enabled"], (result) => {
        const current =
            typeof result.enabled === "boolean"
                ? result.enabled
                : true;

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
        addResult.textContent = "블록 ID를 입력하세요.";
        return;
    }

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    if (!tab || !tab.id) {
        addResult.textContent = "현재 탭을 찾을 수 없습니다.";
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
                addResult.textContent = "엔트리 작업 화면에서 사용하세요.";
                return;
            }

            if (response?.success) {
                addResult.textContent = `추가 요청 완료: ${blockId}`;
            } else {
                addResult.textContent = "추가 요청 실패";
            }
        }
    );
});
