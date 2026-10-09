(() => {
    "use strict";

    const NAME = "[Entry Unlimited Blocks]";

    let enabled = false;
    let installed = false;
    let waitingTimer = null;
    let lastProjectId = null;
    let entryAuthHeaders = null;
let allowUnofficialReload = false;

window.addEventListener(
    "beforeunload",
    (event) => {

        if (!allowUnofficialReload) {
            return;
        }

        event.stopImmediatePropagation();
        delete event.returnValue;
    },
    true
);
const originalFetch = window.fetch;

window.fetch = function(input, init = {}) {
    try {
        const url =
            typeof input === "string"
                ? input
                : input?.url || "";

        const headers =
            new Headers(
                init.headers ||
                input?.headers ||
                {}
            );

        const csrfToken =
            headers.get("csrf-token");

        const xToken =
            headers.get("x-token");

        if (csrfToken && xToken) {
            entryAuthHeaders = {
                "csrf-token": csrfToken,
                "x-token": xToken,
                "x-client-type":
                    headers.get("x-client-type") ||
                    "Client"
            };

            console.log(
                `${NAME} Entry 인증 헤더 확보`
            );
        }
    } catch (_) {}

    return originalFetch.apply(
        this,
        arguments
    );
};

    console.log(`${NAME} patch controller loaded`);

    function requestState() {
        window.postMessage(
            {
                source: "ENTRY_UNLIMITED_BLOCKS_PATCH",
                type: "REQUEST_STATE"
            },
            "*"
        );
    }
function sendProjectId() {

    const match =
        window.location.pathname.match(
            /^\/ws\/([^/?#]+)/
        );

    const routeId =
        match ? match[1] : null;


    if (!routeId) {
        return;
    }


    /*
     * Entry 작업공간이 준비될 때까지 기다림
     */
    if (
        !window.Entry ||
        !Entry.playground?.mainWorkspace?.blockMenu
    ) {
        return;
    }


    /*
     * 새 작품
     */
    if (routeId === "new") {

        if (lastProjectId === "__new__") {
            return;
        }

        lastProjectId = "__new__";

        window.postMessage(
            {
                source:
                    "ENTRY_UNLIMITED_BLOCKS_PATCH",
                type:
                    "PROJECT_ID",
                projectId:
                    null,
                isNew:
                    true
            },
            "*"
        );

        console.log(
            `${NAME} new workspace detected`
        );

        return;
    }


    /*
     * 정상 작품 ID인지 확인
     */
    if (
        !/^[a-f0-9]{24}$/i.test(routeId)
    ) {
        return;
    }


    /*
     * /ws/new에서 저장되어
     * 실제 ID로 바뀐 경우에는
     * 비공식 블록을 다시 로드하지 않음
     */
    if (lastProjectId === "__new__") {

        lastProjectId = routeId;

        console.log(
            `${NAME} new project saved:`,
            routeId
        );

        return;
    }


    /*
     * 저장된 작품은 작품 복원을 위해
     * 인증 헤더가 필요함
     */
    if (!entryAuthHeaders) {
        return;
    }


    if (routeId === lastProjectId) {
        return;
    }


    lastProjectId = routeId;


    window.postMessage(
        {
            source:
                "ENTRY_UNLIMITED_BLOCKS_PATCH",
            type:
                "PROJECT_ID",
            projectId:
                routeId,
            isNew:
                false
        },
        "*"
    );


    console.log(
        `${NAME} project detected:`,
        routeId
    );
}
    async function restoreProjectAfterUnofficial(projectId) {
    if (
        !window.Entry ||
        !projectId ||
        typeof Entry.loadProject !== "function"
    ) {
        return;
    }

    try {
        console.log(
            `${NAME} 비공식 블록 등록 후 작품 원본 복원 시작:`,
            projectId
        );

        const query = `
            query SELECT_PROJECT($id: ID!) {
                project(id: $id) {
                    id
                    name
                    speed
                    objects
                    variables
                    cloudVariable
                    messages
                    functions
                    tables
                    scenes
                    realTimeVariable {
    variableType
    key
    value
    array {
        key
        data
    }
    minValue
    maxValue
    visible
    x
    y
    width
    height
    object
}
                    learning
                    expansionBlocks
                    aiUtilizeBlocks
                    hardwareLiteBlocks
                    blockCategoryUsage
                }
            }
        `;

        if (!entryAuthHeaders) {
    throw new Error(
        "Entry 인증 헤더를 아직 확보하지 못했습니다."
    );
}

const response = await fetch(
    "https://playentry.org/graphql/SELECT_PROJECT",
    {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
            "accept": "*/*",
            "content-type": "application/json",
            "csrf-token":
                entryAuthHeaders["csrf-token"],
            "x-token":
                entryAuthHeaders["x-token"],
            "x-client-type":
                entryAuthHeaders["x-client-type"] ||
                "Client"
        },
        body: JSON.stringify({
            query: query,
            variables: {
                id: projectId
            }
        })
    }
);

        if (!response.ok) {
            throw new Error(
                `작품 요청 실패: ${response.status}`
            );
        }

        const result = await response.json();

        const project =
            result?.data?.project;

        if (!project) {
            throw new Error(
                "작품 데이터를 찾을 수 없음"
            );
        }

        console.log(
            `${NAME} 서버 작품 데이터 확보`,
            project
        );

        if (
            typeof Entry.clearProject === "function"
        ) {
            Entry.clearProject();
        }

        await Entry.loadProject(project);

        Entry.projectId = projectId;

        console.log(
            `${NAME} 비공식 블록 포함 작품 복원 완료`
        );

    } catch (error) {
        console.error(
            `${NAME} 작품 복원 실패`,
            error
        );
    }
}
    function entryReady() {
        return Boolean(
            window.Entry &&
            typeof Entry.Board === "function" &&
            typeof Entry.BlockView === "function" &&
            typeof Entry.Block === "function" &&
            typeof Entry.Thread === "function" &&
            typeof Entry.FieldBlock === "function" &&
            typeof Entry.FieldOutput === "function" &&
            typeof Entry.FieldStatement === "function" &&
            Entry.container &&
            typeof Entry.container.getAllObjects === "function"
        );
    }
    function addBlockById(blockId) {
    try {
        if (!window.Entry) {
            throw new Error("Entry가 아직 준비되지 않았습니다.");
        }

        const id = String(blockId || "").trim();

        if (!id) {
            throw new Error("블록 ID가 비어 있습니다.");
        }

        const project = Entry.exportProject();

      

if (!project?.objects?.length) {
    alert("프로젝트에 오브젝트가 없습니다.");
    return;
}

const emptyObjects = project.objects.filter((obj) => {
    try {
        const script = JSON.parse(obj.script);

        return (
            !Array.isArray(script) ||
            !Array.isArray(script[0]) ||
            script[0].length === 0
        );
    } catch (_) {
        return true;
    }
});

if (emptyObjects.length > 0) {
    const names = emptyObjects
        .map((obj) => obj.name)
        .join("\n");

    alert(
        "블록이 없는 오브젝트가 있습니다.\n\n" +
        names +
        "\n\n모든 오브젝트에 블록을 하나 이상 넣어주세요."
    );

    return;
}

const selectedId =
    Entry.container.selectedObject?.id;

if (!selectedId) {
    throw new Error(
        "선택된 오브젝트가 없습니다."
    );
}

const targetObject =
    project.objects.find(
        (obj) => obj.id === selectedId
    );

if (!targetObject) {
    throw new Error(
        "선택된 오브젝트를 찾을 수 없습니다."
    );
}

const content = JSON.parse(
    targetObject.script
);

        content[0].unshift({
            type: id
        });

        targetObject.script =
    JSON.stringify(content);

        Entry.clearProject();
        Entry.loadProject(project);
        setTimeout(() => {
    Entry.container.selectObject(selectedId);
}, 100);

        console.log(
            `${NAME} block added: ${id}`
        );

    } catch (error) {
        console.error(
            `${NAME} add block failed`,
            error
        );
    }
}
    function startWaiting() {
        if (waitingTimer || installed || !enabled) {
            return;
        }

        console.log(`${NAME} waiting for Entry`);

        waitingTimer = setInterval(() => {
            if (!enabled) {
                clearInterval(waitingTimer);
                waitingTimer = null;
                return;
            }

            if (entryReady()) {
                clearInterval(waitingTimer);
                waitingTimer = null;

                installPatch();
            }
        }, 500);
    }

    function stopWaiting() {
        if (waitingTimer) {
            clearInterval(waitingTimer);
            waitingTimer = null;
        }
    }

    function disablePatch() {
        stopWaiting();

        if (
            window.__entryAnySlotPatch &&
            typeof window.__entryAnySlotPatch.disable === "function"
        ) {
            window.__entryAnySlotPatch.disable();
        }

        installed = false;

        console.log(`${NAME} disabled`);
    }

    function installPatch() {
        if (installed || !enabled) {
            return;
        }

        if (!entryReady()) {
            startWaiting();
            return;
        }

        console.log(`${NAME} installing`);
            (() => {
    'use strict';

    const requiredClasses = [
        'Board',
        'BlockView',
        'Block',
        'Thread',
        'FieldBlock',
        'FieldOutput',
        'FieldStatement',
    ];
    if (!window.Entry || requiredClasses.some((name) => typeof Entry[name] !== 'function')) {
        throw new Error('Open an Entry block workspace before running this patch.');
    }
    if (!Entry.container || typeof Entry.container.getAllObjects !== 'function') {
        throw new Error('The Entry workspace is not ready yet.');
    }

    const requiredMethods = [
        [Entry.Board.prototype, 'generateCodeMagnetMap'],
        [Entry.Board.prototype, 'insert'],
        [Entry.Board.prototype, '_getFieldMagnets'],
        [Entry.Board.prototype, '_getFieldBlockMetaData'],
        [Entry.Board.prototype, '_getOutputMetaData'],
        [Entry.Board.prototype, 'getNearestMagnet'],
        [Entry.BlockView.prototype, '_getMagnetsInThread'],
        [Entry.BlockView.prototype, '_updateCloseBlock'],
        [Entry.BlockView.prototype, '_updateMagnet'],
        [Entry.BlockView.prototype, '_toLocalCoordinate'],
    ];
    for (const [prototype, method] of requiredMethods) {
        if (typeof prototype?.[method] !== 'function') {
            throw new Error(`This Entry version does not provide ${method}().`);
        }
    }

    // 기존 버전이 살아 있으면 먼저 순정 상태로 돌린 뒤 그 순정 메서드를 기준으로 설치한다.
    window.__entryAnySlotPatch?.disable?.();

    const BoardPrototype = Entry.Board.prototype;
    const ViewPrototype = Entry.BlockView.prototype;
    const native = {
        generateCodeMagnetMap: BoardPrototype.generateCodeMagnetMap,
        insert: BoardPrototype.insert,
        getFieldMagnets: BoardPrototype._getFieldMagnets,
        getFieldBlockMetaData: BoardPrototype._getFieldBlockMetaData,
        getOutputMetaData: BoardPrototype._getOutputMetaData,
        getMagnetsInThread: ViewPrototype._getMagnetsInThread,
        updateCloseBlock: ViewPrototype._updateCloseBlock,
        updateMagnet: ViewPrototype._updateMagnet,
        toLocalCoordinate: ViewPrototype._toLocalCoordinate,
    };

    // 현재 Entry의 공통 연결 디스패치가 해석하는 기본 키다. 실제 드래그/지도에 추가 키가
    // 있으면 함께 탐색하되, 모양이나 슬롯 타입이 같은지는 어느 경로에서도 판정하지 않는다.
    const DEFAULT_CONNECTION_TYPES = ['previous', 'next', 'string', 'boolean', 'param'];
    const ROUND_VALUE_CONNECTION_TYPES = new Set(['string', 'param']);
    // Entry 순정 소스의 값 슬롯 메타데이터 최대 높이(24px)를 여유 범위로 사용한다.
    // C자 statement 탐색 띠는 30px이므로 기존 48px처럼 몸통 판정을 멀리서 가로채지 않는다.
    const ROUND_VALUE_HIT_RANGE = 24;
    const syntheticViewState = new WeakMap();
    const searchableBlockCache = new WeakMap();
    const searchableThreadCache = new WeakMap();
    const appliedPatches = [];
    let scanDepth = 0;
    let installed = false;
    let controller;

    const finite = (value, fallback = 0) => (Number.isFinite(value) ? value : fallback);
    const isComment = (block) => Boolean(Entry.Comment && block instanceof Entry.Comment);

    function connectionTypes(...sources) {
        const types = new Set(DEFAULT_CONNECTION_TYPES);
        for (const source of sources) {
            for (const type of Object.keys(source || {})) {
                types.add(type);
            }
        }
        return [...types];
    }

    function collectInputFields(blockView, fields = [], visited = new Set()) {
        if (!blockView || visited.has(blockView)) {
            return fields;
        }
        visited.add(blockView);
        for (const content of blockView._contents || []) {
            if (content instanceof Entry.FieldBlock || content instanceof Entry.FieldOutput) {
                fields.push(content);
                collectInputFields(content._valueBlock?.view, fields, visited);
            }
        }
        return fields;
    }

    function withoutTargetTypeCheck(blockView, targetType, callback) {
        const fields = collectInputFields(blockView);
        const originalTypes = fields.map((field) => field.acceptType);
        try {
            for (const field of fields) {
                field.acceptType = targetType;
            }
            return callback();
        } finally {
            fields.forEach((field, index) => {
                field.acceptType = originalTypes[index];
            });
        }
    }

    function searchableBlock(block) {
        let result = searchableBlockCache.get(block);
        if (!result) {
            result = Object.create(block);
            Object.defineProperty(result, 'assemble', {
                configurable: true,
                enumerable: true,
                value: true,
            });
            searchableBlockCache.set(block, result);
        }
        return result;
    }

    function withDiscoverableThread(thread, callback) {
        let result = searchableThreadCache.get(thread);
        if (!result) {
            result = Object.create(thread);
            Object.defineProperty(result, 'getBlocks', {
                configurable: true,
                value: () =>
                    (thread?.getBlocks?.() || [])
                        .filter((block) => !isComment(block))
                        .map(searchableBlock),
            });
            searchableThreadCache.set(thread, result);
        }
        return callback(result);
    }

    function patchedGetFieldMagnets(thread, zIndex, offset, targetType) {
        if (!scanDepth) {
            return native.getFieldMagnets.apply(this, arguments);
        }
        const args = Array.from(arguments);
        return withDiscoverableThread(thread, (searchableThread) => {
            args[0] = searchableThread;
            return native.getFieldMagnets.apply(this, args);
        });
    }

    function patchedGetFieldBlockMetaData(blockView, cursorX, cursorY, zIndex, targetType) {
        if (!scanDepth) {
            return native.getFieldBlockMetaData.apply(this, arguments);
        }
        const args = arguments;
        return withoutTargetTypeCheck(blockView, targetType, () =>
            native.getFieldBlockMetaData.apply(this, args)
        );
    }

    function patchedGetOutputMetaData(blockView, cursorX, cursorY, zIndex, targetType) {
        if (!scanDepth) {
            return native.getOutputMetaData.apply(this, arguments);
        }
        const args = arguments;
        return withoutTargetTypeCheck(blockView, targetType, () =>
            native.getOutputMetaData.apply(this, args)
        );
    }

    function restoreMagnetProperties(state) {
        if (!state?.magnet) {
            return;
        }
        for (const [name, property] of state.properties) {
            if (state.magnet[name] !== property.synthetic) {
                continue;
            }
            if (property.hadOwn) {
                state.magnet[name] = property.original;
            } else {
                delete state.magnet[name];
            }
        }
        state.properties.clear();
    }

    function restoreSyntheticView(view) {
        const state = syntheticViewState.get(view);
        if (!state) {
            return;
        }
        restoreMagnetProperties(state);
        if (state.group) {
            if (view._nextGroup === state.group) {
                if (state.hadNextGroup) {
                    view._nextGroup = state.originalNextGroup;
                } else {
                    delete view._nextGroup;
                }
            }
            state.group.remove?.();
            if (view.svgGroup?.nextMagnet === state.syntheticNextMagnet) {
                if (state.hadNextMagnet) {
                    view.svgGroup.nextMagnet = state.originalNextMagnet;
                } else {
                    delete view.svgGroup.nextMagnet;
                }
            }
        }
        syntheticViewState.delete(view);
    }

    function ensureSyntheticState(view) {
        let state = syntheticViewState.get(view);
        if (!state) {
            state = { magnet: view.magnet, properties: new Map(), group: null };
            syntheticViewState.set(view, state);
        } else if (state.magnet !== view.magnet) {
            restoreMagnetProperties(state);
            state.magnet = view.magnet;
        }
        return state;
    }

    function addSyntheticMagnet(view, name, value) {
        const state = ensureSyntheticState(view);
        state.properties.set(name, {
            hadOwn: Object.prototype.hasOwnProperty.call(view.magnet, name),
            original: view.magnet[name],
            synthetic: value,
        });
        view.magnet[name] = value;
        return value;
    }

    function normalizeViewForOwner(view) {
        if (!view?.block?.getThread) {
            return;
        }
        if (!(view.block.getThread() instanceof Entry.Thread)) {
            restoreSyntheticView(view);
            return;
        }

        view.magnet ||= {};
        view.magnet.previous || addSyntheticMagnet(view, 'previous', { x: 0, y: 0 });
        const next =
            view.magnet.next ||
            addSyntheticMagnet(view, 'next', {
                x: 0,
                y: Math.max(1, finite(view.height, 30)),
            });

        // 값/논리/출력 모양도 순서 연결의 소유자가 되면 다음 블록을 담을 그룹이 필요하다.
        if (!view._nextGroup && view.svgGroup?.elem) {
            const state = ensureSyntheticState(view);
            state.hadNextGroup = Object.prototype.hasOwnProperty.call(view, '_nextGroup');
            state.originalNextGroup = view._nextGroup;
            state.hadNextMagnet = Object.prototype.hasOwnProperty.call(
                view.svgGroup,
                'nextMagnet'
            );
            state.originalNextMagnet = view.svgGroup.nextMagnet;
            state.syntheticNextMagnet = view.block;
            view.svgGroup.nextMagnet = state.syntheticNextMagnet;
            state.group = view.svgGroup.elem('g');
            view._nextGroup = state.group;
        }

        view._nextGroup?.attr?.(
            'transform',
            `translate(${finite(next.x)},${finite(next.y, Math.max(1, view.height || 30))})`
        );
    }

    function patchedUpdateMagnet() {
        const result = native.updateMagnet.apply(this, arguments);
        normalizeViewForOwner(this);
        return result;
    }

    function patchedToLocalCoordinate(parentView) {
        if (parentView?._nextCommentGroup && !this.svgCommentGroup) {
            const nextCommentGroup = parentView._nextCommentGroup;
            delete parentView._nextCommentGroup;
            try {
                return native.toLocalCoordinate.apply(this, arguments);
            } finally {
                parentView._nextCommentGroup = nextCommentGroup;
            }
        }
        return native.toLocalCoordinate.apply(this, arguments);
    }

    function patchedGetMagnetsInThread() {
        const magnets = { ...(native.getMagnetsInThread.apply(this, arguments) || {}) };
        for (const type of connectionTypes(magnets, this.magnet)) {
            magnets[type] ||= { x: 0, y: 0 };
        }
        return magnets;
    }

    function patchedGenerateCodeMagnetMap() {
        const dragView = this.dragBlock;
        if (!dragView) {
            return native.generateCodeMagnetMap.apply(this, arguments);
        }
        const originalMagnet = dragView.magnet;
        const owner = dragView.block?.getThread?.();
        const lastBlock = owner instanceof Entry.Thread ? owner.getLastBlock?.() : dragView.block;
        const lastView = lastBlock?.view;
        const originalLastMagnet = lastView?.magnet;

        scanDepth++;
        try {
            dragView.magnet = { ...(originalMagnet || {}) };
            for (const type of connectionTypes(originalMagnet, this._magnetMap)) {
                dragView.magnet[type] ||= { x: 0, y: 0 };
            }
            if (lastView && !lastView.magnet?.next) {
                lastView.magnet = {
                    ...(lastView.magnet || {}),
                    next: { x: 0, y: Math.max(1, finite(lastView.height, 30)) },
                };
            }
            return native.generateCodeMagnetMap.apply(this, arguments);
        } finally {
            scanDepth--;
            dragView.magnet = originalMagnet;
            if (lastView) {
                lastView.magnet = originalLastMagnet;
            }
        }
    }

    function getConnectionParent(target) {
        if (target instanceof Entry.FieldStatement) {
            return target._blockView?.block || null;
        }
        if (target instanceof Entry.FieldBlock || target instanceof Entry.FieldOutput) {
            return target._block || null;
        }
        if (target instanceof Entry.Thread) {
            const parent = target.view?.getParent?.();
            return parent instanceof Entry.FieldStatement ? parent._blockView?.block || null : null;
        }
        if (target instanceof Entry.Block) {
            const owner = target.getThread?.();
            if (owner instanceof Entry.FieldBlock || owner instanceof Entry.FieldOutput) {
                return owner._block || null;
            }
            if (owner instanceof Entry.Thread) {
                const parent = owner.view?.getParent?.();
                if (parent instanceof Entry.FieldStatement) {
                    return parent._blockView?.block || null;
                }
            }
        }
        return null;
    }

    function getContainingBlock(target) {
        return target instanceof Entry.Block ? target : getConnectionParent(target);
    }

    function isMovedBlock(candidate, movedBlocks) {
        return Boolean(
            candidate &&
                movedBlocks.some(
                    (moved) =>
                        candidate === moved ||
                        (candidate.id != null && moved?.id != null && candidate.id === moved.id)
                )
        );
    }

    function wouldCreateCycle(target, movedBlocks) {
        // FieldBlock/FieldOutput.view can point at the block currently occupying that slot.
        // Reject those aliases before the owner walk so a dragged value cannot magnetize to itself.
        if (
            isMovedBlock(target, movedBlocks) ||
            isMovedBlock(target?._valueBlock, movedBlocks) ||
            isMovedBlock(target?.view?.block, movedBlocks)
        ) {
            return true;
        }
        const visited = new Set();
        let cursor = getContainingBlock(target);
        while (cursor && !visited.has(cursor)) {
            if (isMovedBlock(cursor, movedBlocks)) {
                return true;
            }
            visited.add(cursor);
            cursor = getConnectionParent(cursor);
        }
        return false;
    }

    function distanceFromRange(value, min, max) {
        if (value < min) {
            return min - value;
        }
        if (value > max) {
            return value - max;
        }
        return 0;
    }

    function findRoundValueMagnet(board, x, y, availableTypes, movedBlocks) {
        const scale = board.scale || 1;
        let best = null;
        for (const type of ROUND_VALUE_CONNECTION_TYPES) {
            if (!(type in availableTypes)) {
                continue;
            }
            for (const row of board._magnetMap?.[type] || []) {
                const dy = distanceFromRange(y, finite(row.point), finite(row.endPoint));
                if (dy > ROUND_VALUE_HIT_RANGE) {
                    continue;
                }
                for (const target of row.blocks || []) {
                    const view = target?.view;
                    if (!view || !getValueSlot(target) || wouldCreateCycle(target, movedBlocks)) {
                        continue;
                    }
                    const minX = finite(view.absX) / scale;
                    const maxX = minX + Math.max(0, finite(view.width));
                    const dx = distanceFromRange(x, minX, maxX);
                    if (dx > ROUND_VALUE_HIT_RANGE) {
                        continue;
                    }
                    const candidate = {
                        target,
                        type,
                        distance: dx * dx + dy * dy,
                        zIndex: finite(view.zIndex),
                    };
                    if (
                        !best ||
                        candidate.distance < best.distance ||
                        (candidate.distance === best.distance && candidate.zIndex > best.zIndex)
                    ) {
                        best = candidate;
                    }
                }
            }
        }
        return best;
    }

    function isStatementBodyTarget(target) {
        if (target instanceof Entry.FieldStatement) {
            return true;
        }
        if (!(target instanceof Entry.Block)) {
            return false;
        }
        const owner = target.getThread?.();
        return owner instanceof Entry.Thread &&
            owner.view?.getParent?.() instanceof Entry.FieldStatement;
    }

    function findStatementBodyMagnet(board, view, x, y, availableTypes, movedBlocks) {
        for (const type of ['previous', 'next']) {
            if (!(type in availableTypes)) {
                continue;
            }
            const target = board.getNearestMagnet(
                x,
                type === 'next' ? y + view.getBelowHeight() : y,
                type
            );
            if (target && isStatementBodyTarget(target) &&
                !wouldCreateCycle(target, movedBlocks)) {
                return { target, type };
            }
        }
        return null;
    }

    function patchedUpdateCloseBlock() {
        const board = this.getBoard();
        if (!board) {
            return;
        }
        const scale = board.scale || 1;
        const x = this.x / scale;
        const y = this.y / scale;
        if (!this.magnetsOfThread) {
            this.magnetsOfThread = this._getMagnetsInThread();
        }
        const movedBlocks = [this.block];
        // C자 몸통의 순정 자석이 실제로 잡힌 경우에는 주변 둥근 슬롯보다 먼저 사용한다.
        // 일반 previous/next 후보에는 적용하지 않아 둥근 슬롯의 24px 편의 범위를 보존한다.
        const statementTarget = findStatementBodyMagnet(
            board,
            this,
            x,
            y,
            this.magnetsOfThread,
            movedBlocks
        );
        if (statementTarget) {
            return board.setMagnetedBlock(statementTarget.target.view, statementTarget.type);
        }
        const roundTarget = findRoundValueMagnet(
            board,
            x,
            y,
            this.magnetsOfThread,
            movedBlocks
        );
        if (roundTarget) {
            return board.setMagnetedBlock(roundTarget.target.view, roundTarget.type);
        }
        for (const type in this.magnetsOfThread) {
            // 둥근 값 입력칸은 위 24px 판정이 단독으로 담당한다.
            if (ROUND_VALUE_CONNECTION_TYPES.has(type)) {
                continue;
            }
            const target = board.getNearestMagnet(
                x,
                type === 'next' ? y + this.getBelowHeight() : y,
                type
            );
            if (target && !wouldCreateCycle(target, movedBlocks)) {
                return board.setMagnetedBlock(target.view, type);
            }
        }
        board.setMagnetedBlock(null);
    }

    function refreshThread(thread) {
        thread?.resetEvent?.();
        thread?.changeEvent?.notify?.();
        const parent = thread?.view?.getParent?.();
        if (parent instanceof Entry.FieldStatement) {
            parent.firstBlock = thread.getFirstBlock();
            thread.getFirstBlock()?.view?._toLocalCoordinate(parent);
        }
    }

    function peekBlocks(block, count = 1) {
        const owner = block?.getThread?.();
        if (owner instanceof Entry.Thread) {
            const index = owner._data.indexOf(block);
            if (index < 0) {
                throw new Error('[AnySlot] The source block is not in its owner thread.');
            }
            const amount = Math.max(
                1,
                Math.min(Math.trunc(finite(count, 1)), owner._data.length - index)
            );
            return owner._data.slice(index, index + amount);
        }
        if (owner instanceof Entry.FieldBlock || owner instanceof Entry.FieldOutput) {
            if (owner._valueBlock !== block) {
                // Entry replaces a value slot before the drag-end command runs. Accept only that
                // active-drag transition; the same mismatch outside a drag remains an error.
                if (!block.view?.dragInstance) {
                    throw new Error('[AnySlot] The source block is not in its owner slot.');
                }
            }
        }
        return [block];
    }

    function resolveMoveCount(block, count) {
        if (Number.isFinite(count)) {
            return Math.max(1, Math.trunc(count));
        }
        const owner = block?.getThread?.();
        if (!(owner instanceof Entry.Thread)) {
            return 1;
        }
        const index = owner._data.indexOf(block);
        return index < 0 ? 1 : Math.max(1, owner._data.length - index);
    }

    function captureMove(block, count, target) {
        const blocks = peekBlocks(block, count);
        const owner = block.getThread?.() || null;
        const plan = {
            block,
            blocks,
            owner,
            index: owner instanceof Entry.Thread ? owner._data.indexOf(block) : -1,
            previous: owner instanceof Entry.Thread ? owner.getPrevBlock(block) : null,
            successor:
                owner instanceof Entry.Thread
                    ? owner._data[owner._data.indexOf(block) + blocks.length]
                    : null,
            position: null,
            sourceReplacement: null,
            sourceReleasedByDrag:
                (owner instanceof Entry.FieldBlock || owner instanceof Entry.FieldOutput) &&
                owner._valueBlock !== block,
        };
        try {
            plan.position = block.view?.getAbsoluteCoordinate?.() || null;
        } catch (_) {}
        if (wouldCreateCycle(target, blocks)) {
            return null;
        }
        return plan;
    }

    function detachOrigin(plan) {
        const { block, blocks, owner } = plan;
        block.view?._toGlobalCoordinate(undefined, true);
        if (owner instanceof Entry.Thread) {
            plan.successor?.view?._toGlobalCoordinate(undefined, true);
            const removed = owner._data.splice(plan.index, blocks.length);
            if (removed.length !== blocks.length || removed.some((item, index) => item !== blocks[index])) {
                owner._data.splice(plan.index, 0, ...removed);
                throw new Error('[AnySlot] The source thread changed during the move.');
            }
            return;
        }
        if (owner instanceof Entry.FieldBlock) {
            if (plan.sourceReleasedByDrag) {
                plan.sourceReplacement = owner._valueBlock || null;
                return;
            }
            try {
                owner.updateValueBlock();
            } finally {
                if (owner._valueBlock !== block) {
                    plan.sourceReplacement = owner._valueBlock;
                }
            }
            if (owner._valueBlock === block) {
                throw new Error('[AnySlot] The source slot did not release the block.');
            }
            return;
        }
        if (owner instanceof Entry.FieldOutput) {
            if (plan.sourceReleasedByDrag) {
                plan.sourceReplacement = owner._valueBlock || null;
                return;
            }
            owner._updateValueBlock(null);
            if (owner._valueBlock === block) {
                throw new Error('[AnySlot] The source output did not release the block.');
            }
            return;
        }
        const removed = owner?.cut?.(block);
        if (owner && (!removed?.length || removed[0] !== block)) {
            throw new Error('[AnySlot] The source owner did not release the block.');
        }
    }

    function prepareMovedBlocks(blocks) {
        for (const block of blocks) {
            block?.view?._updateMagnet();
        }
    }

    function finishSource(plan) {
        const { owner, previous, successor, blocks } = plan;
        if (!(owner instanceof Entry.Thread)) {
            return;
        }
        if (successor?.view) {
            const currentPrevious = owner.getPrevBlock(successor);
            if (currentPrevious?.view) {
                successor.view._toLocalCoordinate(currentPrevious.view);
            } else {
                const parent = owner.view?.getParent?.();
                if (parent instanceof Entry.FieldStatement) {
                    successor.view._toLocalCoordinate(parent);
                } else if (plan.position && owner._data[0] === successor) {
                    successor.moveTo?.(plan.position.x, plan.position.y, false);
                }
            }
        }
        if (owner !== blocks[0]?.getThread?.()) {
            refreshThread(owner);
        }
    }

    function removeMovedFromCurrentOwners(plan) {
        const affectedThreads = new Set();
        for (const block of plan.blocks) {
            const owner = block.getThread?.();
            if (owner instanceof Entry.Thread) {
                const index = owner._data.indexOf(block);
                if (index >= 0) {
                    owner._data.splice(index, 1);
                    affectedThreads.add(owner);
                }
            } else if (owner instanceof Entry.FieldBlock && owner._valueBlock === block) {
                owner.updateValueBlock();
            } else if (owner instanceof Entry.FieldOutput && owner._valueBlock === block) {
                owner._updateValueBlock(null);
            }
        }
        for (const thread of affectedThreads) {
            if (thread !== plan.owner) {
                refreshThread(thread);
            }
        }
    }

    function disposeReplacement(block) {
        if (!block) {
            return;
        }
        try {
            block.doNotSplice = true;
            block.destroy?.();
        } catch (_) {}
    }

    function restoreOrigin(plan) {
        const { owner, blocks } = plan;
        if (owner instanceof Entry.Thread) {
            for (const moved of blocks) {
                const currentIndex = owner._data.indexOf(moved);
                if (currentIndex >= 0) {
                    owner._data.splice(currentIndex, 1);
                }
            }
            const index = Math.max(0, Math.min(plan.index, owner._data.length));
            owner._data.splice(index, 0, ...blocks);
            for (const moved of blocks) {
                moved.setThread(owner);
            }
            prepareMovedBlocks(blocks);
            if (plan.previous?.view) {
                blocks[0].view?._toLocalCoordinate(plan.previous.view);
            } else {
                const parent = owner.view?.getParent?.();
                if (parent instanceof Entry.FieldStatement) {
                    blocks[0].view?._toLocalCoordinate(parent);
                } else if (plan.position) {
                    blocks[0].moveTo?.(plan.position.x, plan.position.y, false);
                }
            }
            plan.successor?.view?._toLocalCoordinate(blocks[blocks.length - 1].view);
            refreshThread(owner);
            return;
        }
        if (owner instanceof Entry.FieldBlock) {
            owner.updateValueBlock(blocks[0]);
            blocks[0].view?._toLocalCoordinate(owner);
            owner.calcWH?.();
            disposeReplacement(plan.sourceReplacement);
            return;
        }
        if (owner instanceof Entry.FieldOutput) {
            owner._updateValueBlock(blocks[0]);
            blocks[0].view?._toLocalCoordinate(owner);
            owner.calcWH?.();
        }
    }

    function restoreDragPosition(plan) {
        try {
            restoreOrigin(plan);
        } catch (_) {
            if (plan.position) {
                plan.block.moveTo?.(plan.position.x, plan.position.y, false);
            }
        }
    }

    function recordMoveError(error, rollbackError) {
        const detail = {
            at: new Date().toISOString(),
            message: String(error?.message || error),
            rollbackMessage: rollbackError ? String(rollbackError?.message || rollbackError) : '',
        };
        if (controller) {
            controller.lastError = detail;
        }
        console.warn('[AnySlot] Connection cancelled; the source block was restored.', detail);
    }

    function performMove(block, count, target, insert) {
        let plan;
        try {
            plan = captureMove(block, count, target);
        } catch (error) {
            recordMoveError(error);
            return false;
        }
        if (!plan) {
            try {
                const unchanged = captureMove(block, count, null);
                if (unchanged) {
                    restoreDragPosition(unchanged);
                }
            } catch (_) {}
            return false;
        }
        try {
            detachOrigin(plan);
            insert(plan.blocks, plan);
            finishSource(plan);
            return true;
        } catch (error) {
            let rollbackError;
            try {
                removeMovedFromCurrentOwners(plan);
                restoreOrigin(plan);
            } catch (failure) {
                rollbackError = failure;
            }
            recordMoveError(error, rollbackError);
            return false;
        }
    }

    function getValueSlot(target) {
        if (target instanceof Entry.FieldBlock || target instanceof Entry.FieldOutput) {
            return target;
        }
        if (target instanceof Entry.Block) {
            const owner = target.getThread?.();
            if (owner instanceof Entry.FieldBlock || owner instanceof Entry.FieldOutput) {
                return owner;
            }
        }
        return null;
    }

    function setSlotValue(slot, block) {
        if (slot instanceof Entry.FieldBlock) {
            slot.updateValueBlock(block);
        } else {
            slot._updateValueBlock(block);
        }
    }

    function putInValueSlot(slot, block) {
        if (!slot || slot._valueBlock === block) {
            return;
        }
        const oldBlock = slot._valueBlock;
        oldBlock?.view?._toGlobalCoordinate(undefined, true);
        try {
            setSlotValue(slot, block);
            block.view?._updateMagnet();
            block.view?._toLocalCoordinate(slot);
            slot.calcWH?.();
            slot.changeEvent?.notify?.();
            if (oldBlock && oldBlock !== block) {
                if (Entry.block?.[oldBlock.type]?.isPrimitive) {
                    try {
                        oldBlock.doNotSplice = true;
                        oldBlock.destroy();
                    } catch (error) {
                        console.warn('[AnySlot] Replaced primitive cleanup was skipped.', error);
                    }
                } else {
                    slot.getCode().createThread([oldBlock]);
                }
            }
        } catch (error) {
            if (oldBlock) {
                const temporaryOwner = oldBlock.getThread?.();
                if (temporaryOwner instanceof Entry.Thread) {
                    const index = temporaryOwner._data.indexOf(oldBlock);
                    if (index >= 0) {
                        temporaryOwner._data.splice(index, 1);
                    }
                    refreshThread(temporaryOwner);
                }
                setSlotValue(slot, oldBlock);
                oldBlock.view?._toLocalCoordinate(slot);
            } else {
                setSlotValue(slot, null);
            }
            slot.calcWH?.();
            throw error;
        }
    }

    function getValueSequenceAnchor(slot) {
        const visited = new Set();
        let anchor = slot?._block || null;
        while (anchor && !visited.has(anchor)) {
            visited.add(anchor);
            const owner = anchor.getThread?.();
            if (owner instanceof Entry.Thread) {
                return anchor;
            }
            if (owner instanceof Entry.FieldBlock || owner instanceof Entry.FieldOutput) {
                anchor = owner._block || null;
                continue;
            }
            break;
        }
        return null;
    }

    function putSequenceInValueSlot(slot, moved) {
        const first = moved[0];
        const tail = moved.slice(1);
        if (!first) {
            throw new Error('[AnySlot] The moved sequence is empty.');
        }
        if (tail.length) {
            const anchor = getValueSequenceAnchor(slot);
            if (!anchor) {
                throw new Error('[AnySlot] The value slot has no sequence anchor.');
            }
            // A stock Entry value slot owns one block. Keep that first block in the slot and
            // connect the remaining dragged blocks immediately after the slot's containing block.
            // This preserves one native owner per block and survives normal save/load.
            insertAfter(anchor, tail);
        }
        putInValueSlot(slot, first);
    }

    function insertAfter(target, moved) {
        const owner = target.getThread();
        if (!(owner instanceof Entry.Thread)) {
            throw new Error('[AnySlot] A sequence target must belong to a thread.');
        }
        const successor = owner.getNextBlock(target);
        successor?.view?._toGlobalCoordinate(undefined, true);
        owner.insertByBlock(target, moved);
        prepareMovedBlocks(moved);
        moved[0].view?._toLocalCoordinate(target.view);
        successor?.view?._toLocalCoordinate(moved[moved.length - 1].view);
        refreshThread(owner);
    }

    function insertBefore(target, moved) {
        if (!(target instanceof Entry.Block)) {
            throw new Error('[AnySlot] The top insertion target no longer exists.');
        }
        const owner = target.getThread();
        if (!(owner instanceof Entry.Thread)) {
            throw new Error('[AnySlot] A sequence target must belong to a thread.');
        }
        const previous = owner.getPrevBlock(target);
        const originalPosition = target.view?.getAbsoluteCoordinate?.();
        target.view?._toGlobalCoordinate(undefined, true);
        owner.insertByBlock(previous, moved);
        prepareMovedBlocks(moved);
        if (previous?.view) {
            moved[0].view?._toLocalCoordinate(previous.view);
        } else {
            const parent = owner.view?.getParent?.();
            if (parent instanceof Entry.FieldStatement) {
                moved[0].view?._toLocalCoordinate(parent);
            } else if (originalPosition) {
                moved[0].moveTo?.(originalPosition.x, originalPosition.y, false);
            }
        }
        target.view?._toLocalCoordinate(moved[moved.length - 1].view);
        refreshThread(owner);
    }

    function insertAtStatementTop(statement, moved) {
        const owner = statement._thread;
        if (!(owner instanceof Entry.Thread)) {
            throw new Error('[AnySlot] The statement thread no longer exists.');
        }
        const firstBlock = owner.getFirstBlock();
        firstBlock?.view?._toGlobalCoordinate(undefined, true);
        owner.insertByBlock(null, moved);
        prepareMovedBlocks(moved);
        statement.firstBlock = moved[0];
        moved[0].view?._toLocalCoordinate(statement);
        firstBlock?.view?._toLocalCoordinate(moved[moved.length - 1].view);
        refreshThread(owner);
    }

    function patchedInsert(block, pointer, count) {
        if (typeof block === 'string') {
            block = this.findById(block);
        }
        if (!block) {
            return false;
        }
        // The real drag command omits count. Stock Entry then moves the dragged block and every
        // following block; recover that amount here instead of silently moving only the first one.
        const amount = resolveMoveCount(block, count);
        if (Array.isArray(pointer) && pointer.length === 3) {
            return performMove(block, amount, null, (moved) => {
                const thread = this.code.createThread(moved, pointer[2]);
                prepareMovedBlocks(moved);
                moved[0].view?._toGlobalCoordinate(undefined, true);
                moved[0].moveTo?.(pointer[0], pointer[1], false);
                refreshThread(thread);
            });
        }
        if (Array.isArray(pointer) && pointer.length === 4 && pointer[3] === -1) {
            const target = this.code.getByPointer([...pointer.slice(0, 3), 0]);
            return performMove(block, amount, target, (moved) => insertBefore(target, moved));
        }

        const target = Array.isArray(pointer) ? this.code.getByPointer(pointer) : pointer;
        const valueSlot = getValueSlot(target);
        if (valueSlot) {
            return performMove(block, amount, valueSlot, (moved) =>
                putSequenceInValueSlot(valueSlot, moved)
            );
        }
        if (
            !(target instanceof Entry.FieldStatement) &&
            !(target instanceof Entry.Thread) &&
            !(target instanceof Entry.Block)
        ) {
            return native.insert.call(this, block, pointer, count);
        }
        return performMove(block, amount, target, (moved) => {
            if (target instanceof Entry.FieldStatement) {
                insertAtStatementTop(target, moved);
                return;
            }
            if (target instanceof Entry.Thread) {
                const parent = target.view?.getParent?.();
                if (parent instanceof Entry.FieldStatement) {
                    insertAtStatementTop(parent, moved);
                } else if (target.getFirstBlock()) {
                    insertBefore(target.getFirstBlock(), moved);
                } else {
                    target.insertByBlock(null, moved);
                    prepareMovedBlocks(moved);
                    refreshThread(target);
                }
                return;
            }
            insertAfter(target, moved);
        });
    }

    function walkBlock(block, visitor, visitedThreads, visitedBlocks) {
        if (!block || visitedBlocks.has(block)) {
            return;
        }
        visitedBlocks.add(block);
        visitor(block.view);
        for (const statement of block.statements || []) {
            walkThread(statement, visitor, visitedThreads, visitedBlocks);
        }
        for (const field of collectInputFields(block.view)) {
            walkBlock(field._valueBlock, visitor, visitedThreads, visitedBlocks);
        }
    }

    function walkThread(thread, visitor, visitedThreads, visitedBlocks) {
        if (!thread || visitedThreads.has(thread)) {
            return;
        }
        visitedThreads.add(thread);
        for (const block of thread.getBlocks?.() || []) {
            walkBlock(block, visitor, visitedThreads, visitedBlocks);
        }
    }

    function forEachLiveView(visitor) {
        const visitedThreads = new Set();
        const visitedBlocks = new Set();
        for (const object of Entry.container.getAllObjects()) {
            const code = object?.script;
            for (const thread of code?.getThreads?.() || []) {
                walkThread(thread, visitor, visitedThreads, visitedBlocks);
            }
        }
    }

    function applyPatch(prototype, method, replacement) {
        appliedPatches.push({
            prototype,
            method,
            hadOwn: Object.prototype.hasOwnProperty.call(prototype, method),
            original: prototype[method],
        });
        prototype[method] = replacement;
    }

    function restorePatches() {
        for (let index = appliedPatches.length - 1; index >= 0; index--) {
            const patch = appliedPatches[index];
            if (patch.hadOwn) {
                patch.prototype[patch.method] = patch.original;
            } else {
                delete patch.prototype[patch.method];
            }
        }
        appliedPatches.length = 0;
    }

    function restoreLiveViews() {
        forEachLiveView((view) => {
            if (!view) {
                return;
            }
            restoreSyntheticView(view);
            try {
                native.updateMagnet.call(view);
            } catch (_) {}
        });
    }

    function disable() {
        if (!installed) {
            return;
        }
        installed = false;
        try {
            restoreLiveViews();
        } finally {
            restorePatches();
            if (window.__entryAnySlotPatch === controller) {
                delete window.__entryAnySlotPatch;
            }
        }
        console.log('Any-slot patch disabled. Reload to normalize nonstandard connections.');
    }

    controller = { version: 'neutral-15', lastError: null, disable };
    const installTouchedViews = [];
    try {
        applyPatch(BoardPrototype, 'generateCodeMagnetMap', patchedGenerateCodeMagnetMap);
        applyPatch(BoardPrototype, 'insert', patchedInsert);
        applyPatch(BoardPrototype, '_getFieldMagnets', patchedGetFieldMagnets);
        applyPatch(BoardPrototype, '_getFieldBlockMetaData', patchedGetFieldBlockMetaData);
        applyPatch(BoardPrototype, '_getOutputMetaData', patchedGetOutputMetaData);
        applyPatch(ViewPrototype, '_getMagnetsInThread', patchedGetMagnetsInThread);
        applyPatch(ViewPrototype, '_updateCloseBlock', patchedUpdateCloseBlock);
        applyPatch(ViewPrototype, '_updateMagnet', patchedUpdateMagnet);
        applyPatch(ViewPrototype, '_toLocalCoordinate', patchedToLocalCoordinate);

        for (const prototype of [Entry.FieldBlock.prototype, Entry.FieldOutput.prototype]) {
            for (const method of ['registerEvent', 'unregisterEvent']) {
                if (typeof prototype[method] !== 'function') {
                    applyPatch(prototype, method, function(block, eventType) {
                        return this.getCode()?.[method]?.(block, eventType);
                    });
                }
            }
        }

        forEachLiveView((view) => {
            installTouchedViews.push(view);
            normalizeViewForOwner(view);
        });
        installed = true;
        window.__entryAnySlotPatch = controller;
        installTouchedViews.length = 0;
    } catch (error) {
        for (let index = installTouchedViews.length - 1; index >= 0; index--) {
            restoreSyntheticView(installTouchedViews[index]);
        }
        installTouchedViews.length = 0;
        try {
            restoreLiveViews();
        } catch (_) {}
        restorePatches();
        if (window.__entryAnySlotPatch === controller) {
            delete window.__entryAnySlotPatch;
        }
        throw new Error(`[AnySlot] Installation rolled back: ${error?.message || error}`);
    }

    console.log('All blocks can repeatedly use all Entry connection points regardless of shape. (neutral-15)');
})();
        installed = true;

        console.log(`${NAME} enabled`);
    }

    function setEnabled(value) {
        enabled = Boolean(value);

        if (enabled) {
            startWaiting();
        } else {
            disablePatch();
        }
    }
let variableMoveFlag = false;
let variableMoveRunId = 0;


function variableMoveStep(
    variable,
    time,
    resolve,
    x,
    y,
    count = 100,
    runId
) {

    /*
     * 정지 버튼을 눌렀으면
     * 현재 이동도 바로 종료
     */
    if (
        !variableMoveFlag ||
        runId !== variableMoveRunId
    ) {
        resolve();
        return;
    }


    variable.setX(
        variable.getX() + x
    );

    variable.setY(
        variable.getY() + y
    );


    count--;


    if (count > 0) {

        setTimeout(
            variableMoveStep,
            time,
            variable,
            time,
            resolve,
            x,
            y,
            count,
            runId
        );

    } else {

        resolve();

    }
}


async function moveVariableRandom(
    variable,
    runId
) {

    const targetX =
        Math.floor(
            Math.random() * 480
        ) - 240;

    const targetY =
        Math.floor(
            Math.random() * 260
        ) - 130;

    const totalTime =
        Math.random() * 700;


    const currentX =
        variable.getX();

    const currentY =
        variable.getY();


    await new Promise((resolve) => {

        variableMoveStep(
            variable,
            totalTime / 100,
            resolve,
            (targetX - currentX) / 100,
            (targetY - currentY) / 100,
            100,
            runId
        );

    });
}


function startVariableMove() {

    /*
     * 이미 실행 중이면
     * 또 실행하지 않음
     */
    if (variableMoveFlag) {
        return;
    }


    const variables =
        Entry.variableContainer
            ?.variables_;


    if (
        !variables ||
        typeof variables.forEach !==
            "function"
    ) {

        console.warn(
            "변수 목록을 찾을 수 없습니다."
        );

        return;
    }


    variableMoveFlag = true;

    const runId =
        ++variableMoveRunId;


    variables.forEach(
        async function(variable) {

            /*
             * 변수 표시창 보이기
             */
            variable.setVisible(true);


            while (
                variableMoveFlag &&
                runId === variableMoveRunId
            ) {

                await moveVariableRandom(
                    variable,
                    runId
                );

            }

        }
    );


    console.log(
        "변수 랜덤 이동 시작"
    );
}


function stopVariableMove() {

    variableMoveFlag = false;

    /*
     * 이전 실행을 완전히 무효화
     */
    variableMoveRunId++;


    console.log(
        "변수 랜덤 이동 정지"
    );
}
  window.addEventListener("message", (event) => {
    if (event.source !== window) {
        return;
    }

    if (
        event.data?.source !== "ENTRY_UNLIMITED_BLOCKS"
    ) {
        return;
    }

    if (
        event.data?.type === "SET_ENABLED"
    ) {
        setEnabled(event.data.enabled);
        return;
    }

    if (
        event.data?.type === "ADD_BLOCK"
    ) {
        addBlockById(event.data.blockId);
        return;
    }
    if (
    event.data?.type === "EXPORT_PROJECT_FOR_UNOFFICIAL"
) {

    try {

        const project =
            Entry.exportProject();
        allowUnofficialReload = true;

        window.postMessage(
            {
                source:
                    "ENTRY_UNLIMITED_BLOCKS_PATCH",

                type:
                    "EXPORTED_PROJECT_FOR_UNOFFICIAL",

                project:
                    project,

                projectId:
                    Entry.projectId || null
            },
            "*"
        );

        console.log(
            "[비공식 블록] 현재 작품 임시 저장용 내보내기 완료"
        );

    } catch (error) {

        console.error(
            "[비공식 블록] 작품 내보내기 실패",
            error
        );

    }

    return;
}  
 if (
    event.data?.type ===
    "RESTORE_TEMP_PROJECT_AFTER_UNOFFICIAL"
) {

    (async () => {

        try {

            const project =
                event.data.project;

            const projectId =
                event.data.projectId;

            if (
                !project ||
                !window.Entry ||
                typeof Entry.loadProject !== "function"
            ) {
                return;
            }

            if (
                typeof Entry.clearProject === "function"
            ) {
                Entry.clearProject();
            }

            await Entry.loadProject(
                project
            );

            if (projectId) {
                Entry.projectId =
                    projectId;
            }

            window.postMessage(
                {
                    source:
                        "ENTRY_UNLIMITED_BLOCKS_PATCH",
                    type:
                        "TEMP_PROJECT_RESTORED_FOR_UNOFFICIAL",
                    storageKey:
                        event.data.storageKey
                },
                "*"
            );

            console.log(
                "[비공식 블록] 임시 작품 복원 완료"
            );

        } catch (error) {

            console.error(
                "[비공식 블록] 임시 작품 복원 실패",
                error
            );
        }

    })();

    return;
}     
    if (
    event.data?.type === "RESTORE_PROJECT_AFTER_UNOFFICIAL"
) {
    restoreProjectAfterUnofficial(
        event.data.projectId
    );

    return;
}

    if (
        event.data?.type === "ENTRY_ACTION"
    ) {
        const action = event.data.action;
        const data = event.data.data || {};

        try {
      if (action === "OPEN_TIPS_DATE") {

    if (
        !/\/community\/tips\/list/.test(
            location.pathname
        )
    ) {
        alert("노팁 목록 페이지가 아닙니다.");
        return;
    }

    const date =
        new Date(data.date);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        alert("날짜 형식이 올바르지 않습니다.");
        return;
    }

    const button =
        document.querySelector("button");

    const list =
        document.querySelector(
            "section>div>div>div>div>ul"
        );

    if (!button || !list) {
        alert("노팁 목록을 찾지 못했습니다.");
        return;
    }

    const oldFetch =
        window.fetch;

    window.fetch =
        function(input, init) {

            const url =
                typeof input === "string"
                    ? input
                    : input?.url || "";

            if (
                !url.includes(
                    "SELECT_DISCUSS_LIST"
                ) ||
                !init?.body
            ) {
                return oldFetch.apply(
                    this,
                    arguments
                );
            }

            const body =
                JSON.parse(
                    init.body
                );

            const variables =
                body.variables;

            if (
                variables
                    ?.pageParam
                    ?.soft
            ) {
                window.fetch =
                    oldFetch;

                alert(
                    "최신순에서만 가능합니다."
                );

                return oldFetch.apply(
                    this,
                    arguments
                );
            }

            variables.searchAfter = [
                date
            ];

            init.body =
                JSON.stringify(
                    body
                );

            window.fetch =
                oldFetch;

            console.log(
                "[노팁 날짜 이동]",
                date
            );

            return oldFetch.call(
                this,
                input,
                init
            );
        };

    list.innerHTML = "";
    list.style = "";

    button.click();

    return;
}      

            if (action === "UNBAN_BLOCKS") {
                for (let i of Entry.playground.blockMenu._bannedClass) {
                    Entry.playground.blockMenu.unbanClass(i);
                }
                return;
            }

            

            if (action === "SET_TIMER") {
                if (
                    data.name !== undefined &&
                    data.name !== ""
                ) {
                    Entry.engine.projectTimer.setName(
                        data.name
                    );
                }

                if (
                    data.x !== undefined &&
                    data.x !== ""
                ) {
                    Entry.engine.projectTimer.setX(
                        Number(data.x)
                    );
                }

                if (
                    data.y !== undefined &&
                    data.y !== ""
                ) {
                    Entry.engine.projectTimer.setY(
                        Number(data.y)
                    );
                }

                return;
            }

            if (action === "SHOW_TIMER") {
                Entry.engine.projectTimer.setVisible(true);
                return;
            }

            if (action === "HIDE_TIMER") {
                Entry.engine.projectTimer.setVisible(false);
                return;
            }
            if (action === "START_VARIABLE_MOVE") {
    startVariableMove();
    return;
}

if (action === "STOP_VARIABLE_MOVE") {
    stopVariableMove();
    return;
}

            if (action === "ADD_LOCAL_VARIABLE") {
                if (
                    !Entry.Func ||
                    !Entry.Func.targetFunc
                ) {
                    alert("함수 편집창을 먼저 열어주세요.");
                    return;
                }

                const count =
                    Number(data.count) || 1;

                for (
                    let i = 0;
                    i < count;
                    i++
                ) {
                    const v =
                        Entry.Func.targetFunc.defaultLocalVariable();

                    v.name =
                        "변수" + (i + 1);

                    Entry.Func.targetFunc.appendLocalVariable(v);
                }

                return;
            }

            if (action === "SET_FRAME_SPEED") {
                const speed =
                    Number(data.speed);

                if (
                    !Number.isFinite(speed) ||
                    speed <= 0
                ) {
                    return;
                }

                const selectedId =
                    Entry.container.selectedObject?.id;

                const project =
                    Entry.exportProject();

                project.speed = speed;

                Entry.clearProject();
                Entry.loadProject(project);

                setTimeout(() => {
                    if (selectedId) {
                        Entry.container.selectObject(
                            selectedId
                        );
                    }
                }, 100);

                return;
            }

        } catch (error) {
            console.error(
                "ENTRY_ACTION failed:",
                action,
                error
            );
        }
    }
});

requestState();
setInterval(() => {
    sendProjectId();
}, 500);

})();
/* =========================================
   확장 프로그램 설치 감지 변수
   ========================================= */

function setExtensionDetectedVariable() {

    if (
        !window.Entry ||
        !Entry.variableContainer
    ) {
        return;
    }

    const variable =
        Entry.variableContainer
            .getVariableByName(
                "@_"
            );

    if (!variable) {
        return;
    }

    variable.setValue(1);
}

setInterval(
    setExtensionDetectedVariable,
    500
);
async function installExtensionCheckFunction() {

    if (
        !window.Entry ||
        !Entry.exportProject ||
        !Entry.loadProject
    ) {
        return;
    }

    const project =
        Entry.exportProject();

    project.variables =
        Array.isArray(project.variables)
            ? project.variables
            : [];

    project.functions =
        Array.isArray(project.functions)
            ? project.functions
            : [];

    /* @_ 변수 찾기 */
    let variable =
        project.variables.find(
            v => v.name === "@_"
        );

    /* 없으면 자동 생성 */
    if (!variable) {

        variable = {
            name: "@_",
            id: "ext0",
            value: "0",
            variableType: "variable",
            visible: false,
            x: 0,
            y: 0,
            object: null,
            array: []
        };

        project.variables.push(
            variable
        );
    }

    const variableId =
        variable.id;

    /* 이미 함수가 있으면 또 만들지 않음 */
    const exists =
        project.functions.some(
            f => f.id === "extcheck"
        );

    if (!exists) {

    
