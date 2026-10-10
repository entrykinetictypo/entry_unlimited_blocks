// isolated world에서 실행됨 (chrome.storage 접근 가능)
// MAIN world의 inject.js가 요청하면 저장된 커스텀 코드/API 키를 postMessage로 전달
(function () {
  console.log('[언차티드 블록/bridge] bridge.js 로드됨, 요청 대기 중...');

  window.addEventListener('message', function (event) {
    if (event.source !== window) return;
    if (!event.data || !event.data.type) return;

    if (event.data.type === '__UNCHARTED_REQUEST_SNIPPETS__') {
      console.log('[언차티드 블록/bridge] 스니펫 요청 받음. storage 조회 중...');
      chrome.storage.local.get('unchartedCustomSnippets', function (result) {
        const snippets = result.unchartedCustomSnippets || [];
        console.log('[언차티드 블록/bridge] storage에서 읽은 스니펫 개수:', snippets.length, snippets);
        window.postMessage({ type: '__UNCHARTED_SNIPPETS_RESPONSE__', snippets: snippets }, '*');
        console.log('[언차티드 블록/bridge] inject.js로 응답 전송 완료');
      });
    }

    if (event.data.type === '__UNCHARTED_REQUEST_GROQ_KEY__') {
      chrome.storage.local.get('unchartedGroqApiKey', function (result) {
        window.postMessage({ type: '__UNCHARTED_GROQ_KEY_RESPONSE__', apiKey: result.unchartedGroqApiKey || '' }, '*');
      });
    }
  });
})();
