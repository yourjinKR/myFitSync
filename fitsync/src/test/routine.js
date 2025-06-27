import { memo } from "react";

// 루티 추천 출력값 예상 형식
let routineList1 = {
    routine_title: '팔 루틴 A',
    routine: [
        { pt_ename: 'barbell curl', set: { set_kg: 10, set_count: 12, set_num: 3 }, memo: '주의사항 간단히 작성' },
    ]
}

const routineList =
{
    "routineList": {
        "routine_title": "가슴 등 A 루틴",
        "routine_category": "가슴, 등"
    },
    "routines": [
        {
            "pt": {
                "pt_name": "벤치프레스",
                "pt_category": "가슴",
            },
            "routineSet": [
                {"set_num": 1, "set_kg": 60, "set_count": 10},
                {"set_num": 2, "set_kg": 70, "set_count": 8},
                {"set_num": 3, "set_kg": 80, "set_count": 6}
            ]
        },
        {
            "pt": {
                "pt_name": "랫풀다운",
                "pt_category": "등",
            },
            "routineSet": [
                {"set_num": 1, "set_kg": 40, "set_count": 12},
                {"set_num": 2, "set_kg": 50, "set_count": 10},
                {"set_num": 3, "set_kg": 60, "set_count": 8}
            ]
        }
    ]
}
