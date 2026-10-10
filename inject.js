/* =========================================================
   언차티드 블록 - 자동 주입 스크립트
   -----------------------------------------------------------
   1단계: Entry.block 객체가 생기자마자 블록 "정의"부터 즉시 등록
          (저장된 작품을 불러올 때 엔트리가 블록을 그리기 전에
           정의가 반드시 먼저 있어야 하므로 최우선으로 처리)
   2단계: 워크스페이스/팔레트(blockMenu)가 준비되면 팔레트에 등록
   ========================================================= */
(function () {
  if (window.__unchartedExtensionLoaded) return;
  window.__unchartedExtensionLoaded = true;

  const LOG = (...args) => console.log('%c[언차티드 블록]', 'color:#3498DB;font-weight:bold;', ...args);

  /* ===================== 공통 유틸 ===================== */
  function getAllObjs() {
    return Entry.container.getAllObjects ? Entry.container.getAllObjects() : Entry.container.objects_;
  }
  function getXY(e) {
    return typeof e.getX === 'function' ? { x: e.getX(), y: e.getY() } : { x: e.x, y: e.y };
  }
  function getScale(e) {
    if (typeof e.getScaleX === 'function') return { sx: e.getScaleX(), sy: e.getScaleY() };
    if (typeof e.getSize === 'function') { const s = e.getSize() / 100; return { sx: s, sy: s }; }
    if (e.object && e.object.scaleX != null) return { sx: e.object.scaleX, sy: e.object.scaleY };
    return { sx: 1, sy: 1 };
  }
  function cloneCanvas(source) {
    const c = document.createElement('canvas');
    c.width = source.width;
    c.height = source.height;
    c.getContext('2d').drawImage(source, 0, 0);
    return c;
  }
  function ensureState(sprite) {
    // 엔트리가 모양(코스튬)을 진짜로 바꿔치기했는지 감지: 우리가 만든 캔버스가 아니면 원본 갱신
    if (!sprite.object.image || sprite.object.image.__unchartedGenerated !== true) {
      sprite.__originalCanvas = sprite.object.image;
    }
    if (!sprite.__unchartedState) {
      sprite.__unchartedState = { grayscale: 0, invert: 0, pixelate: 0, clipTargetId: null };
    }
    return sprite.__unchartedState;
  }
  function hasActiveEffect(state) {
    return state.grayscale > 0 || state.invert > 0 || state.pixelate > 0 || !!state.clipTargetId;
  }

  // 오브젝트의 화면 표시 이미지를 canvas로 교체 (renderEntity와 동일한 패턴으로 통일)
  function applyImageToEntity(sprite, canvas) {
    canvas.__unchartedGenerated = true; // ensureState가 이걸 "우리가 만든 것"으로 인식하게 표식
    sprite.__originalCanvas = canvas;   // 효과 렌더링 기준 원본도 갱신
    sprite.object.image = canvas;
    if (sprite.parent && sprite.parent.stage) sprite.parent.stage.update();
    else if (Entry.stage && Entry.stage.update) Entry.stage.update();
  }

  // 사용자 PC에서 이미지 파일을 선택받아 <img>로 로드해서 반환 (Promise)
  function pickImageFile() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        document.body.removeChild(input);
        if (!file) { reject(new Error('파일을 선택하지 않았습니다.')); return; }
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => resolve({ img, file });
          img.onerror = () => reject(new Error('이미지 디코딩에 실패했습니다.'));
          img.src = reader.result;
        };
        reader.onerror = () => reject(new Error('파일을 읽지 못했습니다.'));
        reader.readAsDataURL(file);
      });
      // 사용자가 파일 선택창을 취소한 경우도 처리 (change가 안 옴 → focus 복귀로 감지)
      window.addEventListener('focus', function onFocus() {
        window.removeEventListener('focus', onFocus);
        setTimeout(() => {
          if (document.body.contains(input) && (!input.files || input.files.length === 0)) {
            document.body.removeChild(input);
            reject(new Error('파일 선택이 취소되었습니다.'));
          }
        }, 300);
      });
      document.body.appendChild(input);
      input.click();
    });
  }

  function renderEntity(sprite) {
    const state = ensureState(sprite);
    let canvas = cloneCanvas(sprite.__originalCanvas);

    if (state.pixelate > 0) {
      const w = canvas.width, h = canvas.height;
      const blockSize = Math.max(1, Math.round((state.pixelate / 100) * 30));
      const small = document.createElement('canvas');
      small.width = Math.max(1, Math.floor(w / blockSize));
      small.height = Math.max(1, Math.floor(h / blockSize));
      small.getContext('2d').drawImage(canvas, 0, 0, small.width, small.height);
      const out = document.createElement('canvas');
      out.width = w; out.height = h;
      const octx = out.getContext('2d');
      octx.imageSmoothingEnabled = false;
      octx.drawImage(small, 0, 0, small.width, small.height, 0, 0, w, h);
      canvas = out;
    }

    if (state.grayscale > 0 || state.invert > 0) {
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const gRatio = state.grayscale / 100;
      const iRatio = state.invert / 100;
      for (let i = 0; i < data.length; i += 4) {
        if (gRatio > 0) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] += (avg - data[i]) * gRatio;
          data[i + 1] += (avg - data[i + 1]) * gRatio;
          data[i + 2] += (avg - data[i + 2]) * gRatio;
        }
        if (iRatio > 0) {
          data[i] += (255 - data[i] - data[i]) * iRatio;
          data[i + 1] += (255 - data[i + 1] - data[i + 1]) * iRatio;
          data[i + 2] += (255 - data[i + 2] - data[i + 2]) * iRatio;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }

    if (state.clipTargetId) {
      const targetObj = getAllObjs().find((o) => o.id === state.clipTargetId);
      if (targetObj) {
        const targetEntity = targetObj.entity;
        const maskCanvas = targetEntity.object.image;
        if (maskCanvas && maskCanvas.width > 0 && maskCanvas.height > 0) {
          const ctx = canvas.getContext('2d');
          const selfPos = getXY(sprite);
          const targetPos = getXY(targetEntity);
          const selfScale = getScale(sprite);
          const targetScale = getScale(targetEntity);
          const relSx = targetScale.sx / selfScale.sx;
          const relSy = targetScale.sy / selfScale.sy;
          const drawW = maskCanvas.width * relSx;
          const drawH = maskCanvas.height * relSy;
          const dx = (targetPos.x - selfPos.x) / selfScale.sx + (canvas.width / 2 - drawW / 2);
          const dy = -(targetPos.y - selfPos.y) / selfScale.sy + (canvas.height / 2 - drawH / 2);
          ctx.globalCompositeOperation = 'destination-in';
          ctx.drawImage(maskCanvas, dx, dy, drawW, drawH);
          ctx.globalCompositeOperation = 'source-over';
        }
      }
    }

    canvas.__unchartedGenerated = true;
    sprite.object.image = canvas;
    if (sprite.parent && sprite.parent.stage) sprite.parent.stage.update();
  }

  // hatType: 모자 블록 타입명. paramKey/paramValue를 주면, 그 블록의 드롭다운 파라미터 값이
  // 일치하는 스레드만 실행한다 (예: '우클릭 감지'와 '휠클릭 감지'를 같은 블록의 드롭다운으로 구분).
  function fireCustomHatEvent(hatType, paramIndex, paramValue) {
    const ws = Entry.getMainWS();
    const board = ws.board;
    const threads = board.code.getThreads();
    const objs = getAllObjs();
    if (!objs.length) return;
    const entity = objs[0].entity;
    const codeObj = entity.parent.script;

    const matched = threads.filter((t) => {
      const fb = t.getFirstBlock();
      const type = fb && (typeof fb.type === 'function' ? fb.type() : fb.type);
      if (type !== hatType) return false;
      if (paramIndex === undefined) return true;
      // 블록 인스턴스의 파라미터(드롭다운 선택값) 확인. 엔트리 내부 구조상
      // fb.params 배열에 저장되는 것이 일반적이라 이를 우선 사용한다.
      const actualValue = fb.params && fb.params[paramIndex];
      return actualValue === paramValue;
    });

    matched.forEach((thread) => {
      let block = thread.getFirstBlock().getNextBlock();
      while (block) {
        try {
          new Entry.Executor(block, entity, codeObj).execute();
        } catch (e) {
          console.error('❌ 모자 블록 하위 실행 에러:', e);
        }
        block = typeof block.getNextBlock === 'function' ? block.getNextBlock() : null;
      }
    });
  }

  function entryToScreen(x, y) {
    const canvas = document.getElementById('entryCanvas');
    if (!canvas) throw new Error('엔트리 캔버스(entryCanvas)를 찾을 수 없습니다.');
    const internalW = canvas.width;
    const internalH = canvas.height;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / internalW;
    const scaleY = rect.height / internalH;
    const pixelX = rect.left + (internalW / 2 + x) * scaleX;
    const pixelY = rect.top + (internalH / 2 - y) * scaleY;
    return { pixelX, pixelY, scaleX, scaleY };
  }

  /* ===================== 파티클 시스템 ===================== */
  // 엔트리 캔버스 위에 겹치는 별도 <canvas> 하나를 두고, 그 위에 모든 파티클을 그린다.
  // - 순간 폭발형: burst() 호출 시 파티클 N개를 생성해 수명이 다할 때까지 렌더 루프에서 갱신
  // - 지속 발생형: emitter를 오브젝트에 붙여서 매 프레임 좌표를 따라가며 계속 파티클을 뿜음
  window.__unchartedParticles = window.__unchartedParticles || {
    list: [],           // 화면에 떠 있는 개별 파티클들
    emitters: new Map(), // key: sprite, value: emitter 설정
    canvas: null,
    ctx: null,
  };

  // 엔트리 무대의 표준 논리 좌표계 크기(가로/세로). entryCanvas의 실제 픽셀 해상도(canvas.width)는
  // 고해상도 대응이나 "전체화면" 전환 시 이 값과 다르게(더 크게) 재설정될 수 있는데, 그 값을 그대로
  // 따라가면 좌표/크기 계산이 흔들려서 "전체화면에서 파티클이 안 커지는" 현상이 생긴다.
  // 그래서 파티클 캔버스의 내부 해상도는 항상 이 고정값으로 유지하고, 화면 표시 크기만
  // CSS(getBoundingClientRect 기준)로 실제 엔트리 캔버스 크기에 맞춘다.
  const UNCHARTED_STAGE_W = 480;
  const UNCHARTED_STAGE_H = 270;

  function ensureParticleCanvas() {
    const state = window.__unchartedParticles;
    const base = document.getElementById('entryCanvas');
    if (!base) return null;
    const parentEl = base.parentElement || document.body;

    if (state.canvas && document.body.contains(state.canvas)) {
      // entryCanvas가 다른 부모로 옮겨졌으면(전체화면 전환 등) 우리 캔버스도 같이 옮겨준다.
      if (state.canvas.parentElement !== parentEl) parentEl.appendChild(state.canvas);
      return state;
    }

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.__unchartedParticleCanvas = true;
    parentEl.appendChild(canvas);

    state.canvas = canvas;
    state.ctx = canvas.getContext('2d');
    return state;
  }

  function syncParticleCanvasRect() {
    const state = window.__unchartedParticles;
    const base = document.getElementById('entryCanvas');
    if (!base || !state.canvas) return;
    const rect = base.getBoundingClientRect();
    const parentEl = base.parentElement || document.body;
    const parentRect = parentEl.getBoundingClientRect();
    // 내부 해상도는 항상 고정 논리 크기로 유지(위 설명 참고) — entryCanvas의 실제 픽셀
    // 해상도가 몇이든 상관없이 좌표/크기 계산이 흔들리지 않는다.
    if (state.canvas.width !== UNCHARTED_STAGE_W) state.canvas.width = UNCHARTED_STAGE_W;
    if (state.canvas.height !== UNCHARTED_STAGE_H) state.canvas.height = UNCHARTED_STAGE_H;
    state.canvas.style.width = rect.width + 'px';
    state.canvas.style.height = rect.height + 'px';
    state.canvas.style.left = (rect.left - parentRect.left) + 'px';
    state.canvas.style.top = (rect.top - parentRect.top) + 'px';
  }

  // 엔트리 좌표(x, y, y위 방향)를 캔버스 내부 픽셀 좌표로 변환 (entryToScreen과 달리 뷰포트 절대좌표가 아니라 캔버스 로컬 좌표)
  // 항상 고정 논리 크기(UNCHARTED_STAGE_W/H) 기준으로 계산한다 — entryCanvas의 실제 해상도와 무관.
  function entryToCanvasLocal(x, y) {
    return { x: UNCHARTED_STAGE_W / 2 + x, y: UNCHARTED_STAGE_H / 2 - y };
  }

  const PARTICLE_SHAPES = {
    circle: function (ctx, size) {
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();
    },
    square: function (ctx, size) {
      ctx.fillRect(-size, -size, size * 2, size * 2);
    },
    star: function (ctx, size) {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const innerAngle = outerAngle + Math.PI / 5;
        const ox = Math.cos(outerAngle) * size;
        const oy = Math.sin(outerAngle) * size;
        const ix = Math.cos(innerAngle) * size * 0.45;
        const iy = Math.sin(innerAngle) * size * 0.45;
        if (i === 0) ctx.moveTo(ox, oy); else ctx.lineTo(ox, oy);
        ctx.lineTo(ix, iy);
      }
      ctx.closePath();
      ctx.fill();
    },
  };

  // 16진 색상 문자열("#RRGGBB")을 {r,g,b}로 변환. 실패하면 null.
  function hexToRgb(hex) {
    if (typeof hex !== 'string') return null;
    const m = hex.trim().match(/^#?([0-9a-fA-F]{6})$/);
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function lerpColor(fromHex, toHex, t) {
    const a = hexToRgb(fromHex);
    const b = hexToRgb(toHex);
    if (!a || !b) return fromHex || toHex || '#FFFFFF';
    const r = Math.round(a.r + (b.r - a.r) * t);
    const g = Math.round(a.g + (b.g - a.g) * t);
    const bl = Math.round(a.b + (b.b - a.b) * t);
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  }

  // opts 지원 필드(지오메트리 대시 스타일로 확장):
  //   shape, gravity, fade, lifeSec, spin
  //   color                         — 단색(기존 방식, startColor/endColor 없을 때 사용)
  //   startColor, endColor          — 수명에 따라 색이 서서히 변함(그라데이션)
  //   size                          — 단일 크기(기존 방식)
  //   startSize, endSize            — 수명에 따라 크기가 서서히 변함
  //   angle                         — 고정 각도(라디안, 기존 방식)
  //   minAngleDeg, maxAngleDeg      — 각도 범위(도 단위)에서 무작위 분사, angle보다 우선
  //   minSpeed, maxSpeed            — 속도 범위에서 무작위 선택 (speed보다 우선)
  //   speed                         — 고정 속도(기존 방식)
  // opts 추가 지원 필드:
  //   spawnRadius                  — 중심점(x,y)에서 이 반경 안 무작위 위치에서 발생("범위")
  //   minSpin, maxSpin             — 회전 속도를 범위에서 무작위 선택(spin 단일값보다 우선)
  //   bounce                       — 0~1, 바닥(floorY)에 닿으면 튕기는 반발 계수(0=안 튕김/그 자리에 멈춤, 1=완전 반사)
  //   floorY                       — 바닥 y좌표(엔트리 좌표, 기본 -135 = 엔트리 무대 맨 아래)
  function spawnParticle(x, y, opts) {
    opts = opts || {};
    const now = Date.now();

    let spawnX = x, spawnY = y;
    if (opts.spawnRadius) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * opts.spawnRadius;
      spawnX = x + Math.cos(a) * r;
      spawnY = y + Math.sin(a) * r;
    }

    let angle;
    if (opts.minAngleDeg != null || opts.maxAngleDeg != null) {
      const minA = (opts.minAngleDeg != null ? opts.minAngleDeg : 0) * Math.PI / 180;
      const maxA = (opts.maxAngleDeg != null ? opts.maxAngleDeg : 360) * Math.PI / 180;
      angle = minA + Math.random() * (maxA - minA);
    } else {
      angle = opts.angle != null ? opts.angle : Math.random() * Math.PI * 2;
    }

    let speed;
    if (opts.minSpeed != null || opts.maxSpeed != null) {
      const minS = opts.minSpeed != null ? opts.minSpeed : 1;
      const maxS = opts.maxSpeed != null ? opts.maxSpeed : minS;
      speed = minS + Math.random() * Math.max(0, maxS - minS);
    } else {
      speed = opts.speed != null ? opts.speed : 1 + Math.random() * 2;
    }

    let spin;
    if (opts.minSpin != null || opts.maxSpin != null) {
      const minSp = opts.minSpin != null ? opts.minSpin : 0;
      const maxSp = opts.maxSpin != null ? opts.maxSpin : minSp;
      spin = minSp + Math.random() * (maxSp - minSp);
    } else {
      spin = opts.spin != null ? opts.spin : (Math.random() - 0.5) * 0.2;
    }

    window.__unchartedParticles.list.push({
      x: spawnX, y: spawnY,
      vx: Math.cos(angle) * speed,
      vy: -Math.sin(angle) * speed, // 엔트리 좌표계 기준 위쪽이 +y
      startSize: opts.startSize != null ? opts.startSize : (opts.size || (2 + Math.random() * 3)),
      endSize: opts.endSize != null ? opts.endSize : (opts.startSize != null ? opts.startSize : (opts.size || (2 + Math.random() * 3))),
      startColor: opts.startColor || opts.color || '#FFA500',
      endColor: opts.endColor || opts.startColor || opts.color || '#FFA500',
      shape: opts.shape || 'circle',
      gravity: opts.gravity != null ? opts.gravity : 0,
      fade: opts.fade !== false,
      spin,
      rotation: Math.random() * Math.PI * 2,
      bounce: opts.bounce != null ? Math.max(0, Math.min(1, opts.bounce)) : 0,
      floorY: opts.floorY != null ? opts.floorY : -135,
      createdAt: now,
      lifeMs: Math.max(50, (opts.lifeSec != null ? opts.lifeSec : 1) * 1000),
    });
  }

  // 순간 폭발형: 한 지점에서 N개를 사방으로 흩뿌림
  function burstParticles(x, y, count, opts) {
    for (let i = 0; i < count; i++) {
      spawnParticle(x, y, opts);
    }
  }

  function stepParticles() {
    const state = ensureParticleCanvas();
    if (!state) return;
    syncParticleCanvasRect();

    // 지속 발생형 emitter들: 매 프레임 붙어있는 오브젝트 위치에서 파티클 방출
    window.__unchartedParticles.emitters.forEach((emitter, sprite) => {
      if (!emitter.on) return;
      const now = Date.now();
      const interval = 1000 / Math.max(1, emitter.rate);
      if (now - emitter.lastEmitAt < interval) return;
      emitter.lastEmitAt = now;
      const pos = getXY(sprite);
      spawnParticle(pos.x, pos.y, emitter.opts);
    });

    const now = Date.now();
    const list = window.__unchartedParticles.list;
    const ctx = state.ctx;
    ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);

    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      const age = now - p.createdAt;
      if (age >= p.lifeMs) { list.splice(i, 1); continue; }

      const dt = 1; // 프레임당 스텝(간단화)
      p.vy -= p.gravity * 0.02;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.spin;

      // 바닥 튕김: floorY보다 아래로 내려가면 반사(bounce=0이면 그냥 바닥에 붙어서 멈춤)
      if (p.bounce > 0 && p.y < p.floorY) {
        p.y = p.floorY;
        p.vy = Math.abs(p.vy) * p.bounce;
        p.vx *= 0.85; // 튕길 때마다 마찰로 가로 속도도 약간 감쇠
      } else if (p.bounce === 0 && p.y < p.floorY && p.gravity !== 0) {
        p.y = p.floorY;
        p.vy = 0;
        p.vx = 0;
      }

      const lifeRatio = Math.max(0, Math.min(1, age / p.lifeMs));
      const alpha = p.fade ? Math.max(0, 1 - lifeRatio) : 1;
      const size = p.startSize + (p.endSize - p.startSize) * lifeRatio;
      const color = p.startColor === p.endColor ? p.startColor : lerpColor(p.startColor, p.endColor, lifeRatio);

      if (size <= 0) continue;

      const local = entryToCanvasLocal(p.x, p.y);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.translate(local.x, local.y);
      ctx.rotate(p.rotation);
      const shapeFn = PARTICLE_SHAPES[p.shape] || PARTICLE_SHAPES.circle;
      shapeFn(ctx, size);
      ctx.restore();
    }
  }

  function clearAllParticles() {
    window.__unchartedParticles.list = [];
    window.__unchartedParticles.emitters.clear();
    if (window.__unchartedParticles.canvas) {
      window.__unchartedParticles.canvas.remove();
      window.__unchartedParticles.canvas = null;
      window.__unchartedParticles.ctx = null;
    }
  }

  /* ===================== 마우스 커서 커스터마이징 ===================== */
  // object.image(캔버스/이미지)를 data URL 커서로 변환해서 CSS cursor로 적용한다.
  window.__unchartedCursor = window.__unchartedCursor || { styleEl: null, scope: null };

  function imageToCursorDataUrl(imgSource, maxSize) {
    const size = maxSize || 32; // 너무 크면 브라우저가 커서로 안 받아줄 수 있어 축소
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    // 원본 비율 유지하며 정사각형 안에 맞춤
    const sw = imgSource.width || imgSource.naturalWidth;
    const sh = imgSource.height || imgSource.naturalHeight;
    if (!sw || !sh) throw new Error('이미지 크기를 읽을 수 없습니다.');
    const scale = Math.min(size / sw, size / sh);
    const dw = sw * scale, dh = sh * scale;
    ctx.drawImage(imgSource, (size - dw) / 2, (size - dh) / 2, dw, dh);
    return c.toDataURL('image/png');
  }

  function ensureCursorStyleEl() {
    if (window.__unchartedCursor.styleEl && document.head.contains(window.__unchartedCursor.styleEl)) {
      return window.__unchartedCursor.styleEl;
    }
    const el = document.createElement('style');
    el.id = '__unchartedCursorStyle';
    document.head.appendChild(el);
    window.__unchartedCursor.styleEl = el;
    return el;
  }

  function applyCustomCursor(dataUrl, scope) {
    const el = ensureCursorStyleEl();
    const cssCursor = 'url("' + dataUrl + '") 16 16, auto';
    if (scope === 'page') {
      el.textContent = '* { cursor: ' + cssCursor + ' !important; }';
    } else {
      // 캔버스 위에서만 (엔트리 무대 iframe/canvas 대상)
      el.textContent = '#entryCanvas, .entryCanvasImg, [class*="entryStage"] { cursor: ' + cssCursor + ' !important; }';
    }
    window.__unchartedCursor.scope = scope;
  }

  function resetCustomCursor() {
    if (window.__unchartedCursor.styleEl) {
      window.__unchartedCursor.styleEl.textContent = '';
    }
    window.__unchartedCursor.scope = null;
  }

  /* ===================== 물리엔진 (Matter.js) ===================== */
  // 하나의 전역 물리 세계를 공유하고, 매 프레임 엔트리 오브젝트 <-> Matter 바디를 동기화한다.
  function ensurePhysicsWorld() {
    if (window.__unchartedPhysics) return window.__unchartedPhysics;
    if (typeof Matter === 'undefined') throw new Error('물리엔진 라이브러리(Matter.js)를 불러오지 못했습니다.');

    const engine = Matter.Engine.create();
    engine.gravity.y = -1; // 엔트리 좌표계는 위가 +y라서 중력을 아래로 향하려면 y를 음수로

    window.__unchartedPhysics = {
      engine,
      bodies: new Map(), // objId -> { body, sprite, cameraTarget }
      cameraTargetId: null,
    };
    return window.__unchartedPhysics;
  }

  // 현재 모양 이미지의 알파 채널로 윤곽을 추출해서 Matter 바디용 정점 배열을 만든다.
  // 정밀 추적 대신 일정 간격으로 샘플링한 뒤 볼록 껍질(convex hull)로 단순화한다.
  function extractHullVertices(sprite) {
    const img = sprite.object && sprite.object.image;
    if (!img || !img.width) return null;

    const off = document.createElement('canvas');
    off.width = img.width;
    off.height = img.height;
    const ctx = off.getContext('2d');
    try {
      ctx.drawImage(img, 0, 0);
    } catch (e) {
      return null; // CORS 등으로 픽셀 읽기가 막힌 이미지
    }

    let data;
    try {
      data = ctx.getImageData(0, 0, off.width, off.height).data;
    } catch (e) {
      return null;
    }

    const points = [];
    const step = Math.max(1, Math.round(Math.max(off.width, off.height) / 40)); // 성능을 위한 샘플링 간격
    for (let y = 0; y < off.height; y += step) {
      for (let x = 0; x < off.width; x += step) {
        const alpha = data[(y * off.width + x) * 4 + 3];
        if (alpha > 30) points.push({ x, y });
      }
    }
    if (points.length < 3) return null;

    const hull = convexHull(points);
    if (hull.length < 3) return null;

    // Matter.js 바디는 중심(0,0) 기준 상대 좌표를 기대하므로, 이미지 중심 기준으로 이동
    const cx = off.width / 2;
    const cy = off.height / 2;
    return hull.map((p) => ({ x: p.x - cx, y: -(p.y - cy) })); // y는 엔트리 좌표계에 맞춰 반전
  }

  // Andrew's monotone chain 볼록 껍질 알고리즘
  function convexHull(points) {
    const pts = points.slice().sort((a, b) => (a.x - b.x) || (a.y - b.y));
    const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

    const lower = [];
    for (const p of pts) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
      lower.push(p);
    }
    const upper = [];
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
      upper.push(p);
    }
    lower.pop();
    upper.pop();
    return lower.concat(upper);
  }

  function createPhysicsBodyForSprite(sprite, isStatic) {
    const physics = ensurePhysicsWorld();
    const id = sprite.__unchartedObjId || (sprite.__unchartedObjId = 'phys_' + Date.now() + Math.random().toString(36).slice(2, 6));

    if (physics.bodies.has(id)) {
      Matter.World.remove(physics.engine.world, physics.bodies.get(id).body);
      physics.bodies.delete(id);
    }

    const vertices = extractHullVertices(sprite) || [{ x: -25, y: -25 }, { x: 25, y: -25 }, { x: 25, y: 25 }, { x: -25, y: 25 }];
    const scaleX = typeof sprite.getScaleX === 'function' ? sprite.getScaleX() : 1;
    const scaleY = typeof sprite.getScaleY === 'function' ? sprite.getScaleY() : 1;
    const scaledVerts = vertices.map((v) => ({ x: v.x * scaleX, y: v.y * scaleY }));

    const body = Matter.Bodies.fromVertices(
      sprite.getX(), sprite.getY(),
      [scaledVerts],
      { isStatic: !!isStatic, restitution: 0.3, friction: 0.3 },
      true
    );

    // Bodies.fromVertices는 정점 집합의 기하학적 무게중심을 새 원점으로 재계산해서
    // body.position을 그쪽으로 옮겨버리기 때문에, 우리가 원한 위치(이미지 중심 = 스프라이트 위치)와
    // 어긋나는 현상이 있었음(실측 확인: 히트박스가 이미지와 안 맞고 붕 떠 보임).
    // 재계산으로 생긴 오프셋만큼 다시 강제로 원하는 위치로 맞춰준다.
    Matter.Body.setPosition(body, { x: sprite.getX(), y: sprite.getY() });

    Matter.World.add(physics.engine.world, body);
    physics.bodies.set(id, { body, sprite, lastX: sprite.getX(), lastY: sprite.getY() });
    sprite.__unchartedHasPhysics = true;
    sprite.__unchartedIsStatic = !!isStatic;
    return body;
  }

  function stepPhysicsWorld() {
    const physics = window.__unchartedPhysics;
    if (!physics || physics.bodies.size === 0) return;

    // 1) 사용자가 이동 블록으로 위치를 바꿨는지 확인해서, 바꿨다면 물리 바디를 그쪽으로 텔레포트
    physics.bodies.forEach((rec) => {
      const { body, sprite } = rec;
      const curX = sprite.getX();
      const curY = sprite.getY();
      if (!sprite.__unchartedIsStatic && (Math.abs(curX - rec.lastX) > 0.01 || Math.abs(curY - rec.lastY) > 0.01)) {
        // 물리 시뮬레이션이 아니라 스크립트(이동 블록)가 위치를 바꾼 경우로 판단 → 텔레포트
        const physicsUpdatedX = body.position.x;
        const physicsUpdatedY = body.position.y;
        if (Math.abs(curX - physicsUpdatedX) > 0.5 || Math.abs(curY - physicsUpdatedY) > 0.5) {
          Matter.Body.setPosition(body, { x: curX, y: curY });
        }
      }
    });

    // 2) 물리 연산 진행
    Matter.Engine.update(physics.engine, 1000 / 60);

    // 3) 결과를 엔트리 오브젝트에 반영
    physics.bodies.forEach((rec) => {
      const { body, sprite } = rec;
      if (!sprite.__unchartedIsStatic) {
        sprite.setX(body.position.x);
        sprite.setY(body.position.y);
        if (!sprite.__unchartedFixedRotation && typeof sprite.setRotation === 'function') {
          sprite.setRotation((body.angle * 180 / Math.PI) % 360);
        }
      }
      rec.lastX = sprite.getX();
      rec.lastY = sprite.getY();
    });

    // 4) 카메라 고정 처리: 대상 오브젝트가 화면상 제자리에 머물도록,
    //    대상의 이동량(delta)만큼 물리 세계의 모든 오브젝트를 반대로 밀어서 보정한다.
    if (physics.cameraTargetId && physics.bodies.has(physics.cameraTargetId)) {
      const camRec = physics.bodies.get(physics.cameraTargetId);
      if (physics.__camLastX == null) {
        physics.__camLastX = camRec.body.position.x;
        physics.__camLastY = camRec.body.position.y;
      }
      const dx = camRec.body.position.x - physics.__camLastX;
      const dy = camRec.body.position.y - physics.__camLastY;

      if (dx !== 0 || dy !== 0) {
        physics.bodies.forEach((rec) => {
          Matter.Body.setPosition(rec.body, { x: rec.body.position.x - dx, y: rec.body.position.y - dy });
          // static(떠있는 물체=바닥/발판)도 카메라가 움직이면 화면상 같이 밀려야 자연스러움
          rec.sprite.setX(rec.body.position.x);
          rec.sprite.setY(rec.body.position.y);
          rec.lastX = rec.sprite.getX();
          rec.lastY = rec.sprite.getY();
        });
      }
      physics.__camLastX = camRec.body.position.x;
      physics.__camLastY = camRec.body.position.y;
    }
  }

  /* ===================== 3D 오브젝트 렌더링 (Three.js) ===================== */
  // 오브젝트별로 Three.js 씬/카메라/렌더러를 하나씩 갖고, 원본 스프라이트는 alpha=0으로 숨긴 뒤
  // 그 자리에 정확히 겹치는 WebGL 캔버스를 얹어서 3D로 표시한다 ("레이어 최고 위로 올리기"와 같은 원리).
  window.__uncharted3D = window.__uncharted3D || new Map(); // objId -> { renderer, scene, camera, mesh, sprite, canvas }

  // 아주 단순한 OBJ 텍스트 파서: v(정점), vt(UV), f(면)만 지원. 로우폴리 용도로 충분.
  // 음수 인덱스, n/g/o/mtllib 등은 무시(혹은 최소 대응)한다.
  function parseObjToGeometry(objText) {
    const positions = [];
    const uvs = [];
    const faceVerts = []; // 삼각분할된 최종 정점 좌표
    const faceUVs = [];

    const lines = objText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line[0] === '#') continue;
      const parts = line.split(/\s+/);
      const tag = parts[0];

      if (tag === 'v') {
        positions.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
      } else if (tag === 'vt') {
        uvs.push([parseFloat(parts[1]), parseFloat(parts[2] || '0')]);
      } else if (tag === 'f') {
        // f v1/vt1 v2/vt2 v3/vt3 ... (다각형이면 팬(fan) 방식으로 삼각분할)
        const refs = parts.slice(1).map((token) => {
          const seg = token.split('/');
          const vIdx = parseInt(seg[0], 10);
          const vtIdx = seg[1] ? parseInt(seg[1], 10) : null;
          return {
            v: vIdx > 0 ? vIdx - 1 : positions.length + vIdx, // 음수 인덱스(끝에서부터) 지원
            vt: vtIdx ? (vtIdx > 0 ? vtIdx - 1 : uvs.length + vtIdx) : null,
          };
        });
        for (let k = 1; k < refs.length - 1; k++) {
          [refs[0], refs[k], refs[k + 1]].forEach((r) => {
            const p = positions[r.v];
            if (!p) return;
            faceVerts.push(p[0], p[1], p[2]);
            if (r.vt != null && uvs[r.vt]) {
              faceUVs.push(uvs[r.vt][0], uvs[r.vt][1]);
            } else {
              faceUVs.push(0, 0);
            }
          });
        }
      }
    }

    if (faceVerts.length === 0) throw new Error('OBJ 코드에서 면(f) 데이터를 찾을 수 없습니다.');

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(faceVerts, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(faceUVs, 2));
    geometry.computeVertexNormals();
    return geometry;
  }

  function ensure3DObject(sprite) {
    const id = sprite.__uncharted3DObjId || (sprite.__uncharted3DObjId = '3d_' + Date.now() + Math.random().toString(36).slice(2, 6));
    let rec = window.__uncharted3D.get(id);
    if (rec) return rec;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.zIndex = 9996;
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 3, 4);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    rec = {
      renderer, scene, camera, mesh: null, sprite, canvas,
      posZ: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1,
    };
    window.__uncharted3D.set(id, rec);

    sprite.__uncharted3DOrigAlpha = sprite.object.alpha != null ? sprite.object.alpha : 1;
    sprite.object.alpha = 0; // 원본 2D 모양은 숨김
    if (Entry.stage && Entry.stage.update) Entry.stage.update();

    return rec;
  }

  function apply3DTexture(rec) {
    const img = rec.sprite.object && rec.sprite.object.image;
    if (!img || !rec.mesh) return;
    const texture = new THREE.Texture(img);
    texture.needsUpdate = true;
    if (rec.mesh.material) rec.mesh.material.dispose();
    rec.mesh.material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
  }

  function sync3DObjects() {
    window.__uncharted3D.forEach((rec) => {
      const { renderer, scene, camera, sprite } = rec;
      if (!rec.mesh) return;

      const screen = entryToScreen(sprite.getX(), sprite.getY());
      const baseSize = 120 * (screen.scaleX || 1) * rec.scale; // 화면상 대략적인 표시 크기(픽셀)

      renderer.setSize(baseSize, baseSize, false);
      canvasStyleSync(rec.canvas, screen.pixelX - baseSize / 2, screen.pixelY - baseSize / 2, baseSize, baseSize);

      rec.mesh.rotation.set(
        rec.rotX * Math.PI / 180,
        rec.rotY * Math.PI / 180,
        rec.rotZ * Math.PI / 180
      );
      camera.position.z = 5 - rec.posZ * 0.01; // z축 이동: 카메라를 당기고 미는 방식으로 표현

      renderer.render(scene, camera);
    });
  }

  function canvasStyleSync(canvas, left, top, width, height) {
    canvas.style.left = left + 'px';
    canvas.style.top = top + 'px';
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
  }

  function remove3DObject(sprite) {
    const id = sprite.__uncharted3DObjId;
    if (!id) return;
    const rec = window.__uncharted3D.get(id);
    if (rec) {
      rec.renderer.dispose();
      rec.canvas.remove();
      window.__uncharted3D.delete(id);
    }
    if (sprite.object) sprite.object.alpha = sprite.__uncharted3DOrigAlpha != null ? sprite.__uncharted3DOrigAlpha : 1;
    sprite.__uncharted3DObjId = null;
    if (Entry.stage && Entry.stage.update) Entry.stage.update();
  }

  /* ===================== 이름 기반 초시계 ===================== */
  // window.__unchartedStopwatches: name -> { running, startedAt(ms), elapsedBeforeStart(초) }
  window.__unchartedStopwatches = window.__unchartedStopwatches || new Map();

  function getStopwatchValue(name) {
    const sw = window.__unchartedStopwatches.get(name);
    if (!sw) return 0;
    if (!sw.running) return sw.elapsedBeforeStart;
    return sw.elapsedBeforeStart + (Date.now() - sw.startedAt) / 1000;
  }

  /* ===================== 1단계: 블록 정의 등록 ===================== */
  // stop 정리 로직은 항상 최신 버전으로 갱신되는 함수로 관리한다
  // (registerBlockDefinitions의 __unchartedDefsRegistered 가드와는 별개로,
  //  Entry가 초기화되는 동안 리스너가 무효화되는 경우가 실측 확인되어 독립적으로 재시도한다)
  window.__unchartedStopCleanup = function () {
    // 물리엔진 정리를 최우선으로 (다른 정리 작업에서 에러가 나도 이건 먼저 실행되게)
    try {
      if (window.__unchartedPhysics) {
        window.__unchartedPhysics.bodies.forEach((rec) => {
          rec.sprite.__unchartedHasPhysics = false;
          rec.sprite.__unchartedIsStatic = false;
          rec.sprite.__unchartedFixedRotation = false;
          rec.sprite.__unchartedObjId = null;
        });
        Matter.World.clear(window.__unchartedPhysics.engine.world, false);
        Matter.Engine.clear(window.__unchartedPhysics.engine);
      }
    } catch (physErr) {
      console.error('❌ [언차티드 블록] 물리엔진 정리 중 오류:', physErr);
    } finally {
      window.__unchartedPhysics = null; // 정리 도중 에러가 나도 무조건 null로 만들어 루프가 멈추게
    }

    // 3D 렌더링 정리 (원본 알파 복원 + WebGL 캔버스 제거)
    try {
      if (window.__uncharted3D) {
        window.__uncharted3D.forEach((rec) => {
          try {
            rec.renderer.dispose();
            rec.canvas.remove();
            if (rec.sprite && rec.sprite.object) {
              rec.sprite.object.alpha = rec.sprite.__uncharted3DOrigAlpha != null ? rec.sprite.__uncharted3DOrigAlpha : 1;
            }
            if (rec.sprite) rec.sprite.__uncharted3DObjId = null;
          } catch (innerErr) { /* 하나 실패해도 계속 */ }
        });
        window.__uncharted3D.clear();
      }
    } catch (threeDErr) {
      console.error('❌ [언차티드 블록] 3D 렌더링 정리 중 오류:', threeDErr);
    }

    // 초시계 전체 초기화
    try {
      if (window.__unchartedStopwatches) window.__unchartedStopwatches.clear();
    } catch (swErr) {
      console.error('❌ [언차티드 블록] 초시계 정리 중 오류:', swErr);
    }

    // 파티클 전체 정리
    try {
      if (typeof clearAllParticles === 'function') clearAllParticles();
    } catch (particleErr) {
      console.error('❌ [언차티드 블록] 파티클 정리 중 오류:', particleErr);
    }

    // 마우스 커서 원상복구
    try {
      if (typeof resetCustomCursor === 'function') resetCustomCursor();
    } catch (cursorErr) {
      console.error('❌ [언차티드 블록] 커서 정리 중 오류:', cursorErr);
    }

    // 애니메이션 전체 정지
    try {
      Entry.container.getCurrentObjects().forEach(function (obj) {
        if (obj.entity && obj.entity.__unchartedAnim) obj.entity.__unchartedAnim.playing = false;
      });
    } catch (animErr) {
      console.error('❌ [언차티드 블록] 애니메이션 정리 중 오류:', animErr);
    }

    try {
      Entry.container.getCurrentObjects().forEach(function (obj) {
        const entity = obj.entity;
        if (entity && entity.__originalCanvas) {
          entity.object.image = entity.__originalCanvas;
          entity.__unchartedState = { grayscale: 0, invert: 0, pixelate: 0, clipTargetId: null };
        }
      });
      if (Entry.stage && Entry.stage.update) Entry.stage.update();
      (window.__unchartedWebsites || []).forEach((f) => f.remove());
      window.__unchartedWebsites = [];
      (window.__unchartedTopLayerClones || new Map()).forEach((rec) => {
        if (rec.sprite && rec.sprite.object) {
          rec.sprite.object.alpha = rec.sprite.__unchartedOrigAlpha != null ? rec.sprite.__unchartedOrigAlpha : 1;
        }
        rec.canvas.remove();
      });
      if (window.__unchartedTopLayerClones) window.__unchartedTopLayerClones.clear();
    } catch (otherErr) {
      console.error('❌ [언차티드 블록] 정지 시 정리 중 오류:', otherErr);
    }
  };

  // stop 이벤트 리스너를 등록한다. 여러 번 호출해도 안전(멱등)하도록,
  // 새 리스너를 추가하기 전에 __unchartedStopHandler 플래그로 최초 1회만 등록하되,
  // 이 함수 자체를 감시병이 주기적으로 재호출해서 혹시 등록이 무효화된 경우를 보정한다.
  function registerStopHandler() {
    if (typeof Entry === 'undefined' || typeof Entry.addEventListener !== 'function') return;
    if (window.__unchartedStopHandler) return;
    Entry.addEventListener('stop', function () {
      if (typeof window.__unchartedStopCleanup === 'function') {
        window.__unchartedStopCleanup();
      }
    });
    window.__unchartedStopHandler = true;
  }

  function registerBlockDefinitions() {
    if (window.__unchartedDefsRegistered) return;    Entry.block.unofficial_grayscale = {
      color: '#7C5CBF', outerLine: '#5B4292', skeleton: 'basic',
      template: '모양 흑백 효과를 %1 % 만큼 적용하기',
      params: [{ type: 'Block', accept: 'string' }],
      class: 'uncharted_effects', isNotFor: [],
      paramsKeyMap: { VALUE: 0 },
      def: { params: [{ type: 'number', params: ['50'], statements: [] }], type: 'unofficial_grayscale' },
      func: function (sprite, script) {
        ensureState(sprite).grayscale = Math.max(0, Math.min(100, script.getNumberValue('VALUE', script)));
        renderEntity(sprite);
        return script.callReturn();
      },
    };

    Entry.block.unofficial_invert = {
      color: '#7C5CBF', outerLine: '#5B4292', skeleton: 'basic',
      template: '모양 반전 효과를 %1 % 만큼 적용하기',
      params: [{ type: 'Block', accept: 'string' }],
      class: 'uncharted_effects', isNotFor: [],
      paramsKeyMap: { VALUE: 0 },
      def: { params: [{ type: 'number', params: ['50'], statements: [] }], type: 'unofficial_invert' },
      func: function (sprite, script) {
        ensureState(sprite).invert = Math.max(0, Math.min(100, script.getNumberValue('VALUE', script)));
        renderEntity(sprite);
        return script.callReturn();
      },
    };

    Entry.block.unofficial_pixelate = {
      color: '#7C5CBF', outerLine: '#5B4292', skeleton: 'basic',
      template: '모양 모자이크 효과를 %1 % 만큼 적용하기',
      params: [{ type: 'Block', accept: 'string' }],
      class: 'uncharted_effects', isNotFor: [],
      paramsKeyMap: { VALUE: 0 },
      def: { params: [{ type: 'number', params: ['50'], statements: [] }], type: 'unofficial_pixelate' },
      func: function (sprite, script) {
        ensureState(sprite).pixelate = Math.max(0, Math.min(100, script.getNumberValue('VALUE', script)));
        renderEntity(sprite);
        return script.callReturn();
      },
    };

    Entry.block.unofficial_clipToObject = {
      color: '#E67E22', outerLine: '#B9600C', skeleton: 'basic',
      template: '모양을 %1 오브젝트에 클리핑하기',
      params: [{ type: 'DropdownDynamic', value: null, menuName: 'allSprites', fontSize: 11 }],
      class: 'uncharted_effects', isNotFor: [],
      paramsKeyMap: { TARGET: 0 },
      def: { params: [null], type: 'unofficial_clipToObject' },
      func: function (sprite, script) {
        const targetId = script.getStringValue('TARGET', script);
        const selfObj = getAllObjs().find((o) => o.entity === sprite);
        if (!selfObj) throw new Error('내 오브젝트 정보를 찾을 수 없습니다.');
        if (targetId === selfObj.id) throw new Error('자기 자신은 클리핑 대상으로 선택할 수 없습니다.');
        ensureState(sprite).clipTargetId = targetId;
        renderEntity(sprite);
        return script.callReturn();
      },
    };

    // 이미지 업로드 → 자신의 모양으로 저장 (교체 또는 새 모양 추가)
    Entry.block.unofficial_uploadPicture = {
      color: '#16A085', outerLine: '#117A65', skeleton: 'basic',
      template: '이미지 업로드해서 자신의 모양으로 %1',
      params: [
        { type: 'Dropdown', options: [['교체하기', 'replace'], ['새로 추가하기', 'add']], value: 'replace' },
      ],
      class: 'uncharted_effects', isNotFor: [],
      paramsKeyMap: { MODE: 0 },
      def: { params: ['replace'], type: 'unofficial_uploadPicture' },
      func: async function (sprite, script) {
        const mode = script.getStringValue('MODE', script);
        const selfObj = getAllObjs().find((o) => o.entity === sprite);
        if (!selfObj) throw new Error('내 오브젝트 정보를 찾을 수 없습니다.');

        let picked;
        try {
          picked = await pickImageFile();
        } catch (e) {
          console.warn('[이미지 업로드]', e.message);
          return script.callReturn(); // 취소 시 조용히 종료
        }

        const { img, file } = picked;

        // 캔버스로 변환 (엔트리 렌더 파이프라인과 호환되게)
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);

        if (mode === 'replace') {
          // 현재 모양을 이 이미지로 교체
          applyImageToEntity(sprite, canvas);
          LOG('✅ [이미지 업로드] 현재 모양을 교체했습니다:', file.name);
        } else {
          // 새 모양으로 추가 시도
          // ※ 주의: 엔트리 내부 pictures 데이터 구조에 대한 확신이 100%는 아니라서
          //   실패하면 콘솔에 원인을 남기고, 최소한 화면 표시는 되도록 폴백 처리
          try {
            const pictures = selfObj.pictures || (selfObj.pictures = []);
            const newId = 'uncharted_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
            const newPic = {
              id: newId,
              name: (file.name || '업로드 모양').replace(/\.[^.]+$/, ''),
              type: 'user',
              filename: newId,
              fileurl: canvas.toDataURL('image/png'),
              imageType: 'png',
              dimension: { width: canvas.width, height: canvas.height },
            };
            pictures.push(newPic);

            // 모양 목록 UI가 있다면 갱신 시도 (실패해도 무시)
            try {
              if (Entry.playground && Entry.playground.object === selfObj && Entry.playground.injectPicture) {
                Entry.playground.injectPicture(selfObj);
              } else if (Entry.playground && typeof Entry.playground.reloadPlayground === 'function') {
                Entry.playground.reloadPlayground();
              }
            } catch (uiErr) {
              console.warn('[이미지 업로드] 모양 목록 UI 갱신 실패(무시):', uiErr.message);
            }

            // 지금 화면에 바로 반영도 해준다 (선택 안 해도 시각적으로 확인 가능하게)
            applyImageToEntity(sprite, canvas);

            LOG('✅ [이미지 업로드] 새 모양으로 추가했습니다:', newPic.name, '(pictures 배열에 push됨, UI 목록 반영은 미검증)');
          } catch (e) {
            console.warn('[이미지 업로드] 새 모양 추가 중 오류, 화면 표시만 적용:', e.message);
            applyImageToEntity(sprite, canvas);
          }
        }

        return script.callReturn();
      },
    };

    // 효과 이름(드롭다운 값) <-> 상태 객체의 키 매핑
    const EFFECT_KEY_MAP = { gray: 'grayscale', invert: 'invert', pixelate: 'pixelate' };

    // 붓 패턴 채우기: "자신의 (모양) 모양으로 (왜곡/자르기) 로 채우기"
    // - 자르기: 기존 방식(원본 크기 이미지를 repeat, 그린 경로로 클리핑된 것처럼 보임)
    // - 왜곡: 그리는 도중 실시간으로 지금까지의 경로 bounding box에 이미지를 늘려 맞춤
    //         (공식 "채우기 멈추기"(fill_stop) 블록이 눌릴 때까지 계속 갱신됨)
    Entry.block.unofficial_startPatternFill = {
      color: '#D35400', outerLine: '#A04000', skeleton: 'basic',
      template: '자신의 %1 모양으로 %2 로 채우기',
      params: [
        { type: 'DropdownDynamic', value: null, menuName: 'pictures', fontSize: 11 },
        { type: 'Dropdown', options: [['왜곡', 'distort'], ['자르기', 'crop']], value: 'distort' },
      ],
      class: 'uncharted_brush', isNotFor: [],
      paramsKeyMap: { PICTURE: 0, MODE: 1 },
      def: { params: [null, 'distort'], type: 'unofficial_startPatternFill' },
      func: async function (sprite, script) {
        const pictureValue = script.getStringValue('PICTURE', script);
        const mode = script.getStringValue('MODE', script);
        const selfObj = getAllObjs().find((o) => o.entity === sprite);
        if (!selfObj) throw new Error('내 오브젝트 정보를 찾을 수 없습니다.');

        const pictures = selfObj.pictures || [];
        const pic = pictures.find((p) => p.id === pictureValue || p.name === pictureValue) || pictures[0];
        if (!pic) throw new Error('모양 "' + pictureValue + '"을(를) 찾을 수 없습니다.');

        // 이미지 로드 (같은 모양이면 캐시 재사용)
        if (!sprite.__brushPatternImage || sprite.__brushPatternImage.__picId !== pic.id) {
          let img;
          let url = null;
          if (pic.fileurl) {
            url = pic.fileurl.startsWith('http') ? pic.fileurl : 'https://playentry.org' + pic.fileurl;
          } else if (pic.filename && typeof pic.filename === 'string') {
            const fn = pic.filename;
            url = 'https://playentry.org/uploads/' + fn.substring(0, 2) + '/' + fn.substring(2, 4) + '/image/' + fn + '.png';
          }

          if (url) {
            try {
              img = await new Promise((resolve, reject) => {
                const im = new Image();
                im.crossOrigin = 'Anonymous';
                im.onload = () => resolve(im);
                im.onerror = () => reject(new Error('로드 실패'));
                im.src = url;
              });
            } catch (e) {
              console.warn('[패턴 채우기] URL 로드 실패, 현재 모양 이미지로 대체:', url, e.message);
              img = null;
            }
          }

          if (!img) {
            const currentImg = sprite.object && sprite.object.image;
            if (currentImg && currentImg.width > 0) {
              img = currentImg;
            } else {
              throw new Error('패턴으로 쓸 이미지를 준비하지 못했습니다.');
            }
          }

          img.__picId = pic.id;
          sprite.__brushPatternImage = img;
        }

        // paint 좌표계 규칙(실측 확인됨): x는 엔트리 x와 동일, y는 반전(-getY())
        if (!sprite.paint) Entry.setBasicPaint(sprite);
        sprite.paint.stop = false;

        if (mode === 'crop') {
          sprite.__unchartedFillActive = false; // 왜곡 실시간 갱신 대상에서 제외
          sprite.paint.beginBitmapFill(sprite.__brushPatternImage, 'repeat');
        } else {
          // 왜곡 모드: 렌더 루프가 매 프레임 재계산하도록 표시
          sprite.__unchartedFillActive = true;
          sprite.__unchartedFillImage = sprite.__brushPatternImage;
          // 시작 시점엔 경로가 점 하나뿐이라 bbox가 0이므로, 우선 최소 크기로 채워둔다
          sprite.paint.beginBitmapFill(sprite.__brushPatternImage, 'no-repeat');
          hookEndFillForUnchartedFill(sprite);
        }

        return sprite.paint.moveTo(sprite.getX(), -1 * sprite.getY());
      },
    };

    // 공식 "채우기 멈추기"(fill_stop) 블록이 눌리면 왜곡 갱신을 멈추도록,
    // paint.endFill을 인스턴스 단위로 감싸서 감지한다 (원본 동작은 그대로 유지)
    function hookEndFillForUnchartedFill(sprite) {
      const paint = sprite.paint;
      if (!paint || paint.__unchartedEndFillHooked) return;
      const originalEndFill = paint.endFill.bind(paint);
      paint.endFill = function (...args) {
        sprite.__unchartedFillActive = false;
        return originalEndFill(...args);
      };
      paint.__unchartedEndFillHooked = true;
    }

    Entry.block.unofficial_addEffectAmount = {
      color: '#7C5CBF', outerLine: '#5B4292', skeleton: 'basic',
      template: '%1 효과를 %2 % 만큼 더하기',
      params: [
        {
          type: 'Dropdown',
          options: [['흑백', 'gray'], ['반전', 'invert'], ['모자이크', 'pixelate']],
          value: 'gray',
        },
        { type: 'Block', accept: 'string' },
      ],
      class: 'uncharted_effects', isNotFor: [],
      paramsKeyMap: { TYPE: 0, AMOUNT: 1 },
      def: { params: ['gray', { type: 'number', params: ['10'], statements: [] }], type: 'unofficial_addEffectAmount' },
      func: function (sprite, script) {
        const typeKey = EFFECT_KEY_MAP[script.getStringValue('TYPE', script)];
        if (!typeKey) throw new Error('알 수 없는 효과 종류입니다.');
        const amount = script.getNumberValue('AMOUNT', script);
        const state = ensureState(sprite);
        state[typeKey] = Math.max(0, Math.min(100, (state[typeKey] || 0) + amount));
        renderEntity(sprite);
        return script.callReturn();
      },
    };

    Entry.block.unofficial_getEffectAmount = {
      color: '#7C5CBF', outerLine: '#5B4292', skeleton: 'basic_string_field',
      template: '%1 오브젝트의 %2 효과 강도 값',
      params: [
        { type: 'DropdownDynamic', value: null, menuName: 'allSprites', fontSize: 11 },
        {
          type: 'Dropdown',
          options: [['흑백', 'gray'], ['반전', 'invert'], ['모자이크', 'pixelate']],
          value: 'gray',
        },
      ],
      class: 'uncharted_effects', isNotFor: [],
      paramsKeyMap: { TARGET: 0, TYPE: 1 },
      def: { params: [null, 'gray'], type: 'unofficial_getEffectAmount' },
      func: function (sprite, script) {
        const targetId = script.getStringValue('TARGET', script);
        const typeKey = EFFECT_KEY_MAP[script.getStringValue('TYPE', script)];
        if (!typeKey) throw new Error('알 수 없는 효과 종류입니다.');
        const targetObj = getAllObjs().find((o) => o.id === targetId);
        if (!targetObj) throw new Error('오브젝트를 찾을 수 없습니다.');
        const state = targetObj.entity.__unchartedState;
        return state ? (state[typeKey] || 0) : 0;
      },
    };

    // ===================== 생성형 AI (Groq API) =====================
    // 오브젝트별 대화 상태: { systemPrompt, history: [{role, content}, ...] }
    function ensureAiState(sprite) {
      if (!sprite.__unchartedAiState) {
        sprite.__unchartedAiState = { systemPrompt: '', history: [] };
      }
      return sprite.__unchartedAiState;
    }

    // ===== 작품에 저장되는 "공유 Groq 키" =====
    // 엔트리의 숨김(visible:false) 전역 변수로 저장한다. 이러면 프로젝트를 저장할 때
    // 변수값이 프로젝트 JSON에 함께 포함되어, 그 작품을 여는 다른 사람도 자동으로 쓸 수 있다.
    // (완전히 안 보이는 비밀 저장소는 아님 — 프로젝트 파일을 직접 열어보면 드러날 수 있음.
    //  이 점은 팝업의 경고 문구로 사용자에게 명시함)
    const SHARED_GROQ_KEY_VAR_NAME = '__uncharted_shared_groq_key';

    function findSharedGroqKeyVariable() {
      const list = Entry.variableContainer && Entry.variableContainer.variables_;
      if (!list) return null;
      return list.find((v) => v.name_ === SHARED_GROQ_KEY_VAR_NAME) || null;
    }

    function getSharedGroqKey() {
      const v = findSharedGroqKeyVariable();
      return v ? v.value_ : '';
    }

    // 팝업에서 postMessage로 요청이 오면 호출됨 (아래 message 리스너에서 연결)
    function setSharedGroqKey(key) {
      if (typeof Entry === 'undefined' || !Entry.variableContainer || !Entry.Variable) {
        throw new Error('아직 엔트리 편집 화면이 준비되지 않았습니다. 작품 편집 화면에서 다시 시도해주세요.');
      }
      let v = findSharedGroqKeyVariable();
      if (v) {
        v.setValue(key);
      } else {
        v = Entry.Variable.create({
          name: SHARED_GROQ_KEY_VAR_NAME,
          value: key,
          object: null, // 전역
          visible: false, // 무대에는 안 보이게
          variableType: 'variable',
        });
        Entry.variableContainer.variables_.unshift(v);
        try { Entry.variableContainer.createVariableView(v); } catch (e) { /* 변수 패널이 아직 없을 수 있음 */ }
      }
      try { Entry.variableContainer.updateList(); } catch (e) { /* 무시 */ }
    }

    function removeSharedGroqKey() {
      const v = findSharedGroqKeyVariable();
      if (!v) return;
      try {
        Entry.variableContainer.variables_ = Entry.variableContainer.variables_.filter((x) => x !== v);
        Entry.variableContainer.updateList();
      } catch (e) { /* 무시 */ }
    }

    // 팝업(popup.js)이 postMessage를 통해 이 함수들을 호출할 수 있도록 전역에 노출
    window.__unchartedSetSharedGroqKey = setSharedGroqKey;
    window.__unchartedRemoveSharedGroqKey = removeSharedGroqKey;
    window.__unchartedGetSharedGroqKeyStatus = function () {
      return !!getSharedGroqKey();
    };

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // 429(요청 한도 초과) 시 몇 초 기다렸다 재시도. 계속 실패하면 null 반환(호출부에서 안내 문구 처리)
    async function callGroqWithRetry(apiKey, messages, maxRetries) {
      const waitTimes = [3000, 6000, 10000]; // 3초 → 6초 → 10초
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey,
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b',
            messages: messages,
          }),
        });

        if (res.status === 429) {
          if (attempt < maxRetries) {
            const retryAfterHeader = res.headers.get('retry-after');
            const waitMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : waitTimes[attempt] || 10000;
            console.warn('[생성형 AI] 요청 한도 초과, ' + Math.round(waitMs / 1000) + '초 후 재시도 (' + (attempt + 1) + '/' + maxRetries + ')');
            await sleep(waitMs);
            continue;
          }
          return { ok: false, rateLimited: true };
        }

        if (!res.ok) {
          const errText = await res.text();
          throw new Error('Groq API 오류(' + res.status + '): ' + errText.slice(0, 200));
        }

        const data = await res.json();
        const answer = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (!answer) throw new Error('AI 응답을 읽을 수 없습니다.');
        return { ok: true, answer };
      }
      return { ok: false, rateLimited: true };
    }

    Entry.block.unofficial_setAiRole = {
      color: '#00A86B', outerLine: '#00754A', skeleton: 'basic',
      template: '생성형 AI 역할 설정하기 %1',
      params: [{ type: 'Block', accept: 'string' }],
      class: 'uncharted_ai', isNotFor: [],
      paramsKeyMap: { ROLE: 0 },
      def: { params: [{ type: 'text', params: ['너는 친절한 도우미야.'], statements: [] }], type: 'unofficial_setAiRole' },
      func: function (sprite, script) {
        const role = script.getStringValue('ROLE', script);
        const state = ensureAiState(sprite);
        state.systemPrompt = role;
        return script.callReturn();
      },
    };

    Entry.block.unofficial_askAi = {
      color: '#00A86B', outerLine: '#00754A', skeleton: 'basic_string_field',
      template: 'AI에게 %1 물어보고 대답 받기 %2',
      params: [
        { type: 'Block', accept: 'string' }, // 질문 내용
        {
          type: 'Dropdown',
          options: [['새로 시작', 'reset'], ['기억하기', 'remember']],
          value: 'reset',
        },
      ],
      class: 'uncharted_ai', isNotFor: [],
      paramsKeyMap: { CONTENT: 0, MODE: 1 },
      def: {
        params: [
          { type: 'text', params: ['안녕?'], statements: [] },
          'reset',
        ],
        type: 'unofficial_askAi',
      },
      func: async function (sprite, script) {
        const content = script.getStringValue('CONTENT', script);
        const mode = script.getStringValue('MODE', script);

        const apiKey = window.__unchartedGroqKey || getSharedGroqKey();
        if (!apiKey) throw new Error('Groq API 키가 설정되지 않았습니다. 확장 프로그램 팝업에서 먼저 키를 등록해주세요.');

        const state = ensureAiState(sprite);
        if (mode === 'reset') state.history = [];

        const messages = [];
        if (state.systemPrompt) messages.push({ role: 'system', content: state.systemPrompt });
        messages.push(...state.history);
        messages.push({ role: 'user', content });

        let result;
        try {
          result = await callGroqWithRetry(apiKey, messages, 2); // 최초 시도 + 최대 2번 재시도
        } catch (e) {
          console.warn('[생성형 AI]', e.message);
          throw new Error('AI 요청 실패: ' + e.message);
        }

        if (!result.ok) {
          // 재시도까지 다 실패(계속 요청 한도 초과) → 에러를 던지지 않고 안내 문자열을 값으로 반환
          return '(요청이 많아 잠시 후 다시 시도해 주세요)';
        }

        const answer = result.answer;
        if (mode === 'remember') {
          state.history.push({ role: 'user', content });
          state.history.push({ role: 'assistant', content: answer });
        }

        return answer;
      },
    };

    Entry.block.unofficial_isPageVisible = {
      color: '#4CAF50', outerLine: '#3d8b40', skeleton: 'basic_boolean_field',
      template: '엔트리 화면이 보이는 상태인가?',
      params: [], class: 'uncharted_sensing', isNotFor: [],
      def: { params: [], type: 'unofficial_isPageVisible' },
      func: function () { return !document.hidden; },
    };

    // 현재 보고 있는 작품 페이지(/project/{id})에서 작품 id를 뽑아온다
    function getCurrentProjectId() {
      const m = location.pathname.match(/\/project\/([a-f0-9]+)/i);
      return m ? m[1] : null;
    }

    Entry.block.unofficial_isLiked = {
      color: '#4CAF50', outerLine: '#3d8b40', skeleton: 'basic_boolean_field',
      template: '이 작품에 좋아요를 눌렀는가?',
      params: [], class: 'uncharted_sensing', isNotFor: [],
      def: { params: [], type: 'unofficial_isLiked' },
      func: async function (sprite, script) {
        const projectId = getCurrentProjectId();
        if (!projectId) throw new Error('작품 상세 페이지(playentry.org/project/...)에서만 사용할 수 있습니다.');

        try {
          const res = await fetch('https://playentry.org/graphql/CHECK_LIKE', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // 로그인 세션 쿠키 포함
            body: JSON.stringify({
              query: 'query CHECK_LIKE($target: String!, $groupId: ID) {\n  checkLike(target: $target, groupId: $groupId) {\n    isLike\n  }\n}',
              variables: { target: projectId, targetSubject: 'project', targetType: 'individual' },
            }),
          });
          if (!res.ok) throw new Error('요청 실패(' + res.status + ')');
          const data = await res.json();
          const isLike = data && data.data && data.data.checkLike && data.data.checkLike.isLike;
          return isLike != null; // null이면 안 누른 것, 문자열(id)이면 누른 것
        } catch (e) {
          console.warn('[좋아요 확인]', e.message);
          return false;
        }
      },
    };

    Entry.block.unofficial_toggleLike = {
      color: '#4CAF50', outerLine: '#3d8b40', skeleton: 'basic',
      template: '이 작품에 좋아요 %1',
      params: [{ type: 'Dropdown', options: [['누르기', 'like'], ['취소하기', 'unlike']], value: 'like' }],
      class: 'uncharted_sensing', isNotFor: [],
      paramsKeyMap: { ACTION: 0 },
      def: { params: ['like'], type: 'unofficial_toggleLike' },
      func: async function (sprite, script) {
        const action = script.getStringValue('ACTION', script);
        const projectId = getCurrentProjectId();
        if (!projectId) throw new Error('작품 상세 페이지(playentry.org/project/...)에서만 사용할 수 있습니다.');

        const opName = action === 'like' ? 'LIKE' : 'UNLIKE';
        const fieldName = action === 'like' ? 'like' : 'unlike';

        try {
          const res = await fetch('https://playentry.org/graphql/' + opName, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              query: 'mutation ' + opName + '($target: String!, $targetSubject: String!, $targetType: String!) {\n  ' + fieldName + '(target: $target, targetSubject: $targetSubject, targetType: $targetType) {\n    id\n    target\n    targetSubject\n    targetType\n  }\n}',
              variables: { target: projectId, targetSubject: 'project', targetType: 'individual' },
            }),
          });
          if (!res.ok) throw new Error('요청 실패(' + res.status + ')');
          const data2 = await res.json();
          if (data2.errors) throw new Error(data2.errors[0] && data2.errors[0].message);
        } catch (e) {
          console.warn('[좋아요 ' + (action === 'like' ? '누르기' : '취소') + ']', e.message);
          throw new Error('좋아요 처리 실패: ' + e.message);
        }

        return script.callReturn();
      },
    };

    window.__unchartedWebsites = window.__unchartedWebsites || [];
    Entry.block.unofficial_createWebsite = {
      color: '#3498DB', outerLine: '#2874A6', skeleton: 'basic',
      template: '%1 사이트를 x:%2 y:%3 에 %4 x %5 크기로 생성하기',
      params: [
        { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' },
        { type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' },
        { type: 'Block', accept: 'string' },
      ],
      class: 'uncharted_web', isNotFor: [],
      paramsKeyMap: { URL: 0, X: 1, Y: 2, WIDTH: 3, HEIGHT: 4 },
      def: {
        params: [
          { type: 'text', params: ['https://playentry.org'], statements: [] },
          { type: 'number', params: ['0'], statements: [] },
          { type: 'number', params: ['0'], statements: [] },
          { type: 'number', params: ['200'], statements: [] },
          { type: 'number', params: ['150'], statements: [] },
        ],
        type: 'unofficial_createWebsite',
      },
      func: function (sprite, script) {
        const url = script.getStringValue('URL', script);
        const x = script.getNumberValue('X', script);
        const y = script.getNumberValue('Y', script);
        const w = script.getNumberValue('WIDTH', script);
        const h = script.getNumberValue('HEIGHT', script);
        const { pixelX, pixelY, scaleX, scaleY } = entryToScreen(x, y);
        const pixelW = w * scaleX;
        const pixelH = h * scaleY;

        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.position = 'fixed';
        iframe.style.left = (pixelX - pixelW / 2) + 'px';
        iframe.style.top = (pixelY - pixelH / 2) + 'px';
        iframe.style.width = pixelW + 'px';
        iframe.style.height = pixelH + 'px';
        iframe.style.border = '1px solid #ccc';
        iframe.style.zIndex = 9999;
        document.body.appendChild(iframe);
        window.__unchartedWebsites.push(iframe);

        iframe.addEventListener('load', function () {
          fireCustomHatEvent('unofficial_when_webpage_created');
        });

        return script.callReturn();
      },
    };

    Entry.block.unofficial_when_webpage_created = {
      color: '#3498DB', outerLine: '#2874A6', skeleton: 'basic_event',
      template: '웹페이지가 생성되었을 때',
      params: [], class: 'event', isNotFor: [], events: {},
      def: { params: [], type: 'unofficial_when_webpage_created' },
      func: function (sprite, script) { return script.callReturn(); },
    };

    // ===================== 클립보드 =====================
    Entry.block.unofficial_clipboardWrite = {
      color: '#5D6D7E', outerLine: '#424949', skeleton: 'basic',
      template: '클립보드에 %1 넣기',
      params: [{ type: 'Block', accept: 'string' }],
      class: 'uncharted_system', isNotFor: [],
      paramsKeyMap: { CONTENT: 0 },
      def: { params: [{ type: 'text', params: ['복사할 내용'], statements: [] }], type: 'unofficial_clipboardWrite' },
      func: async function (sprite, script) {
        const content = script.getStringValue('CONTENT', script);
        try {
          await navigator.clipboard.writeText(content);
        } catch (e) {
          console.warn('[클립보드] 쓰기 실패:', e.message);
          throw new Error('클립보드에 쓸 수 없습니다. (브라우저 권한을 확인하세요)');
        }
        return script.callReturn();
      },
    };

    Entry.block.unofficial_clipboardRead = {
      color: '#5D6D7E', outerLine: '#424949', skeleton: 'basic_string_field',
      template: '클립보드의 첫 항목 가져오기',
      params: [],
      class: 'uncharted_system', isNotFor: [],
      paramsKeyMap: {},
      def: { params: [], type: 'unofficial_clipboardRead' },
      func: async function (sprite, script) {
        try {
          const text = await navigator.clipboard.readText();
          return text;
        } catch (e) {
          console.warn('[클립보드] 읽기 실패:', e.message);
          return '';
        }
      },
    };

    // ===================== 우클릭 패널 끄기/켜기 =====================
    Entry.block.unofficial_toggleContextMenu = {
      color: '#5D6D7E', outerLine: '#424949', skeleton: 'basic',
      template: '우클릭 패널 %1',
      params: [{ type: 'Dropdown', options: [['끄기', 'off'], ['켜기', 'on']], value: 'off' }],
      class: 'uncharted_system', isNotFor: [],
      paramsKeyMap: { STATE: 0 },
      def: { params: ['off'], type: 'unofficial_toggleContextMenu' },
      func: function (sprite, script) {
        const state = script.getStringValue('STATE', script);
        if (state === 'off') {
          if (!window.__unchartedContextMenuBlocked) {
            window.__unchartedContextMenuHandler = function (e) { e.preventDefault(); };
            document.addEventListener('contextmenu', window.__unchartedContextMenuHandler);
            window.__unchartedContextMenuBlocked = true;
          }
        } else {
          if (window.__unchartedContextMenuBlocked) {
            document.removeEventListener('contextmenu', window.__unchartedContextMenuHandler);
            window.__unchartedContextMenuBlocked = false;
          }
        }
        return script.callReturn();
      },
    };

    // ===================== 우클릭/휠클릭 감지 (판단 블록: 누르는 동안 계속 참) =====================
    Entry.block.unofficial_isMouseButtonDown = {
      color: '#4CAF50', outerLine: '#3d8b40', skeleton: 'basic_boolean_field',
      template: '%1 을(를) 하고 있는가?',
      params: [{ type: 'Dropdown', options: [['우클릭', 'right'], ['휠클릭', 'middle']], value: 'right' }],
      class: 'uncharted_sensing', isNotFor: [],
      paramsKeyMap: { BUTTON: 0 },
      def: { params: ['right'], type: 'unofficial_isMouseButtonDown' },
      func: function (sprite, script) {
        const button = script.getStringValue('BUTTON', script);
        const state = window.__unchartedInputState || {};
        return button === 'right' ? !!state.rightDown : !!state.middleDown;
      },
    };

    // ===================== 휠 스크롤 감지 (판단 블록: 스크롤 직후 0.2초간 참) =====================
    Entry.block.unofficial_isWheelScrolling = {
      color: '#4CAF50', outerLine: '#3d8b40', skeleton: 'basic_boolean_field',
      template: '휠을 %1 올리고 있는가?',
      params: [{ type: 'Dropdown', options: [['위로', 'up'], ['아래로', 'down']], value: 'up' }],
      class: 'uncharted_sensing', isNotFor: [],
      paramsKeyMap: { DIRECTION: 0 },
      def: { params: ['up'], type: 'unofficial_isWheelScrolling' },
      func: function (sprite, script) {
        const direction = script.getStringValue('DIRECTION', script);
        const state = window.__unchartedInputState || {};
        const now = Date.now();
        if (direction === 'up') {
          return !!(state.wheelUpUntil && now < state.wheelUpUntil);
        }
        return !!(state.wheelDownUntil && now < state.wheelDownUntil);
      },
    };

    if (!window.__unchartedMouseWheelHooked) {
      window.__unchartedInputState = window.__unchartedInputState || {
        rightDown: false, middleDown: false, wheelUpUntil: 0, wheelDownUntil: 0,
      };
      const inputState = window.__unchartedInputState;
      const WHEEL_HOLD_MS = 200;

      // 우클릭/휠클릭: mousedown에서 누른 것으로, mouseup에서 뗀 것으로 처리
      document.addEventListener('mousedown', function (e) {
        if (e.button === 2) inputState.rightDown = true;
        if (e.button === 1) inputState.middleDown = true;
      });
      document.addEventListener('mouseup', function (e) {
        if (e.button === 2) inputState.rightDown = false;
        if (e.button === 1) inputState.middleDown = false;
      });
      window.addEventListener('blur', function () {
        inputState.rightDown = false;
        inputState.middleDown = false;
      });

      document.addEventListener('wheel', function (e) {
        const now = Date.now();
        if (e.deltaY < 0) inputState.wheelUpUntil = now + WHEEL_HOLD_MS;
        else inputState.wheelDownUntil = now + WHEEL_HOLD_MS;
      }, { passive: true });

      window.__unchartedMouseWheelHooked = true;
    }

    // ===================== 글상자 선택 가능 켜기/끄기 =====================
    // ===================== 글상자 선택 가능 켜기/끄기 =====================
    // 캔버스는 픽셀 그림이라 텍스트를 실제로 드래그 선택할 수 없음 →
    // 글상자 오브젝트마다 화면에 정확히 겹치는 투명한 실제 텍스트(DOM)를 만들어 흉내낸다.
    window.__unchartedTextOverlays = window.__unchartedTextOverlays || new Map(); // objId -> div
    window.__unchartedTextSelectEnabled = window.__unchartedTextSelectEnabled || false;

    function removeAllTextOverlays() {
      window.__unchartedTextOverlays.forEach((div) => div.remove());
      window.__unchartedTextOverlays.clear();
    }

    function syncTextOverlays() {
      if (!window.__unchartedTextSelectEnabled) return;
      const canvas = document.getElementById('entryCanvas');
      if (!canvas) return;

      const objs = getAllObjs().filter((o) => o.entity && o.entity.type === 'textBox');
      const seenIds = new Set();

      objs.forEach((o) => {
        const entity = o.entity;
        seenIds.add(o.id);

        let div = window.__unchartedTextOverlays.get(o.id);
        if (!div) {
          div = document.createElement('div');
          div.style.position = 'fixed';
          div.style.color = 'transparent';
          div.style.background = 'transparent';
          div.style.whiteSpace = 'pre';
          div.style.pointerEvents = 'auto';
          div.style.userSelect = 'text';
          div.style.webkitUserSelect = 'text';
          div.style.cursor = 'text';
          div.style.zIndex = 9998;
          div.style.transformOrigin = 'top left';
          document.body.appendChild(div);
          window.__unchartedTextOverlays.set(o.id, div);
        }

        try {
          const bounds = entity.object.getBounds(); // 로컬 좌표계(엔티티 중심 기준) x,y,width,height
          const ex = entity.getX();
          const ey = entity.getY();
          // 엔트리 좌표(중심 + 로컬 오프셋)를 화면 픽셀로 변환
          const topLeft = entryToScreen(ex + bounds.x, ey - bounds.y); // y는 반전
          const bottomRight = entryToScreen(ex + bounds.x + bounds.width, ey - bounds.y - bounds.height);

          const text = typeof entity.getText === 'function' ? entity.getText() : (entity.text || '');
          const fontSize = (entity.fontSize || 20) * (topLeft.scaleY || 1);

          div.textContent = text;
          div.style.left = topLeft.pixelX + 'px';
          div.style.top = topLeft.pixelY + 'px';
          div.style.width = Math.max(1, bottomRight.pixelX - topLeft.pixelX) + 'px';
          div.style.height = Math.max(1, bottomRight.pixelY - topLeft.pixelY) + 'px';
          div.style.fontSize = fontSize + 'px';
          div.style.lineHeight = fontSize + 'px';
          div.style.fontFamily = entity.fontType || 'sans-serif';
          div.style.display = entity.getVisible && entity.getVisible() === false ? 'none' : 'block';
        } catch (e) {
          // 오브젝트 하나 동기화 실패해도 나머지는 계속되게
        }
      });

      // 삭제된 글상자 오브젝트의 오버레이 정리
      window.__unchartedTextOverlays.forEach((div, id) => {
        if (!seenIds.has(id)) {
          div.remove();
          window.__unchartedTextOverlays.delete(id);
        }
      });
    }

    Entry.block.unofficial_toggleTextSelect = {
      color: '#5D6D7E', outerLine: '#424949', skeleton: 'basic',
      template: '글상자 선택 가능 %1',
      params: [{ type: 'Dropdown', options: [['켜기', 'on'], ['끄기', 'off']], value: 'on' }],
      class: 'uncharted_system', isNotFor: [],
      paramsKeyMap: { STATE: 0 },
      def: { params: ['on'], type: 'unofficial_toggleTextSelect' },
      func: function (sprite, script) {
        const state = script.getStringValue('STATE', script);
        window.__unchartedTextSelectEnabled = state === 'on';
        if (state === 'off') removeAllTextOverlays();
        else syncTextOverlays();
        return script.callReturn();
      },
    };

    // ===================== 오브젝트 레이어 최고 위로 올리기(캔버스 밖 DOM 복제) =====================
    // 원본은 alpha=0으로 숨기되 위치/회전/효과 로직은 그대로 유지하고,
    // 화면에는 매 프레임 원본을 그대로 복제한 <canvas>를 z-index 최상단에 겹쳐 보여준다.
    window.__unchartedTopLayerClones = window.__unchartedTopLayerClones || new Map(); // objId -> {canvas, ctx}

    function removeTopLayerClone(sprite) {
      const id = sprite.__unchartedTopLayerId;
      if (!id) return;
      const rec = window.__unchartedTopLayerClones.get(id);
      if (rec) {
        rec.canvas.remove();
        window.__unchartedTopLayerClones.delete(id);
      }
      if (sprite.object) sprite.object.alpha = sprite.__unchartedOrigAlpha != null ? sprite.__unchartedOrigAlpha : 1;
      sprite.__unchartedTopLayer = false;
      if (Entry.stage && Entry.stage.update) Entry.stage.update();
    }

    function syncTopLayerClones() {
      window.__unchartedTopLayerClones.forEach((rec, id) => {
        const sprite = rec.sprite;
        if (!sprite || !sprite.object) return;
        const img = sprite.object.image;
        if (!img || !img.width) { rec.canvas.style.display = 'none'; return; }

        const scaleXY = entryToScreen(0, 0); // 화면 스케일만 필요
        const screenScaleX = scaleXY.scaleX;
        const screenScaleY = scaleXY.scaleY;

        const objScaleX = typeof sprite.getScaleX === 'function' ? sprite.getScaleX() : (sprite.object.scaleX || 1);
        const objScaleY = typeof sprite.getScaleY === 'function' ? sprite.getScaleY() : (sprite.object.scaleY || 1);

        // 실제 화면에 그려지는 크기는 img.width/height가 아니라 getBounds()(스케일 미반영, 로컬 좌표)를 기준으로 계산
        let boundsW = img.width, boundsH = img.height;
        if (typeof sprite.object.getBounds === 'function') {
          const b = sprite.object.getBounds();
          if (b && b.width > 0 && b.height > 0) { boundsW = b.width; boundsH = b.height; }
        }

        const drawW = boundsW * objScaleX;
        const drawH = boundsH * objScaleY;
        const pixelW = drawW * screenScaleX;
        const pixelH = drawH * screenScaleY;

        const center = entryToScreen(sprite.getX(), sprite.getY());
        const rotationDeg = sprite.object.rotation || 0;

        // 캔버스 내부 해상도는 이미지 원본 그대로, CSS 크기만 계산된 표시 크기로 맞춤(비율 왜곡 없이 축소/확대)
        rec.canvas.width = Math.max(1, Math.round(img.width));
        rec.canvas.height = Math.max(1, Math.round(img.height));
        rec.ctx.clearRect(0, 0, rec.canvas.width, rec.canvas.height);
        try {
          rec.ctx.drawImage(img, 0, 0);
        } catch (e) { /* 이미지가 아직 준비 안 됐을 수 있음 */ }

        rec.canvas.style.display = (sprite.getVisible && sprite.getVisible() === false) ? 'none' : 'block';
        rec.canvas.style.left = (center.pixelX - pixelW / 2) + 'px';
        rec.canvas.style.top = (center.pixelY - pixelH / 2) + 'px';
        rec.canvas.style.width = pixelW + 'px';
        rec.canvas.style.height = pixelH + 'px';
        rec.canvas.style.transform = 'rotate(' + rotationDeg + 'deg)';
      });
    }

    Entry.block.unofficial_toggleTopLayer = {
      color: '#8E44AD', outerLine: '#6C3483', skeleton: 'basic',
      template: '오브젝트 레이어 최고 위로 %1',
      params: [{ type: 'Dropdown', options: [['올리기', 'on'], ['내리기', 'off']], value: 'on' }],
      class: 'uncharted_system', isNotFor: [],
      paramsKeyMap: { STATE: 0 },
      def: { params: ['on'], type: 'unofficial_toggleTopLayer' },
      func: function (sprite, script) {
        const state = script.getStringValue('STATE', script);

        if (state === 'on') {
          if (!sprite.__unchartedTopLayer) {
            const id = sprite.__unchartedTopLayerId || ('toplayer_' + Date.now() + Math.random().toString(36).slice(2, 6));
            sprite.__unchartedTopLayerId = id;
            const canvas = document.createElement('canvas');
            canvas.style.position = 'fixed';
            canvas.style.zIndex = 9997;
            canvas.style.pointerEvents = 'none';
            canvas.style.transformOrigin = 'center center';
            document.body.appendChild(canvas);
            window.__unchartedTopLayerClones.set(id, { canvas, ctx: canvas.getContext('2d'), sprite });

            sprite.__unchartedOrigAlpha = sprite.object.alpha != null ? sprite.object.alpha : 1;
            sprite.object.alpha = 0; // 원본은 숨기되 로직(위치/이동/효과)은 그대로 유지
            sprite.__unchartedTopLayer = true;
            if (Entry.stage && Entry.stage.update) Entry.stage.update();
          }
        } else {
          removeTopLayerClone(sprite);
        }

        return script.callReturn();
      },
    };

    // ===================== 물리엔진 =====================
    Entry.block.unofficial_addPhysics = {
      color: '#C0392B', outerLine: '#922B21', skeleton: 'basic',
      template: '자신에게 물리엔진 부여하기',
      params: [], class: 'uncharted_physics', isNotFor: [],
      paramsKeyMap: {},
      def: { params: [], type: 'unofficial_addPhysics' },
      func: function (sprite, script) {
        createPhysicsBodyForSprite(sprite, false);
        return script.callReturn();
      },
    };

    Entry.block.unofficial_setFloating = {
      color: '#C0392B', outerLine: '#922B21', skeleton: 'basic',
      template: '자신을 떠있는 물체로 설정하기',
      params: [], class: 'uncharted_physics', isNotFor: [],
      paramsKeyMap: {},
      def: { params: [], type: 'unofficial_setFloating' },
      func: function (sprite, script) {
        createPhysicsBodyForSprite(sprite, true); // static: 중력 무시, 다른 오브젝트의 바닥/발판 역할
        return script.callReturn();
      },
    };

    Entry.block.unofficial_setPhysicsProperty = {
      color: '#C0392B', outerLine: '#922B21', skeleton: 'basic',
      template: '자신의 %1 을(를) %2 (으)로 설정하기',
      params: [
        { type: 'Dropdown', options: [['탄성력', 'restitution'], ['회전 가능 여부', 'rotatable']], value: 'restitution' },
        { type: 'Block', accept: 'string' },
      ],
      class: 'uncharted_physics', isNotFor: [],
      paramsKeyMap: { PROP: 0, VALUE: 1 },
      def: { params: ['restitution', { type: 'number', params: ['0.5'], statements: [] }], type: 'unofficial_setPhysicsProperty' },
      func: function (sprite, script) {
        const prop = script.getStringValue('PROP', script);
        const physics = window.__unchartedPhysics;
        const rec = physics && physics.bodies.get(sprite.__unchartedObjId);
        if (!rec) throw new Error('먼저 "물리엔진 부여하기" 또는 "떠있는 물체로 설정하기"를 실행하세요.');

        if (prop === 'restitution') {
          const value = script.getNumberValue('VALUE', script);
          rec.body.restitution = value;
        } else {
          // 회전 가능 여부: 참/거짓 문자열 또는 판단 블록 결과를 받는다
          const raw = script.getStringValue('VALUE', script);
          const rotatable = !(raw === 'false' || raw === '0' || raw === '');
          if (rotatable) {
            if (sprite.__unchartedFixedRotation && rec.__unchartedOrigInertia != null) {
              Matter.Body.setInertia(rec.body, rec.__unchartedOrigInertia);
            }
            sprite.__unchartedFixedRotation = false;
          } else {
            if (!sprite.__unchartedFixedRotation) {
              rec.__unchartedOrigInertia = rec.body.inertia; // 나중에 복원할 수 있도록 저장
            }
            Matter.Body.setInertia(rec.body, Infinity);
            Matter.Body.setAngularVelocity(rec.body, 0);
            sprite.__unchartedFixedRotation = true;
          }
        }
        return script.callReturn();
      },
    };

    Entry.block.unofficial_getRestitution = {
      color: '#C0392B', outerLine: '#922B21', skeleton: 'basic_string_field',
      template: '%1 의 탄성력 값',
      params: [{ type: 'DropdownDynamic', value: null, menuName: 'allSprites', fontSize: 11 }],
      class: 'uncharted_physics', isNotFor: [],
      paramsKeyMap: { TARGET: 0 },
      def: { params: [null], type: 'unofficial_getRestitution' },
      func: function (sprite, script) {
        const targetId = script.getStringValue('TARGET', script);
        const targetObj = getAllObjs().find((o) => o.id === targetId);
        const physics = window.__unchartedPhysics;
        if (!targetObj || !physics) return 0;
        const rec = physics.bodies.get(targetObj.entity.__unchartedObjId);
        return rec ? rec.body.restitution : 0;
      },
    };

    Entry.block.unofficial_setCollidable = {
      color: '#C0392B', outerLine: '#922B21', skeleton: 'basic',
      template: '자신의 접촉 가능여부 %1 (으)로 설정',
      params: [{ type: 'Dropdown', options: [['가능하게', 'on'], ['불가능하게', 'off']], value: 'on' }],
      class: 'uncharted_physics', isNotFor: [],
      paramsKeyMap: { STATE: 0 },
      def: { params: ['on'], type: 'unofficial_setCollidable' },
      func: function (sprite, script) {
        const state = script.getStringValue('STATE', script);
        const physics = window.__unchartedPhysics;
        const rec = physics && physics.bodies.get(sprite.__unchartedObjId);
        if (!rec) throw new Error('먼저 "물리엔진 부여하기" 또는 "떠있는 물체로 설정하기"를 실행하세요.');
        rec.body.isSensor = state === 'off'; // 센서 모드: 충돌 감지는 유지되나 물리적으로 막지 않음(유령 모드)
        return script.callReturn();
      },
    };

    Entry.block.unofficial_cameraFollow = {
      color: '#C0392B', outerLine: '#922B21', skeleton: 'basic',
      template: '카메라를 %1 에 고정하기',
      params: [{ type: 'DropdownDynamic', value: null, menuName: 'allSprites', fontSize: 11 }],
      class: 'uncharted_physics', isNotFor: [],
      paramsKeyMap: { TARGET: 0 },
      def: { params: [null], type: 'unofficial_cameraFollow' },
      func: function (sprite, script) {
        const targetId = script.getStringValue('TARGET', script);
        const targetObj = getAllObjs().find((o) => o.id === targetId);
        if (!targetObj) throw new Error('대상 오브젝트를 찾을 수 없습니다.');
        const physics = ensurePhysicsWorld();
        physics.cameraTargetId = targetObj.entity.__unchartedObjId || null;
        if (!physics.cameraTargetId) throw new Error('카메라 고정 대상은 먼저 물리엔진이 부여되어 있어야 합니다.');
        return script.callReturn();
      },
    };

    // x/y 방향으로 힘 가하기: Matter.js의 힘 단위는 질량 기반으로 매우 작아서(보통 0.001 단위),
    // 사용자가 체감 가능한 숫자(예: 10, 50)를 입력하면 알맞은 스케일로 변환해서 적용한다.
    Entry.block.unofficial_applyForce = {
      color: '#C0392B', outerLine: '#922B21', skeleton: 'basic',
      template: 'x %1 y %2 방향으로 %3 만큼의 힘을 보내기',
      params: [
        { type: 'Block', accept: 'string' },
        { type: 'Block', accept: 'string' },
        { type: 'Block', accept: 'string' },
      ],
      class: 'uncharted_physics', isNotFor: [],
      paramsKeyMap: { FX: 0, FY: 1, POWER: 2 },
      def: {
        params: [
          { type: 'number', params: ['0'], statements: [] },
          { type: 'number', params: ['1'], statements: [] },
          { type: 'number', params: ['5'], statements: [] },
        ],
        type: 'unofficial_applyForce',
      },
      func: function (sprite, script) {
        const fx = script.getNumberValue('FX', script);
        const fy = script.getNumberValue('FY', script);
        const power = script.getNumberValue('POWER', script);

        const physics = window.__unchartedPhysics;
        const rec = physics && physics.bodies.get(sprite.__unchartedObjId);
        if (!rec) throw new Error('먼저 "물리엔진 부여하기" 또는 "떠있는 물체로 설정하기"를 실행하세요.');

        const len = Math.sqrt(fx * fx + fy * fy) || 1;
        const scale = 0.001; // Matter.js 체감 스케일 보정
        const forceX = (fx / len) * power * scale;
        const forceY = -(fy / len) * power * scale; // 엔트리 y(위가 +)를 Matter 좌표계(아래가 +)로 반전

        Matter.Body.applyForce(rec.body, rec.body.position, { x: forceX, y: forceY });
        return script.callReturn();
      },
    };

    // ===================== 3D 오브젝트 렌더링 (Three.js) =====================
    Entry.block.unofficial_joinListAsText = {
      color: '#1ABC9C', outerLine: '#148F77', skeleton: 'basic_string_field',
      template: '%1 리스트의 모든 값을 줄바꿈으로 합치기',
      params: [{ type: 'DropdownDynamic', value: null, menuName: 'lists', fontSize: 10 }],
      class: 'uncharted_3d', isNotFor: [],
      paramsKeyMap: { LIST: 0 },
      def: { params: [null], type: 'unofficial_joinListAsText' },
      func: function (sprite, script) {
        const listId = script.getStringValue('LIST', script);
        const listObj = (Entry.variableContainer.lists_ || []).find((l) => l.id_ === listId || l.name_ === listId);
        if (!listObj) throw new Error('리스트를 찾을 수 없습니다.');

        const items = typeof listObj.getArray === 'function' ? listObj.getArray() : (listObj.array_ || []);
        return items.map((item) => item.data).join('\n');
      },
    };

    Entry.block.unofficial_loadObjModel = {
      color: '#1ABC9C', outerLine: '#148F77', skeleton: 'basic',
      template: '%1 코드를 obj 모양으로 인식하기',
      params: [{ type: 'Block', accept: 'string' }],
      class: 'uncharted_3d', isNotFor: [],
      paramsKeyMap: { OBJCODE: 0 },
      def: { params: [{ type: 'text', params: ['# obj 코드를 여기에 붙여넣으세요'], statements: [] }], type: 'unofficial_loadObjModel' },
      func: function (sprite, script) {
        const objCode = script.getStringValue('OBJCODE', script);
        if (typeof THREE === 'undefined') throw new Error('3D 렌더링 라이브러리(Three.js)를 불러오지 못했습니다.');

        const rec = ensure3DObject(sprite);
        const geometry = parseObjToGeometry(objCode);

        if (rec.mesh) {
          rec.scene.remove(rec.mesh);
          rec.mesh.geometry.dispose();
          if (rec.mesh.material) rec.mesh.material.dispose();
        }

        const material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        rec.mesh = new THREE.Mesh(geometry, material);
        rec.scene.add(rec.mesh);

        // 지오메트리 크기에 맞춰 카메라 프레이밍(대략적으로 잘 보이도록 바운딩 스피어 기준 배치)
        geometry.computeBoundingSphere();
        const radius = (geometry.boundingSphere && geometry.boundingSphere.radius) || 1;
        rec.camera.position.set(0, 0, radius * 2.5);
        rec.camera.lookAt(0, 0, 0);

        apply3DTexture(rec); // 현재 모양 이미지를 텍스처로 적용
        return script.callReturn();
      },
    };

    Entry.block.unofficial_refreshTexture = {
      color: '#1ABC9C', outerLine: '#148F77', skeleton: 'basic',
      template: '자신의 모양을 3D 텍스처로 다시 입히기',
      params: [], class: 'uncharted_3d', isNotFor: [],
      paramsKeyMap: {},
      def: { params: [], type: 'unofficial_refreshTexture' },
      func: function (sprite, script) {
        const rec = window.__uncharted3D.get(sprite.__uncharted3DObjId);
        if (!rec) throw new Error('먼저 "obj 모양으로 인식하기"를 실행하세요.');
        apply3DTexture(rec);
        return script.callReturn();
      },
    };

    Entry.block.unofficial_set3DTransform = {
      color: '#1ABC9C', outerLine: '#148F77', skeleton: 'basic',
      template: '3D (회전x %1 회전y %2 회전z %3 z축위치 %4 크기 %5) 로 설정하기',
      params: [
        { type: 'Block', accept: 'string' },
        { type: 'Block', accept: 'string' },
        { type: 'Block', accept: 'string' },
        { type: 'Block', accept: 'string' },
        { type: 'Block', accept: 'string' },
      ],
      class: 'uncharted_3d', isNotFor: [],
      paramsKeyMap: { RX: 0, RY: 1, RZ: 2, PZ: 3, SCALE: 4 },
      def: {
        params: [
          { type: 'number', params: ['0'], statements: [] },
          { type: 'number', params: ['0'], statements: [] },
          { type: 'number', params: ['0'], statements: [] },
          { type: 'number', params: ['0'], statements: [] },
          { type: 'number', params: ['1'], statements: [] },
        ],
        type: 'unofficial_set3DTransform',
      },
      func: function (sprite, script) {
        const rec = window.__uncharted3D.get(sprite.__uncharted3DObjId);
        if (!rec) throw new Error('먼저 "obj 모양으로 인식하기"를 실행하세요.');
        rec.rotX = script.getNumberValue('RX', script);
        rec.rotY = script.getNumberValue('RY', script);
        rec.rotZ = script.getNumberValue('RZ', script);
        rec.posZ = script.getNumberValue('PZ', script);
        rec.scale = script.getNumberValue('SCALE', script) || 1;
        return script.callReturn();
      },
    };

    Entry.block.unofficial_remove3D = {
      color: '#1ABC9C', outerLine: '#148F77', skeleton: 'basic',
      template: '3D 렌더링 해제하기 (2D 모양으로 되돌리기)',
      params: [], class: 'uncharted_3d', isNotFor: [],
      paramsKeyMap: {},
      def: { params: [], type: 'unofficial_remove3D' },
      func: function (sprite, script) {
        remove3DObject(sprite);
        return script.callReturn();
      },
    };

    // ===================== 이름 기반 초시계 =====================
    Entry.block.unofficial_createStopwatch = {
      color: '#F39C12', outerLine: '#B9770E', skeleton: 'basic',
      template: '초시계 이름: %1 (으)로 초시계 생성하기',
      params: [{ type: 'Block', accept: 'string' }],
      class: 'uncharted_time', isNotFor: [],
      paramsKeyMap: { NAME: 0 },
      def: { params: [{ type: 'text', params: ['타이머1'], statements: [] }], type: 'unofficial_createStopwatch' },
      func: function (sprite, script) {
        const name = script.getStringValue('NAME', script);
        if (!name) throw new Error('초시계 이름을 입력하세요.');
        if (!window.__unchartedStopwatches.has(name)) {
          window.__unchartedStopwatches.set(name, { running: false, startedAt: 0, elapsedBeforeStart: 0 });
        }
        return script.callReturn();
      },
    };

    Entry.block.unofficial_getStopwatchValue = {
      color: '#F39C12', outerLine: '#B9770E', skeleton: 'basic_string_field',
      template: '초시계 %1 값',
      params: [{ type: 'Block', accept: 'string' }],
      class: 'uncharted_time', isNotFor: [],
      paramsKeyMap: { NAME: 0 },
      def: { params: [{ type: 'text', params: ['타이머1'], statements: [] }], type: 'unofficial_getStopwatchValue' },
      func: function (sprite, script) {
        const name = script.getStringValue('NAME', script);
        return Math.round(getStopwatchValue(name) * 100) / 100; // 소수점 둘째 자리까지
      },
    };

    Entry.block.unofficial_controlStopwatch = {
      color: '#F39C12', outerLine: '#B9770E', skeleton: 'basic',
      template: '초시계 %1 (을)를 %2',
      params: [
        { type: 'Block', accept: 'string' },
        { type: 'Dropdown', options: [['시작하기', 'start'], ['멈추기', 'stop'], ['초기화', 'reset']], value: 'start' },
      ],
      class: 'uncharted_time', isNotFor: [],
      paramsKeyMap: { NAME: 0, ACTION: 1 },
      def: { params: [{ type: 'text', params: ['타이머1'], statements: [] }, 'start'], type: 'unofficial_controlStopwatch' },
      func: function (sprite, script) {
        const name = script.getStringValue('NAME', script);
        const action = script.getStringValue('ACTION', script);
        let sw = window.__unchartedStopwatches.get(name);
        if (!sw) {
          sw = { running: false, startedAt: 0, elapsedBeforeStart: 0 };
          window.__unchartedStopwatches.set(name, sw);
        }

        if (action === 'start') {
          if (!sw.running) {
            sw.running = true;
            sw.startedAt = Date.now();
          }
        } else if (action === 'stop') {
          if (sw.running) {
            sw.elapsedBeforeStart += (Date.now() - sw.startedAt) / 1000;
            sw.running = false;
          }
        } else if (action === 'reset') {
          sw.running = false;
          sw.startedAt = 0;
          sw.elapsedBeforeStart = 0;
        }

        return script.callReturn();
      },
    };

    // ===================== 스프라이트 애니메이션 =====================
    // sprite.__unchartedAnim = { frames: [pictureName,...], fps, loop, frameIndex, lastTickAt }
    Entry.block.unofficial_playAnimation = {
      color: '#9B59B6', outerLine: '#76448A', skeleton: 'basic',
      template: '%1 의 모양 순서로 %2 fps 속도로 애니메이션 재생하기',
      params: [
        { type: 'DropdownDynamic', value: null, menuName: 'lists', fontSize: 10 },
        { type: 'Block', accept: 'string' },
      ],
      class: 'uncharted_anim', isNotFor: [],
      paramsKeyMap: { LIST: 0, FPS: 1 },
      def: { params: [null, { type: 'number', params: ['8'], statements: [] }], type: 'unofficial_playAnimation' },
      func: function (sprite, script) {
        const listId = script.getStringValue('LIST', script);
        const fps = Math.max(1, script.getNumberValue('FPS', script) || 8);

        const listObj = (Entry.variableContainer.lists_ || []).find((l) => l.id_ === listId || l.name_ === listId);
        if (!listObj) throw new Error('리스트를 찾을 수 없습니다.');
        const items = typeof listObj.getArray === 'function' ? listObj.getArray() : (listObj.array_ || []);
        const frames = items.map((item) => item.data).filter((v) => v !== '' && v != null);
        if (frames.length === 0) throw new Error('리스트에 모양 이름이 하나도 없습니다.');

        sprite.__unchartedAnim = {
          frames, fps, loop: sprite.__unchartedAnim ? sprite.__unchartedAnim.loop : true,
          frameIndex: 0, lastTickAt: Date.now(), playing: true,
        };
        return script.callReturn();
      },
    };

    Entry.block.unofficial_stopAnimation = {
      color: '#9B59B6', outerLine: '#76448A', skeleton: 'basic',
      template: '애니메이션 정지하기',
      params: [], class: 'uncharted_anim', isNotFor: [],
      paramsKeyMap: {},
      def: { params: [], type: 'unofficial_stopAnimation' },
      func: function (sprite, script) {
        if (sprite.__unchartedAnim) sprite.__unchartedAnim.playing = false;
        return script.callReturn();
      },
    };

    Entry.block.unofficial_setAnimationLoop = {
      color: '#9B59B6', outerLine: '#76448A', skeleton: 'basic',
      template: '애니메이션 반복 %1',
      params: [{ type: 'Dropdown', options: [['켜기', 'on'], ['끄기', 'off']], value: 'on' }],
      class: 'uncharted_anim', isNotFor: [],
      paramsKeyMap: { STATE: 0 },
      def: { params: ['on'], type: 'unofficial_setAnimationLoop' },
      func: function (sprite, script) {
        const state = script.getStringValue('STATE', script);
        if (!sprite.__unchartedAnim) sprite.__unchartedAnim = { frames: [], fps: 8, frameIndex: 0, lastTickAt: Date.now(), playing: false };
        sprite.__unchartedAnim.loop = state === 'on';
        return script.callReturn();
      },
    };

    function tickAnimation(sprite) {
      const anim = sprite.__unchartedAnim;
      if (!anim || !anim.playing || anim.frames.length === 0) return;

      const now = Date.now();
      const frameDuration = 1000 / anim.fps;
      if (now - anim.lastTickAt < frameDuration) return;

      anim.lastTickAt = now;
      anim.frameIndex++;

      if (anim.frameIndex >= anim.frames.length) {
        if (anim.loop) {
          anim.frameIndex = 0;
        } else {
          anim.frameIndex = anim.frames.length - 1;
          anim.playing = false;
        }
      }

      const selfObj = getAllObjs().find((o) => o.entity === sprite);
      if (!selfObj) return;
      const pictureName = anim.frames[anim.frameIndex];
      try {
        const picture = selfObj.getPicture ? selfObj.getPicture(pictureName) : null;
        if (picture) sprite.setImage(picture);
      } catch (e) {
        console.warn('[애니메이션] 모양 전환 실패:', pictureName, e.message);
      }
    }

    // ===================== 픽셀아트 최적화 =====================
    Entry.block.unofficial_setPixelArtMode = {
      color: '#E67E22', outerLine: '#B9600C', skeleton: 'basic',
      template: '자신을 픽셀아트 최적화 상태로 %1',
      params: [{ type: 'Dropdown', options: [['켜기', 'on'], ['끄기', 'off']], value: 'on' }],
      class: 'uncharted_anim', isNotFor: [],
      paramsKeyMap: { STATE: 0 },
      def: { params: ['on'], type: 'unofficial_setPixelArtMode' },
      func: function (sprite, script) {
        const state = script.getStringValue('STATE', script);
        sprite.__unchartedPixelArt = state === 'on';

        // 엔트리 메인 캔버스 전체 렌더링 컨텍스트의 이미지 스무딩을 끔(전역 설정이라
        // 개별 오브젝트 단위 제어는 createjs 컨텍스트 특성상 어려움 — 캔버스 전체에 적용됨)
        const canvas = document.getElementById('entryCanvas');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.imageSmoothingEnabled = !state || state !== 'on' ? true : false;
        }
        // createjs Stage 자체의 스무딩 설정도 있다면 함께 끈다(있을 때만)
        try {
          if (Entry.stage && Entry.stage.canvas) {
            const stageCtx = Entry.stage.canvas.getContext && Entry.stage.canvas.getContext('2d');
            if (stageCtx) stageCtx.imageSmoothingEnabled = state !== 'on';
          }
        } catch (e) { /* 무시 */ }

        return script.callReturn();
      },
    };

    // ===================== 파티클 시스템 =====================
    const PARTICLE_SHAPE_OPTIONS = [['동그라미', 'circle'], ['네모', 'square'], ['별', 'star']];
    const PARTICLE_COLOR_MODE_OPTIONS = [
      ['주황 불꽃', '#FFA500'], ['빨강', '#FF4136'], ['하양(눈)', '#FFFFFF'],
      ['회색(연기)', '#AAAAAA'], ['하늘색', '#39CCCC'], ['노랑', '#FFDC00'],
      ['초록', '#2ECC40'], ['분홍', '#F012BE'],
    ];

    Entry.block.unofficial_particleBurst = {
      color: '#E91E63', outerLine: '#AD1457', skeleton: 'basic',
      template: '지금 위치에서 파티클 %1 개 %2 모양 %3 색으로 터뜨리기 (지속시간 %4 초)',
      params: [
        { type: 'Block', accept: 'string' },
        { type: 'Dropdown', options: PARTICLE_SHAPE_OPTIONS, value: 'circle' },
        { type: 'Dropdown', options: PARTICLE_COLOR_MODE_OPTIONS, value: '#FFA500' },
        { type: 'Block', accept: 'string' },
      ],
      class: 'uncharted_particle', isNotFor: [],
      paramsKeyMap: { COUNT: 0, SHAPE: 1, COLOR: 2, LIFE: 3 },
      def: {
        params: [
          { type: 'number', params: ['20'], statements: [] },
          'circle',
          '#FFA500',
          { type: 'number', params: ['1'], statements: [] },
        ],
        type: 'unofficial_particleBurst',
      },
      func: function (sprite, script) {
        const count = Math.max(1, Math.min(300, script.getNumberValue('COUNT', script)));
        const shape = script.getStringValue('SHAPE', script);
        const color = script.getStringValue('COLOR', script);
        const life = Math.max(0.1, script.getNumberValue('LIFE', script));
        const pos = getXY(sprite);
        burstParticles(pos.x, pos.y, count, {
          shape, color, lifeSec: life,
          speed: 1.5 + Math.random() * 2.5,
          gravity: 0.3,
        });
        return script.callReturn();
      },
    };

    Entry.block.unofficial_particleEmitToggle = {
      color: '#E91E63', outerLine: '#AD1457', skeleton: 'basic',
      template: '나를 따라다니는 파티클 발생을 %1 (모양 %2 색 %3 초당 %4 개)',
      params: [
        { type: 'Dropdown', options: [['켜기', 'on'], ['끄기', 'off']], value: 'on' },
        { type: 'Dropdown', options: PARTICLE_SHAPE_OPTIONS, value: 'circle' },
        { type: 'Dropdown', options: PARTICLE_COLOR_MODE_OPTIONS, value: '#AAAAAA' },
        { type: 'Block', accept: 'string' },
      ],
      class: 'uncharted_particle', isNotFor: [],
      paramsKeyMap: { STATE: 0, SHAPE: 1, COLOR: 2, RATE: 3 },
      def: {
        params: [
          'on',
          'circle',
          '#AAAAAA',
          { type: 'number', params: ['10'], statements: [] },
        ],
        type: 'unofficial_particleEmitToggle',
      },
      func: function (sprite, script) {
        const state = script.getStringValue('STATE', script);
        const shape = script.getStringValue('SHAPE', script);
        const color = script.getStringValue('COLOR', script);
        const rate = Math.max(1, Math.min(60, script.getNumberValue('RATE', script)));

        if (state === 'on') {
          window.__unchartedParticles.emitters.set(sprite, {
            on: true,
            rate,
            lastEmitAt: 0,
            opts: { shape, color, lifeSec: 1, speed: 0.3 + Math.random() * 0.5, gravity: -0.05 },
          });
        } else {
          window.__unchartedParticles.emitters.delete(sprite);
        }
        return script.callReturn();
      },
    };

    Entry.block.unofficial_particleClearAll = {
      color: '#E91E63', outerLine: '#AD1457', skeleton: 'basic',
      template: '모든 파티클 지우기',
      params: [],
      class: 'uncharted_particle', isNotFor: [],
      paramsKeyMap: {},
      def: { params: [], type: 'unofficial_particleClearAll' },
      func: function (sprite, script) {
        clearAllParticles();
        return script.callReturn();
      },
    };

    Entry.block.unofficial_particleFromCode = {
      color: '#E91E63', outerLine: '#AD1457', skeleton: 'basic',
      template: '%1 코드를 바탕으로 파티클 생성하기',
      params: [{ type: 'Block', accept: 'string' }],
      class: 'uncharted_particle', isNotFor: [],
      paramsKeyMap: { CODE: 0 },
      def: {
        params: [{ type: 'text', params: ['{"count":20,"shape":"circle","startColor":"#FFA500","endColor":"#FF0000","life":1,"minSpeed":1,"maxSpeed":3,"minAngle":60,"maxAngle":120,"gravity":0.3,"spawnRadius":0,"minSpin":-0.1,"maxSpin":0.1,"bounce":0}'], statements: [] }],
        type: 'unofficial_particleFromCode',
      },
      func: function (sprite, script) {
        const code = script.getStringValue('CODE', script);
        let cfg;
        try {
          cfg = JSON.parse(code);
        } catch (e) {
          throw new Error('파티클 코드가 올바른 JSON 형식이 아닙니다: ' + e.message);
        }
        if (!cfg || typeof cfg !== 'object') {
          throw new Error('파티클 코드는 { } 형태의 JSON 객체여야 합니다.');
        }

        const count = Math.max(1, Math.min(300, Number(cfg.count) || 20));
        const pos = getXY(sprite);
        burstParticles(pos.x, pos.y, count, {
          shape: cfg.shape || 'circle',
          color: cfg.color,
          startColor: cfg.startColor || cfg.color || '#FFA500',
          endColor: cfg.endColor || cfg.startColor || cfg.color || '#FFA500',
          size: cfg.size,
          startSize: cfg.startSize,
          endSize: cfg.endSize,
          lifeSec: cfg.life != null ? Number(cfg.life) : 1,
          angle: cfg.angle != null ? Number(cfg.angle) * Math.PI / 180 : undefined,
          minAngleDeg: cfg.minAngle != null ? Number(cfg.minAngle) : undefined,
          maxAngleDeg: cfg.maxAngle != null ? Number(cfg.maxAngle) : undefined,
          speed: cfg.speed != null ? Number(cfg.speed) : undefined,
          minSpeed: cfg.minSpeed != null ? Number(cfg.minSpeed) : undefined,
          maxSpeed: cfg.maxSpeed != null ? Number(cfg.maxSpeed) : undefined,
          gravity: cfg.gravity != null ? Number(cfg.gravity) : 0,
          spin: cfg.spin != null ? Number(cfg.spin) : undefined,
          minSpin: cfg.minSpin != null ? Number(cfg.minSpin) : undefined,
          maxSpin: cfg.maxSpin != null ? Number(cfg.maxSpin) : undefined,
          spawnRadius: cfg.spawnRadius != null ? Number(cfg.spawnRadius) : undefined,
          bounce: cfg.bounce != null ? Number(cfg.bounce) : undefined,
          floorY: cfg.floorY != null ? Number(cfg.floorY) : undefined,
          fade: cfg.fade !== false,
        });
        return script.callReturn();
      },
    };

    // ===================== 마우스 커서 커스터마이징 =====================
    Entry.block.unofficial_setMouseCursor = {
      color: '#34495E', outerLine: '#212F3C', skeleton: 'basic',
      template: '마우스 커서를 자신의 (%1) 모양으로 정하기 - 적용 범위: %2',
      params: [
        { type: 'DropdownDynamic', menuName: 'pictures', value: null, fontSize: 11 },
        { type: 'Dropdown', options: [['엔트리 캔버스 위에서만', 'canvas'], ['페이지 전체', 'page']], value: 'canvas' },
      ],
      class: 'uncharted_cursor', isNotFor: [],
      paramsKeyMap: { PICTURE: 0, SCOPE: 1 },
      def: { params: [null, 'canvas'], type: 'unofficial_setMouseCursor' },
      func: function (sprite, script) {
        const pictureId = script.getStringValue('PICTURE', script);
        const scope = script.getStringValue('SCOPE', script);
        const selfObj = getAllObjs().find((o) => o.entity === sprite);
        if (!selfObj) throw new Error('오브젝트를 찾을 수 없습니다.');

        let picture = null;
        try {
          picture = selfObj.getPicture ? selfObj.getPicture(pictureId) : null;
        } catch (e) { /* 아래에서 처리 */ }
        if (!picture) throw new Error('선택한 모양을 찾을 수 없습니다.');

        const src = picture.fileurl
          ? (picture.fileurl.indexOf('http') === 0 ? picture.fileurl : 'https://playentry.org' + picture.fileurl)
          : ('https://playentry.org/uploads/' + picture.filename.slice(0, 2) + '/' + picture.filename.slice(2, 4) + '/image/' + picture.filename + '.png');

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
          try {
            const dataUrl = imageToCursorDataUrl(img, 32);
            applyCustomCursor(dataUrl, scope);
          } catch (e) {
            console.warn('[마우스 커서]', e.message);
          }
        };
        img.onerror = function () {
          console.warn('[마우스 커서] 이미지를 불러오지 못했습니다:', src);
        };
        img.src = src;

        return script.callReturn();
      },
    };

    Entry.block.unofficial_resetMouseCursor = {
      color: '#34495E', outerLine: '#212F3C', skeleton: 'basic',
      template: '마우스 커서 원래대로 되돌리기',
      params: [],
      class: 'uncharted_cursor', isNotFor: [],
      paramsKeyMap: {},
      def: { params: [], type: 'unofficial_resetMouseCursor' },
      func: function (sprite, script) {
        resetCustomCursor();
        return script.callReturn();
      },
    };

    if (!window.__unchartedTopLayerWatchdog) {
      // stop 이벤트가 안 불리는 경우를 대비해, 엔진이 정지 상태인데 클론이 남아있으면 강제 정리
      // (엔진 상태 API 존재 여부가 불확실하므로, 확인 가능한 경우에만 정리하고 불확실하면 그대로 둔다)
      setInterval(function () {
        if (window.__unchartedTopLayerClones.size === 0) return;
        let running = true; // 알 수 없으면 안전하게 "실행 중"으로 간주해서 지우지 않음
        if (Entry.engine && typeof Entry.engine.isState === 'function') {
          try { running = Entry.engine.isState('run'); } catch (e) { /* 판단 불가, running 유지 */ }
        }
        if (!running) {
          window.__unchartedTopLayerClones.forEach((rec) => {
            if (rec.sprite && rec.sprite.object) {
              rec.sprite.object.alpha = rec.sprite.__unchartedOrigAlpha != null ? rec.sprite.__unchartedOrigAlpha : 1;
            }
            rec.canvas.remove();
          });
          window.__unchartedTopLayerClones.clear();
          if (Entry.stage && Entry.stage.update) Entry.stage.update();
        }
      }, 500);
      window.__unchartedTopLayerWatchdog = true;
    }

    if (!window.__unchartedRenderLoopStarted) {
      (function loop() {
        try {
          Entry.container.getCurrentObjects().forEach((obj) => {
            try {
              const entity = obj.entity;
              if (entity && entity.__unchartedState && hasActiveEffect(entity.__unchartedState)) {
                renderEntity(entity);
              }
              if (entity && entity.__unchartedFillActive && entity.paint) {
                updateDistortFill(entity);
              }
              if (entity && entity.__unchartedAnim && entity.__unchartedAnim.playing) {
                tickAnimation(entity);
              }
            } catch (innerErr) {
              // 오브젝트 하나가 실패해도 다른 오브젝트들은 계속 갱신되게 함
              console.warn('[언차티드 블록] 렌더 중 오류(무시하고 계속):', innerErr.message);
            }
          });
          if (window.__unchartedTextSelectEnabled) syncTextOverlays();
          if (window.__unchartedTopLayerClones.size > 0) syncTopLayerClones();
          if (window.__unchartedPhysics && window.__unchartedPhysics.bodies.size > 0) stepPhysicsWorld();
          if (window.__uncharted3D.size > 0) sync3DObjects();
          if (window.__unchartedParticles && (window.__unchartedParticles.list.length > 0 || window.__unchartedParticles.emitters.size > 0)) stepParticles();
        } catch (outerErr) {
          console.warn('[언차티드 블록] 루프 오류(무시하고 계속):', outerErr.message);
        } finally {
          // 어떤 에러가 나든 루프는 반드시 계속되도록 finally에서 재호출
          requestAnimationFrame(loop);
        }
      })();
      window.__unchartedRenderLoopStarted = true;
    }

    // "왜곡" 모드 붓 채우기: 매 프레임, 지금까지 그려진 경로의 bounding box에
    // 이미지가 맞게 늘어나도록 다시 채운다. 경로 좌표는 우리가 직접 누적 보관해서
    // beginBitmapFill 재호출로 인한 내부 경로 리셋의 영향을 받지 않게 한다.
    function updateDistortFill(sprite) {
      const paint = sprite.paint;
      const img = sprite.__unchartedFillImage;
      if (!paint || !img) return;

      hookEndFillForUnchartedFill(sprite);

      // 지금까지 쌓인 좌표(MoveTo/LineTo)를 읽어 우리 쪽 경로 배열에 누적 반영
      const instructions = paint._activeInstructions || paint.instructions || [];
      const pts = instructions
        .filter((c) => typeof c.x === 'number' && typeof c.y === 'number')
        .map((c) => ({ x: c.x, y: c.y }));

      // 현재 그리고 있는 진행 중 좌표(마지막 위치)도 포함시켜 실시간 반응성을 높인다
      const liveX = sprite.getX();
      const liveY = -1 * sprite.getY();
      if (pts.length === 0 || pts[pts.length - 1].x !== liveX || pts[pts.length - 1].y !== liveY) {
        pts.push({ x: liveX, y: liveY });
      }

      if (pts.length < 2) return; // 점이 하나뿐이면 아직 도형이 아님

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      pts.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });

      const boxW = Math.max(1, maxX - minX);
      const boxH = Math.max(1, maxY - minY);
      const scaleX = boxW / img.width;
      const scaleY = boxH / img.height;
      // Matrix2D(a, b, c, d, tx, ty): 이미지 로컬좌표(0..width, 0..height)를 bbox로 매핑
      const matrix = new createjs.Matrix2D(scaleX, 0, 0, scaleY, minX, minY);

      paint.beginBitmapFill(img, 'no-repeat', matrix);
      paint.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        paint.lineTo(pts[i].x, pts[i].y);
      }
      if (Entry.stage && Entry.stage.update) Entry.stage.update();
    }

    /* --- 콘솔에 입력하기 --- */
    Entry.block.unofficial_consoleLog = {
      color: '#95A5A6', outerLine: '#7f8c8d', skeleton: 'basic',
      template: '콘솔에 %1 입력하기',
      params: [{ type: 'Block', accept: 'string' }],
      class: 'uncharted_debug', isNotFor: [],
      paramsKeyMap: { VALUE: 0 },
      def: { params: [{ type: 'text', params: ['안녕하세요'], statements: [] }], type: 'unofficial_consoleLog' },
      func: function (sprite, script) {
        const value = script.getStringValue('VALUE', script);
        console.log('%c[엔트리 콘솔 출력]', 'color:#f1c40f;font-weight:bold;', value);
        return script.callReturn();
      },
    };

    /* --- 비공식 블록 패키지 라이브러리 시스템 --- */
    window.__unchartedLibrary = window.__unchartedLibrary || {};

    // 예시 패키지: 시간 블록 (라이브러리 동작 확인용 샘플)
    if (!window.__unchartedLibrary['time']) {
      window.__unchartedLibrary['time'] = {
        label: '시간 블록',
        defineBlocks: function () {
          if (Entry.block.unofficial_getTimestamp) return;
          Entry.block.unofficial_getTimestamp = {
            color: '#16A085', outerLine: '#117A65', skeleton: 'basic_string_field',
            template: '현재 시간(초)',
            params: [], class: 'uncharted_time', isNotFor: [],
            def: { params: [], type: 'unofficial_getTimestamp' },
            func: function () { return Math.floor(Date.now() / 1000); },
          };
        },
        palette: [['calc', 'unofficial_getTimestamp']],
      };
    }

    // 레거시 안전 도구: 커뮤니티에서 공유되던 "스페셜블록" 계열 중
    // eval() / 자동 게시글 업로드 등 위험 요소를 전부 제거하고
    // 같은 기능을 안전한 방식으로 재구현한 패키지
    if (!window.__unchartedLibrary['legacySafe']) {
      window.__unchartedLibrary['legacySafe'] = {
        label: '레거시 안전 도구',
        defineBlocks: function () {
          if (Entry.block.unofficial_getBrowserInfo) return;

          Entry.block.unofficial_getBrowserInfo = {
            color: '#607D8B', outerLine: '#455A64', skeleton: 'basic_string_field',
            template: '컴퓨터 정보(브라우저)',
            params: [], class: 'uncharted_legacy', isNotFor: [],
            def: { params: [], type: 'unofficial_getBrowserInfo' },
            func: function () { return navigator.userAgent; },
          };

          Entry.block.unofficial_isDesktopOS = {
            color: '#607D8B', outerLine: '#455A64', skeleton: 'basic_boolean_field',
            template: '데스크탑(PC) 환경인가?',
            params: [], class: 'uncharted_legacy', isNotFor: [],
            def: { params: [], type: 'unofficial_isDesktopOS' },
            func: function () {
              const ua = navigator.userAgent.toLowerCase();
              return ['win', 'mac', 'linux', 'x11'].some((k) => ua.includes(k)) && !/mobile|android|iphone|ipad/.test(ua);
            },
          };

          Entry.block.unofficial_showAlert = {
            color: '#795548', outerLine: '#5D4037', skeleton: 'basic',
            template: '%1 내용으로 알림창 띄우기',
            params: [{ type: 'Block', accept: 'string' }],
            class: 'uncharted_legacy', isNotFor: [],
            paramsKeyMap: { VALUE: 0 },
            def: { params: [{ type: 'text', params: ['안녕하세요'], statements: [] }], type: 'unofficial_showAlert' },
            func: function (sprite, script) {
              window.alert(script.getStringValue('VALUE', script));
              return script.callReturn();
            },
          };

          Entry.block.unofficial_showConfirm = {
            color: '#795548', outerLine: '#5D4037', skeleton: 'basic_boolean_field',
            template: '%1 내용으로 확인창(예/아니오) 띄우기',
            params: [{ type: 'Block', accept: 'string' }],
            class: 'uncharted_legacy', isNotFor: [],
            paramsKeyMap: { VALUE: 0 },
            def: { params: [{ type: 'text', params: ['계속할까요?'], statements: [] }] },
            func: function (sprite, script) {
              return window.confirm(script.getStringValue('VALUE', script));
            },
          };

          Entry.block.unofficial_showPrompt = {
            color: '#795548', outerLine: '#5D4037', skeleton: 'basic_string_field',
            template: '%1 내용으로 입력창 띄우고 입력값 가져오기',
            params: [{ type: 'Block', accept: 'string' }],
            class: 'uncharted_legacy', isNotFor: [],
            paramsKeyMap: { VALUE: 0 },
            def: { params: [{ type: 'text', params: ['입력해주세요'], statements: [] }] },
            func: function (sprite, script) {
              return window.prompt(script.getStringValue('VALUE', script)) || '';
            },
          };

          function safeJsonParse(raw) {
            try {
              return JSON.parse(raw);
            } catch (e) {
              throw new Error('JSON 형식이 올바르지 않습니다 (큰따옴표를 사용해야 해요). 예: ["1","2","3"]');
            }
          }

          Entry.block.unofficial_arrayItem = {
            color: '#8E44AD', outerLine: '#6C3483', skeleton: 'basic_string_field',
            template: 'JSON 배열 %1 의 %2 번째 항목',
            params: [{ type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' }],
            class: 'uncharted_legacy', isNotFor: [],
            paramsKeyMap: { ARRAY: 0, NUM: 1 },
            def: {
              params: [
                { type: 'text', params: ['["1","2","3"]'], statements: [] },
                { type: 'number', params: ['1'], statements: [] },
              ],
            },
            func: function (sprite, script) {
              const arr = safeJsonParse(script.getStringValue('ARRAY', script));
              if (!Array.isArray(arr)) throw new Error('입력한 JSON이 배열이 아닙니다.');
              const idx = script.getNumberValue('NUM', script) - 1;
              return arr[idx] !== undefined ? arr[idx] : '';
            },
          };

          Entry.block.unofficial_arrayLength = {
            color: '#8E44AD', outerLine: '#6C3483', skeleton: 'basic_string_field',
            template: 'JSON 배열 %1 의 항목 수',
            params: [{ type: 'Block', accept: 'string' }],
            class: 'uncharted_legacy', isNotFor: [],
            paramsKeyMap: { ARRAY: 0 },
            def: { params: [{ type: 'text', params: ['["1","2","3"]'], statements: [] }] },
            func: function (sprite, script) {
              const arr = safeJsonParse(script.getStringValue('ARRAY', script));
              if (!Array.isArray(arr)) throw new Error('입력한 JSON이 배열이 아닙니다.');
              return arr.length;
            },
          };

          Entry.block.unofficial_jsonValue = {
            color: '#8E44AD', outerLine: '#6C3483', skeleton: 'basic_string_field',
            template: 'JSON %1 의 %2 값',
            params: [{ type: 'Block', accept: 'string' }, { type: 'Block', accept: 'string' }],
            class: 'uncharted_legacy', isNotFor: [],
            paramsKeyMap: { JSONSTR: 0, KEY: 1 },
            def: {
              params: [
                { type: 'text', params: ['{"title":"안녕"}'], statements: [] },
                { type: 'text', params: ['title'], statements: [] },
              ],
            },
            func: function (sprite, script) {
              const obj = safeJsonParse(script.getStringValue('JSONSTR', script));
              const key = script.getStringValue('KEY', script);
              return obj[key] !== undefined ? obj[key] : '';
            },
          };

          Entry.block.unofficial_jsonKeyCount = {
            color: '#8E44AD', outerLine: '#6C3483', skeleton: 'basic_string_field',
            template: 'JSON %1 의 항목 수',
            params: [{ type: 'Block', accept: 'string' }],
            class: 'uncharted_legacy', isNotFor: [],
            paramsKeyMap: { JSONSTR: 0 },
            def: { params: [{ type: 'text', params: ['{"title":"안녕"}'], statements: [] }] },
            func: function (sprite, script) {
              const obj = safeJsonParse(script.getStringValue('JSONSTR', script));
              return Object.keys(obj).length;
            },
          };

          Entry.block.unofficial_fetchJson = {
            color: '#2980B9', outerLine: '#1F618D', skeleton: 'basic_string_field',
            template: '%1 주소에서 JSON 가져오기',
            params: [{ type: 'Block', accept: 'string' }],
            class: 'uncharted_legacy', isNotFor: [],
            paramsKeyMap: { URL: 0 },
            def: { params: [{ type: 'text', params: ['https://playentry.org/api/discuss/findNotice'], statements: [] }] },
            func: async function (sprite, script) {
              const url = script.getStringValue('URL', script);
              try {
                const res = await fetch(url);
                const data = await res.json();
                return JSON.stringify(data);
              } catch (e) {
                throw new Error('가져오기 실패: ' + e.message);
              }
            },
          };

          Entry.block.unofficial_toast = {
            color: '#16A085', outerLine: '#117A65', skeleton: 'basic',
            template: '%1 제목 %2 내용의 %3 알림 띄우기',
            params: [
              { type: 'Block', accept: 'string' },
              { type: 'Block', accept: 'string' },
              {
                type: 'Dropdown',
                options: [['성공', 'success'], ['경고', 'warning'], ['오류', 'alert']],
                value: 'success',
              },
            ],
            class: 'uncharted_legacy', isNotFor: [],
            paramsKeyMap: { TITLE: 0, CONTENT: 1, TYPE: 2 },
            def: {
              params: [
                { type: 'text', params: ['제목'], statements: [] },
                { type: 'text', params: ['내용'], statements: [] },
                'success',
              ],
            },
            func: function (sprite, script) {
              const title = script.getStringValue('TITLE', script);
              const content = script.getStringValue('CONTENT', script);
              const type = script.getStringValue('TYPE', script);
              const toastFn = Entry.toast && Entry.toast[type];
              if (typeof toastFn === 'function') {
                toastFn.call(Entry.toast, title, content, true);
              } else {
                console.log('[알림]', title, content);
              }
              return script.callReturn();
            },
          };
        },
        palette: [
          ['calc', 'unofficial_getBrowserInfo'],
          ['judgement', 'unofficial_isDesktopOS'],
          ['looks', 'unofficial_showAlert'],
          ['judgement', 'unofficial_showConfirm'],
          ['calc', 'unofficial_showPrompt'],
          ['calc', 'unofficial_arrayItem'],
          ['calc', 'unofficial_arrayLength'],
          ['calc', 'unofficial_jsonValue'],
          ['calc', 'unofficial_jsonKeyCount'],
          ['calc', 'unofficial_fetchJson'],
          ['looks', 'unofficial_toast'],
        ],
      };
    }

    const libraryKeys = Object.keys(window.__unchartedLibrary);
    Entry.block.unofficial_loadPackage = {
      color: '#8E44AD', outerLine: '#6C3483', skeleton: 'basic',
      template: '%1 블록 불러오기',
      params: [{
        type: 'Dropdown',
        options: libraryKeys.map((key) => [window.__unchartedLibrary[key].label, key]),
        value: libraryKeys[0] || '',
      }],
      class: 'uncharted_debug', isNotFor: [],
      paramsKeyMap: { PACKAGE: 0 },
      def: { params: [libraryKeys[0] || ''], type: 'unofficial_loadPackage' },
      func: function (sprite, script) {
        const key = script.getStringValue('PACKAGE', script);
        console.log('▶ 불러오려는 패키지 키:', key);
        const pkg = window.__unchartedLibrary[key];
        if (!pkg) throw new Error('"' + key + '" 패키지를 라이브러리에서 찾을 수 없습니다.');

        pkg.defineBlocks();

        const bm = window.__bm;
        pkg.palette.forEach(([category, type]) => {
          try {
            if (bm._threadsMap && bm._threadsMap[type] && !bm.getThreadByBlockKey(type)) {
              delete bm._threadsMap[type];
            }
            bm.addCategoryData(category, type);
          } catch (e) {
            console.warn('패키지 팔레트 등록 실패:', type, e.message);
          }
        });

        console.log('✅ "' + pkg.label + '" 패키지 불러오기 완료 (팔레트에서 확인해보세요)');
        return script.callReturn();
      },
    };

    window.__unchartedDefsRegistered = true;
    LOG('1단계 완료: 블록 정의 등록됨 (저장된 작품 로드 대비 완료)');
  }

  /* ===================== 2단계: 팔레트 등록 ===================== */
  function registerPalette() {
    let ws, bm;
    try {
      ws = Entry.getMainWS();
      bm = (Entry.playground && Entry.playground.blockMenu) || (ws.board && ws.board.blockMenu) || ws.blockMenu;
    } catch (e) { return false; }
    if (!bm) return false;

    window.__bm = bm;
    const registrations = [
      ['looks', 'unofficial_grayscale'],
      ['looks', 'unofficial_invert'],
      ['looks', 'unofficial_pixelate'],
      ['looks', 'unofficial_clipToObject'],
      ['looks', 'unofficial_uploadPicture'],
      ['brush', 'unofficial_startPatternFill'],
      ['looks', 'unofficial_addEffectAmount'],
      ['looks', 'unofficial_getEffectAmount'],
      ['looks', 'unofficial_createWebsite'],
      ['judgement', 'unofficial_isPageVisible'],
      ['judgement', 'unofficial_isLiked'],
      ['looks', 'unofficial_toggleLike'],
      ['start', 'unofficial_when_webpage_created'],
      ['calc', 'unofficial_consoleLog'],
      ['calc', 'unofficial_setAiRole'],
      ['calc', 'unofficial_askAi'],
      ['calc', 'unofficial_clipboardWrite'],
      ['calc', 'unofficial_clipboardRead'],
      ['looks', 'unofficial_toggleContextMenu'],
      ['looks', 'unofficial_toggleTextSelect'],
      ['looks', 'unofficial_toggleTopLayer'],
      ['calc', 'unofficial_addPhysics'],
      ['calc', 'unofficial_setFloating'],
      ['calc', 'unofficial_setPhysicsProperty'],
      ['calc', 'unofficial_getRestitution'],
      ['calc', 'unofficial_setCollidable'],
      ['calc', 'unofficial_cameraFollow'],
      ['calc', 'unofficial_applyForce'],
      ['looks', 'unofficial_joinListAsText'],
      ['looks', 'unofficial_loadObjModel'],
      ['looks', 'unofficial_refreshTexture'],
      ['looks', 'unofficial_set3DTransform'],
      ['looks', 'unofficial_remove3D'],
      ['calc', 'unofficial_createStopwatch'],
      ['calc', 'unofficial_getStopwatchValue'],
      ['calc', 'unofficial_controlStopwatch'],
      ['looks', 'unofficial_playAnimation'],
      ['looks', 'unofficial_stopAnimation'],
      ['looks', 'unofficial_setAnimationLoop'],
      ['looks', 'unofficial_setPixelArtMode'],
      ['judgement', 'unofficial_isMouseButtonDown'],
      ['judgement', 'unofficial_isWheelScrolling'],
      ['calc', 'unofficial_particleBurst'],
      ['calc', 'unofficial_particleEmitToggle'],
      ['calc', 'unofficial_particleClearAll'],
      ['calc', 'unofficial_particleFromCode'],
      ['looks', 'unofficial_setMouseCursor'],
      ['looks', 'unofficial_resetMouseCursor'],
      ['expansion', 'unofficial_loadPackage'],
    ];

    registrations.forEach(([category, type]) => {
      try {
        if (bm._threadsMap && bm._threadsMap[type] && !bm.getThreadByBlockKey(type)) {
          delete bm._threadsMap[type];
        }
        bm.addCategoryData(category, type);
      } catch (e) {
        // 아직 준비가 덜 됐을 수 있으니 조용히 넘어가고 다음 재시도 때 다시 시도
      }
    });

    LOG('2단계 완료: 팔레트에 블록 등록됨');
    return true;
  }

  window.__unchartedForceReapply = function () {
    registerBlockDefinitions();
    const ok = registerPalette();
    return ok ? '재등록 성공' : '아직 워크스페이스가 준비되지 않음 (에디터 화면에서 다시 시도)';
  };

  /* ===================== 준비될 때까지 재시도 ===================== */
  let defsTimer = setInterval(function () {
    if (typeof Entry !== 'undefined' && Entry.block) {
      registerBlockDefinitions();
      clearInterval(defsTimer);
    }
  }, 50);

  let paletteTimer = setInterval(function () {
    if (window.__unchartedDefsRegistered) {
      // 워크스페이스가 막 생긴 시점엔 아직 엔트리 공식 블록들이 카테고리 배열에 다 채워지기 전이라,
      // 여기서 바로 등록하면 우리 블록이 공식 블록들 사이에 끼어버리는 현상이 있었음(실측 확인).
      // 워크스페이스 존재를 확인한 뒤 한 번 더 지연시켜서, 공식 블록들이 다 채워진 후에 맨 뒤에 붙게 한다.
      let ws, bm;
      try {
        ws = Entry.getMainWS();
        bm = (Entry.playground && Entry.playground.blockMenu) || (ws.board && ws.board.blockMenu) || ws.blockMenu;
      } catch (e) { /* 아직 준비 안 됨 */ }
      if (bm) {
        clearInterval(paletteTimer);
        setTimeout(function retryRegister() {
          const ok = registerPalette();
          if (!ok) setTimeout(retryRegister, 500); // 혹시 실패하면 계속 재시도
        }, 4000);
      }
    }
  }, 300);

  // 안전장치: 60초 넘게 못 찾으면 재시도 중단 (플레이 전용 페이지 등)
  setTimeout(() => { clearInterval(defsTimer); clearInterval(paletteTimer); }, 60000);

  // 감시병: 엔트리가 SPA 내부적으로 재초기화되어 우리 블록 정의가
  // 사라지는 경우(저장 실패, 효과 소실의 주된 원인으로 추정)를 3초마다 감시하고
  // 사라졌으면 조용히 다시 심어준다.
  setInterval(function () {
    try {
      if (typeof Entry === 'undefined' || !Entry.block) return;
      if (!Entry.block.unofficial_grayscale) {
        console.warn('[언차티드 블록] 블록 정의가 사라진 것을 감지했습니다. 다시 등록합니다.');
        window.__unchartedDefsRegistered = false;
        registerBlockDefinitions();
        setTimeout(registerPalette, 500); // 재초기화 직후 공식 블록 목록이 다시 채워질 시간을 살짝 줌
      }
      registerStopHandler(); // 이미 등록되어 있으면 내부에서 즉시 리턴하니 매번 호출해도 안전
    } catch (e) {
      // 감시병 자체는 절대 죽지 않아야 하므로 에러를 삼킴
    }
  }, 3000);

  // stop 핸들러 재등록 감시병: Entry.block이 막 생긴 아주 이른 시점에 등록한 리스너가
  // 이후 엔트리 내부 초기화 과정에서 무효화되는 경우가 실측 확인됨.
  // registerBlockDefinitions와는 독립적으로, 페이지 로드 초반 20초 동안 주기적으로 재등록을 시도한다.
  let stopHandlerRetries = 0;
  const stopHandlerRetryTimer = setInterval(function () {
    try {
      window.__unchartedStopHandler = false; // 재등록 허용
      registerStopHandler();
    } catch (e) {
      // 무시하고 계속 재시도
    }
    stopHandlerRetries++;
    if (stopHandlerRetries >= 10) clearInterval(stopHandlerRetryTimer); // 약 20초간(2초 간격) 재시도 후 중단
  }, 2000);
  registerStopHandler(); // 최초 시도도 즉시 한 번

  // ===== 사용자 커스텀 코드 스니펫 =====
  // bridge.js(isolated world)가 chrome.storage에서 읽어 postMessage로 보내주면 실행
  window.addEventListener('message', function (event) {
    if (event.source !== window) return;
    if (!event.data || event.data.type !== '__UNCHARTED_SNIPPETS_RESPONSE__') return;
    const snippets = event.data.snippets || [];
    LOG('bridge.js로부터 응답 받음. 스니펫 개수:', snippets.length);
    snippets.forEach(function (snip) {
      try {
        LOG('커스텀 코드 실행: "' + snip.title + '"');
        new Function(snip.code)();
      } catch (e) {
        console.error('[언차티드 블록] 커스텀 코드 "' + snip.title + '" 실행 중 에러:', e);
      }
    });
  });

  // 우리 블록 정의가 준비된 뒤에 스니펫을 요청 (스니펫 안에서 우리 헬퍼를 쓸 수 있도록)
  let snippetRequestTimer = setInterval(function () {
    if (window.__unchartedDefsRegistered) {
      LOG('bridge.js에 커스텀 코드 스니펫 요청 전송...');
      window.postMessage({ type: '__UNCHARTED_REQUEST_SNIPPETS__' }, '*');
      clearInterval(snippetRequestTimer);
    }
  }, 300);
  setTimeout(() => clearInterval(snippetRequestTimer), 60000);

  // ===== Groq API 키 (팝업에서 저장, 블록에서는 값을 직접 보지 않고 자동으로 사용) =====
  window.addEventListener('message', function (event) {
    if (event.source !== window) return;
    if (!event.data || event.data.type !== '__UNCHARTED_GROQ_KEY_RESPONSE__') return;
    window.__unchartedGroqKey = event.data.apiKey || '';
  });

  function requestGroqKey() {
    window.postMessage({ type: '__UNCHARTED_REQUEST_GROQ_KEY__' }, '*');
  }
  requestGroqKey();
  // 팝업에서 키를 새로 저장/변경했을 수 있으니 주기적으로 갱신 (가볍게 5초마다)
  setInterval(requestGroqKey, 5000);

  /* =========================================================
     언차티드 사이트 (playentry.org/uncharted/*)
     -----------------------------------------------------------
     엔트리 페이지 위에 전체화면 오버레이를 덮어서 우리만의 서브사이트로
     보이게 한다. 실제 URL(주소창)은 playentry.org 그대로 유지되고,
     엔트리 자체 라우팅/렌더링은 건드리지 않은 채 그 위를 완전히 가린다.
     ========================================================= */
  function isUnchartedRoute() {
    return /^\/uncharted(\/|$)/.test(location.pathname);
  }
  function getUnchartedSubRoute() {
    const m = location.pathname.match(/^\/uncharted\/?([^/?#]*)/);
    return (m && m[1]) || 'home';
  }

  let unchartedSiteRoot = null;
  let unchartedSiteAnimHandle = null;

  function unmountUnchartedSite() {
    if (unchartedSiteAnimHandle) {
      cancelAnimationFrame(unchartedSiteAnimHandle);
      unchartedSiteAnimHandle = null;
    }
    if (unchartedSiteRoot) {
      unchartedSiteRoot.remove();
      unchartedSiteRoot = null;
    }
  }

  // 실제 엔트리 헤더(role="banner")는 가리지 않고 그대로 살려둔 채, 그 아래 영역만
  // 우리 화면으로 덮는다. 헤더의 CSS 클래스는 빌드마다 바뀌는 해시(css-1jpsan1 등)라서
  // 믿을 수 없으므로, 시맨틱 태그+role(header[role="banner"])로만 찾는다.
  function findEntryHeaderEl() {
    return document.querySelector('header[role="banner"]');
  }

  function adjustUnchartedOverlayTop() {
    if (!unchartedSiteRoot) return;
    const header = findEntryHeaderEl();
    const height = header ? Math.round(header.getBoundingClientRect().height) : 0;
    unchartedSiteRoot.style.top = height + 'px';
  }

  function mountUnchartedSite() {
    if (!isUnchartedRoute()) {
      unmountUnchartedSite();
      return;
    }
    const route = getUnchartedSubRoute();
    if (unchartedSiteRoot && unchartedSiteRoot.dataset.route === route) {
      adjustUnchartedOverlayTop(); // 헤더 높이가 바뀌었을 수 있으니 매번 재확인
      return;
    }
    unmountUnchartedSite();

    const root = document.createElement('div');
    root.id = '__unchartedSiteRoot';
    root.dataset.route = route;
    // 엔트리 아트 스타일(밝은 하늘색 톤 배경, 진한 남색 텍스트)에 맞춤. 헤더 영역은
    // 침범하지 않도록 top을 실제 헤더 높이로 잡아서 z-index 다툼 없이 자연스럽게 이어지게 한다.
    root.style.cssText = [
      'position:fixed', 'left:0', 'right:0', 'bottom:0', 'z-index:2147483000',
      'background:#F4FAFF', 'overflow:auto',
      "font-family:'Pretendard','Noto Sans KR','Malgun Gothic','Apple SD Gothic Neo',sans-serif",
      'color:#25313E',
    ].join(';');
    (document.body || document.documentElement).appendChild(root);
    unchartedSiteRoot = root;
    adjustUnchartedOverlayTop();

    if (route === 'particleeditor') {
      renderUnchartedParticleEditor(root);
    } else {
      renderUnchartedHome(root);
    }

    // 엔트리 SPA가 헤더를 비동기로 늦게 그리거나 크기를 바꾸는 경우까지 대비해 잠깐 재확인
    let tries = 0;
    const headerWatchdog = setInterval(function () {
      adjustUnchartedOverlayTop();
      tries++;
      if (tries > 20 || !unchartedSiteRoot) clearInterval(headerWatchdog);
    }, 200);
  }

  window.addEventListener('resize', adjustUnchartedOverlayTop);

  function bindUnchartedLinks(root) {
    root.querySelectorAll('[data-uncharted-link]').forEach((a) => {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        const href = a.getAttribute('href');
        history.pushState({}, '', href);
        mountUnchartedSite();
      });
    });
  }

  // 엔트리 아트 스타일 팔레트 (공식 브랜드 색과 완전히 동일하진 않지만, 밝은 하늘색·민트 톤과
  // 둥근 카드/필 버튼으로 엔트리 특유의 느낌을 살림)
  const UNCHARTED_UI = {
    sky: '#28A7E8', skyDark: '#1C8FCB', mint: '#00C9A7', navy: '#25313E',
    cardBg: '#FFFFFF', pageBg: '#F4FAFF', border: '#E2EEF6', muted: '#5B6B78',
  };

  function renderUnchartedHome(root) {
    const ui = UNCHARTED_UI;
    root.innerHTML = `
      <div style="max-width:860px;margin:0 auto;padding:48px 24px 80px;">
        <div style="font-size:13px;letter-spacing:.08em;color:${ui.sky};font-weight:800;">UNCHARTED BLOCKS</div>
        <h1 style="font-size:32px;margin:8px 0 6px;color:${ui.navy};">🌌 언차티드 블록</h1>
        <p style="color:${ui.muted};line-height:1.7;font-size:15px;max-width:640px;">
          엔트리 공식 API에는 없는 블록들을, 브라우저 내부 구조를 직접 뜯어서 만드는 비공식 확장 프로그램입니다.
          이 화면은 확장이 <code style="background:${ui.border};padding:2px 6px;border-radius:6px;color:${ui.navy};">playentry.org/uncharted/</code> 경로를 가로채서 보여주는 자체 도구 모음이에요.
        </p>

        <a href="/uncharted/particleeditor" data-uncharted-link style="
          display:flex;align-items:center;gap:16px;margin-top:32px;padding:22px 26px;
          background:linear-gradient(135deg,${ui.sky},${ui.mint});border-radius:20px;text-decoration:none;color:#fff;
          box-shadow:0 10px 24px -8px rgba(40,167,232,.5);
        ">
          <div style="font-size:34px;">✨</div>
          <div>
            <div style="font-weight:800;font-size:18px;">파티클 에디터 열기</div>
            <div style="opacity:.9;font-size:13px;margin-top:2px;">모양·색상·범위·주기·방향을 슬라이더로 조정하며 실시간 미리보고, 완성한 효과를 코드로 내보내 블록에 붙여넣으세요.</div>
          </div>
          <div style="margin-left:auto;font-size:22px;">→</div>
        </a>

        <h2 style="font-size:17px;margin-top:44px;color:${ui.navy};">주요 블록</h2>
        <ul style="line-height:2;color:${ui.muted};font-size:14px;padding-left:20px;">
          <li>파티클 터뜨리기 / 파티클 발생 켜기·끄기 / <b style="color:${ui.navy};">코드를 바탕으로 파티클 생성하기</b></li>
          <li>마우스 커서를 자신의 모양으로 정하기</li>
          <li>자신에게 물리엔진 부여하기 (중력·탄성·충돌)</li>
          <li>OBJ 코드로 3D 오브젝트 렌더링하기</li>
          <li>생성형 AI에게 물어보고 대답 받기</li>
          <li>이름 기반 초시계, 스프라이트 애니메이션 재생 등</li>
        </ul>

        <div style="margin-top:44px;padding-top:18px;border-top:1px solid ${ui.border};color:${ui.muted};font-size:12px;">
          이 화면은 실제 엔트리 서버 페이지가 아니라, 설치된 "언차티드 블록" 확장 프로그램이 브라우저에서 그리고 있는 화면입니다.
        </div>
      </div>
    `;
    bindUnchartedLinks(root);
  }

  function renderUnchartedParticleEditor(root) {
    const ui = UNCHARTED_UI;
    root.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;min-height:100%;">
        <div style="flex:1 1 480px;min-width:320px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;background:${ui.pageBg};">
          <div style="width:100%;max-width:560px;display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <a href="/uncharted/home" data-uncharted-link style="color:${ui.sky};text-decoration:none;font-weight:800;">← 언차티드 홈</a>
            <div style="color:${ui.muted};font-size:13px;">파티클 에디터</div>
          </div>
          <canvas id="__unchartedPEcanvas" width="560" height="420" style="background:#12202B;border-radius:20px;max-width:100%;box-shadow:0 8px 20px -6px rgba(37,49,62,.25);"></canvas>
          <label style="margin-top:14px;color:${ui.navy};font-size:13px;display:flex;align-items:center;gap:6px;">
            <input type="checkbox" id="__unchartedPEauto" checked /> 자동으로 반복 터뜨리기
          </label>
        </div>

        <div style="flex:1 1 380px;min-width:320px;padding:24px;background:${ui.cardBg};overflow:auto;border-left:1px solid ${ui.border};">
          <h2 style="margin:0 0 16px;font-size:17px;color:${ui.navy};">⚙️ 설정</h2>
          <div id="__unchartedPEcontrols" style="display:flex;flex-direction:column;gap:14px;font-size:13px;color:${ui.navy};"></div>

          <h3 style="margin:24px 0 8px;font-size:14px;color:${ui.muted};">코드로 내보내기 / 불러오기</h3>
          <textarea id="__unchartedPEcode" spellcheck="false" style="
            width:100%;height:130px;background:${ui.pageBg};color:${ui.navy};border:1px solid ${ui.border};border-radius:12px;
            padding:10px;font-family:monospace;font-size:12px;box-sizing:border-box;resize:vertical;
          "></textarea>
          <div style="display:flex;gap:8px;margin-top:8px;">
            <button id="__unchartedPEgenerate" style="flex:1;padding:11px;border:none;border-radius:999px;background:${ui.sky};color:#fff;font-weight:800;cursor:pointer;">코드 생성</button>
            <button id="__unchartedPEcopy" style="flex:1;padding:11px;border:none;border-radius:999px;background:${ui.border};color:${ui.navy};font-weight:700;cursor:pointer;">복사</button>
            <button id="__unchartedPEapply" style="flex:1;padding:11px;border:none;border-radius:999px;background:${ui.border};color:${ui.navy};font-weight:700;cursor:pointer;">코드 적용</button>
          </div>
          <p style="color:${ui.muted};font-size:12px;margin-top:14px;line-height:1.6;">
            "코드 생성" 버튼을 눌러 나온 JSON을 복사해서, 엔트리 편집 화면의
            <b style="color:${ui.navy};">"(내용) 코드를 바탕으로 파티클 생성하기"</b> 블록에 붙여넣으면 여기서 만든 효과가 그대로 재현됩니다.
          </p>
        </div>
      </div>
    `;
    bindUnchartedLinks(root);
    initUnchartedParticleEditor(root);
  }

  // 에디터 전용 독립 파티클 물리(엔트리 좌표계와 무관, 캔버스 픽셀 좌표를 그대로 사용).
  // 실제 엔트리 파티클 엔진(spawnParticle/stepParticles)과 지원 옵션을 최대한 맞춰서
  // 여기서 만든 코드가 실제 블록에서도 동일하게 재현되도록 함.
  function initUnchartedParticleEditor(root) {
    const ui = UNCHARTED_UI;
    const canvas = root.querySelector('#__unchartedPEcanvas');
    const ctx = canvas.getContext('2d');
    const controlsEl = root.querySelector('#__unchartedPEcontrols');
    const codeEl = root.querySelector('#__unchartedPEcode');
    const autoEl = root.querySelector('#__unchartedPEauto');

    const cfg = {
      count: 25, shape: 'circle',
      startColor: '#FFA500', endColor: '#FF0000',
      life: 1.2, minSpeed: 1, maxSpeed: 3.5,
      minAngle: 60, maxAngle: 120, gravity: 0.3,
      startSize: 5, endSize: 0, minSpin: -0.1, maxSpin: 0.1,
      spawnRadius: 0, bounce: 0,
      burstInterval: 0.6, fade: true,
    };

    const fields = [
      { key: 'shape', label: '모양', type: 'select', options: [['circle', '동그라미'], ['square', '네모'], ['star', '별']] },
      { key: 'startColor', label: '시작 색상', type: 'color' },
      { key: 'endColor', label: '끝 색상', type: 'color' },
      { key: 'count', label: '개수(버스트당)', type: 'range', min: 1, max: 100, step: 1 },
      { key: 'burstInterval', label: '튀는 주기(초)', type: 'range', min: 0.1, max: 3, step: 0.1 },
      { key: 'life', label: '수명(초)', type: 'range', min: 0.1, max: 5, step: 0.1 },
      { key: 'spawnRadius', label: '발생 위치 범위', type: 'range', min: 0, max: 100, step: 1 },
      { key: 'minSpeed', label: '최소 속도', type: 'range', min: 0, max: 10, step: 0.1 },
      { key: 'maxSpeed', label: '최대 속도', type: 'range', min: 0, max: 10, step: 0.1 },
      { key: 'minAngle', label: '최소 각도(도) — 방향', type: 'range', min: 0, max: 360, step: 1 },
      { key: 'maxAngle', label: '최대 각도(도) — 방향', type: 'range', min: 0, max: 360, step: 1 },
      { key: 'gravity', label: '중력', type: 'range', min: -2, max: 2, step: 0.05 },
      { key: 'bounce', label: '바닥 튕김(반발력)', type: 'range', min: 0, max: 1, step: 0.05 },
      { key: 'startSize', label: '시작 크기', type: 'range', min: 0, max: 20, step: 0.5 },
      { key: 'endSize', label: '끝 크기', type: 'range', min: 0, max: 20, step: 0.5 },
      { key: 'minSpin', label: '최소 회전 속도', type: 'range', min: -0.5, max: 0.5, step: 0.01 },
      { key: 'maxSpin', label: '최대 회전 속도', type: 'range', min: -0.5, max: 0.5, step: 0.01 },
    ];

    controlsEl.innerHTML = fields.map((f) => {
      if (f.type === 'select') {
        return `<label style="display:flex;flex-direction:column;gap:4px;">
          <span style="color:${ui.muted};">${f.label}</span>
          <select data-key="${f.key}" style="padding:8px;border-radius:10px;background:${ui.pageBg};color:${ui.navy};border:1px solid ${ui.border};">
            ${f.options.map(([v, l]) => `<option value="${v}" ${cfg[f.key] === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </label>`;
      }
      if (f.type === 'color') {
        return `<label style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <span style="color:${ui.muted};">${f.label}</span>
          <input type="color" data-key="${f.key}" value="${cfg[f.key]}" style="width:48px;height:28px;border:none;background:none;cursor:pointer;" />
        </label>`;
      }
      return `<label style="display:flex;flex-direction:column;gap:4px;">
        <span style="color:${ui.muted};display:flex;justify-content:space-between;">
          <span>${f.label}</span><span data-val-for="${f.key}">${cfg[f.key]}</span>
        </span>
        <input type="range" data-key="${f.key}" min="${f.min}" max="${f.max}" step="${f.step}" value="${cfg[f.key]}" />
      </label>`;
    }).join('');

    controlsEl.querySelectorAll('[data-key]').forEach((el) => {
      el.addEventListener('input', function () {
        const key = el.dataset.key;
        const val = el.type === 'range' ? Number(el.value) : el.value;
        cfg[key] = val;
        const valLabel = controlsEl.querySelector('[data-val-for="' + key + '"]');
        if (valLabel) valLabel.textContent = val;
      });
    });

    // ---- 독립 미리보기 파티클 물리 (엔트리 좌표계 미사용, 캔버스 좌표 그대로) ----
    const PE_SHAPES = {
      circle: function (c, size) { c.beginPath(); c.arc(0, 0, size, 0, Math.PI * 2); c.fill(); },
      square: function (c, size) { c.fillRect(-size, -size, size * 2, size * 2); },
      star: function (c, size) {
        c.beginPath();
        for (let i = 0; i < 5; i++) {
          const oa = (Math.PI * 2 * i) / 5 - Math.PI / 2, ia = oa + Math.PI / 5;
          const ox = Math.cos(oa) * size, oy = Math.sin(oa) * size;
          const ix = Math.cos(ia) * size * 0.45, iy = Math.sin(ia) * size * 0.45;
          if (i === 0) c.moveTo(ox, oy); else c.lineTo(ox, oy);
          c.lineTo(ix, iy);
        }
        c.closePath(); c.fill();
      },
    };
    let peParticles = [];
    let lastBurstAt = 0;
    const floorY = canvas.height - 20; // 미리보기용 바닥선(캔버스 좌표, 아래쪽일수록 y가 큼)

    function peBurst() {
      const cx = canvas.width / 2, cy = canvas.height * 0.6;
      for (let i = 0; i < cfg.count; i++) {
        let sx = cx, sy = cy;
        if (cfg.spawnRadius > 0) {
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * cfg.spawnRadius;
          sx += Math.cos(a) * r;
          sy += Math.sin(a) * r;
        }
        const angleDeg = cfg.minAngle + Math.random() * (cfg.maxAngle - cfg.minAngle);
        const angle = angleDeg * Math.PI / 180;
        const speed = cfg.minSpeed + Math.random() * Math.max(0, cfg.maxSpeed - cfg.minSpeed);
        const spin = cfg.minSpin + Math.random() * (cfg.maxSpin - cfg.minSpin);
        peParticles.push({
          x: sx, y: sy,
          // 캔버스 좌표계는 아래가 +y라서, "위로 발사"를 표현하려면 부호를 엔트리와 반대로 뒤집는다
          vx: Math.cos(angle) * speed,
          vy: -Math.sin(angle) * speed,
          createdAt: Date.now(),
          lifeMs: Math.max(50, cfg.life * 1000),
          rotation: Math.random() * Math.PI * 2,
          spin,
        });
      }
    }

    function peStep() {
      const now = Date.now();
      if (autoEl.checked && now - lastBurstAt > Math.max(80, cfg.burstInterval * 1000)) {
        lastBurstAt = now;
        peBurst();
      }
      ctx.fillStyle = '#12202B';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = peParticles.length - 1; i >= 0; i--) {
        const p = peParticles[i];
        const age = now - p.createdAt;
        if (age >= p.lifeMs) { peParticles.splice(i, 1); continue; }
        p.vy += cfg.gravity * 0.02;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;

        if (p.y > floorY) {
          if (cfg.bounce > 0) {
            p.y = floorY;
            p.vy = -Math.abs(p.vy) * cfg.bounce;
            p.vx *= 0.85;
          } else if (cfg.gravity !== 0) {
            p.y = floorY;
            p.vy = 0;
            p.vx = 0;
          }
        }

        const t = Math.max(0, Math.min(1, age / p.lifeMs));
        const alpha = cfg.fade ? 1 - t : 1;
        const size = cfg.startSize + (cfg.endSize - cfg.startSize) * t;
        const color = lerpColor(cfg.startColor, cfg.endColor, t);
        if (size <= 0) continue;

        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        (PE_SHAPES[cfg.shape] || PE_SHAPES.circle)(ctx, size);
        ctx.restore();
      }
      unchartedSiteAnimHandle = requestAnimationFrame(peStep);
    }
    peStep();

    function cfgToCode() {
      return JSON.stringify({
        count: cfg.count, shape: cfg.shape,
        startColor: cfg.startColor, endColor: cfg.endColor,
        life: cfg.life, minSpeed: cfg.minSpeed, maxSpeed: cfg.maxSpeed,
        minAngle: cfg.minAngle, maxAngle: cfg.maxAngle, gravity: cfg.gravity,
        startSize: cfg.startSize, endSize: cfg.endSize,
        minSpin: cfg.minSpin, maxSpin: cfg.maxSpin,
        spawnRadius: cfg.spawnRadius, bounce: cfg.bounce, fade: cfg.fade,
      }, null, 2);
    }

    root.querySelector('#__unchartedPEgenerate').addEventListener('click', function () {
      codeEl.value = cfgToCode();
    });
    root.querySelector('#__unchartedPEcopy').addEventListener('click', function () {
      if (!codeEl.value) codeEl.value = cfgToCode();
      codeEl.select();
      navigator.clipboard && navigator.clipboard.writeText(codeEl.value).catch(function () {
        document.execCommand && document.execCommand('copy');
      });
    });
    root.querySelector('#__unchartedPEapply').addEventListener('click', function () {
      let parsed;
      try {
        parsed = JSON.parse(codeEl.value);
      } catch (e) {
        alert('올바른 JSON이 아닙니다: ' + e.message);
        return;
      }
      Object.keys(cfg).forEach((k) => {
        if (parsed[k] != null) cfg[k] = parsed[k];
      });
      // 컨트롤 UI를 새 값으로 다시 그림
      controlsEl.querySelectorAll('[data-key]').forEach((el) => {
        const key = el.dataset.key;
        el.value = cfg[key];
        const valLabel = controlsEl.querySelector('[data-val-for="' + key + '"]');
        if (valLabel) valLabel.textContent = cfg[key];
      });
    });

    codeEl.value = cfgToCode();
  }

  function watchUnchartedRouteChanges() {
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    history.pushState = function () {
      const ret = origPush.apply(this, arguments);
      setTimeout(mountUnchartedSite, 0);
      return ret;
    };
    history.replaceState = function () {
      const ret = origReplace.apply(this, arguments);
      setTimeout(mountUnchartedSite, 0);
      return ret;
    };
    window.addEventListener('popstate', function () { setTimeout(mountUnchartedSite, 0); });
  }

  watchUnchartedRouteChanges();
  if (document.body) {
    mountUnchartedSite();
  } else {
    document.addEventListener('DOMContentLoaded', mountUnchartedSite);
  }
  // 엔트리 SPA가 초기화되며 뒤늦게 라우트를 바꾸는 경우까지 대비해 몇 초간 재확인
  let unchartedRouteWatchdogCount = 0;
  const unchartedRouteWatchdog = setInterval(function () {
    mountUnchartedSite();
    unchartedRouteWatchdogCount++;
    if (unchartedRouteWatchdogCount > 20) clearInterval(unchartedRouteWatchdog);
  }, 500);
})();
