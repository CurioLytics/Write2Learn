'use client';

import { useResponsive } from '@/hooks/common/use-responsive';
import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Section } from '@/components/landing/section';
import { FeatureCard } from '@/components/landing/feature-card';
import { StepItem } from '@/components/landing/step-item';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  const { isMobile } = useResponsive();

  // Pain points addressed
  const painPoints = [
    {
      icon: "😓",
      problem: "Học mãi vẫn quên từ vựng?",
      solution: "Spaced Repetition giúp ghi nhớ lâu dài"
    },
    {
      icon: "📝",
      problem: "Không biết viết gì?",
      solution: "Template sẵn theo từng chủ đề"
    },
    {
      icon: "🗣️",
      problem: "Thiếu cơ hội thực hành?",
      solution: "AI Roleplay 24/7 mọi tình huống"
    },
    {
      icon: "🎯",
      problem: "Không biết mình tiến bộ chưa?",
      solution: "Dashboard theo dõi và gợi ý bài luyện tập"
    }
  ];

  // Core features with user benefits
  const features = [
    {
      title: "Luyện giao tiếp thực tế",
      description: "Đóng vai trong các tình huống như đi du lịch, phỏng vấn, mua sắm... Luyện phản xạ nhanh như nói với người thật.",
      iconSrc: "/icons/language.svg",
      benefit: "Tự tin giao tiếp + Không còn sợ nói"
    },
    {
      title: "Viết và nhận phản hồi tức thì",
      description: "Viết về bất cứ điều gì bằng tiếng Anh. AI phản hồi ngay lập tức về ngữ pháp, từ vựng và cách diễn đạt tự nhiên hơn.",
      iconSrc: "/icons/bookmark.svg",
      benefit: "Cải thiện viết + Tích lũy từ vựng cá nhân"
    },
    {
      title: "Ôn từ vựng khoa học",
      description: "Hệ thống nhắc nhở ôn đúng lúc sắp quên. Mỗi từ gắn với ngữ cảnh và nội dung do chính bạn tạo ra.",
      iconSrc: "/icons/cap.svg",
      benefit: "Nhớ lâu + Dùng từ tự nhiên"
    },
  ];

  // How it works - simplified user flow
  const steps = [
    {
      number: 1,
      title: "Cá nhân hóa",
      description: "Chọn mục tiêu, trình độ và phong cách học phù hợp với bạn. Chỉ 2 phút!",
      iconSrc: "/icons/plus.svg",
    },
    {
      number: 2,
      title: "Nói & Viết",
      description: "Luyện giao tiếp hoặc viết mỗi ngày. AI coach cá nhân luôn sẵn sàng phản hồi.",
      iconSrc: "/icons/check.svg",
    },
    {
      number: 3,
      title: "Lưu từ hay",
      description: "Lưu từ vựng từ nội dung do chính bạn tạo ra. Học từ có ý nghĩa, nhớ lâu hơn.",
      iconSrc: "/icons/bookmark.svg",
    },
    {
      number: 4,
      title: "Ôn & Tiến bộ",
      description: "Ôn tập theo lịch thông minh. Dashboard theo dõi và gợi ý bài luyện tập.",
      iconSrc: "/icons/cap.svg",
    },
  ];

  // Footer links
  const footerLinks = [
    { text: "Đăng nhập", href: "/auth" },
    { text: "Đăng ký", href: "/auth?mode=signup" },
    { text: "Quyền riêng tư", href: "#" },
    { text: "Điều khoản", href: "#" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <Header
        logoSrc="/images/logo.png"
        logoText="W2L"
        buttonText="Bắt đầu hành trình của bạn"
        buttonLink="/auth?mode=signup"
      />

      {/* Hero Section */}
      <Hero
        title={
          <>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Write your Thoughts,</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Learn your Words</span>
          </>
        }
        subtitle="Luyện giao tiếp, viết và ôn từ vựng — tất cả được cá nhân hóa với AI"
        description="Write2Learn biến mỗi lời nói và dòng chữ của bạn thành bài học tiếng Anh thực tế nhất."
        buttonText="Bắt đầu hành trình của bạn"
        buttonLink="/auth?mode=signup"
      />

      {/* Pain Points Section */}
      <Section
        title={<>Bạn có đang gặp những khó khăn này?</>}
        bgColor="bg-gray-50"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {painPoints.map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.problem}</h3>
                  <p className="text-sm text-blue-600">✓ {item.solution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Features Section */}
      <Section
        title={<>Ba cách học hiệu quả trong một ứng dụng</>}
        bgColor="bg-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col">
              <FeatureCard
                title={feature.title}
                description={feature.description}
                iconSrc={feature.iconSrc}
              />
              <div className="mt-3 px-4">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  <span>🎯</span>
                  <span>{feature.benefit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* How It Works Section */}
      <Section
        title={<>Hành trình học của bạn với <span className="text-black">W</span><span className="bg-gradient-to-b from-black from-50% to-blue-600 to-50% bg-clip-text text-transparent">2</span><span className="text-blue-600">L</span></>}
        bgColor="bg-blue-50"
      >
        <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8">
          {steps.map((step, index) => (
            <StepItem
              key={index}
              number={step.number}
              title={step.title}
              description={step.description}
              iconSrc={step.iconSrc}
            />
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section
        title={<>Sẵn sàng bắt đầu?</>}
        bgColor="bg-gradient-to-br from-blue-600 to-purple-600"
      >
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xl text-white mb-8">
            Tham gia ngay hôm nay và trải nghiệm cách học tiếng Anh khác biệt —
            được cá nhân hóa hoàn toàn cho bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/auth?mode=signup"
              className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
            >
              Bắt đầu miễn phí
            </a>
            <a
              href="/auth"
              className="text-white font-medium px-8 py-4 rounded-2xl border-2 border-white hover:bg-white/10 transition-all"
            >
              Đã có tài khoản? Đăng nhập
            </a>
          </div>
          <p className="text-sm text-white/80 mt-6">
            ✨ Không cần thẻ tín dụng • 🚀 Thiết lập trong 2 phút
          </p>
        </div>
      </Section>

      {/* Footer */}
      <Footer
        logoSrc="/images/logo.png"
        logoText="Viết để Học"
        links={footerLinks}
      />
    </div>
  );
}