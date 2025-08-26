# FitSync (솔데스크 2차 웹개발 프로젝트)

## 📌 프로젝트 소개
**FitSync**는 퍼스널 트레이너(PT)와 회원을 연결하는 **사람 중심의 PT 관리 웹서비스**입니다.  
트레이너와 회원이 투명하고 편리하게 소통하며, AI를 통한 운동 루틴 추천과 기록 관리까지 지원합니다.  

- 트레이너: 자신의 프로필과 전문성을 홍보하고 회원을 관리할 수 있음  
- 회원: 트레이너와 상담 후 PT 계약, 운동 기록 작성 및 시각화, AI 루틴 추천 기능 활용 가능  

## 🎯 주요 기능
- 소셜 로그인 (Google, Kakao, Naver OAuth)
- 1:1 실시간 채팅 (WebSocket)
- PT 결제 시스템 (PortOne API, 정기 구독 포함)
- 개인 캘린더 (운동 기록 관리, 트레이너 회원 일정 관리)
- AI 서비스 (운동 루틴 추천, 운동 기록 피드백)

## 👥 주요 사용자
- 자신을 홍보하고 체계적으로 회원을 관리하고 싶은 **헬스 트레이너**
- 처음 운동을 시작하여 도움이 필요한 **초보자**
- 운동 기록을 체계적으로 남기고 싶은 **회원**
- 나의 근성장 변화를 확인하고 싶은 **운동인**

## 🛠 기술 스택
### Backend
- Java (11, LTS)
- Spring MVC
- MyBatis
- Oracle DB
- Apache Tomcat 9.0

### Frontend
- React
- HTML, CSS, JavaScript
- styled-components (또는 Tailwind CSS)

### AI & API
- OpenAI API (운동 루틴 추천/피드백)
- PortOne REST API v2 (정기 결제)
- OAuth (Google, Kakao, Naver)

### DevOps & Deployment
- AWS Elastic Beanstalk (Spring MVC 배포)
- AWS S3 + CloudFront (React 정적 파일 호스팅)

## 📊 데이터베이스 구조 (요약)
- **member**: 회원 정보  
- **pt**: 트레이너 정보  
- **record / routine**: 운동 기록 및 루틴  
- **schedule**: 일정 관리  
- **review / favorite**: 리뷰 및 즐겨찾기  
- **payment**: 결제 내역 및 구독  
- **room / message**: 채팅 및 파일 전송 로그  

## 🚀 프로젝트 목적
- PT 계약 과정을 온라인으로 간소화  
- 초보자도 쉽게 접근할 수 있는 운동 기록 및 성장 시각화  
- AI 기반 맞춤형 피드백 제공  

---

## 📸 스크린샷
(여기에 서비스 주요 화면 캡처 추가)

---

## 🤝 팀 구성 및 역할
- **Frontend**: React UI 개발, AI 대시보드, 실시간 채팅 화면  
- **Backend**: Spring MVC API 설계, DB 모델링, 결제/구독 로직 구현  
- **DevOps**: AWS 배포 (Elastic Beanstalk, S3, CloudFront)  

## 📈 향후 개선사항
- 모바일 반응형 디자인 강화  
- Elasticsearch 기반 한글 친화적 검색 기능 추가  
- AI 피드백 고도화 (주간/월간 운동 분석)  
