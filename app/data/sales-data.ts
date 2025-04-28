// app/data/sales-data.ts
import { fetchAllPayments } from '../services/payment-service';

// Define types for payment and chart data
interface Payment {
  timestamp: string;
  amount: number | string;
}

interface DayData {
  day: string;
  sales: number;
}

interface MonthData {
  month: string;
  sales: number;
}

// Helper function to group payments by day of week
const groupByDayOfWeek = (payments: Payment[]): DayData[] => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = days.map(day => ({ day, sales: 0 }));
  
  payments.forEach(payment => {
    const date = new Date(payment.timestamp);
    const dayIndex = date.getDay(); // 0 (Sun) to 6 (Sat)
    
    // Check if payment.amount is a string and parse accordingly
    if (typeof payment.amount === 'string') {
      // Split the string into individual numbers
      const amounts = payment.amount.match(/[\d.]+/g);
      if (amounts) {
        const total = amounts.reduce((sum: number, val: string) => sum + parseFloat(val), 0);
        result[dayIndex].sales += total;
      }
    } else if (typeof payment.amount === 'number') {
      result[dayIndex].sales += payment.amount;
    }
  });
  
  return result;
};

// Helper function to group payments by month
const groupByMonth = (payments: Payment[]): MonthData[] => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const result = months.map(month => ({ month, sales: 0 }));
  
  payments.forEach(payment => {
    const date = new Date(payment.timestamp);
    const monthIndex = date.getMonth(); // 0 (Jan) to 11 (Dec)
    
    // Handle both string and number amount types
    if (typeof payment.amount === 'string') {
      const amounts = payment.amount.match(/[\d.]+/g);
      if (amounts) {
        const total = amounts.reduce((sum: number, val: string) => sum + parseFloat(val), 0);
        result[monthIndex].sales += total;
      }
    } else {
      result[monthIndex].sales += payment.amount;
    }
  });
  
  return result;
};

// Fetch and transform payment data
export const getWeeklySalesData = async (): Promise<DayData[]> => {
  const payments = await fetchAllPayments();
  return groupByDayOfWeek(payments);
};

export const getMonthlySalesData = async (): Promise<MonthData[]> => {
  const payments = await fetchAllPayments();
  return groupByMonth(payments);
};

// Fallback static data (optional)
export const staticWeeklySalesData: DayData[] = [
  { day: "Mon", sales: 400 },
  { day: "Tue", sales: 300 },
  { day: "Wed", sales: 500 },
  { day: "Thu", sales: 700 },
  { day: "Fri", sales: 600 },
  { day: "Sat", sales: 200 },
  { day: "Sun", sales: 300 },
];

export const staticMonthlySalesData: MonthData[] = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 5000 },
  { month: "Apr", sales: 7000 },
  { month: "May", sales: 6000 },
  { month: "Jun", sales: 2000 },
  { month: "Jul", sales: 3000 },
  { month: "Aug", sales: 4000 },
  { month: "Sep", sales: 5000 },
  { month: "Oct", sales: 7000 },
  { month: "Nov", sales: 6000 },
  { month: "Dec", sales: 8000 },
];