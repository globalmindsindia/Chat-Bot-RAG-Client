import axios from "axios";

const BASE_URL = "https://api.chat.globalmindsindia.com";
// const BASE_URL = "http://localhost:5000";

export const BookingService = {
  createBooking: async (payload: any) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/meetings/create`,
        payload
      );
      return response.data;
    } catch (error: any) {
      console.error("Create booking error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create booking"
      );
    }
  },
};
