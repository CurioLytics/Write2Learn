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
        <Button
          variant={selectedCategory === 'all' ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All Categories
        </Button>
        {categories.map(category => (
          <Button
            key={category.name}
            variant={selectedCategory === category.name ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.name)}
            className="capitalize"
          >
            {category.name}
          </Button>
        ))}
      </div>
      
      {/* Framework Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFrameworks.map(framework => (
          <Card 
            key={framework.name} 
            className="cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => {
              setSelectedFramework(framework);
              setIsDialogOpen(true);
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{framework.name}</CardTitle>
                  <p className="text-sm text-gray-500">{framework.category}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{framework.content}</p>
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