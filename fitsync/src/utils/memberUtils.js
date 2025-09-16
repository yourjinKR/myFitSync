import axios from "axios";

/** 개인정보, 신체정보 */
export const getMemberTotalData = async () => {
    try {
        const response = await axios.get(
            '/member/info/all',
            { withCredentials: true }
        );

        if (response.data) {
            return response.data;
        } else {
            throw new Error(response.data);
        }
    } catch (error) {
        console.error("멤버 정보 가져오기 오류 :", error);
        throw error;
    }
}