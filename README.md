# Entry Unlimited Blocks

엔트리의 블록 연결 제한을 해제하는 Chrome 확장 프로그램입니다.

## 기능

- 엔트리 블록 연결 제한 해제
- 확장 프로그램 팝업에서 기능 켜기/끄기
- Entry 작업 화면에서 자동 적용

## 설치 방법

1. GitHub 저장소에서 ZIP 파일 다운로드
2. ZIP 파일 압축 해제
3. Chrome 주소창에 `chrome://extensions` 입력
4. 오른쪽 위의 `개발자 모드` 켜기
5. `압축해제된 확장 프로그램을 로드` 클릭
6. 압축을 푼 폴더 선택

## 사용 방법

Chrome 확장 프로그램 아이콘을 클릭하면 팝업이 열립니다.

- `켜기` : 블록 연결 제한 해제 활성화
- `끄기` : 블록 연결 제한 해제 비활성화

## 파일 구조

```text
entry-unlimited-blocks/
├─ manifest.json
├─ content.js
├─ patch.js
├─ popup.html
├─ popup.js
└─ README.md
