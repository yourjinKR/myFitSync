import axios from "axios";

export const GymUtil = {
    // 체육관 리스트 불러오기
    getGym : async () => {
        try {
            const response = await axios.get('/admin/gyms');

            console.log("체육관 불러옴 : " , response.data);
            
            return response.data;
        } catch (error) {
            
        }
    },

    // 체육관 추가하기
    addGym : async (gym) => {
        try {
            const response = await axios.post('/admin/gym', gym);

            console.log("체육관 추가함 : " , response.data);
            
            return response.data;
        } catch (error) {
            
        }
    }
};