
import { useAIMentor } from './useAIMentor';

// Re-export the useAIMentor hook as useAIChat for backward compatibility
export const useAIChat = useAIMentor;
export type { ChatMessage } from './useAIMentor';
