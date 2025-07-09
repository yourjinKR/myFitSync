import axios from "axios";

/** 개인정보, 신체정보 */
export const getMemberTotalData = async () => {
    try {
        const response = await axios.get(
            '/member/getMemberInfoWithBody',
            { withCredentials: true }
        );

        if (response.data) {
            console.log("Member data fetched successfully:", response.data);
            return response.data;
        } else {
            throw new Error(response.data);
        }
    } catch (error) {
        console.error("Error fetching member data:", error);
        throw error;
    }
}