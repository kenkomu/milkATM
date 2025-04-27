// components/linechart.tsx
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  width?: number | string;
  height?: number | string;
  data: any[];
  xAxisKey: string;
  dataKey: string;
  color?: string;
}

export const CustomLineChart = ({ 
  width = '100%', 
  height = 300, 
  data, 
  xAxisKey,
  dataKey,
  color = '#8884d8'
}: LineChartProps) => {
  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <Line type="monotone" dataKey={dataKey} stroke={color} />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
      </LineChart>
    </ResponsiveContainer>
  );
};