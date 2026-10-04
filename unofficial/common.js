(() => {


EntryStatic.getAllBlocks = () => {

    return Entry.staticBlocks;

}

const updateCategory = (category, options) => {

   Entry.playground.mainWorkspace.blockMenu._generateCategoryView(
    Entry.staticBlocks.map(item => ({
        category: item.category,
        visible: item.category !== 'arduino'
    }))
); 
    for (let i = 0; i < $('.entryCategoryElementWorkspace').length; i++) {

        if (!($($('.entryCategoryElementWorkspace')[i]).attr('id') == 'entryCategorytext')) {

            $($('.entryCategoryElementWorkspace')[i]).attr('class', 'entryCategoryElementWorkspace');

        }

    }

    Entry.playground.blockMenu._categoryData = EntryStatic.getAllBlocks();

    Entry.playground.blockMenu._generateCategoryCode(category);

    if (options) {

        if (options.background) {

            $(`#entryCategory${category}`).css('background-image', 'url(' + options.background + ')');

            $(`#entryCategory${category}`).css('background-repeat', 'no-repeat');

            if (options.backgroundSize) {

                $(`#entryCategory${category}`).css('background-size', options.backgroundSize + 'px');

            }

        }

        if (options.name) {

            $(`#entryCategory${category}`)[0].innerText = options.name

        }

    }

}


const addBlock = (blockname, template, color, params, _class, func, skeleton = 'basic') => {

    Entry.block[blockname] = {

        color: color.color,

        outerLine: color.outerline,

        fontColor: color.fontColor,

        skeleton: skeleton,

        statement: [],

        params: params.params,

        events: {},

        def: {

            params: params.def,

            type: blockname

        },

        paramsKeyMap: params.map,

        class: _class ? _class : 'default',

        func: func,

        template: template

    }

}


addBlock('follow', '%1 팔로우를 했을 때', {

    color: EntryStatic.colorSet.block.default.START,

    outerLine: EntryStatic.colorSet.block.darken.START

}, {

    params: [

        {

            type: 'Indicator',

            img: 'block_icon/start_icon_play.svg',

            size: 14,

            position: {

                x: 0,

                y: -2,

            },

        },


    ],

}, 'text', (sprite, script) => {

    Entry.events_.stop.push(function () {

    });

}, 'basic_event');


addBlock('mark', '%1 북마크를 했을 때', {

    color: EntryStatic.colorSet.block.default.START,

    outerLine: EntryStatic.colorSet.block.darken.START

}, {

    params: [

        {

            type: 'Indicator',

            img: 'block_icon/start_icon_play.svg',

            size: 14,

            position: {

                x: 0,

                y: -2,

            },

        },


    ],

}, 'text', (sprite, script) => {

    Entry.events_.stop.push(function () {

    });

}, 'basic_event');


addBlock('follow_can', '%1 팔로우 취소를 했을 때', {

    color: EntryStatic.colorSet.block.default.START,

    outerLine: EntryStatic.colorSet.block.darken.START

}, {

    params: [

        {

            type: 'Indicator',

            img: 'block_icon/start_icon_play.svg',

            size: 14,

            position: {

                x: 0,

                y: -2,

            },

        },


    ],

}, 'text', (sprite, script) => {

    Entry.events_.stop.push(function () {

    });

}, 'basic_event');


addBlock('follow_please', '%1 팔로우 요청을 했을 때', {

    color: EntryStatic.colorSet.block.default.START,

    outerLine: EntryStatic.colorSet.block.darken.START

}, {

    params: [

        {

            type: 'Indicator',

            img: 'block_icon/start_icon_play.svg',

            size: 14,

            position: {

                x: 0,

                y: -2,

            },

        },


    ],

}, 'text', (sprite, script) => {

    Entry.events_.stop.push(function () {

    });

}, 'basic_event');


addBlock('follow!', '%1 유저 팔로우 하기%2', {

    color: EntryStatic.colorSet.block.default.HARDWARE,

    outerLine: EntryStatic.colorSet.block.darken.HARDWARE

}, {

    params: [

        {

            type: 'Block',

            accept: 'string'

        },

        {

            type: 'Indicator',

            img: 'block_icon/hardware_icon.svg',

            size: 11,

        }

    ],

    def: [

        {

            type: "text",

            params: ['경찰악어씨']

        },

    ],

});


addBlock('like!', '좋아요 누르기%1', {

    color: EntryStatic.colorSet.block.default.HARDWARE,

    outerLine: EntryStatic.colorSet.block.darken.HARDWARE

}, {

    params: [

        {

            type: 'Indicator',

            img: 'block_icon/hardware_icon.svg',

            size: 11,

        }

    ],

    def:

        []

});


addBlock('mark!', '북마크 누르기%1', {

    color: EntryStatic.colorSet.block.default.HARDWARE,

    outerLine: EntryStatic.colorSet.block.darken.HARDWARE

}, {

    params: [

        {

            type: 'Indicator',

            img: 'block_icon/hardware_icon.svg',

            size: 11,

        }

    ],

    def:

        []

});


addBlock('follow?', '%1 유저를 팔로잉 하는가?', {

    color: '#4562f5',

    outerline: '#1b3ad8',

}, {

    params: [

        {

            type: 'Block',

            accept: 'string'

        },


    ],

    def: [

        {

            type: "text",

            params: ['경찰악어씨']

        },

    ], map: {},

}, 'text', async (sprite, script) => {

    const inputText = script.getValue('text', script);

    const hasNonDigit = /[^0-9]/.test(inputText);

    return hasNonDigit

}, 'basic_boolean_field');


addBlock('like', '%1 좋아요를 눌렀을 때', {

    color: EntryStatic.colorSet.block.default.START,

    outerLine: EntryStatic.colorSet.block.darken.START

}, {

    params: [

        {

            type: 'Indicator',

            img: 'block_icon/start_icon_play.svg',

            size: 14,

            position: {

                x: 0,

                y: -2,

            },

        },


    ],

}, 'text', (sprite, script) => {

    Entry.events_.stop.push(function () {

    });

}, 'basic_event');


addBlock('like?', '좋아요를 눌렀는가?', {

    color: '#4562f5',

    outerline: '#1b3ad8',

}, {

    params: [



    ],

    def: [


    ], map: {},

}, 'text', async (sprite, script) => {

    const inputText = script.getValue('text', script);

    const hasNonDigit = /[^0-9]/.test(inputText);


}, 'basic_boolean_field');


addBlock('mark?', '북마크를 눌렀는가?', {

    color: '#4562f5',

    outerline: '#1b3ad8',

}, {

    params: [



    ],

    def: [


    ], map: {},

}, 'text', async (sprite, script) => {

    const inputText = script.getValue('text', script);

    const hasNonDigit = /[^0-9]/.test(inputText);

    return hㅇasNonDigit

}, 'basic_boolean_field');


addBlock('write', '%1%2', {

    color: EntryStatic.colorSet.block.default.HARDWARE,

    outerLine: EntryStatic.colorSet.block.darken.HARDWARE

}, {

    params: [

        {

            "type": "TextInput",

            "value": "여기에 입력하세요",

            "clearBG": true,

            "color": "#ffffffff",

            'size': 12

        },

        {

            type: 'Indicator',

            img: 'block_icon/hardware_icon.svg',

            size: 11,

        },

    ],

    def: [


    ],

})


addBlock('very-good', '%1잘했어요%2', {

    color: EntryStatic.colorSet.block.default.FLOW,

    outerLine: EntryStatic.colorSet.block.darken.FLOW

}, {

    params: [

        {

            type: 'Block',

            accept: 'boolean'

        },


        {

            type: 'Indicator',

            img: 'block_icon/flow_icon.svg',

            size: 11,

        },

    ],

    def: [


    ],

})



Entry.staticBlocks.push({

    category: 'CommonBlock',

    visible: true,

    blocks: [

        'follow', 'follow_can', 'follow_please', 'like', 'mark', 'follow?', 'like?', 'mark?', 'follow!', 'like!', 'mark!',//유저

        'write', 'very-good',


    ]

});


updateCategory('CommonBlock')


$('head').append(`<style> #entryCategoryCommonBlock 

{ background-image: url(/lib/entry-js/images/moving.svg); 

 background-repeat: no-repeat; 

 border-bottom-right-radius: 6px; 

 border-bottom-left-radius: 6px; 

 margin-bottom: 1px; 

 } .entrySelectedCategory#entryCategoryCommonBlock 

  { background-image: url(/lib/entry-js/images/moving_on.svg); 

background-color: #000000ff;

border-color: #000000ff;

color: #ffffffff;


}

    } </style>

`)


$('#entryCategoryCommonBlock').append('공용')
})();
