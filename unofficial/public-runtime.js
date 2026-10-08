(() => {

    console.log(
        "[공개 작품 런타임] 시작"
    );

    const currentScript =
        document.currentScript;

    if (!currentScript) {
        return;
    }

    const baseUrl =
        new URL(
            "../",
            currentScript.src
        ).href;

    const publicFiles = [
    "unofficial/right_click.js",
    "unofficial/special.js",
    "unofficial/magnet.js",
    "unofficial/block20.js",
    "unofficial/common.js",
    "unofficial/tecsu.js",
    "unofficial/mint.js",
    "unofficial/newblock.js",
    "unofficial/npi.js",

    "unofficial/etc.js",
    "unofficial/nyang.js",
    "unofficial/strong.js",
    "unofficial/kris.js",
    "unofficial/express.js"
];

    const timer =
        setInterval(() => {

            let targetWindow =
                window;

            let targetDocument =
                document;

            const iframe =
                document.querySelector(
                    "iframe.project_iframe"
                ) ||
                document.querySelector(
                    "iframe"
                );

            try {

                if (
                    iframe &&
                    iframe.contentWindow &&
                    iframe.contentWindow.Entry &&
                    iframe.contentWindow.Entry.block
                ) {

                    targetWindow =
                        iframe.contentWindow;

                    targetDocument =
                        iframe.contentDocument;
                }

            } catch (_) {}


            if (
                !targetWindow.Entry ||
                !targetWindow.Entry.block
            ) {
                return;
            }


            clearInterval(timer);


            console.log(
                "[공개 작품 런타임] Entry 준비 완료"
            );


            let index = 0;


            function loadNext() {

                if (
                    index >=
                    publicFiles.length
                ) {

                    console.log(
                        "[공개 작품 런타임] 1차 로드 완료"
                    );

                    return;
                }


                const file =
                    publicFiles[index++];


                const script =
                    targetDocument
                        .createElement(
                            "script"
                        );


                script.src =
                    new URL(
                        file,
                        baseUrl
                    ).href;


                script.onload =
                    () => {

                        console.log(
                            "[공개 작품 런타임] 로드:",
                            file
                        );

                        script.remove();

                        loadNext();
                    };


                script.onerror =
                    () => {

                        console.log(
                            "[공개 작품 런타임] 실패:",
                            file
                        );

                        script.remove();

                        loadNext();
                    };


                (
                    targetDocument.head ||
                    targetDocument
                        .documentElement
                ).appendChild(
                    script
                );
            }


            loadNext();

        }, 50);

})();
