// 시/도 데이터
export const area0 = ["시/도 선택", "서울특별시", "인천광역시", "대전광역시", "광주광역시", "대구광역시", "울산광역시", "부산광역시", "경기도", "강원도", "충청북도", "충청남도", "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도"];
// 서울특별시
export const area1 = ["구/군 선택", "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"];
// 인천광역시
export const area2 = ["구/군 선택", "계양구", "미추홀구", "남동구", "동구", "부평구", "서구", "연수구", "중구", "강화군", "옹진군"];
// 대전광역시
export const area3 = ["구/군 선택", "대덕구", "동구", "서구", "유성구", "중구"];
// 광주광역시
export const area4 = ["구/군 선택", "광산구", "남구", "동구", "북구", "서구"];
// 대구광역시
export const area5 = ["구/군 선택", "남구", "달서구", "동구", "북구", "서구", "수성구", "중구", "달성군"];
// 울산광역시
export const area6 = ["구/군 선택", "남구", "동구", "북구", "중구", "울주군"];
// 부산광역시
export const area7 = ["구/군 선택", "강서구", "금정구", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구", "기장군"];
// 경기도
export const area8 = ["구/군 선택", "고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시", "안양시", "양주시", "오산시", "용인시", "의왕시", "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시", "가평군", "양평군", "여주군", "연천군"];
// 강원도
export const area9 = ["구/군 선택", "강릉시", "동해시", "삼척시", "속초시", "원주시", "춘천시", "태백시", "고성군", "양구군", "양양군", "영월군", "인제군", "정선군", "철원군", "평창군", "홍천군", "화천군", "횡성군"];
// 충청북도
export const area10 = ["구/군 선택", "제천시", "청주시", "충주시", "괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "증평군", "진천군", "청원군"];
// 충청남도
export const area11 = ["구/군 선택", "계룡시", "공주시", "논산시", "보령시", "서산시", "아산시", "천안시", "금산군", "당진군", "부여군", "서천군", "연기군", "예산군", "청양군", "태안군", "홍성군"];
// 전라북도
export const area12 = ["구/군 선택", "군산시", "김제시", "남원시", "익산시", "전주시", "정읍시", "고창군", "무주군", "부안군", "순창군", "완주군", "임실군", "장수군", "진안군"];
// 전라남도
export const area13 = ["구/군 선택", "광양시", "나주시", "목포시", "순천시", "여수시", "강진군", "고흥군", "곡성군", "구례군", "담양군", "무안군", "보성군", "신안군", "영광군", "영암군", "완도군", "장성군", "장흥군", "진도군", "함평군", "해남군", "화순군"];
// 경상북도
export const area14 = ["구/군 선택", "경산시", "경주시", "구미시", "김천시", "문경시", "상주시", "안동시", "영주시", "영천시", "포항시", "고령군", "군위군", "봉화군", "성주군", "영덕군", "영양군", "예천군", "울릉군", "울진군", "의성군", "청도군", "청송군", "칠곡군"];
// 경상남도
export const area15 = ["구/군 선택", "거제시", "김해시", "마산시", "밀양시", "사천시", "양산시", "진주시", "진해시", "창원시", "통영시", "거창군", "고성군", "남해군", "산청군", "의령군", "창녕군", "하동군", "함안군", "함양군", "합천군"];
// 제주특별자치도
export const area16 = ["구/군 선택", "서귀포시", "제주시"];

// 모든 지역 데이터를 한 객체로 정리
export const areaAll = {
  area0,
  area1,
  area2,
  area3,
  area4,
  area5,
  area6,
  area7,
  area8,
  area9,
  area10,
  area11,
  area12,
  area13,
  area14,
  area15,
  area16
};

export function selectBOX() {
  try {
    // Get the 'sido1' select element
    const sidoSelect = document.getElementById("sido1");

    // 시/도 선택 박스 초기화
    if (sidoSelect) {
      // 이미 옵션이 있는지 확인
      if (sidoSelect.options.length === 0) {
        // 옵션이 없을 때만 추가
        area0.forEach(function(areaName) {
          const option = document.createElement("option");
          option.value = areaName;
          option.textContent = areaName;
          sidoSelect.appendChild(option);
        });
      }

      // Initialize the next select box (gugun)
      const gugunSelectInitial = sidoSelect.nextElementSibling;
      if (gugunSelectInitial && gugunSelectInitial.tagName === 'SELECT' && gugunSelectInitial.options.length === 0) {
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "구/군 선택";
        gugunSelectInitial.appendChild(defaultOption);
      }
    }

    // 시/도 선택시 구/군 설정
    const sidoSelectors = document.querySelectorAll("select[name^='sido']");

    sidoSelectors.forEach(function(selectElement) {
      // 이벤트 리스너가 이미 있는지 확인하는 속성
      if (!selectElement.hasChangeListener) {
        selectElement.addEventListener("change", function(e) {
          const selectedIndex = this.selectedIndex;
          if (selectedIndex <= 0) return; // 선택된 항목이 없거나 "시/도 선택"인 경우 처리하지 않음
          
          const areaKey = `area${selectedIndex - 1}`;
          const gugunSelect = this.nextElementSibling;

          if (gugunSelect && gugunSelect.tagName === 'SELECT') {
            gugunSelect.innerHTML = "";

            const currentArea = areaAll[areaKey];

            if (currentArea) {
              currentArea.forEach(function(gugunName) {
                const option = document.createElement("option");
                option.value = gugunName;
                option.textContent = gugunName;
                gugunSelect.appendChild(option);
              });
            } else {
              const defaultOption = document.createElement("option");
              defaultOption.value = "";
              defaultOption.textContent = "구/군 선택";
              gugunSelect.appendChild(defaultOption);
            }
          }
        });
        // 이벤트 리스너가 추가되었음을 표시
        selectElement.hasChangeListener = true;
      }
    });
  } catch (error) {
    console.error("selectBOX 함수 실행 중 오류 발생:", error);
  }
}