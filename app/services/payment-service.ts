import axios from 'axios';

const API_BASE_URL = '/api/payments';

interface Payment {
  transaction_id: string;
  amount: number;
  phone: string;
  fname: string;
  mname: string;
  lname: string;
  timestamp: string;
}

export const fetchAllPayments = async (): Promise<Payment[]> => {
  try {
    const response = await axios.get(API_BASE_URL, {
      timeout: 10000, // Increased timeout to 10 seconds
      timeoutErrorMessage: 'Payment data request took too long',
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout:', error.message);
        throw new Error('Request timeout. Please try again later.');
      } else if (error.response) {
        console.error('Server error:', error.response.status, error.response.data);
        throw new Error('Server error occurred');
      } else {
        console.error('Network error:', error.message);
        throw new Error('Network error. Please check your connection.');
      }
    }
    console.error('Unexpected error:', error);
    throw new Error('An unexpected error occurred');
  }
};