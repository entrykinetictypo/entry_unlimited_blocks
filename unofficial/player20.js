(() => {

    if (window.__PLAYER20_LOADER__) {
        return;
    }

    window.__PLAYER20_LOADER__ = true;

    console.log("[Player20] 시작");


    /*
     * 현재 player20.js와 같은 폴더의
     * block20.js 주소 구하기
     */
    const currentSrc =
        document.currentScript?.src;

    if (!currentSrc) {
        console.warn(
            "[Player20] 현재 스크립트 주소를 찾을 수 없음"
        );
        return;
    }

    const block20Url =
        new URL(
            "block20.js",
            currentSrc
        ).href;


    function findTargetWindow() {

        /*
         * 현재 창에 Entry가 있으면 사용
         */
        if (
            window.Entry &&
            Entry.block
        ) {
            return window;
        }


        /*
         * iframe 안의 실제 실행 Entry 찾기
         */
        const iframes =
            document.querySelectorAll(
                "iframe"
            );

        for (const iframe of iframes) {

            try {

                const target =
                    iframe.contentWindow;

                if (
                    target &&
                    target.Entry &&
                    target.Entry.block
                ) {
                    return target;
                }

            } catch (_) {}

        }


        return null;
    }


    function registerBlock20(targetWindow) {

        const Entry =
            targetWindow.Entry;

        const Block20 =
            targetWindow.Block20;


        if (
            !Entry ||
            !Entry.block ||
            !Block20 ||
            typeof Block20.block !==
                "function"
        ) {
            return false;
        }


        if (
            targetWindow
                .__BLOCK20_PLAYER_REGISTERED__
        ) {
            return true;
        }


        const blocks =
            Block20.block();


        for (const block of blocks) {

            Entry.block[block.name] = {

                color:
                    block.color.default,

                fontColor:
                    block.color.font ||
                    "#ffffff",

                outerLine:
                    block.color.darken,

                skeleton:
                    block.skeleton,

                statement: [],

                params:
                    block.params,

                events: {},

                def: {
                    params:
                        block.def,

                    type:
                        block.name
                },

                paramsKeyMap:
                    block.map,

                class:
                    block.class ||
                    "default",

                func:
                    block.func,

                template:
                    block.template
            };

        }


        targetWindow
            .__BLOCK20_PLAYER_REGISTERED__ =
            true;


        console.log(
            "[Player20] 2.0블록 실행 정의 등록 완료:",
            blocks.length
        );


        return true;
    }


    function loadBlock20(
        targetWindow
    ) {

        if (
            targetWindow.Block20 &&
            typeof targetWindow
                .Block20.block ===
                "function"
        ) {

            return registerBlock20(
                targetWindow
            );
        }


        if (
            targetWindow
                .__BLOCK20_PLAYER_LOADING__
        ) {
            return false;
        }


        targetWindow
            .__BLOCK20_PLAYER_LOADING__ =
            true;


        const script =
            targetWindow.document
                .createElement(
                    "script"
                );


        script.src =
            block20Url;


        script.onload = () => {

            script.remove();

            targetWindow
                .__BLOCK20_PLAYER_LOADING__ =
                false;


            registerBlock20(
                targetWindow
            );

        };


        script.onerror = () => {

            targetWindow
                .__BLOCK20_PLAYER_LOADING__ =
                false;

            console.warn(
                "[Player20] block20.js 로드 실패"
            );

        };


        (
            targetWindow.document.head ||
            targetWindow.document
                .documentElement
        ).appendChild(
            script
        );


        return false;
    }


    const timer =
        setInterval(() => {

            const targetWindow =
                findTargetWindow();


            if (!targetWindow) {
                return;
            }


            if (
                targetWindow
                    .__BLOCK20_PLAYER_REGISTERED__
            ) {

                clearInterval(timer);

                return;
            }


            loadBlock20(
                targetWindow
            );


            if (
                targetWindow
                    .__BLOCK20_PLAYER_REGISTERED__
            ) {
                clearInterval(timer);
            }

        }, 100);

})();
