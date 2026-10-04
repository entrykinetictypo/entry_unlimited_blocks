//NPI 블록 1.6 버전
//NPI 블록은 앞으로도 계속 업데이트 됩니다.


Entry.staticBlocks = [
    {
        category: 'start',
        blocks: [
            'when_run_button_click',
            'when_some_key_pressed',
            'mouse_clicked',
            'mouse_click_cancled',
            'when_object_click',
            'when_object_click_canceled',
            'when_message_cast',
            'message_cast',
            'message_cast_wait',
            'when_scene_start',
            'start_scene',
            'start_neighbor_scene',
            'check_object_property',
            'check_block_execution',
            'switch_scope',
            'is_answer_submited',
            'check_lecture_goal',
            'check_variable_by_name',
            'show_prompt',
            'check_goal_success',
            'positive_number',
            'negative_number',
            'wildcard_string',
            'wildcard_boolean',
            'register_score',
        ],
    },
    {
        category: 'flow',
        blocks: [
            'wait_second',
            'repeat_basic',
            'repeat_inf',
            'repeat_while_true',
            'stop_repeat',
            '_if',
            'if_else',
            'wait_until_true',
            'stop_object',
            'restart_project',
            'when_clone_start',
            'create_clone',
            'delete_clone',
            'remove_all_clones',
        ],
    },
    {
        category: 'moving',
        blocks: [
            'move_direction',
            'bounce_wall',
            'move_x',
            'move_y',
            'move_xy_time',
            'locate_x',
            'locate_y',
            'locate_xy',
            'locate_xy_time',
            'locate',
            'locate_object_time',
            'rotate_relative',
            'direction_relative',
            'rotate_by_time',
            'direction_relative_duration',
            'rotate_absolute',
            'direction_absolute',
            'see_angle_object',
            'move_to_angle',
        ],
    },
    {
        category: 'looks',
        blocks: [
            'show',
            'hide',
            'dialog_time',
            'dialog',
            'remove_dialog',
            'change_to_some_shape',
            'change_to_next_shape',
            'add_effect_amount',
            'change_effect_amount',
            'erase_all_effects',
            'change_scale_size',
            'set_scale_size',
            'flip_x',
            'flip_y',
            'change_object_index',
        ],
    },
    {
        category: 'brush',
        blocks: [
            'brush_stamp',
            'start_drawing',
            'stop_drawing',
            'set_color',
            'set_random_color',
            'change_thickness',
            'set_thickness',
            'change_brush_transparency',
            'set_brush_tranparency',
            'brush_erase_all',
        ],
    },
    {
        category: 'text',
        blocks: ['text_blue', 'text_orange', 'text_Yello', 'text_gray ', 'text_flush'],
    },
    {
        category: 'sound',
        blocks: [
            'sound_something_with_block',
            'sound_something_second_with_block',
            'sound_from_to',
            'sound_something_wait_with_block',
            'sound_something_second_wait_with_block',
            'sound_from_to_and_wait',
            'sound_volume_change',
            'sound_volume_set',
            'sound_silent_all',
        ],
    },
    {
        category: 'judgement',
        blocks: [
            'is_clicked',
            'is_press_some_key',
            'reach_something',
            'boolean_basic_operator',
            'boolean_and_or',
            'boolean_not',
        ],
    },
    {
        category: 'calc',
        blocks: [
            'calc_basic',
            'calc_rand',
            'coordinate_mouse',
            'coordinate_object',
            'get_sound_volume',
            'quotient_and_mod',
            'calc_operation',
            'get_project_timer_value',
            'choose_project_timer_action',
            'set_visible_project_timer',
            'get_date',
            'distance_something',
            'get_sound_duration',
            'get_user_name',
            'length_of_string',
            'combine_something',
            'char_at',
            'substring',
            'index_of_string',
            'replace_string',
            'change_string_case',
        ],
    },
    {
        category: 'variable',
        blocks: [
            'variableAddButton',
            'listAddButton',
            'ask_and_wait',
            'get_canvas_input_value',
            'set_visible_answer',
            'get_variable',
            'change_variable',
            'set_variable',
            'show_variable',
            'hide_variable',
            'value_of_index_from_list',
            'add_value_to_list',
            'remove_value_from_list',
            'insert_value_to_list',
            'change_value_list_index',
            'length_of_list',
            'is_included_in_list',
            'show_list',
            'hide_list',
        ],
    },
    {
        category: 'func',
        blocks: ['functionAddButton'],
    },
    {
        category: 'analysis',
        blocks: [
            'analizyDataAddButton',
            'append_row_to_table',
            'insert_row_to_table',
            'delete_row_from_table',
            'set_value_from_table',
            'get_table_count',
            'get_value_from_table',
            'calc_values_from_table',
            'open_table_chart',
            'close_table_chart',
        ],
    },
    {
        category: 'ai_utilize',
        blocks: [
            'aiUtilizeBlockAddButton',
            'aiUtilizeModelTrainButton',
            'audio_title',
            'check_microphone',
            'speech_to_text_convert',
            'speech_to_text_get_value',
            'get_microphone_volume',
            'tts_title',
            'read_text',
            'read_text_wait_with_block',
            'set_tts_property',
            'translate_title',
            'get_translated_string',
            'check_language',
            'video_title',
            'video_draw_webcam',
            'video_check_webcam',
            'video_flip_camera',
            'video_set_camera_opacity_option',
            'video_motion_value',
            'video_toggle_model',
            'video_is_model_loaded',
            'video_number_detect',
            'video_toggle_ind',
            'video_body_part_coord',
            'video_face_part_coord',
            'video_detected_face_info',
        ],
    },
    {
        category: 'expansion',
        blocks: [
            'expansionBlockAddButton',
            'weather_title',
            'check_weather',
            'check_finedust',
            'get_weather_data',
            'get_current_weather_data',
            'get_today_temperature',
            'check_city_weather',
            'check_city_finedust',
            'get_city_weather_data',
            'get_current_city_weather_data',
            'get_today_city_temperature',
            'festival_title',
            'count_festival',
            'get_festival_info',
            'behaviorConductDisaster_title',
            'count_disaster_behavior',
            'get_disaster_behavior',
            'behaviorConductLifeSafety_title',
            'count_lifeSafety_behavior',
            'get_lifeSafety_behavior',
        ],
    },
    {
        category: 'arduino',
        blocks: [
            'arduino_reconnect',
            'arduino_open',
            'arduino_cloud_pc_open',
            'arduino_connect',
            'arduino_download_connector',
            'download_guide',
            'arduino_download_source',
            'arduino_noti',
        ].concat(EntryStatic.DynamicHardwareBlocks),
    }
];
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


let value = 0;


const LibraryCreator = {
    start: (blocksJSON, category, text) => {
        let blockArray = new Array;
        // LibraryCreator 가져오기
    }
}


c1 = '#e18834ff'
c2 = '#235eb1ff'
c3 = '#a048c0ff'
c4 = '#736c8eff'
c5 = '#21c3c8ff'
c6 = '#3bae5cff'
c7 = '#ae5274ff'
c1o = '#875718ff'
c2o = '#1c3ca6ff'
c3o = '#5c0862ff'
c4o = '#000000ff'
c5o = '#164ed2ff'
c6o = '#144b32ff'
c7o = '#640728ff'
w = 'rgba(255, 255, 255, 1)'
t = 'rgba(255, 255, 255, 0)'
c2x = '#153b7078'
c3x = '#a048c077'
c4x = '#736c8e92'
// 블록 추가 시작


////////////////////



addBlock('npi', '%1', {
    color: EntryStatic.colorSet.common.TRANSPARENT,
    outerLine: EntryStatic.colorSet.common.TRANSPARENT
}, {
    params: [
        {
            type: 'Text',
            text: 'NPI.Blocks',
            color: EntryStatic.colorSet.common.TEXT,
            class: 'bold',
            align: 'center'
        }
    ],
    def: [],
    map: {}
}, 'basic_text',)


addBlock('alert1', '%1', {
    color: EntryStatic.colorSet.common.TRANSPARENT,
    outerLine: EntryStatic.colorSet.common.TRANSPARENT
}, {
    params: [
        {
            type: 'Text',
            text: 'NPI블록은 현재 1.5 버전입니다.',
            color: EntryStatic.colorSet.common.TEXT,
            class: 'bold',
        }
    ],
    def: [],
    map: {}
}, 'basic_text',)


addBlock('alert2', '%1', {
    color: EntryStatic.colorSet.common.TRANSPARENT,
    outerLine: EntryStatic.colorSet.common.TRANSPARENT
}, {
    params: [
        {
            type: 'Text',
            text: '투명한 블록은 작동하지 않습니다.',
            color: EntryStatic.colorSet.common.TEXT,
            class: 'bold',
        }
    ],
    def: [],
    map: {}
}, 'basic_text',)


addBlock('min', '현재시각 (분)', {
    color: c6,
    outerLine: c6o
}, {
    params: [],
    def: [],
    map: {}
}, 'text', async (sprite, script) => {
    let today1 = new Date();
    let minutes = today1.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    return minutes;
}, 'basic_string_field')


addBlock('sec', '현재시각 (초)', {
    color: c6,
    outerLine: c6o
}, {
    params: [],
    def: [],
    map: {}
}, 'text', async (sprite, script) => {
    let today2 = new Date();
    let seconds = today2.getSeconds();
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return seconds;
}, 'basic_string_field')


addBlock('com', '컴퓨터이름', {
    color: c3,
    outerLine: c3o,
}, {
    params: [],
    def: [],
    map: {}
}, 'text', (sprite, script) => {
    return Entry.userAgent
}, 'basic_string_field')


addBlock('teb name', '페이지이름', {
    color: c3,
    outerLine: c3o,
}, {
    params: [],
    def: [],
    map: {},
}, 'text', async (sprite, script) => {
    let pagetitle = document.title;
    return pagetitle;
}, 'basic_string_field')


addBlock('page name', '페이지 이름을 %1 (으)로 변경하기%2', {
    color: c3,
    outerLine: c3o,
}, {
    params: [
        {
            type: 'Block',
            accept: 'string'
        },
        {
            type: 'Indicator',
            img: 'block_icon/start_icon_play.svg',
            size: 11
        }
    ],
    def: [
        {
            type: 'text',
            params: ['이름 없음']
        },
    ],
    map: {
        PAGETITLE: 0
    },
}, 'text', async (sprite, script) => {
    document.title = script.getValue('PAGETITLE', script);
    return script.callReturn();
},)


addBlock('domidator', '더미데이터 불러오기%1', {
    color: c1,
    outerLine: c1o,
}, {
    params: [
        {
            type: 'Indicator',
            img: 'block_icon/brush_icon.svg',
            size: 11
        }
    ],
    def: [],
    map: {},
}, 'text', async (sprite, script) => {
    Entry.playground.blockMenu._bannedClass.forEach((block) => Entry.playground.blockMenu.unbanClass(block));
    return script;
})


addBlock('mobile', '모바일?', {
    color: c1,
    outerLine: c1o,
}, {
    params: [],
    def: [],
    map: {},
}, 'text', async (sprite, script) => {
    (typeof Entry.isMobile() == true) ? true : (typeof Entry.isMobile() == false) ? true : false;
}, 'basic_boolean_field', 'basic_string_field')


addBlock('infinity', 'Infinity', {
    color: c6,
    outerLine: c6o,
}, {
    params: [],
    def: [],
    map: {},
}, 'text', async (sprite, script) => {
    return Infinity;
}, 'basic_string_field')


addBlock('big_num', '%1 과 %2 중 큰 수', {
    color: c6,
    outerLine: c6o,
}, {
    params: [
        { type: 'Block', accept: 'string' },
        { type: 'Block', accept: 'string' }
    ],
    def: [
        { type: 'text', params: ['1'] },
        { type: 'text', params: ['2'] }
    ],
    map: {
        X: 0,
        Y: 1
    }
}, 'text', (sprite, script) => {
    const x = Number(script.getValue('X', script));
    const y = Number(script.getValue('Y', script));
    return Math.max(x, y);
}, 'basic_string_field');


addBlock('ㄷn', 'NPI 뜻', {
    color: c1,
    outerLine: c1o,
}, {
    params: [],
    def: [],
    map: {},
}, 'text', async (sprite, script) => {
    return ('New Perfect item');
}, 'basic_string_field')


addBlock('variable', '%1', {
    color: EntryStatic.colorSet.common.TRANSPARENT,
    outerLine: EntryStatic.colorSet.common.TRANSPARENT
}, {
    params: [
        {
            type: 'Text',
            text: 'variable',
            color: EntryStatic.colorSet.common.TEXT,
            class: 'bold',
            align: 'center'
        }
    ],
    def: [],
    map: {}
}, 'text', 'basic_text',)


addBlock('value', "%1 이름의 변수 값", {
    color: c4,
    outerLine: c4o
}, {
    params: [
        {
            type: 'Block',
            accept: 'string'
        }
    ],
    def: [
        {
            type: 'text',
            params: ['변수']
        }
    ],
    map: {
        KEY: 0
    },
}, 'text', async (sprite, script) => {
    let keydd = script.getValue("KEY", script);
    return localStorage.getItem(Entry.projectId + keydd);
}, 'basic_string_field')


addBlock('length', '배열 %1 의 항목 수', {
    color: c4,
    outerLine: c4o
}, {
    params: [
        {
            type: 'Block',
            accept: 'string'
        }
    ],
    def: [
        {
            type: 'text',
            params: [`['1', '2']`]
        }
    ],
    map: {
        ARRAY: 0
    }
}, 'text', (sprite, script) => {
    let done = eval(script.getValue('ARRAY', script)).length
    return done
}, 'basic_string_field')



addBlock('array', '배열 %1 의 %2 번째 항목', {
    color: c4,
    outerLine: c4o
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
            params: [`['1', '2']`]
        },
        {
            type: 'text',
            params: ['1']
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
}, 'basic_string_field');



addBlock('var', '%1 이름의 변수를 %2 (으)로 정하기 %3', {
    color: c4,
    outerline: c4o,
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
            type: 'Indicator',
            img: 'block_icon/start_icon_play.svg',
            size: 11
        }
    ],
    def: [
        {
            type: 'text',
            params: ['변수']
        },
        {
            type: 'text',
            params: ['10']
        },
    ],
    map: {
        KEY: 0,
        VALUE: 1
    },
}, 'text', async (sprite, script) => {
    let keydd = script.getValue("KEY", script);
    let valuedd = script.getValue("VALUE", script);
    localStorage.setItem(Entry.projectId + keydd, valuedd);
})


addBlock('reset var', '%1 이름의 변수 초기화하기 %2', {
    color: c4,
    outerline: c4o,
}, {
    params: [
        {
            type: 'Block',
            accept: 'string'
        },
        {
            type: 'Indicator',
            img: 'block_icon/start_icon_play.svg',
            size: 11
        }
    ],
    def: [
        {
            type: 'text',
            params: ['변수']
        },
    ],
    map: {
        KEY: 0
    },
}, 'text', async (sprite, script) => {
    let keydd = script.getValue("KEY", script);
    localStorage.removeItem(Entry.projectId + keydd);
})


addBlock('add', '%1 항목을 %2 이름의 리스트에 추가하기%3', {
    color: c4,
    outerline: c4o,
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
            type: 'Indicator',
            img: 'block_icon/start_icon_play.svg',
            size: 11
        }
    ],
    def: [
        {
            type: 'text',
            params: ['1']
        },
        {
            type: 'text',
            params: ['리스트']
        },
    ],
    map: {
        ENTRYADDLISTNAME: 0,
        ENTRYADDLISTARRAY: 1
    },
}, 'text', async (sprite, script) => {
    Entry.variableContainer.getListByName(script.getValue('ENTRYADDLISTNAME', script)).appendValue(script.getValue('ENTRYADDLISTARRAY', script));
    return script.callReturn();
})


addBlock('abandon', '%1 이름의 리스트의 모든 항목 삭제하기%2', {
    color: c4,
    outerline: c4o,
}, {
    params: [
        {
            type: 'Block',
            accept: 'string'
        },
        {
            type: 'Indicator',
            img: 'block_icon/start_icon_play.svg',
            size: 11
        }
    ],
    def: [


        {
            type: 'text',
            params: ['리스트']
        },
    ],
    map: {
        ENTRYDELETELISTNAME: 0,
    },
},
    'text', async (sprite, script) => {
        const DeleteList = Entry.variableContainer.getListByName(script.getValue("ENTRYDELETELISTNAME"));
        while (DeleteList.getArray().length > 0) {
            DeleteList.deleteValue(1);
        }
        return script.callReturn();
    },
)


addBlock('list', '%1 이름의 리스트에서 %2 항목의 위치    ',
    {
        color: c4,
        outerline: c4o,
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
    ],
    def: [


        {
            type: 'text',
            params: ['리스트']
        },
        {
            type: 'text',
            params: ['1']
        },
    ],
    map: {
        ENTRYFINDLISTNAME: 0,
        ENTRYFINDLISTSTRING: 1
    },
}, 'text',
    async (sprite, script) => {
        let list = Entry.variableContainer.getListByName(script.getValue('ENTRYFINDLISTNAME', script));
        if (!list) {
            return null;
        }
        const arr = list.getArray();
        const data = script.getValue('ENTRYFINDLISTSTRING', script);
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i].data.toString() == data.toString()) {
                return i + 1;
            }
        }
        return '없어';


    }, 'basic_string_field')
addBlock('count_objects', '작품에 사용된 오브젝트 수', {
    color: '#242424ff',
    outerline: '#000000ff',
}, {
    params: [],
    def: [],
    map: {},
}, 'text', async (sprite, script) => {
    const objectCount = Entry.container.getAllObjects().length;
    return objectCount;
}, 'basic_string_field');


addBlock('ID', '작품 아이디', {
    color: '#242424ff',
    outerline: '#000000ff',
}, {
    params: [],
    def: [],
    map: {},
}, 'text', async (sprite, script) => {
    return Entry.projectId;
}, 'basic_string_field');


addBlock('name', '작품 이름', {
    color: '#242424ff',
    outerline: '#000000ff',
}, {
    params: [],
    def: [],
    map: {},
}, 'text', async (sprite, script) => {
    return Entry.projectName;
}, 'basic_string_field');


addBlock('count_scenes', '작품에 사용된 장면 수', {
    color: '#242424ff',
    outerline: '#000000ff',
}, {
    params: [],
    def: [],
    map: {},
}, 'text', async (sprite, script) => {
    const sceneCount = Entry.scene.getScenes().length;
    return sceneCount;
}, 'basic_string_field');


addBlock('scene_name', '현재 장면 이름', {
    color: '#242424ff',
    outerline: '#000000ff',
}, {
    params: [],
    def: [],
    map: {},
}, 'text', async (sprite, script) => {
    const currentScene = Entry.scene.selectedScene;
    return currentScene.name;
}, 'basic_string_field');


addBlock('web', '%1', {
    color: EntryStatic.colorSet.common.TRANSPARENT,
    outerLine: EntryStatic.colorSet.common.TRANSPARENT
}, {
    params: [
        {
            type: 'Text',
            text: 'web',
            color: EntryStatic.colorSet.common.TEXT,
            class: 'bold',
            align: 'center'
        }
    ],
    def: [],
    map: {}
}, 'text', 'basic_text',)


addBlock('stop', '작품 정지하기%1', {
    color: c2,
    outerline: c2o,
}, {
    params: [
        {
            type: 'Indicator',
            img: 'block_icon/start_icon_clone.svg',
            size: 11,
        }
    ],
    def: [null],
    map: {},
}, 'text', (sprite, script) => {
    const value = script.getValue('VALUE', script);
    Entry.engine.toggleStop()
}, 'basic_without_next')


addBlock('pause', '일시 정지하기%1', {
    color: c2,
    outerline: c2o,
}, {
    params: [
        {
            type: 'Indicator',
            img: 'block_icon/start_icon_clone.svg',
            size: 11,
        }
    ],
    def: [null],
    map: {},
}, 'text', (sprite, script) => {
    const value = script.getValue('VALUE', script);
    Entry.engine.togglePause()
})


addBlock('check_site', '%1 에서 실행하는가?', {
    color: c3,
    outerLine: c3o
}, {
    params: [
        {
            type: 'Dropdown',
            options: [
                ['네이버', 'naver'],
                ['구글', 'google']
            ],
            value: 'naver'
        }
    ],
    def: ['naver'],
    map: {
        SITE: 0
    }
}, 'boolean',
    function (site) {
        const host = window.location.hostname.toLowerCase();
        const ua = navigator.userAgent.toLowerCase();
        return host.includes(site) || ua.includes(site);
    }, 'basic_boolean_field');


addBlock('site', '%1 사이트로 이동%2', {
    color: c3,
    outerline: c3o,
}, {
    params: [
        {
            type: 'Block',
            accept: 'string'
        },
        {
            type: 'Indicator',
            img: 'block_icon/start_icon_play.svg',
            size: 11
        }
    ],
    def: [
        {
            type: "text",
            params: ['https://playentry.org/']
        },
    ],
    map: {
        VALUE: 0
    },
}, 'text', async (sprite, script) => {
    open(script.getValue('VALUE', script));
    return script.callReturn();


})


addBlock('move', '엔트리 %1(으)로 이동%2', {
    color: c3,
    outerLine: c3o,
}, {
    params: [
        {
            type: 'Dropdown',
            options: [
                ['이야기', 'story'],
                ['홈', 'home'],
                ['노하우&팁', 'tips'],
                ['위키', 'wiki']
            ],
            value: 'home'
        },
        {
            type: 'Indicator',
            img: 'block_icon/start_icon_play.svg',
            size: 11
        }
    ],
    def: ['home'],
    map: {
        DEST: 0
    }
}, 'text',
    (sprite, script) => {
        const site = script.getStringValue('DEST');
        let url = '';
        switch (site) {
            case 'story':
                url = 'https://playentry.org/community/entrystory/list?sort=created&term=all';
                break;
            case 'home':
                url = 'https://playentry.org/';
                break;
            case 'tips':
                url = 'https://playentry.org/community/tips/list?sort=created&term=all';
                break;
            case 'wiki':
                url = 'https://docs.playentry.org/user/';
                break;
        }
        open(url);
        return script.callReturn();
    }, 'basic');


addBlock('Entry', '%1', {
    color: EntryStatic.colorSet.common.TRANSPARENT,
    outerLine: EntryStatic.colorSet.common.TRANSPARENT
}, {
    params: [
        {
            type: 'Text',
            text: 'Entry',
            color: EntryStatic.colorSet.common.TEXT,
            class: 'bold',
            align: 'center'
        }
    ],
    def: [],
    map: {}
}, 'text', 'basic_text',)


addBlock('screen', '전체화면으로 실행하기%1', {
    color: c2,
    outerline: c2o,
}, {
    params: [
        {
            type: 'Indicator',
            img: 'block_icon/start_icon_clone.svg',
            size: 11,
        }
    ],
    def: [null],
    class: 'stop_projects'
}, 'text', (sprite, script) => {
    Entry.engine.toggleFullScreen();
})


addBlock('dark', '다크모드 적용하기%1', {
    color: c1,
    outerline: c1o,
}, {
    params: [
        {
            type: 'Indicator',
            img: 'block_icon/brush_icon.svg',
            size: 11,
        }
    ],
    def: [],
}, 'text', (script, sprite) => {
    let all = $("*");
    function blackwhite() {
        setTimeout(function () {
            $("div, p, pre").css({ "background-color": "black", "color": "white" });
        }, 1);
    }
    blackwhite()
    setInterval(blackwhite, (0))
})


addBlock('reset', '새로고침하기 %1', {
    color: c2,
    outerLine: c2o,
}, {
    params: [
        {
            type: 'Indicator',
            img: 'block_icon/start_icon_clone.svg',
            size: 11,
        }
    ],
    def: [],
    map: {},
}, 'text', (sprite, script) => {
    const value = script.getValue('VALUE', script);
    location.reload();
})



addBlock('console', '%1 (이)라고 콘솔에 %2 %3', {
    color: c2,
    outerLine: c2o,
}, {
    params: [
        {
            type: 'Block',
            accept: 'string'
        },
        {
            type: 'Dropdown',
            options: [
                ['로그', 'log'],
                ['경고', 'warn'],
                ['오류', 'error'],
                ['알림', 'info']
            ],
            fontSize: 11,
            arrowColor: c2,
            value: 'log'
        },
        {
            type: 'Indicator',
            img: 'block_icon/start_icon_clone.svg',
            size: 11,
        }
    ],
    def: [
        {
            type: 'text',
            params: [`NPI`]
        },
        null,
        null
    ],
    map: {
        CONTENT: 0,
        TYPE: 1
    },
}, 'text', async (sprite, script) => {
    console[script.getValue('TYPE', script)](script.getValue('CONTENT', script));
    return script.callReturn();
})


addBlock('clear', '콘솔 모두 지우기%1', {
    color: c2,
    outerLine: c2o
}, {
    params: [
        {
            type: 'Indicator',
            img: 'block_icon/start_icon_clone.svg',
            size: 11,
        }
    ],
    def: [
        null
    ],
    map: {}
}, 'text', (sprite, script) => {
    console.clear();
    return script.callReturn();
})


addBlock('Search', '구글에 %1 (을)를 검색하기%2', {
    color: c3,
    outerLine: c3o
}, {
    params: [
        {
            type: 'Block',
            accept: 'string'
        },
        {
            type: 'Indicator',
            img: 'block_icon/start_icon_hand.svg',
            size: 11
        }
    ],
    def: [
        {
            type: 'text',
            params: ['비공식블록']
        }
    ],
    map: {
        SEARCHRESULT: 0
    },
}, 'text', async (sprite, script) => {
    open('https://google.com/search?q=' + script.getValue('SEARCHRESULT', script));
    return script.callReturn();
},)


addBlock('Ctrl', '%1(을)를 복사하기 %2', {
    color: c1,
    outerLine: c1o
}, {
    params: [
        {
            type: 'Block',
            accept: 'string'
        },
        {
            type: 'Indicator',
            img: 'block_icon/brush_icon.svg',
            size: 11,
        }
    ],
    def: [
        {
            type: "text",
            params: ['NPI']
        },
    ],
    map: {
        TEXTTOCOPY: 0
    },
}, 'brush_control',
    async (sprite, script) => {
        copy(script.getValue('TEXTTOCOPY', script));
        return script.callReturn();
    })


addBlock('toast', '%1 제목과 %2 내용의 %3 경고를 %4 출력하기%5', {
    color: c2,
    outerLine: c2o
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
                ['초록색', 'success'],
                ['노란색', 'warning'],
                ['빨간색', 'alert']
            ],
            fontSize: 11,
            arrowColor: c2o,
            value: 'alert'
        },
        {
            type: 'Dropdown',
            options: [
                ['클릭하면 사라지게', 'true'],
                ['저절로 사라지게', 'false']
            ],
            fontSize: 11,
            arrowColor: c2,
            value: 'true'
        },
        {
            type: 'Indicator',
            img: 'block_icon/start_icon_clone.svg',
            size: 11,
        }
    ],
    def: [
        {
            type: 'text',
            params: [`경고`]
        },
        {
            type: 'text',
            params: [`빨간색으로 표시된 블록을 확인해주세요.`]
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


addBlock('window2', '%1 내용의 %2 창 띄워주고 기다리기%3', {
    color: c7,
    outerLine: c7o,
}, {
    params: [
        {
            type: 'Block',
            accept: 'string'
        },
        {
            type: 'Dropdown',
            options: [
                ['alert', 'alert'],
                ['confirm', 'confirm'],
                ['prompt', 'prompt']
            ],
            value: 'alert'
        },
        {
            type: 'Indicator',
            img: 'block_icon/start_icon_play.svg',
            size: 11,
        }
    ],
    def: [
        {
            type: 'text',
            params: ['NPI']
        }
    ],
    map: {
        TYPE: 0,
        MESSAGE: 1
    }
}, 'text', async (sprite, script) => {
    const type = script.getValue('TYPE', script);
    const message = script.getValue('MESSAGE', script);


    switch (type) {
        case 'alert':
            alert(message);
            return script.callReturn();
        case 'confirm':
            return confirm(message);
        case 'prompt':
            return prompt(message);
    }
})


addBlock('boost mode', '부스트모드가 꺼져있는가?', {
    color: c2,
    outerline: c2o
}, {
    params: [],
    def: [],
    map: {},
}, 'text', async (sprite, script) => {
    (typeof useWebGL == 'undefined') ? true : useWebGL == true ? true : false;
}, 'basic_boolean_field',)


addBlock('answer', '%1 내용의 prompt 창에 입력한 값', {
    color: c7,
    outerline: c7o
}, {
    params: [
        {
            type: 'Block',
            accept: 'string'
        },
        {
            type: 'Indicator',
            img: 'block_icon/start_icon_play.svg',
            size: 11,
        }
    ],
    def: [
        {
            type: "text",
            params: ['prompt 창입니다']
        },
    ],
    class: 'box',
    map: {
        VALUE: 0
    },
}, 'text', (sprite, script) => {
    const value = script.getValue('VALUE', script);
    return prompt(value)
}, 'basic_string_field');


addBlock('confirm?', '%1 내용의 confirm 창에서 확인을 클릭했는가?', {
    color: c7,
    outerLine: c7o
}, {
    params: [
        { type: 'Block', accept: 'string' }
    ],
    def: [
        { type: 'text', params: ['confirm 창입니다.'] }
    ],
    map: {
        CONFIRMVALUE: 0
    }
}, 'text', async (sprite, script) => {
    const message = script.getValue('CONFIRMVALUE', script);
    const result = confirm(message);
    return result;
}, 'basic_boolean_field')


addBlock('code', '%1의 명령어 실행하기 %2', {
    color: c1,
    outerline: c1o
}, {
    params: [
        {
            type: 'Block',
            accept: 'string'
        },
        {
            type: 'Indicator',
            img: 'block_icon/brush_icon.svg',
            size: 11,
        }
    ],
    def: [
        {
            type: "text",
            params: [`alert('안녕!')`]
        },
    ],
    map: { STARTJSCODE: 0 }


}, 'text', async (sprite, script) => {
    try {
        eval(script.getValue('STARTJSCODE', script));
    }
    catch (err) {
        alert('오류 발생' + err);
    }
    return script.callReturn();
})
addBlock('eRrOR', '강제 정지 후 빨간 테두리 만들기%1', {
    color: c2,
    outerLine: c2o
}, {
    params: [
        {
            type: 'Indicator',
            img: 'block_icon/start_icon_clone.svg',
            size: 11,
        }
    ],
    def: [
        null
    ],
    map: {}
}, 'text', (sprite, script) => {
    finish()
    return script.callReturn()
})


addBlock('illegal', '%1', {
    color: EntryStatic.colorSet.common.TRANSPARENT,
    outerLine: EntryStatic.colorSet.common.TRANSPARENT
}, {
    params: [
        {
            type: 'Text',
            text: 'Illegal',
            color: EntryStatic.colorSet.common.TEXT,
            class: 'bold',
            align: 'center'
        }
    ],
    def: [],
    map: {}
}, 'text', 'basic_text',)


addBlock('window', '%1', {
    color: EntryStatic.colorSet.common.TRANSPARENT,
    outerLine: EntryStatic.colorSet.common.TRANSPARENT
}, {
    params: [
        {
            type: 'Text',
            text: 'Window',
            color: EntryStatic.colorSet.common.TEXT,
            class: 'bold',
            align: 'center'
        }
    ],
    def: [],
    map: {}
}, 'text', 'basic_text',)


addBlock('math', '%1', {
    color: EntryStatic.colorSet.common.TRANSPARENT,
    outerLine: EntryStatic.colorSet.common.TRANSPARENT
}, {
    params: [
        {
            type: 'Text',
            text: 'Math',
            color: EntryStatic.colorSet.common.TEXT,
            class: 'bold',
            align: 'center'
        }
    ],
    def: [],
    map: {}
}, 'text', 'basic_text',)
addBlock('ratio', '%1 : %2 비율', {
    color: c6,
    outerLine: c6o
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
            params: ['2']
        },
        {
            type: 'text',
            params: ['1']
        }
    ],
    map: {
        FIRST: 0,
        SECOND: 1
    }
},
    'calc',
    function (entity, script) {
        const first = Number(script.getValue('FIRST', script));
        const second = Number(script.getValue('SECOND', script));
        if (isNaN(first) || isNaN(second) || second === 0) return 0;
        return first / second;
    }, 'basic_string_field')



addBlock('multiple', '%1의 배수 중 %2번째 수', {
    color: c6,
    outerLine: c6o
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
            params: ['401']
        },
        {
            type: 'text',
            params: ['7202']
        }
    ],
    map: {
        BASE: 0,
        INDEX: 1
    }
},
    'calc',
    function (entity, script) {
        const base = Number(script.getValue('BASE', script));
        const index = Number(script.getValue('INDEX', script));
        if (isNaN(base) || isNaN(index) || index < 1) return 0;
        return base * index;
    }, 'basic_string_field')


addBlock(
    'text or num',
    '%1(이)가 문자인가?',
    {
        color: c1,
        outerline: c1o,
    },
    {
        params: [
            {
                type: 'Block',
                accept: 'string',
                name: 'input'
            }
        ],
        def: [
            {
                type: 'text',
                params: ['쀏']
            }
        ],
        map: {
            input: 0
        }
    },
    'default',
    (sprite, script) => {
        const value = script.getValue('input', script);
        return typeof value === 'string' || value instanceof String;
    },
    'basic_boolean_field'
);


addBlock('pause2', '%1초 동안 일시정지하기%2', {
    color: c2,
    outerLine: c2o
}, {
    params: [
        {
            type: 'Block',
            accept: 'string'
        },
        {
            type: 'Indicator',
            img: 'block_icon/start_icon_clone.svg',
            size: 11,
        }
    ],
    def: [
        {
            type: 'number',
            params: ['800']
        }
    ],
    map: {
        DURATION: 0
    },
}, 'text', async (sprite, script) => {
    const duration = script.getValue('DURATION', script);
    Entry.engine.togglePause();
    await new Promise(resolve => setTimeout(resolve, duration * 1000));
    Entry.engine.togglePause();
    return script.callReturn();
});


addBlock('today', '오늘 요일', {
    color: c1,
    outerLine: c1o
}, {
    params: [],
    def: [],
    map: {},
}, 'text', async (sprite, script) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const today = new Date();
    const dayIndex = today.getDay();
    return days[dayIndex];
}, 'basic_string_field');


addBlock('tomorrow', '내일 요일', {
    color: c1,
    outerLine: c1o
}, {
    params: [],
    def: [],
    map: {},
}, 'text', async (sprite, script) => {
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    const today = new Date();
    const dayIndex = today.getDay();
    return days[dayIndex];
}, 'basic_string_field');


addBlock('npi off', 'NPI블록 불러오기 해제%1', {
    color: '#ff0000ff',
    outerLine: '#a90000ff',
}, {
    params: [
        {
            type: 'Indicator',
            color: "#a90000ff",
            size: 11,
        }
    ],
    def: [],
}, 'text', async (sprite, script) => {
    Entry.playground.blockMenu.banCategory('API')
})


addBlock('off', '모든 카테고리 제거하기%1', {
    color: '#ff0000ff',
    outerLine: '#a90000ff',
}, {
    params: [
        {
            type: 'Indicator',
            color: "#a90000ff",
            size: 11,
        }
    ],
    def: [],
}, 'text', async (sprite, script) => {
    Entry.playground.blockMenu.banCategory('API')
    Entry.playground.blockMenu.banCategory('start')
    Entry.playground.blockMenu.banCategory('flow')
    Entry.playground.blockMenu.banCategory('moving')
    Entry.playground.blockMenu.banCategory('looks')
    Entry.playground.blockMenu.banCategory('brush')
    Entry.playground.blockMenu.banCategory('text')
    Entry.playground.blockMenu.banCategory('judgement')
    Entry.playground.blockMenu.banCategory('sound')
    Entry.playground.blockMenu.banCategory('calc')
    Entry.playground.blockMenu.banCategory('variable')
    Entry.playground.blockMenu.banCategory('func')
    Entry.playground.blockMenu.banCategory('analysis')
    Entry.playground.blockMenu.banCategory('ai_utilize')
    Entry.playground.blockMenu.banCategory('expansion')
    Entry.playground.blockMenu.banCategory('arduino')


})


addBlock('easter_egg', '이스터에그 블록%1%2', {
    color: '#a0c6ddff',
    outerLine: '#95a8afff',
}, {
    params: [
        {
            type: 'Block',
            accept: 'string'
        },
        {
            type: 'Indicator',
            img: 'beta_tag.svg',
            size: 11,
        }
    ],
    def: [
        {
            type: 'number',
            params: ['숨겨진 이스터에그']
        }
    ],
}, 'text', async (sprite, script) => {
    if (script === 'alert0')
        alert('이스터에그를 발견했습니다!')
    if (script === 'house')
        url = 'https://playentry.org/';
    if (script === 'Qkfrkstordmfhvytlehlsqmffhrdmfghkrdlsgowntpdy')
        finish
})


addBlock('is_signal', '%1 신호를 받았는가?',{
        color: c2,
        outerline: c2o
    },{
        params: [
        {
            type: 'Block',
            accept: 'string'
        },
        ],
        def: [        
            {
            type: 'text',
            params: ['신호']
        }
    ],
        map: { SIGNAL: 0 }
    },
    'text',(sprite, script) => {
        const signalName = script.getStringValue('SIGNAL');
        if (Entry.engine.raiseEventMap && Entry.engine.raiseEventMap[signalName]) {
            return true;
        }
        return false;
    },'basic_boolean_field')


Entry.staticBlocks.push({
    category: 'API', blocks: [
        'alert1',
        'alert2',
        'npi',
        'code',
        'repeat',
        'dark',
        'Ctrl',
        'tomorrow',
        'today',
        'domidator',
        'project_name',
        'ㄷn',
        'mobile',
        'text or num',
        'variable',
        'length',
        'array',
        'var',
        'reset var',
        'value',
        'add',
        'abandon',
        'list',
        'count_objects',
        'ID',
        'name',
        'count_scenes',
        'scene_name',
        'Entry',
        'toast',
        'eRrOR',
        'console',
        'clear',
        'reset',
        'screen',
        'stop',
        'pause',
        'pause2',
        'block_other_object',
        'boost mode',
        'is_signal',
        'window',
        'window2',
        'answer',
        'confirm?',
        'math',
        'ratio',
        'min','sec','big_num',
        'multiple','infinity', 'web', 'com','teb name','page name','check_site',
        'site','move','Search','illegal','npi off','off','easter_egg',
    ]
});


updateCategory('API')


$('head').append(`<style> #entryCategoryAPI 
{ background-image: url(/lib/entry-js/images/robot.svg); 
 background-repeat: no-repeat; 
 border-bottom-right-radius: 6px; 
 border-bottom-left-radius: 6px; 
 margin-bottom: 1px; 
 } .entrySelectedCategory#entryCategoryAPI 
  { background-image: url(/lib/entry-js/images/robot_on.svg); 
background-color: #3ed6c1ff;
border-color: #000000ff;
color: #ffffffff;


}

    } </style>
`)


$('#entryCategoryAPI').append('NPI')
