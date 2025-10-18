# 결제 및 구독 서비스
Portone API 를 활용하여 결제 모듈을 구현
- 결제수단 등록
- 단건 결제
- 결제 예약
- 결제 모니터링

## 결제 수단 등록

### 결제 수단
사용자에게 결제수단 등록, 수정, 삭제 기능 제공
- 간편 결제 : 카카오 페이
- 카드 결제 : 토스 페이

## 단건 결제
사용자가 등록된 결제수단으로 구독권을 결제

## 결제 예약
결제가 성공하면 다음달(+31일) 기준으로 결제를 예약<br>
결제기록에서 예약 결제를 취소 가능

## 결제 모니터링
일일 단위로 예약 결제건들의 결제 성공 여부를 확인

<br>
<br>
<br>

# AI 루틴 추천 서비스
- 사용자의 정보를 기반으로 gpt API를 활용하여 맞춤형 운동 루틴을 추천
- 요청과 응답의 내용을 DB에 저장

## 사전 검증
사용자의 결제 내역을 기반으로 요청 가능한지 검증
- 구독자인가?
- 1회 무료 체험 가능자인가?

## 요청
**데이터**와 기존 프롬프트를 조합하여 `java.net.HttpURLConnection`를 사용하여 gpt api 직접 요청

### 데이터
1. 사용자의 기본정보와 신체정보
2. 사용자의 AI 요청시 요구사항 (분할 수, 변경된 신체정보)
3. 문자열로 파싱된 운동정보(idx, name을 key-value로 매핑)


## 응답
- 요청 성공시 응답 내용에 대한 예외처리 진행
- 응답 내용에 대한 전반적인 정보를 `apiLog` 테이블에 저장
- 사용자에게 응답 내용(추천 결과)를 전달

### `apilog` 저장 데이터
- 응답자
- 요청 내용
- 응답 내용
- 요청 시간
- 응답 시간
- 요청 토큰
- 응답 토큰
- API 모델
- 서비스 버전 (자체적으로 버저닝)
- 요청 상태 (`success/exeception/fail`)

<br>
<br>
<br>

# AI 서비스 사용자 피드백 및 행동 기록
사용자가 AI 서비스 결과에 대한 피드백과 응답에 대한 행동을 기록
- apilog_feedback : 사용자 피드백
- apilog_feedback_reason : 사용자 피드백 사유
- apilog_user_action : 사용자 행동

## 사용자 피드백

### apilog_feedback
- `LIKE`
- `DISLIKE`

### apilog_feedback_reason
- `difficulty` : 부적절한 난이도로 추천함
- `exercise_type` : 운동 종류가 마음에 들지 않음
- `time` : 운동 시간이 부적절함
- `structure` : 운동 구성이 마음에 들지 않음
- `injury` : 부상 위험이 있음
- `timeout` : 응답시간이 오래 걸림
- `other` :  기타 사유

## 사용자 행동 

### apilog_user_action
- `saved-immediate` : 즉시 루틴으로 저장
- `ignored` : 루틴으로 저장하지 않음
- `saved-after` : 나중에 루틴으로 저장

<br>
<br>
<br>

# AI 응답/요청 기록에 대한 시각화
chart.js를 활용하여 AI 응답/요청 데이터에 대한 시각화 구현

## 구현 목적
- 응답 및 요청 기록을 수집하여 개발 과정에서 발생하는 문제점을 파악
- 사용자에게 요청 기록과 사용량에 대한 정보 제공
- 비지니스상 구독료에 대한 근거 제공

## 저장 데이터
**<details>**
<summary>자세히</summary>

- `apilog_idx` : 고유 id
- `member_idx` : 호출한 회원
- `apilog_prompt` : 입력 프롬프트 내용
- `apilog_response` : 출력 내용
- `apilog_request_time` : 요청 시간
- `apilog_response_time` : 응답 시간
- `apilog_input_tokens` : 입력 토큰
- `apilog_output_tokens` : 출력 토큰
- `apilog_model` : 모델 (예: gpt-3.5 turbo, gpt-4o)
- `apilog_version` : Semantic Versioning
- `apilog_status` : succcess, exception, fail
- `apilog_service_type` : 사용자 정보 기반 운동 루틴 추천 (현재는 1개뿐이며 추후 확장성을 고려함)
- `apilog_feedback` : LIKE, DISLIKE 
- `apilog_feedback_reason` : exercise_type, timeout... (DISLIKE일때만 수집)
- `apilog_status_reason` : invalid_exercise: 엉덩이 킥백 머신
- `apilog_user_action` : (예 : "saved-immediate", "ignored", "saved-after")

</details>

<br>
<br>
<br>

# 체육관 관리
- 체육관 정보 등록, 조회, 수정, 삭제
- kako Map API를 활용하여 체육관 정보 제공
