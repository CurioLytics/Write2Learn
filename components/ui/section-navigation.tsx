'use client';

import { useEffect, useState } from 'react';

interface Section {
    id: string;
    label: string;
}

interface SectionNavigationProps {
    sections: Section[];
}

/**
 * Section navigation component that shows which section is currently in view
 * Displays on the right side with active section highlighted
 */
export function SectionNavigation({ sections }: SectionNavigationProps) {
    const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px', // Trigger when section is in middle of viewport
            threshold: 0,
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe all sections
        sections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            observer.disconnect();
        };
    }, [sections]);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
            <ul className="space-y-3">
                {sections.map((section) => {
                    const isActive = activeSection === section.id;
                    return (
                        <li key={section.id}>
                            <button
                                onClick={() => scrollToSection(section.id)}
                                className={`flex items-center gap-3 group transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                                    }`}
                            >
                                {/* Dot indicator */}
                                <span
                                    className={`w-3 h-3 rounded-full border-2 transition-all duration-200 ${isActive
                                            ? 'bg-blue-600 border-blue-600 scale-125'
                                            : 'bg-transparent border-gray-400'
                                        }`}
                                />

                                {/* Label */}
                                <span
                                    className={`text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'text-blue-600'
                                            : 'text-gray-600'
                                        }`}
                                >
                                    {section.label}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
