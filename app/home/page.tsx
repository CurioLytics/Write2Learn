'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TemplateCards } from '@/components/journal/template-cards';
import { RoleplayCard } from '@/components/roleplay/roleplay-card';
import { FlashcardCard } from '@/app/vocab/components/Flashcard';
import { ReviewControls } from '@/app/vocab/components/ReviewControls';
import { ProgressBar } from '@/app/vocab/components/ProgressBar';
import { supabase } from '@/services/supabase/client';

interface RoleplayScenario {
    id: string; 
    name: string;
    context: string;
    image: string | null;
}

interface DueFlashcard {
    vocabulary_id: string;
    word: string;
    meaning: string;
    example?: string;
    next_review_at: string;
    vocabulary_set: {
        title: string;
    };
}

function DueFlashcards() {
    const { user } = useAuth();
    const [flashcards, setFlashcards] = useState<DueFlashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);

    useEffect(() => {
        async function fetchDueFlashcards() {
            if (!user?.id) {
                setIsLoading(false);
                return;
            }

            try {
                const now = new Date().toISOString();
                const { data, error } = await supabase
                    .from('vocabulary_status')
                    .select(`
                        vocabulary_id,
                        next_review_at,
                        vocabulary!inner(
                            word,
                            meaning,
                            example,
                            vocabulary_set!inner(
                                title,
                                profile_id
                            )
                        )
                    `)
                    .eq('vocabulary.vocabulary_set.profile_id', user.id)
                    .lte('next_review_at', now)
                    .order('next_review_at', { ascending: true })
                    .limit(20);

                if (error) {
                    console.error('Error fetching flashcards:', error);
                } else {
                    const formatted = (data || []).map((item: any) => ({
                        vocabulary_id: item.vocabulary_id,
                        word: item.vocabulary.word,
                        meaning: item.vocabulary.meaning,
                        example: item.vocabulary.example,
                        next_review_at: item.next_review_at,
                        vocabulary_set: {
                            title: item.vocabulary.vocabulary_set.title
                        }
                    }));
                    setFlashcards(formatted);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDueFlashcards();
    }, [user?.id]);

    const handleRating = async (rating: string) => {
        const currentCard = flashcards[currentIndex];
        if (!currentCard || isSubmitting) return;

        // Immediately move to next card for smooth UX
        if (currentIndex + 1 < flashcards.length) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            // All cards completed, show completion state immediately
            setCurrentIndex(0);
            setIsFlipped(false);
            // Optionally refresh to get new due cards after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }

        // Process rating in background (fire-and-forget)
        const ratingMap: Record<string, number> = {
            'again': 1,
            'hard': 2,
            'good': 3,
            'easy': 4
        };

        // Background API call - don't await
        fetch('/api/vocabulary/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                vocabulary_id: currentCard.vocabulary_id, 
                rating: ratingMap[rating] 
            }),
        }).catch(error => {
            console.error('Background review update failed:', error);
            // Could show a toast notification if needed, but don't block UX
        });
    };

    const handleShuffle = () => {
        setIsShuffled(!isShuffled);
        setIsFlipped(false); // Reset flip state when shuffling
    };

    // Get the front and back content based on shuffle state
    const getFrontContent = (card: DueFlashcard) => isShuffled ? card.meaning : card.word;
    const getBackContent = (card: DueFlashcard) => isShuffled ? card.word : `${card.meaning}${
        card.example ? `\n\n"${card.example}"` : ''
    }`;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="text-gray-600">Đang tải thẻ từ vựng...</div>
            </div>
        );
    }

    if (flashcards.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold mb-2">Tuyệt vời!</h3>
                <p className="text-gray-600">Không có từ vựng nào cần ôn tập ngay bây giờ.</p>
                <button 
                    onClick={() => window.location.href = '/vocab'}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Xem tất cả từ vựng
                </button>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];
    const progress = ((currentIndex + 1) / flashcards.length) * 100;

    return (
        <div className="flex flex-col items-center space-y-6 w-full max-w-md mx-auto">
            {/* Progress */}
            <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Tiến độ</span>
                    <span className="text-sm font-medium">{currentIndex + 1}/{flashcards.length}</span>
                </div>
                <ProgressBar value={progress} />
            </div>

            {/* Set Info */}
            <div className="text-center">
                <p className="text-sm text-gray-500">{currentCard.vocabulary_set.title}</p>
            </div>

            {/* Shuffle button */}
            <div className="flex justify-center">
                <button
                    onClick={handleShuffle}
                    className="p-3 text-gray-600 hover:text-blue-600 transition-colors"
                    aria-label="Shuffle front and back"
                    title="Exchange front and back content"
                >
                    🔀
                </button>
            </div>

            {/* Flashcard */}
            <FlashcardCard
                front={getFrontContent(currentCard)}
                back={getBackContent(currentCard)}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(!isFlipped)}
            />

            {/* Review Controls */}
            {isFlipped && (
                <div className="flex flex-col items-center">
                    <ReviewControls onRate={handleRating} />
                </div>
            )}

            {/* Instructions */}
            {!isFlipped && (
                <p className="text-sm text-gray-500 text-center max-w-md">
                </p>
            )}
        </div>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const { user } = useAuth();
    
    // Sử dụng kiểu dữ liệu đã định nghĩa
    const [scenarios, setScenarios] = useState<RoleplayScenario[]>([]); 
    const [loading, setLoading] = useState(true);

    // Updated auto-scroll refs and state for 3 sections
    const journalSectionRef = useRef<HTMLElement>(null);
    const roleplaySectionRef = useRef<HTMLElement>(null);
    const vocabSectionRef = useRef<HTMLElement>(null);
    const [currentSection, setCurrentSection] = useState<'journal' | 'roleplay' | 'vocab'>('journal');
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);

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

    // Updated auto-scroll behavior for 3 sections
    useEffect(() => {
        const handleScroll = () => {
            if (isAutoScrolling) return;

            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const sectionThreshold = windowHeight * 0.5;

            if (scrollY < sectionThreshold && currentSection !== 'journal') {
                setIsAutoScrolling(true);
                setCurrentSection('journal');
                setTimeout(() => setIsAutoScrolling(false), 1000);
            } else if (scrollY >= sectionThreshold && scrollY < sectionThreshold * 2 && currentSection !== 'roleplay') {
                setIsAutoScrolling(true);
                setCurrentSection('roleplay');
                setTimeout(() => setIsAutoScrolling(false), 1000);
            } else if (scrollY >= sectionThreshold * 2 && currentSection !== 'vocab') {
                setIsAutoScrolling(true);
                setCurrentSection('vocab');
                setTimeout(() => setIsAutoScrolling(false), 1000);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentSection, isAutoScrolling]);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="scroll-smooth">
            {/* SECTION 1 – NHẬT KÝ */}
            <section ref={journalSectionRef} id="journal" className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-blue-50/40 px-4">
                <div className="w-full max-w-2xl mx-auto">
                    <TemplateCards />
                    <div className="text-center mt-6">
                        <Button
                            onClick={() => router.push('/journal/new')}
                            variant='outline'
                            className="relative overflow-hidden bg-white border-2 border-gray-900 text-gray-900 hover:text-white transition-colors duration-500 group"
                        >
                            <span className="absolute inset-0 bg-gray-900 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                            <span className="relative z-10">Free Write Now</span>
                        </Button>
                    </div>
                </div>
                <button
                    aria-label="Scroll down to roleplay section"
                    onClick={() => scrollTo('roleplay')}
                    className="mt-6 mx-auto flex items-center justify-center p-3 rounded-full bg-white/70 shadow hover:bg-white transition-all animate-bounce"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-800">
                        <path d="M12 5v14" />
                        <path d="m19 12-7 7-7-7" />
                    </svg>
                </button>
            </section>

            {/* SECTION 2 – HỘI THOẠI */}
            <section ref={roleplaySectionRef} id="roleplay" className="h-screen flex flex-col justify-center bg-gradient-to-b from-blue-50/40 to-green-50/40 py-8">
                <div className="max-w-6xl mx-auto px-4 lg:px-6 xl:px-8 space-y-6 lg:space-y-8 w-full">
                    <div className="bg-white shadow-sm rounded-2xl p-4 lg:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Hôm nay, bạn muốn đóng vai ai?</h2>
                            <Link href="/roleplay" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                Xem thêm
                            </Link>
                        </div>

                        <div className="relative -mx-4 lg:mx-0">
                            <div 
                                className="overflow-x-auto scrollbar-hide scroll-smooth px-4 lg:px-0"
                                onMouseDown={(e) => {
                                    const slider = e.currentTarget;
                                    let isDown = true;
                                    let startX = e.pageX - slider.offsetLeft;
                                    let scrollLeft = slider.scrollLeft;
                                    
                                    slider.style.cursor = 'grabbing';
                                    
                                    const handleMouseMove = (e: MouseEvent) => {
                                        if (!isDown) return;
                                        e.preventDefault();
                                        const x = e.pageX - slider.offsetLeft;
                                        const walk = (x - startX) * 2;
                                        slider.scrollLeft = scrollLeft - walk;
                                    };
                                    
                                    const handleMouseUp = () => {
                                        isDown = false;
                                        slider.style.cursor = 'grab';
                                        document.removeEventListener('mousemove', handleMouseMove);
                                        document.removeEventListener('mouseup', handleMouseUp);
                                    };
                                    
                                    document.addEventListener('mousemove', handleMouseMove);
                                    document.addEventListener('mouseup', handleMouseUp);
                                }}
                                style={{ cursor: 'grab' }}
                            >
                                <div className="flex gap-4 pb-2">
                                    {loading ? (
                                        Array.from({ length: 3 }).map((_, index) => (
                                            <div key={index} className="w-52 h-32 bg-gray-200 animate-pulse rounded-lg flex-shrink-0" />
                                        ))
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
                                        <div className="w-full text-center py-8 text-gray-500">
                                            <p>Chưa có hội thoại nào được thêm.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Single navigation arrow */}
                    <div className="flex justify-center">
                        <button
                            aria-label="Cuộn xuống phần từ vựng"
                            onClick={() => scrollTo('vocab')}
                            className="p-3 rounded-full bg-white/70 shadow hover:bg-white transition-all animate-bounce"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-800">
                                <path d="M12 5v14" />
                                <path d="m19 12-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* SECTION 3 – TỪ VỰNG */}
            <section ref={vocabSectionRef} id="vocab" className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-green-50/40 to-white py-8">
                <div className="max-w-6xl mx-auto px-4 lg:px-6 xl:px-8 space-y-6 lg:space-y-8">
                    <div className="bg-white shadow-sm rounded-2xl p-4 lg:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                            <h2 className="text-lg lg:text-xl font-semibold text-gray-900"> 20 từ sắp quên</h2>
                        </div>
                        <DueFlashcards />
                    </div>

                    <div className="flex justify-center">
                        <button
                            aria-label="Cuộn lên phần nhật ký"
                            onClick={() => scrollTo('journal')}
                            className="mt-4 p-3 rounded-full bg-white/70 shadow hover:bg-white transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-800 rotate-180">
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