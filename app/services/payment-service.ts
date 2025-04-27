// app/services/payment-service.ts
import axios from 'axios';

const API_BASE_URL = '/api/payments'; // This will proxy through your Next.js server

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
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout');
      } else if (error.response) {
        console.error('Server error:', error.response.status, error.response.data);
      } else {
        console.error('Network error:', error.message);
      }
    } else {
      console.error('Unexpected error:', error);
    }
    return [];
  }
};