// 루틴 추천 출력값 예상 형식
const aiResponseExample = 
{
    result : [
        {
            routineList: 
            {
                routine_title : "가슴 등 A 루틴",
            },
            routines : [
                {
                    pt : {
                        pt_name : "벤치프레스",
                    },
                    routine_set : [
                        {set_num : 1, set_kg : 60, set_count : 10},
                        {set_num : 2, set_kg : 70, set_count : 8},
                        {set_num : 3, set_kg : 80, set_count : 6}
                    ]
                },
                {
                    pt : {
                        pt_name : "랫풀다운",
                    },
                    routine_set : [
                        {set_num : 1, set_kg : 50, set_count : 10},
                        {set_num : 2, set_kg : 60, set_count : 8},
                        {set_num : 3, set_kg : 70, set_count : 6}
                    ]
                }
            ]
        },
        {
            routineList: 
            {
                routine_title : "하체 B 루틴",
            },
            routines : [
                {
                    pt : {
                        pt_name : "스쿼트",
                    },
                    routine_set : [
                        {set_num : 1, set_kg : 70, set_count : 10},
                        {set_num : 2, set_kg : 80, set_count : 8},
                        {set_num : 3, set_kg : 90, set_count : 6}
                    ]
                },
                {
                    pt : {
                        pt_name : "레그프레스",
                    },
                    routine_set : [
                        {set_num : 1, set_kg : 100, set_count : 10},
                        {set_num : 2, set_kg : 110, set_count : 8},
                        {set_num : 3, set_kg : 120, set_count : 6}
                    ]
                }
            ]
        }
    ]
}

const aiResponseExample2 = {
    title : "가슴 등 A 루틴",
    routines : [
        {
            pt : {
                pt_name : "벤치프레스",
            },
            setList : [
                {set_num : 1, set_kg : 60, set_count : 10},
                {set_num : 2, set_kg : 70, set_count : 8},
                {set_num : 3, set_kg : 80, set_count : 6}
            ]
        },
        {
            pt : {
                pt_name : "랫풀다운",
            },
            setList : [
                {set_num : 1, set_kg : 50, set_count : 10},
                {set_num : 2, set_kg : 60, set_count : 8},
                {set_num : 3, set_kg : 70, set_count : 6}
            ]
        }
    ]
}

const aiResponseExample3 = [
    {routine_name : "가슴 등 루틴", 
    exercises : [
        {pt_name : "벤치프레스", set_kg : 60, set_count : 10, set_num: 4},
        {pt_name : "랫풀다운", set_kg : 50, set_count : 10, set_num: 4},
        {pt_name : "덤벨플라이", set_kg : 20, set_count : 12, set_num: 3},
        {pt_name : "바벨로우", set_kg : 70, set_count : 8, set_num: 4}]},
    {routine_name : "하체 루틴",
    exercises : [
        {pt_name : "스쿼트", set_kg : 80, set_count : 10, set_num: 4},
        {pt_name : "레그프레스", set_kg : 100, set_count : 10, set_num: 4},
        {pt_name : "레그컬", set_kg : 40, set_count : 12, set_num: 3},
        {pt_name : "카프레이즈", set_kg : 50, set_count : 15, set_num: 3}]},
    {routine_name : "어깨 루틴",
    exercises : [
        {pt_name : "밀리터리프레스", set_kg : 50, set_count : 10, set_num: 4},
        {pt_name : "사이드레터럴레이즈", set_kg : 15, set_count : 12, set_num: 3},
        {pt_name : "프론트레터럴레이즈", set_kg : 15, set_count : 12, set_num: 3},
        {pt_name : "슈러그", set_kg : 70, set_count : 10, set_num: 4}]},
    {routine_name : "팔 루틴",
    exercises : [
        {pt_name : "바벨컬", set_kg : 40, set_count : 10, set_num: 4},
        {pt_name : "덤벨컬", set_kg : 20, set_count : 12, set_num: 3},
        {pt_name : "트라이셉스 푸시다운", set_kg : 30, set_count : 10, set_num: 4},
        {pt_name : "딥스", set_kg : 0, set_count : 8, set_num: 4}]}
];
