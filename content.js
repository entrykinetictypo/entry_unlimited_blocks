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
            if (message?.type !== "ADD_ENTRY_BLOCK") {
                return;
            }

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
        }
    );

})();
