(() => {
EntryStatic.getAllBlocks = () => {

    return Entry.staticBlocks;

}

const updateCategory = (category, options) => {

    Entry.playground.mainWorkspace.blockMenu._generateCategoryView([

        { category: 'start', visible: true },

        { category: 'flow', visible: true },

        { category: 'moving', visible: true },

        { category: 'looks', visible: true },

        { category: 'brush', visible: true },

        { category: 'text', visible: true },

        { category: 'sound', visible: true },

        { category: 'judgement', visible: true },

        { category: 'calc', visible: true },

        { category: 'variable', visible: true },

        { category: 'func', visible: true },

        { category: 'analysis', visible: true },

        { category: 'ai_utilize', visible: true },

        { category: 'expansion', visible: true },

        { category: 'arduino', visible: false }, { category: category, visible: true }

    ]);

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



const LibraryCreator = {

    start: (blocksJSON, category, text) => {

        let blockArray = new Array;

        // LibraryCreator 가져오기

    }

}


addBlock('문숫', '%1', {


			color: EntryStatic.colorSet.common.TRANSPARENT,

    outerline: EntryStatic.colorSet.common.TRANSPARENT

}, {

    params: [

        {

            type: 'Text',

            text: '문자&숫자',

            color: EntryStatic.colorSet.common.TEXT,

            class: 'bold',

            align: 'center'

        }

    ],

    def: [],

    map: {},

})


addBlock('배열', '%1', {


			color: EntryStatic.colorSet.common.TRANSPARENT,

    outerline: EntryStatic.colorSet.common.TRANSPARENT

}, {

    params: [

        {

            type: 'Text',

            text: '배열',

            color: EntryStatic.colorSet.common.TEXT,

            class: 'bold',

            align: 'center'

        }

    ],

    def: [],

    map: {},

})


addBlock('기록', '%1', {


			color: EntryStatic.colorSet.common.TRANSPARENT,

    outerline: EntryStatic.colorSet.common.TRANSPARENT

}, {

    params: [

        {

            type: 'Text',

            text: '기록',

            color: EntryStatic.colorSet.common.TEXT,

            class: 'bold',

            align: 'center'

        }

    ],

    def: [],

    map: {},

})


addBlock('정보', '%1', {


			color: EntryStatic.colorSet.common.TRANSPARENT,

    outerline: EntryStatic.colorSet.common.TRANSPARENT

}, {

    params: [

        {

            type: 'Text',

            text: '작품& 컴퓨터 정보',

            color: EntryStatic.colorSet.common.TEXT,

            class: 'bold',

            align: 'left'

        }

    ],

    def: [],

    map: {},

})


addBlock('get_korean_jamo', '%1 문자의 %2', {

    color: '#8222ff',

    outerline: '#670bdd',

}, {

    params: [

        { type: 'Block', accept: 'string' },

        {

            type: 'Dropdown',

            options: [

                ['초성', 'cho'],

                ['중성', 'jung'],

                ['종성', 'jong']

            ],

            fontSize: 11,

            arrowColor: '#8222ff',

            value: 'cho'

        }

    ],

    def: [

        { type: 'text', params: ['엔'] },

    ],

    map: {

        TEXT: 0,

        TYPE: 1

    }

}, 'text', (sprite, script) => {

    const text = script.getValue('TEXT', script);

    const type = script.getValue('TYPE', script);


    if (!text || text.length === 0) return '';


    const char = text[0];

    const code = char.charCodeAt(0) - 0xAC00;


    if (code < 0 || code > 11171) {

        return char;

    }


    const chosung = [

        'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'

    ];

    const jungsung = [

        'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'

    ];

    const jongsung = [

        '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'

    ];


    const choIndex = Math.floor(code / 588);

    const jungIndex = Math.floor((code % 588) / 28);

    const jongIndex = code % 28;


    if (type === 'cho') return chosung[choIndex];

    if (type === 'jung') return jungsung[jungIndex];

    if (type === 'jong') return jongsung[jongIndex];


    return '';

}, 'basic_string_field')


addBlock('convert_bin_dec', '%1 %2를 %3 로 변환', {

    color: '#8222ff',

    outerline: '#670bdd',

}, {

    params: [


        {

            type: 'Dropdown',

            options: [

                ['10진수', 'toDec'],

                ['2진수', 'toBin']

            ],

            fontSize: 11,

            arrowColor: '#8222ff',

            value: 'toBin'

        },

        { type: 'Block', accept: 'string' }, // 변환할 값

        {

            type: 'Dropdown',

            options: [

                ['10진수', 'toDec'],

                ['2진수', 'toBin']

            ],

            fontSize: 11,

            arrowColor: '#8222ff',

            value: 'toDec'

        }

    ],

    def: [

        { type: 'text', params: ['10'] },

    ],

    map: {

        VALUE: 0,

        MODE: 1

    }

}, 'text', (sprite, script) => {

    const value = script.getValue('VALUE', script);

    const mode = script.getValue('MODE', script);


    if (mode === 'toDec') {

        // 2진수 → 10진수

        return parseInt(value, 2);

    } else if (mode === 'toBin') {

        // 10진수 → 2진수

        const num = Number(value);

        if (isNaN(num)) return '';

        return num.toString(2);

    }


    return '';

}, 'basic_string_field')


addBlock('is_not_number', '%1이 숫자가 아니다', {

    color: '#8222ff',

    outerline: '#670bdd',

}, {

    params: [

        { type: 'Block', accept: 'string' }

    ],

    def: [

        { type: 'text', params: ['7'] }

    ],

    map: {

        VALUE: 0

    }

}, 'text', (sprite, script) => {

    const value = script.getValue('VALUE', script);

    const isNumber = !isNaN(Number(value));

    return !isNumber;

}, 'basic_boolean_field')


addBlock('split_string', '%1 에서 %2 기준으로 분할한 값 [배열로 저장됨]', {

    color: EntryStatic.colorSet.block.default.JUDGE,

    outerLine: EntryStatic.colorSet.block.default.JUJDE

}, {

    params: [

        { type: 'Block', accept: 'string' },

        { type: 'Block', accept: 'string' }

    ],

    def: [

        { type: 'text', params: ['엔트리와 함께해요!'] },

        { type: 'text', params: ['와'] }

    ],

    map: {

        SOURCE: 0,

        DELIMITER: 1

    }

}, 'text', (sprite, script) => {

    const source = script.getValue('SOURCE', script);

    const delimiter = script.getValue('DELIMITER', script);

    const resultArray = source.split(delimiter);

    return resultArray;

}, 'basic_string_field')


addBlock('length', '배열&JSON %1 의 항목 수', {

    color: EntryStatic.colorSet.block.default.JUDGE,

    outerLine: EntryStatic.colorSet.block.default.JUDGE

}, {

    params: [

        { type: 'Block', accept: 'string' }

    ],

    def: [

        { type: 'text', params: ["['안녕', '엔트리', '함께하자']"] }

    ],

    map: {

        ARRAY: 0

    }

}, 'text', (sprite, script) => {

    let value = script.getValue('ARRAY', script);

    let arr;

    try {

        arr = JSON.parse(value);

    } catch (e) {

        arr = eval(value);

    }

    return Array.isArray(arr) ? arr.length : 0;

}, 'basic_string_field')


addBlock('array', '배열 %1 의 %2 번째 항목', {

    color: EntryStatic.colorSet.block.default.JUDGE,

    outerLine: EntryStatic.colorSet.block.default.JUJDE

}, {

    params: [

        {

            type: 'Block',

            accept: 'string'

        },

        {

            type: 'Block',

            accept: 'string'

        }

    ],

    def: [

        {

            type: 'text',

            params: [`['안녕', '엔트리']`]

        },

        {

            type: 'text',

            params: ['0']

        }

    ],

    map: {

        ARRAY: 0,

        NUM: 1

    }

}, 'text', (sprite, script) => {

    let array = eval(script.getValue('ARRAY', script))

    let done = array[script.getValue('NUM', script) - 1]

    return done

}, 'basic_string_field')


addBlock('array_insert', '배열 %1 에 %2 를 %3 번째 항목에 추가하기 %4', {

    color: EntryStatic.colorSet.block.default.JUDGE,

    outerLine: EntryStatic.colorSet.block.default.JUJDE

}, {

    params: [

        { type: 'Block', accept: 'string' },

        { type: 'Block', accept: 'string' },

        { type: 'Block', accept: 'string' },

        {

            type: 'Indicator',

            img: 'block_icon/judgement_icon.svg',

            size: 11,

        }

    ],

    def: [

        { type: 'text', params: ['[안녕]'] },

        { type: 'text', params: ['엔트리 최고!'] },

        { type: 'text', params: [`1`] }

    ],

    map: {

        ARRAY: 0,

        VALUE: 1,

        INDEX: 2

    }

}, 'text', (sprite, script) => {

    const arr = script.getValue('ARRAY', script);

    const value = script.getValue('VALUE', script);

    let index = script.getValue('INDEX', script);

    index = Number(index) - 1;

    if (Array.isArray(arr)) {

        arr.splice(index, 0, value);

    }

    return arr;

})


addBlock('json_add_item', 'JSON %1 에 %2 제목과 %3 항목 추가하기%4', {

    color: EntryStatic.colorSet.block.default.JUDGE,

    outerLine: EntryStatic.colorSet.block.default.JUJDE

}, {

    params: [

        { type: 'Block', accept: 'string' },  // JSON 문자열

        { type: 'Block', accept: 'string' },  // 제목(Key)

        { type: 'Block', accept: 'string' },  // 항목(Value)

        {

            type: 'Indicator',

            img: 'block_icon/judgement_icon.svg',

            size: 11,

        }

    ],

    def: [

        { type: 'text', params: [`{'제목': '최고!,'JSON': '최고!}`] },

        { type: 'text', params: ['자바스크립트'] },

        { type: 'text', params: ['좋아!'] }

    ],

    map: {

        JSON_STR: 0,

        KEY: 1,

        VALUE: 2

    }

}, 'text', (sprite, script) => {

    let jsonStr = script.getValue('JSON_STR', script);

    let key = script.getValue('KEY', script);

    let value = script.getValue('VALUE', script);


    let obj;

    try {

        obj = JSON.parse(jsonStr);

    } catch (e) {

        obj = {};

    }


    // 새로운 항목 추가

    obj[key] = value;


    // 다시 JSON 문자열로 반환

    return JSON.stringify(obj);

});


////////////////////////////////////


///////////////////////


addBlock('toast', '제목%1내용%2의%3토스트를%4출력하기%5', {

    color: EntryStatic.colorSet.block.default.EXPANSION,

    outerLine: EntryStatic.colorSet.block.default.EXPANSION

}, {

    params: [

        {

            type: 'Block',

            accept: 'string'

        },

        {

            type: 'Block',

            accept: 'string'

        },

        {

            type: 'Dropdown',

            options: [

                ['성공', 'success'],

                ['이름 중복', 'warning'],

                ['경고', 'alert']

            ],

            fontSize: 11,

            arrowColor: EntryStatic.colorSet.block.default.EXPANSION,

            value: 'success'

        },

        {

            type: 'Dropdown',

            options: [

                ['클릭하면 사라지게', 'true'],

                ['잠시 뒤 사라지게', 'false']

            ],

            fontSize: 11,

            arrowColor: EntryStatic.colorSet.block.default.EXPANSION,

            value: 'false'

        },

        {

            type: 'Indicator',

            img: 'block_icon/expansion_icon.svg',

            size: 11,

        }

    ],

    def: [

        {

            type: 'text',

            params: [`안녕!`]

        },

        {

            type: 'text',

            params: [`엔트리!`]

        },

        null,

        null,

        null

    ],

    map: {

        TITLE: 0,

        CONTENT: 1,

        TYPE: 2,

        HIDE: 3

    }

}, 'text', (sprite, script) => {

    let hide

    if (script.getValue('HIDE', script) == 'true') {

        hide = true

    } else {

        hide = false

    }

    eval(`Entry.toast.${script.getValue('TYPE', script)}('${script.getValue('TITLE', script)}', '${script.getValue('CONTENT', script)}', ${hide})`)

    return script.callReturn()

})


addBlock('log_message', '%1에 %2 기록하기 %3', {

    color: EntryStatic.colorSet.block.default.EXPANSION,

    outerLine: EntryStatic.colorSet.block.default.EXPANSION

}, {

    params: [

        {

            type: 'Dropdown',

            options: [

                ['엔트리 콘솔', 'entry'],

                ['브라우저 콘솔', 'browser']

            ],

            fontSize: 11,

            arrowColor: EntryStatic.colorSet.block.default.EXPANSION,

            value: 'entry'

        },

        {

            type: 'Block',

            accept: 'string'

        },

        {

            type: 'Indicator',

            img: 'block_icon/expansion_icon.svg',

            size: 11,

        }

    ],

    def: [

        {

            type: 'text',

            params: ['엔트리']

        },

    ],

    map: {

        TARGET: 0,

        MESSAGE: 1

    }

}, 'default', (sprite, script) => {

    const target = script.getValue('TARGET', script);

    const message = script.getValue('MESSAGE', script);


    if (target === 'entry') {

        // 엔트리 콘솔에 기록

        Entry.console.print(message, true);

    } else {

        // 브라우저 콘솔에 기록

        console.log(message);

    }


    return script.callReturn();

})


addBlock('clear_console', '%1 모두 지우기 %2', {

    color: EntryStatic.colorSet.block.default.EXPANSION,

    outerLine: EntryStatic.colorSet.block.default.EXPANSION

}, {

    params: [

        {

            type: 'Dropdown',

            options: [

                ['엔트리 콘솔', 'entry'],

                ['브라우저 콘솔', 'browser']

            ],

            fontSize: 11,

            arrowColor: EntryStatic.colorSet.block.default.EXPANSION,

            value: 'entry'

        },

        {

            type: 'Indicator',

            img: 'block_icon/expansion_icon.svg',

            size: 11,

        }

    ],

    def: ['entry'],

    map: {

        TARGET: 0

    }

}, 'default', (sprite, script) => {

    const target = script.getValue('TARGET', script);


    if (target === 'entry') {

        // 엔트리 콘솔 지우기

        Entry.console.clear();

    } else {

        // 브라우저 콘솔 지우기

        console.clear();

    }


    return script.callReturn();

});


///////////////////////////


////////////


addBlock('id', '이 작품의 ID', {

    color: EntryStatic.colorSet.block.default.CALC,

    outerLine: EntryStatic.colorSet.block.default.CALC,

}, {

    params: [],

    def: [],

    map: {},

}, 'text', async (sprite, script) => {

    return Entry.projectId

}, 'basic_string_field')


addBlock('boostmode', '부스트모드가 켜져있는가?', {

    color: EntryStatic.colorSet.block.default.CALC,

    outerLine: EntryStatic.colorSet.block.default.CALC,

}, {

    params: [],

    def: [],

    map: {},

}, 'text', async (sprite, script) => {

    (typeof useWebGL == 'undefined') ? false : useWebGL == true ? true : false;


}, 'basic_boolean_field');


addBlock('copy_text', '%1 텍스트 복사하기 %2', {

    color: EntryStatic.colorSet.block.default.BRUSH,

    outerLine: EntryStatic.colorSet.block.default.BRUSH,

}, {

    params: [

        { type: 'Block', accept: 'string' },

        {

            type: 'Indicator',

            img: 'block_icon/brush_icon.svg',

            size: 11,

        }

    ],

    def: [

        { type: 'text', params: ['Magnet Block'] }

    ],

    map: {

        TEXTTOCOPY: 0

    },

}, 'text', async (sprite, script) => {

    copy(script.getValue('TEXTTOCOPY', script));

    return script.callReturn();

});

window.UnofficialRuntime.registerPackage({
    id: 'MagnetBlock',
    name: '매그넛',
    blocks: [
        { name: '문숫', definition: Entry.block['문숫'] },
        { name: 'get_korean_jamo', definition: Entry.block['get_korean_jamo'] },
        { name: 'convert_bin_dec', definition: Entry.block['convert_bin_dec'] },
        { name: 'is_not_number', definition: Entry.block['is_not_number'] },
        { name: '배열', definition: Entry.block['배열'] },
        { name: 'split_string', definition: Entry.block['split_string'] },
        { name: 'array', definition: Entry.block['array'] },
        { name: 'length', definition: Entry.block['length'] },
        { name: 'array_insert', definition: Entry.block['array_insert'] },
        { name: 'json_add_item', definition: Entry.block['json_add_item'] },
        { name: '기록', definition: Entry.block['기록'] },
        { name: 'toast', definition: Entry.block['toast'] },
        { name: 'log_message', definition: Entry.block['log_message'] },
        { name: 'clear_console', definition: Entry.block['clear_console'] },
        { name: '정보', definition: Entry.block['정보'] },
        { name: 'id', definition: Entry.block['id'] },
        { name: 'boostmode', definition: Entry.block['boostmode'] },
        { name: 'copy_text', definition: Entry.block['copy_text'] }
    ],
    icon: '/lib/entry-js/images/hardware.svg'
});
})();
