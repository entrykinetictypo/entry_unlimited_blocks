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
