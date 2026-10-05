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

            console.log("[비공식 블록 저장]", projectId, file);
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
