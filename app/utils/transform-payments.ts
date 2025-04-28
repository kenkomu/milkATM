// app/utils/transform-payments.ts

// Define a Payment interface for better type safety
interface Payment {
  timestamp: string | number | Date;
  amount: number;
}

// Helper function to ensure a value is a number
function ensureNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

export const groupPaymentsByTimePeriod = (payments: Payment[], period: 'day' | 'month') => {
  const labels = period === 'day' 
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']  // Days of the week
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];  // Months

  const labelKey = period === 'day' ? 'day' : 'month';

  // Initialize the result array
  const result = labels.map(label => ({ [labelKey]: label, sales: 0 }));

  payments.forEach(payment => {
    const date = new Date(payment.timestamp);
    // Get index based on period (day or month)
    const index = period === 'day' ? date.getDay() : date.getMonth();
    // Ensure payment.amount is a number
    result[index].sales += ensureNumber(payment.amount);
  });

  // Return properly formatted data
  if (period === 'day') {
    return result.map(item => ({
      day: item.day,
      sales: item.sales
    }));
  } else {
    return result.map(item => ({
      month: item.month,
      sales: item.sales
    }));
  }
};

// Transform payments to weekly data
export function transformPaymentsToWeeklyData(payments: Payment[]) {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklySales = Array(7).fill(0);

  payments.forEach(payment => {
    const date = new Date(payment.timestamp);
    const dayIndex = date.getDay(); // 0 (Sun) to 6 (Sat)
    // Ensure payment.amount is a number
    weeklySales[dayIndex] += ensureNumber(payment.amount);
  });

  return weekDays.map((day, index) => {
    const sales = weeklySales[index];
    // Ensure sales is a number before calling toFixed
    return {
      day,
      sales: typeof sales === 'number' ? sales : 0
    };
  });
}

// Transform payments to monthly data
export function transformPaymentsToMonthlyData(payments: Payment[]) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlySales = Array(12).fill(0);

  payments.forEach(payment => {
    const date = new Date(payment.timestamp);
    const monthIndex = date.getMonth();
    // Ensure payment.amount is a number
    monthlySales[monthIndex] += ensureNumber(payment.amount);
  });

  return monthNames.map((month, index) => ({
    month,
    sales: monthlySales[index]
  }));
}