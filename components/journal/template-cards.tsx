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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplates() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Get templates from the new templates table structure
        const { data, error: fetchError } = await supabase
          .from('templates')
          .select('profile_id, name, content, cover_image')
          .eq('profile_id', user.id)
          .in('name', ['Set the Day', 'Evening Shutdown']);

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        // Transform data to match JournalTemplate interface
        const formattedTemplates: JournalTemplate[] = (data || []).map((template: any) => ({
          id: encodeURIComponent(template.name), // Use encoded name as ID for navigation
          profile_id: template.profile_id,
          name: template.name,
          content: template.content,
          cover_image: template.cover_image
        }));

        setTemplates(formattedTemplates);
      } catch (err) {
        console.error('Error loading templates:', err);
        setError('Failed to load templates. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTemplates();
  }, [user?.id]);

  const handleCardClick = (template: JournalTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    } else {
      // Navigate to journal editor with the template content directly
      const params = new URLSearchParams({
        templateName: template.name,
        customContent: template.content || ''
      });
      router.push(`/journal/new?${params.toString()}`);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 w-full max-w-4xl mx-auto">
        {[1, 2].map((index) => (
          <div
            key={index}
            className="bg-gray-200 animate-pulse rounded-2xl h-40 sm:h-48 lg:h-52"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-red-600 underline hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No templates available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 w-full max-w-4xl mx-auto">
      {templates.map((template) => (
        <div
          key={template.id}
          onClick={() => handleCardClick(template)}
          className="group relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg card-hover"
        >
          {/* Cover Image */}
          <div className="relative h-40 sm:h-48 lg:h-52 w-full">
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
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 text-white">
              <h3 className="text-base lg:text-lg font-semibold mb-1 group-hover:text-yellow-300 transition-colors">
                {template.name}
              </h3>
              <p className="text-xs text-gray-200 opacity-90 line-clamp-2">
                {template.name === 'Set the Day' 
                  ? 'Focus and clarity for today'
                  : 'Reflect and improve tomorrow'
                }
              </p>
            </div>
            
            {/* Settings icon */}
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg 
                  className="w-4 h-4 text-white" 
                  fill="none" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 0a3 3 0 0 0 5.625 0m2.829 0a3 3 0 0 1 5.625 0m-8.457 0H12m-8.457 0a3 3 0 0 1-5.625 0m16.193 0a3 3 0 0 0-5.625 0"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}