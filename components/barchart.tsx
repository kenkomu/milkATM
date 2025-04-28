// /home/ken/Projects/milkatm/components/barchart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: any[];
  xAxisKey: string;
  barKey: string;
  barColor?: string;
  width?: number | string;
  height?: number | string;
  barSize?: number;
}

export const CustomBarChart = ({
  data,
  xAxisKey,
  barKey,
  barColor = '#8884d8',
  width = '100%',
  height = 300,
  barSize = 30,
}: BarChartProps) => {
  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={data}>
        <XAxis dataKey={xAxisKey} stroke={barColor} />
        <YAxis
          tickFormatter={(value) => new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'KES',
            maximumFractionDigits: 0
          }).format(value)}
        />
        <Tooltip
          formatter={(value) => [
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'KES'
            }).format(Number(value)),
            'Sales'
          ]}
          labelFormatter={(label) => `Month: ${label}`} // or "Month: " for monthly
        />
        <Legend
          width={100}
          wrapperStyle={{
            top: 40,
            right: 20,
            backgroundColor: '#f5f5f5',
            border: '1px solid #d5d5d5',
            borderRadius: 3,
            lineHeight: '40px'
          }}
        />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <Bar dataKey={barKey} fill={barColor} barSize={barSize} />
      </BarChart>
    </ResponsiveContainer>
  );
};