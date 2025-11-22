'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JournalTemplate } from '@/types/journal';
import { useAuth } from '@/hooks/auth/use-auth';
import { supabase } from '@/services/supabase/client';
import Image from 'next/image';

interface TemplateCardsProps {
  onTemplateSelect?: (template: JournalTemplate) => void;
}

export function TemplateCards({ onTemplateSelect }: TemplateCardsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<JournalTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<JournalTemplate | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    async function loadTemplates() {
      if (!user?.id) return;

      const { data } = await supabase
        .from('templates')
        .select('profile_id, name, content, cover_image')
        .in('name', ['Morning Intentions', 'Evening Wind-Down'])
        .order('name', { ascending: false })
        .limit(2);

      const formattedTemplates: JournalTemplate[] = (data || []).map((template: any) => ({
        id: encodeURIComponent(template.name),
        profile_id: template.profile_id,
        name: template.name,
        content: template.content,
        cover_image: template.cover_image
      }));

      setTemplates(formattedTemplates);
      setIsLoading(false);
    }
    
    loadTemplates();
  }, [user?.id]);

  const handleCardClick = (template: JournalTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    } else {
      const params = new URLSearchParams({
        templateName: template.name,
        customContent: template.content || ''
      });
      router.push(`/journal/new?${params.toString()}`);
    }
  };

  const handleSettingsClick = (e: React.MouseEvent, template: JournalTemplate) => {
    e.stopPropagation();
    setEditingTemplate(template);
    setEditContent(template.content || '');
  };

  const handleSave = async () => {
    if (!editingTemplate) return;
    // Update template content logic here
    setEditingTemplate(null);
    setEditContent('');
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mx-auto">
        {[1, 2].map((index) => (
        <div key={index} className="bg-white rounded-xl overflow-hidden">
          <div className="bg-gray-200 animate-pulse h-16 sm:h-20 w-full" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mx-auto">
      {templates.map((template) => (
        <div
          key={template.id}
          onClick={() => handleCardClick(template)}
          className="group relative overflow-hidden rounded-xl cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md bg-white"
        >
          {/* Cover Image */}
          <div className="relative h-16 sm:h-20 w-full">
            {template.cover_image ? (
              <Image
                src={template.cover_image}
                alt={template.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
            )}
            
            {/* Small Settings icon */}
            <div className="absolute top-3 right-3">
              {template.name !== 'Viết tự do' && (
                <button
                  onClick={(e) => handleSettingsClick(e, template)}
                  className="w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/90"
                >
                  <svg className="w-3 h-3 text-gray-600" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Text Content Below */}
          <div className="p-3">
            <h3 className="text-sm text-gray-800 mb-1">
              {template.name}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {template.name === 'Morning Intentions' 
                ? 'Stay focused, get into the right mindset, and make progress with clarity.'
                : 'Track your progress, focus on being benevolent, and make tomorrow better.'
              }
            </p>
          </div>
        </div>
      ))}
      
      {/* Edit Dialog */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex">
            {/* Left side */}
            <div className="w-1/2 p-6 border-r">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full mb-4">PREMIUM FEATURE</span>
                <h2 className="text-2xl font-bold mb-2">{editingTemplate.name}</h2>
                <p className="text-gray-600 text-sm">
                  Customize the framework as needed by changing, adding, or removing questions.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            {/* Right side */}
            <div className="w-1/2 p-6">
              <div className="space-y-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="What is on your mind right now that you need to clear before starting?"
                  className="w-full h-20 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  placeholder="What is the one thing you want to get done today, and why is it important?"
                  className="w-full h-20 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  placeholder="What is the emotional state or mindset you want to embody today?"
                  className="w-full h-20 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="text-blue-600 text-sm hover:text-blue-700">+ Add question</button>
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => setEditingTemplate(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}