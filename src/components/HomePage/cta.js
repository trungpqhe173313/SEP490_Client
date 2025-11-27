"use client";
import { Button, TextField } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useRouter } from "next/navigation";

const CallToAction = () => {
  const router = useRouter();
  return (
    <section className="py-24 bg-gradient-to-r from-green-700 to-green-400">
      <div className="max-w-6xl mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Bạn đã sẵn sàng để nâng cấp phương thức quản lý chưa? 
          </h2>
          <p className="text-lg text-green-100 mb-8 max-w-xl mx-auto">
            Hãy tham gia ngay hệ thống quản lý kho thức ăn chăn nuôi của chúng tôi.
          </p>
          <div className="flex flex-row gap-4 justify-center items-center max-w-md mx-auto my-8">
            <Button 
              variant="contained" 
              size="large"
              endIcon={<ArrowForwardIcon />}
              className="!whitespace-nowrap !px-16 !py-4 !background-primary !text-white"
              sx={{backgroundColor: "#016630"}}
              onClick={() => router.push("/login")}
            >
              Bắt đầu dùng thử
            </Button>
          </div>
          <div className="mt-12 pt-12 border-t border-blue-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-2xl font-bold text-white mb-2">500+</div>
                <div className="text-blue-100">Người dùng thường xuyên</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-2">50Tr+</div>
                <div className="text-blue-100">Hàng hóa được lưu trữ</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-2">99%</div>
                <div className="text-blue-100">Thời gian hoạt động</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-2">24/7</div>
                <div className="text-blue-100">Hỗ trợ</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
