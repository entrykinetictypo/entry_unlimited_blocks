# easy console

콘솔을 편하게 쓰는 확장 프로그램입니다.

## 기능

- 엔트리 블록 연결 제한 해제
- 확장 프로그램 팝업에서 기능 켜기/끄기
- Entry 작업 화면에서 자동 적용

## 설치 방법

1. 초록색 code를 눌러 download zip 선택
2. 파일 탐색기로 가기
3. ZIP 파일 압축 해제
4. Chrome 주소창에 `chrome://extensions` 입력
5. 오른쪽 위의 `개발자 모드` 켜기
6. `압축해제된 확장 프로그램을 로드` 클릭
7. 압축을 푼 폴더 더블클릭
8. 다시 더블클릭
9.unofficial폴더를 무시하고 폴더 열기 클릭

## 사용 방법

Chrome 확장 프로그램 아이콘을 클릭하면 팝업이 열립니다.

- `켜기` : 블록 연결 제한 해제 활성화
- `끄기` : 블록 연결 제한 해제 비활성화
- 블록 불러오기에서 직접 아이디를 적거나 복붙하기
- 최근 추가한 블록을 클릭하면 그 블록 불러와짐

## 파일 구조

```text
entry-unlimited-blocks/
unofficial folder
├─ manifest.json
├─ content.js
├─ patch.js
├─ popup.html
├─ popup.js
└─ README.md
