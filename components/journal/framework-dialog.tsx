'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Framework } from '@/services/framework-service';

interface FrameworkDialogProps {
  framework: Framework | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FrameworkDialog({ framework, isOpen, onClose }: FrameworkDialogProps) {
  const router = useRouter();

  const handleUseTemplate = () => {
    if (!framework) return;

    const params = new URLSearchParams({
      templateName: framework.name,
      customContent: framework.content
    });
    
    router.push(`/journal/new?${params.toString()}`);
  };

  if (!framework) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {framework.name}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Category: {framework.category}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600 leading-relaxed">
              {framework.category} framework to enhance your journaling practice
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Content</h4>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {framework.content}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleUseTemplate} className="bg-blue-600 hover:bg-blue-700">
            Dùng mẫu này
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}