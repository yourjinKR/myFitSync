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