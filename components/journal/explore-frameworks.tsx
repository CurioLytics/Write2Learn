'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { frameworkService, Framework, FrameworkCategory } from '@/services/framework-service';
import { FrameworkDialog } from '@/components/journal/framework-dialog';

export function ExploreFrameworks() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [categories, setCategories] = useState<FrameworkCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [frameworksData, categoriesData] = await Promise.all([
          frameworkService.getFrameworks(),
          frameworkService.getCategories()
        ]);

        setFrameworks(frameworksData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching framework data:', err);
        setError('Failed to load frameworks');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredFrameworks = selectedCategory === 'all'
    ? frameworks
    : frameworks.filter(f => f.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
      </div>
    );
  }

  if (frameworks.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Frameworks Available</h3>
        <p className="text-gray-600">
          Frameworks will appear here once they are added to the system.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`
            px-3 py-1.5 text-sm rounded-full transition-colors capitalize
            ${selectedCategory === 'all'
              ? 'bg-[var(--primary-blue-lighter)] text-[var(--primary)] font-medium'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          All Categories
        </button>
        {categories.map(category => (
          <button
            key={category.name}
            onClick={() => setSelectedCategory(category.name)}
            className={`
              px-3 py-1.5 text-sm rounded-full transition-colors capitalize
              ${selectedCategory === category.name
                ? 'bg-[var(--primary-blue-lighter)] text-[var(--primary)] font-medium'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Framework Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFrameworks.map(framework => (
          <Card
            key={framework.name}
            className="cursor-pointer hover:shadow-md transition-shadow group bg-white shadow border-2 border-[var(--accent-blue)] rounded-2xl"
            onClick={() => {
              setSelectedFramework(framework);
              setIsDialogOpen(true);
            }}
          >
            <CardHeader className="pb-3">
              <div className="text-lg text-gray-800">{framework.name}</div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm line-clamp-2">
                {framework.description && framework.description.length > 100
                  ? `${framework.description.substring(0, 100)}...`
                  : framework.description || 'No description available'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <FrameworkDialog
        framework={selectedFramework}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}