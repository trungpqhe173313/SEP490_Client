"use client";
import { Card, CardContent } from "@mui/material";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const inventoryData = [
  { month: "Tháng 1", stock: 4200, orders: 2400 },
  { month: "Tháng 2", stock: 3800, orders: 2800 },
  { month: "Tháng 3", stock: 4500, orders: 2200 },
  { month: "Tháng 4", stock: 4100, orders: 2600 },
  { month: "Tháng 5", stock: 4800, orders: 2900 },
  { month: "Tháng 6", stock: 4400, orders: 2500 }
];

const efficiencyData = [
  { name: "Quý 1", efficiency: 85 },
  { name: "Quý 2", efficiency: 88 },
  { name: "Quý 3", efficiency: 92 },
  { name: "Quý 4", efficiency: 95 }
];

const distributionData = [
  { name: "Nhà kho A", value: 400 },
  { name: "Nhà kho B", value: 300 },
  { name: "Nhà kho C", value: 200 },
  { name: "Nhà kho D", value: 100 }
];

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#64B5F6'];

const Statistic = () => {
  return (
    <section className="py-24 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Thông số dữ liệu
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Đồ thị hóa khả năng lưu trữ của kho thức ăn chăn nuôi với phân tích chuyên sâu và báo cáo chi tiết
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-md border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Thống kê đơn hàng và hàng hoá</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis dataKey="month" stroke="#ddd" />
                  <YAxis stroke="#ddd" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="stock" label="Hàng hóa" name="Hàng hóa" fill={COLORS[0]} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="orders" label="Đơn hàng" name="Đơn hàng" fill={COLORS[1]} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Hiệu suất vận hành</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={efficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis dataKey="name" stroke="#ddd" />
                  <YAxis stroke="#ddd" domain={[80, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke={COLORS[2]} 
                    strokeWidth={3}
                    dot={{ fill: COLORS[2], r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md border border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Phân bố hàng hóa giữa các nhà kho</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Statistic;

