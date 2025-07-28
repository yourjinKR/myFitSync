import axios from "axios";

export const GymUtil = {
    /** 체육관 리스트 불러오기 */
    getGyms: async ({ keyword = '', keywordType = '', page = 1, pageSize = 10 } = {}) => {
        try {
            const response = await axios.get('/admin/gyms', {
            params: {
                keyword,
                keywordType,
                page,
                pageSize,
            },
            });

            console.log("체육관 불러오기:", response.data);
            return response.data;
        } catch (error) {
            console.error("체육관 불러오기 실패:", error);
            throw error;
        }
    },
    
    /** 특정 체육관 불러오기 */
    getGym : async (gym_idx) => {
        try {
            const response = await axios.get(`/admin/gym/${gym_idx}`);

            console.log("특정 체육관 불러오기 : " , response.data);
            
            return response.data;
        } catch (error) {
            console.log("특정 체육관 불러오기 오류 : " + error);
        }
    },
    
    /** 체육관 추가하기 */
    addGym : async (gym) => {
        try {
            const response = await axios.post('/admin/gym', gym);

            console.log("체육관 추가 : " , response.data);
            
            return response.data;
        } catch (error) {
            console.log("체육관 추가 실패 : " + error);
        }
    },

    /** 체육관 수정하기 */ 
    updateGym : async (gym) => {
        try {
            const response = await axios.put('/admin/gym', gym);

            console.log("체육관 수정 : " , response.data);
            
            return response.data;
        } catch (error) {
            console.log("체육관 수정 실패 : " + error);
        }
    },

    /** 체육관 수정하기 */ 
    deleteGym : async (gym_idx) => {
        try {
            const response = await axios.delete(`/admin/gym/${gym_idx}`);

            console.log("체육관 삭제 : " , response.data);
            
            return response.data;
        } catch (error) {
            console.log("체육관 삭제 실패 : " + error);
        }
    }
};