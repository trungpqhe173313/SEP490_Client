import { Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/herowarehouse.jpg"
          alt="Modern warehouse with inventory management" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gray-600" style={{opacity: 0.7}} />
      </div>
      {/* Content */}
      <div className="relative z-10 px-4 py-8 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Quản lý nguyên liệu thông minh
        </h1>
        <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl mx-auto">
          Tối ưu hàng tồn kho, hợp lý hóa quy trình và nâng cao hiệu suất với hệ thống quản lý nguyên liệu thông minh của chúng tôi
        </p>
        <div className="flex flex-row gap-4 justify-center pt-8">
          <Button 
            variant="contained" 
            size="large" 
            endIcon={<ArrowForwardIcon />}
            className="!text-lg !px-8 !py-3 !bg-green-600 !text-white hover:!bg-green-800"
          >
            Bắt đầu ngay
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            className="!text-lg !px-8 !py-3 !border-white !text-white hover:!bg-white/10 hover:!border-white"
          >
            Xem Demo
          </Button>
        </div>
      </div>
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-blue-100 rounded-xl flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-green-100 rounded" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
