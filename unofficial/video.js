(() => {
    "use strict";

    if (window.__entryVideoBlocksLoaded || window.__entryVideoBlocksLoading) {
        return;
    }

    window.__entryVideoBlocksLoading = true;

    const VIDEO_CATEGORY = "unofficial_video";
    const VIDEO_BLOCKS = [
        "unofficial_video_play",
        "unofficial_video_play_wait",
        "unofficial_video_control",
        "unofficial_video_close",
        "unofficial_video_move",
        "unofficial_video_get",
        "unofficial_video_mute",
        "unofficial_video_effect",
        "unofficial_video_speed",
        "unofficial_video_state",
        "unofficial_video_size",
        "unofficial_video_rotate",
        "unofficial_video_stop"
    ];

    function ready() {
        return !!(
            window.Entry &&
            Entry.block &&
            Array.isArray(Entry.staticBlocks) &&
            Entry.playground &&
            Entry.playground.mainWorkspace &&
            Entry.playground.mainWorkspace.blockMenu &&
            typeof window.$ === "function"
        );
    }

    function updateCategory(category, options) {
        const blockMenu = Entry.playground.mainWorkspace.blockMenu;
        const categories = [];
        const seen = new Set();

        Entry.staticBlocks.forEach((item) => {
            if (!item || !item.category || seen.has(item.category)) return;

            seen.add(item.category);

            categories.push({
                category: item.category,
                visible: item.category !== "arduino"
            });
        });

        if (!seen.has(category)) {
            categories.push({
                category,
                visible: true
            });
        }

        blockMenu._generateCategoryView(categories);

        for (
            let i = 0;
            i < $(".entryCategoryElementWorkspace").length;
            i++
        ) {
            const element =
                $(".entryCategoryElementWorkspace")[i];

            if (
                $(element).attr("id") !==
                "entryCategorytext"
            ) {
                $(element).attr(
                    "class",
                    "entryCategoryElementWorkspace"
                );
            }
        }

        blockMenu._categoryData =
            Entry.staticBlocks;

        blockMenu._generateCategoryCode(
            category
        );

        if (
            options?.background
        ) {
            $(`#entryCategory${category}`).css(
                "background-image",
                `url(${options.background})`
            );

            $(`#entryCategory${category}`).css(
                "background-repeat",
                "no-repeat"
            );

            if (
                options.backgroundSize
            ) {
                $(`#entryCategory${category}`).css(
                    "background-size",
                    `${options.backgroundSize}px`
                );
            }
        }

        if (
            options?.name
        ) {
            const categoryElement =
                $(`#entryCategory${category}`)[0];

            if (
                categoryElement
            ) {
                categoryElement.innerText =
                    options.name;
            }
        }
    }

    function addBlock(
        blockname,
        template,
        color,
        params,
        _class,
        func,
        skeleton = "basic"
    ) {
        Entry.block[blockname] = {
            color: color.color,
            outerLine:
                color.outerLine ??
                color.outerline,
            fontColor:
                color.fontColor,
            skeleton,
            statement: [],
            params: params.params,
            events: {},
            def: {
                params: params.def,
                type: blockname
            },
            paramsKeyMap:
                params.map,
            class:
                _class || "default",
            func,
            template
        };
    }

    function init() {
        if (!ready()) {
            return false;
        }

        const c1 =
            "#6cb45cff";

        const c2 =
            c1;

        const c1o =
            "#369162ff";


        addBlock(
            "unofficial_video_play",
            "동영상 %1 재생하기%2",
            {
                color: c1,
                outerLine: c1o
            },
            {
                params: [
                    {
                        type:
                            "Dropdown",

                        options: [
                            [
                                "대상 없음",
                                "n"
                            ]
                        ],

                        fontSize:
                            11,

                        arrowColor:
                            c1o,

                        value:
                            "n"
                    },
                    {
                        type:
                            "Indicator",

                        size:
                            11
                    }
                ],

                def: [
                    null
                ],

                map: {}
            }
        );


        addBlock(
            "unofficial_video_play_wait",
            "동영상 %1 재생하고 기다리기%2",
            {
                color:
                    c1,

                outerLine:
                    c1o
            },
            {
                params: [
                    {
                        type:
                            "Dropdown",

                        options: [
                            [
                                "대상 없음",
                                "n"
                            ]
                        ],

                        fontSize:
                            11,

                        arrowColor:
                            c1o,

                        value:
                            "n"
                    },
                    {
                        type:
                            "Indicator",

                        size:
                            11
                    }
                ],

                def: [
                    null
                ],

                map: {}
            }
        );


        addBlock(
            "unofficial_video_control",
            "동영상 %1%2",
            {
                color:
                    c1,

                outerLine:
                    c1o
            },
            {
                params: [
                    {
                        type:
                            "Dropdown",

                        options: [
                            [
                                "정지하기",
                                "stop"
                            ],
                            [
                                "다시 시작하기",
                                "resume"
                            ],
                            [
                                "끄기",
                                "off"
                            ]
                        ],

                        fontSize:
                            11,

                        arrowColor:
                            c1o,

                        value:
                            "stop"
                    },
                    {
                        type:
                            "Indicator",

                        size:
                            11
                    }
                ],

                def: [
                    null
                ],

                map: {}
            }
        );


        addBlock(
            "unofficial_video_close",
            "동영상 닫기%1",
            {
                color:
                    c1,

                outerLine:
                    c1o
            },
            {
                params: [
                    {
                        type:
                            "Indicator",

                        size:
                            11
                    }
                ],

                def: [
                    null
                ],

                map: {}
            }
        );


        addBlock(
            "unofficial_video_move",
            "동영상 %1 (을)를 x: %2 y: %3 위치로 이동시키기%4",
            {
                color:
                    c1,

                outerLine:
                    c1o
            },
            {
                params: [
                    {
                        type:
                            "Dropdown",

                        options: [
                            [
                                "대상 없음",
                                "대상 없음"
                            ]
                        ],

                        fontSize:
                            11,

                        arrowColor:
                            c1o,

                        value:
                            "대상없음"
                    },
                    {
                        type:
                            "Block",

                        accept:
                            "string"
                    },
                    {
                        type:
                            "Block",

                        accept:
                            "string"
                    },
                    {
                        type:
                            "Indicator",

                        size:
                            11
                    }
                ],

                def: [
                    {
                        type:
                            "text",

                        params: [
                            "0"
                        ]
                    },
                    {
                        type:
                            "text",

                        params: [
                            "0"
                        ]
                    }
                ],

                map: {}
            }
        );


        addBlock(
            "unofficial_video_get",
            "동영상 %1 의 %2",
            {
                color:
                    c1,

                outerLine:
                    c1o
            },
            {
                params: [
                    {
                        type:
                            "Dropdown",

                        options: [
                            [
                                "대상 없음",
                                "n"
                            ]
                        ],

                        fontSize:
                            11,

                        arrowColor:
                            c1o,

                        value:
                            "n"
                    },
                    {
                        type:
                            "Dropdown",

                        options: [
                            [
                                "길이",
                                "long"
                            ],
                            [
                                "배속",
                                "speed"
                            ],
                            [
                                "x 좌푯값",
                                "x"
                            ],
                            [
                                "y 좌푯값",
                                "y"
                            ],
                            [
                                "크기",
                                "size"
                            ],
                            [
                                "소리크기",
                                "sound"
                            ],
                            [
                                "방향",
                                "spinner"
                            ]
                        ],

                        fontSize:
                            11,

                        arrowColor:
                            c1o,

                        value:
                            "long"
                    }
                ],

                def: [
                    null
                ],

                map: {}
            },
            "text",
            (sprite, script) => {
                return script;
            },
            "basic_string_field"
        );


        addBlock(
            "unofficial_video_mute",
            "동영상 %1 하기%2",
            {
                color:
                    c1,

                outerLine:
                    c1o
            },
            {
                params: [
                    {
                        type:
                            "Dropdown",

                        options: [
                            [
                                "음소거",
                                "ns"
                            ],
                            [
                                "음소거 해제",
                                "s"
                            ]
                        ],

                        fontSize:
                            11,

                        arrowColor:
                            c1o,

                        value:
                            "ns"
                    },
                    {
                        type:
                            "Indicator",

                        size:
                            11
                    }
                ],

                def: [
                    null
                ],

                map: {}
            }
        );


        addBlock(
            "unofficial_video_effect",
            "동영상 %1 효과를 %2 만큼 주기%3",
            {
                color:
                    c1,

                outerLine:
                    c1o
            },
            {
                params: [
                    {
                        type:
                            "Dropdown",

                        options: [
                            [
                                "밝기",
                                "밝기"
                            ],
                            [
                                "투명도",
                                "투명도"
                            ]
                        ],

                        fontSize:
                            11,

                        arrowColor:
                            c1o,

                        value:
                            "밝기"
                    },
                    {
                        type:
                            "Block",

                        accept:
                            "string"
                    },
                    {
                        type:
                            "Indicator",

                        size:
                            11
                    }
                ],

                def: [
                    {
                        type:
                            "text",

                        params: [
                            "10"
                        ]
                    }
                ],

                map: {}
            }
        );


        addBlock(
            "unofficial_video_speed",
            "동영상을 %1 배속으로 설정하기%2",
            {
                color:
                    c1,

                outerLine:
                    c1o
            },
            {
                params: [
                    {
                        type:
                            "Block",

                        accept:
                            "string"
                    },
                    {
                        type:
                            "Indicator",

                        size:
                            11
                    }
                ],

                def: [
                    {
                        type:
                            "text",

                        params: [
                            "2"
                        ]
                    }
                ],

                map: {}
            }
        );


        addBlock(
            "unofficial_video_state",
            "동영상이 %1 상태인가?",
            {
                color:
                    c1,

                outerLine:
                    c1o
            },
            {
                params: [
                    {
                        type:
                            "Dropdown",

                        options: [
                            [
                                "음소거",
                                "ns"
                            ],
                            [
                                "음소거 해제",
                                "s"
                            ]
                        ],

                        fontSize:
                            11,

                        arrowColor:
                            c1o,

                        value:
                            "ns"
                    }
                ],

                def: [],

                map: {}
            },
            "text",
            async () => {
                return false;
            },
            "basic_boolean_field"
        );


        addBlock(
            "unofficial_video_size",
            "동영상의 크기를 %1 만큼 바꾸기%2",
            {
                color:
                    c1,

                outerLine:
                    c1o
            },
            {
                params: [
                    {
                        type:
                            "Block",

                        accept:
                            "string"
                    },
                    {
                        type:
                            "Indicator",

                        size:
                            11
                    }
                ],

                def: [
                    {
                        type:
                            "text",

                        params: [
                            "10"
                        ]
                    }
                ],

                map: {}
            }
        );


        addBlock(
            "unofficial_video_rotate",
            "동영상 방향을 %1 만큼 회전하기%2",
            {
                color:
                    c1,

                outerLine:
                    c1o
            },
            {
                params: [
                    {
                        type:
                            "Block",

                        accept:
                            "string"
                    },
                    {
                        type:
                            "Indicator",

                        size:
                            11
                    }
                ],

                def: [
                    {
                        type:
                            "text",

                        params: [
                            "90"
                        ]
                    }
                ],

                map: {}
            }
        );


        addBlock(
            "unofficial_video_stop",
            "%1 동영상 멈추기%2",
            {
                color:
                    c1,

                outerLine:
                    c1o
            },
            {
                params: [
                    {
                        type:
                            "Dropdown",

                        options: [
                            [
                                "모든",
                                "all"
                            ],
                            [
                                "자신의",
                                "i"
                            ],
                            [
                                "다른 오브젝트의",
                                "others"
                            ]
                        ],

                        fontSize:
                            11,

                        arrowColor:
                            c1o,

                        value:
                            "all"
                    },
                    {
                        type:
                            "Indicator",

                        size:
                            11
                    }
                ],

                def: [],

                map: {}
            }
        );


        for (
            let i =
                Entry.staticBlocks.length - 1;
            i >= 0;
            i--
        ) {
            if (
                Entry.staticBlocks[i]
                    ?.category ===
                VIDEO_CATEGORY
            ) {
                Entry.staticBlocks.splice(
                    i,
                    1
                );
            }
        }


        Entry.staticBlocks.push({
            category:
                VIDEO_CATEGORY,

            blocks:
                VIDEO_BLOCKS
        });


        updateCategory(
            VIDEO_CATEGORY
        );


        if (
            !document.getElementById(
                "entry-video-block-style"
            )
        ) {
            $("head").append(`
<style id="entry-video-block-style">

#entryCategory${VIDEO_CATEGORY} {
    background-image:
        url(/lib/entry-js/images/sensor.svg);

    background-repeat:
        no-repeat;

    border-bottom-right-radius:
        6px;

    border-bottom-left-radius:
        6px;

    margin-bottom:
        1px;
}

.entrySelectedCategory#entryCategory${VIDEO_CATEGORY} {
    background-image:
        url(/lib/entry-js/images/sensor.on.svg);

    border-color:
        #ffffffff;

    color:
        #ffffffff;
}

</style>
            `);
        }


        const categoryElement =
            $(
                `#entryCategory${VIDEO_CATEGORY}`
            );

        if (
            categoryElement.length &&
            !categoryElement
                .text()
                .includes(
                    "동영상"
                )
        ) {
            categoryElement.append(
                "동영상"
            );
        }


        window.__entryVideoBlocksLoaded =
            true;

        window.__entryVideoBlocksLoading =
            false;


        console.log(
            "[동영상블록] 등록 완료"
        );


        return true;
    }


    if (
        init()
    ) {
        return;
    }


    let retryCount =
        0;


    const retryTimer =
        setInterval(
            () => {

                retryCount++;


                if (
                    init() ||
                    retryCount >= 200
                ) {
                    clearInterval(
                        retryTimer
                    );


                    if (
                        !window
                            .__entryVideoBlocksLoaded
                    ) {
                        window
                            .__entryVideoBlocksLoading =
                            false;


                        console.warn(
                            "[동영상블록] Entry 준비 시간 초과"
                        );
                    }
                }

            },
            100
        );

})();
