import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Lightbulb, Target, Users } from 'lucide-react';

interface Framework {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  icon: React.ReactNode;
}

const frameworks: Framework[] = [
  {
    id: 'reflection',
    title: 'Daily Reflection Framework',
    description: 'Structure your thoughts with guided reflection prompts',
    category: 'Personal Growth',
    tags: ['reflection', 'daily', 'mindfulness'],
    icon: <Lightbulb className="h-5 w-5" />
  },
  {
    id: 'goal-setting',
    title: 'Goal Setting Framework',
    description: 'Track your English learning goals and milestones',
    category: 'Goal Planning',
    tags: ['goals', 'progress', 'planning'],
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 'conversation',
    title: 'Conversation Practice Log',
    description: 'Document your speaking practice and conversations',
    category: 'Speaking Practice',
    tags: ['speaking', 'conversation', 'practice'],
    icon: <Users className="h-5 w-5" />
  },
  {
    id: 'vocabulary',
    title: 'Vocabulary Learning Framework',
    description: 'Track new words and phrases in context',
    category: 'Vocabulary Building',
    tags: ['vocabulary', 'words', 'learning'],
    icon: <BookOpen className="h-5 w-5" />
  }
];

export function ExploreFrameworks() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = ['all', ...new Set(frameworks.map(f => f.category))];
  
  const filteredFrameworks = selectedCategory === 'all' 
    ? frameworks 
    : frameworks.filter(f => f.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === 'all' ? 'All Categories' : category}
          </Button>
        ))}
      </div>
      
      {/* Framework Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFrameworks.map(framework => (
          <Card 
            key={framework.id} 
            className="cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => {
              // TODO: Implement framework selection/usage
              console.log('Selected framework:', framework.id);
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                  {framework.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{framework.title}</CardTitle>
                  <p className="text-sm text-gray-500">{framework.category}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-3">{framework.description}</p>
              <div className="flex flex-wrap gap-1">
                {framework.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}