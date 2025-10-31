// app/not-found.js
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-5xl font-bold text-green-600">404 - Không tìm thấy</h1>
      <p className="mt-4 text-lg text-gray-600">
        Trang mà bạn đang có truy cập chưa có trong hệ thống của chúng tôi
      </p>
      <Link href="/" className="mt-6 text-blue-500 hover:underline">
        Về trang chủ
      </Link>
    </div>
  );
}
