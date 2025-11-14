'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/use-auth';
import { TemplateCards } from '@/components/journal/template-cards';
import { Quote } from '@/components/ui/quote';
import { RoleplayCard } from '@/components/roleplay/roleplay-card';
import { QuickReview } from '@/components/flashcards/quick-review';
// Giả sử đường dẫn này đúng, nếu không bạn cần điều chỉnh
import { supabase } from '@/services/supabase/client'; 

// Định nghĩa kiểu dữ liệu cho kịch bản nhập vai dựa trên cột Supabase
interface RoleplayScenario {
    id: string; 
    name: string;      // Tên cột mới: 'name'
    context: string;   // Tên cột mới: 'context'
    image: string | null; // Tên cột mới: 'image'
}

const quotes = [
    { text: 'Tâm hồn ta được nhuộm bởi màu sắc của những suy nghĩ chính mình.', author: 'Marcus Aurelius' },
    { text: 'Tâm trí sẽ trở thành hình dạng của những gì nó thường xuyên nghĩ đến.', author: 'Marcus Aurelius' },
    { text: 'Càng viết nhiều, bạn càng hiểu rõ điều mình nghĩ.', author: 'Marty Rubin' },
    { text: 'Muốn trở thành người viết, hãy đọc thật nhiều và viết thật nhiều.', author: 'Stephen King' },
];

export default function DashboardPage() {
    const { user } = useAuth();
    const today = new Date();
    const quote = quotes[today.getDate() % quotes.length];
    
    // Sử dụng kiểu dữ liệu đã định nghĩa
    const [scenarios, setScenarios] = useState<RoleplayScenario[]>([]); 
    const [loading, setLoading] = useState(true);

    // 🧠 Fetch roleplay từ Supabase
    useEffect(() => {
        async function fetchScenarios() {
            const { data, error } = await supabase
                .from('roleplays') // Tên bảng
                // ❗ Đã điều chỉnh tên cột theo schema bạn cung cấp
                .select('id, name, context, image') 
                .order('created_at', { ascending: false })
                .limit(3);

            if (error) {
                console.error('❌ Lỗi khi tải roleplay:', error.message);
                setScenarios([]); // Đặt về mảng rỗng khi có lỗi
            } else {
                // Ép kiểu dữ liệu nếu cần
                setScenarios(data as RoleplayScenario[]);
            }
            setLoading(false);
        }

        fetchScenarios();
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="scroll-smooth">
            {/* SECTION 1 – VIẾT (Giữ nguyên) */}
            <section id="viet" className="h-screen flex flex-col justify-center bg-gradient-to-b from-gray-50 to-blue-50/40">
                <div className="text-center space-y-6 px-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Chào bạn, {user?.email?.split('@')[0] || 'người học tiếng Anh'}
                    </h1>
                    <p className="text-gray-600 text-lg">Dành chút thời gian để viết và lắng nghe chính mình hôm nay.</p>

                    <div className="max-w-3xl mx-auto">
                        <TemplateCards />
                    </div>

                    <Quote text={quote.text} author={quote.author} />

                    <button
                        aria-label="Cuộn xuống phần học"
                        onClick={() => scrollTo('hoc')}
                        className="mt-8 mx-auto flex items-center justify-center p-3 rounded-full bg-white/70 shadow hover:bg-white transition-all animate-bounce"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                            <path d="M12 5v14" />
                            <path d="m19 12-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </section>

            {/* SECTION 2 – HỌC */}
            <section id="hoc" className="h-screen flex flex-col justify-center bg-gradient-to-b from-blue-50/40 to-white">
                <div className="max-w-6xl mx-auto px-4 space-y-8">
                    {/* Roleplay Section */}
                    <div className="bg-white shadow rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">🎭 Luyện hội thoại hôm nay</h2>
                            <Link href="/roleplay" className="text-blue-600 text-sm hover:underline">
                                Xem tất cả
                            </Link>
                        </div>

                        <div className="overflow-x-auto scrollbar-hide">
                            <div className="flex gap-4 pb-2 cursor-grab active:cursor-grabbing"
                                 onMouseDown={(e) => {
                                   const slider = e.currentTarget.parentElement!;
                                   let isDown = true;
                                   let startX = e.pageX - slider.offsetLeft;
                                   let scrollLeft = slider.scrollLeft;
                                   
                                   const handleMouseMove = (e: MouseEvent) => {
                                     if (!isDown) return;
                                     e.preventDefault();
                                     const x = e.pageX - slider.offsetLeft;
                                     const walk = (x - startX) * 2;
                                     slider.scrollLeft = scrollLeft - walk;
                                   };
                                   
                                   const handleMouseUp = () => {
                                     isDown = false;
                                     document.removeEventListener('mousemove', handleMouseMove);
                                     document.removeEventListener('mouseup', handleMouseUp);
                                   };
                                   
                                   document.addEventListener('mousemove', handleMouseMove);
                                   document.addEventListener('mouseup', handleMouseUp);
                                 }}>
                                {loading ? (
                                    <p className="text-gray-500 text-center w-full">Đang tải dữ liệu hội thoại...</p>
                                ) : scenarios.length > 0 ? (
                                    scenarios.map((s) => (
                                        <div key={s.id} className="flex-shrink-0">
                                            <RoleplayCard
                                                id={s.id}
                                                title={s.name}
                                                description={s.context}
                                                imageUrl={s.image || ''}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center w-full">Chưa có hội thoại nào được thêm.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Review */}
                    <div className="bg-white shadow rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">📘 Ôn từ vựng nhanh</h2>
                            <Link href="/vocab" className="text-blue-600 text-sm hover:underline">
                                Tới Vocab Hub
                            </Link>
                        </div>
                        <QuickReview count={5} />
                    </div>

                    <div className="flex justify-center">
                        <button
                            aria-label="Cuộn lên phần viết"
                            onClick={() => scrollTo('viet')}
                            className="mt-4 p-3 rounded-full bg-white/70 shadow hover:bg-white transition-all animate-bounce"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 rotate-180">
                                <path d="M12 5v14" />
                                <path d="m19 12-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}