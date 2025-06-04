
import { BookOpen, HelpCircle, Gamepad2, Video, Image, FileText } from 'lucide-react';
import { SageLessonModule } from '@/services/sageService';

interface SageModuleIconProps {
  type: SageLessonModule['module_type'];
  size?: number;
  className?: string;
}

export const SageModuleIcon = ({ type, size = 16, className = "" }: SageModuleIconProps) => {
  const iconProps = { size, className };

  switch (type) {
    case 'content':
      return <BookOpen {...iconProps} className={`text-blue-600 ${className}`} />;
    case 'quiz':
      return <HelpCircle {...iconProps} className={`text-green-600 ${className}`} />;
    case 'game':
      return <Gamepad2 {...iconProps} className={`text-purple-600 ${className}`} />;
    case 'video':
      return <Video {...iconProps} className={`text-red-600 ${className}`} />;
    case 'image':
      return <Image {...iconProps} className={`text-yellow-600 ${className}`} />;
    case 'assessment':
      return <FileText {...iconProps} className={`text-orange-600 ${className}`} />;
    default:
      return <BookOpen {...iconProps} className={`text-gray-600 ${className}`} />;
  }
};
