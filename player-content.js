(() => {

    const isPublicProjectPage =
        /^\/project\/[a-f0-9]{24}(?:\/|$)/i
            .test(window.location.pathname);

    if (!isPublicProjectPage) {
        return;
    }

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

})();
