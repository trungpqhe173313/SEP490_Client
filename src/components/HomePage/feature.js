import { Card, CardContent } from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import BarChartIcon from "@mui/icons-material/BarChart";
import BoltIcon from "@mui/icons-material/Bolt";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import SecurityIcon from "@mui/icons-material/Security";

const features = [
	{
		icon: InventoryIcon,
		title: "Theo dõi hàng tồn kho theo thời gian thực",
		description:
			"Theo dõi mức tồn kho nguyên liệu của bạn trong thời gian thực với các cảnh báo và thông báo tự động khi lượng tồn thấp.",
	},
	{
		icon: BarChartIcon,
		title: "Phân tích nâng cao",
		description:
			"Nhận thông tin chi tiết với các bảng điều khiển phân tích mạnh mẽ hiển thị xu hướng, dự báo và cơ hội tối ưu hóa.",
	},
	{
		icon: BoltIcon,
		title: "Tự động hóa quy trình làm việc",
		description:
			"Tối ưu hoạt động với các quy trình đặt hàng, nhận hàng và phân bổ được tự động hóa.",
	},
	{
		icon: AssignmentTurnedInIcon,
		title: "Báo cáo tuân thủ",
		description:
			"Tạo các báo cáo toàn diện phục vụ yêu cầu tuân thủ quy định và đảm bảo chất lượng.",
	},
	{
		icon: AccountTreeIcon,
		title: "Quản lý đa kho",
		description:
			"Quản lý hàng tồn kho tại nhiều kho và địa điểm khác nhau trên cùng một nền tảng hợp nhất.",
	},
	{
		icon: SecurityIcon,
		title: "Bảo mật & Kiểm soát truy cập",
		description:
			"Bảo mật cấp doanh nghiệp với kiểm soát truy cập dựa trên vai trò và nhật ký kiểm tra đầy đủ.",
	},
];

const Feature = () => {
	return (
		<section className="py-24 bg-gray-50">
			<div className="max-w-6xl mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
						Các tính năng mạnh mẽ cho vận hành hiện đại
					</h2>
					<p className="text-lg text-gray-500 max-w-xl mx-auto">
						Mọi công cụ bạn cần để quản lý nguyên liệu hiệu quả và chính xác
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => {
						const Icon = feature.icon;
						return (
							<Card
								key={index}
								className="bg-green-50 shadow-md border border-gray-200 transition-all"
							>
								<CardContent className="pt-6">
									<div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
										<Icon className="text-white" fontSize="medium" />
									</div>
									<h3 className="text-lg font-semibold mb-2">
										{feature.title}
									</h3>
									<p className="text-gray-600">
										{feature.description}
									</p>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default Feature;
