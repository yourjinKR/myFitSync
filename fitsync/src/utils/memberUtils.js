import axios from "axios";

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