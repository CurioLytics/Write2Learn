import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Thêm cấu hình images
  images: {
    // Thêm các tên miền bên ngoài vào mảng remotePatterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eqhldzwiymtcyxyxezos.supabase.co', // Thay thế bằng tên miền Supabase của bạn
        pathname: '/storage/v1/object/public/**', // Cho phép tải ảnh từ bất kỳ đường dẫn nào trong public storage
      },
      // Nếu bạn có các dịch vụ lưu trữ ảnh khác, hãy thêm chúng vào đây
    ],
    // HOẶC (cách cũ hơn nhưng vẫn hoạt động):
    // domains: ['eqhldzwiymtcyxyxezos.supabase.co'], 
  },
  /* config options here */
};

export default nextConfig;
