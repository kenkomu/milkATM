// app/utils/transform-payments.ts

// Define a Payment interface for better type safety
interface Payment {
  timestamp: string | number | Date;
  amount: number;
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
    result[index].sales += payment.amount;  // Aggregating the sales
  });

  // Ensure the return type is strictly typed for { day: string; sales: number }
  return result.map(item => ({
    day: item.day || item.month, // This ensures it has a day/month property
    sales: item.sales
  }));
};
// Use the generic function for weekly data
export const transformPaymentsToWeeklyData = (payments: Payment[]) => {
  return groupPaymentsByTimePeriod(payments, 'day');
};

// Use the generic function for monthly data
export const transformPaymentsToMonthlyData = (payments: Payment[]) => {
  return groupPaymentsByTimePeriod(payments, 'month');
};
