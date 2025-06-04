
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SageLessonModule } from '@/services/sageService';

interface DragItem {
  type: 'existing-module' | 'new-module';
  moduleType?: SageLessonModule['module_type'];
  module?: SageLessonModule;
}

interface DragDropContextType {
  dragItem: DragItem | null;
  isDragging: boolean;
  draggedOverPosition: number | null;
  setDragItem: (item: DragItem | null) => void;
  setIsDragging: (dragging: boolean) => void;
  setDraggedOverPosition: (position: number | null) => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};

interface DragDropProviderProps {
  children: ReactNode;
}

export const DragDropProvider = ({ children }: DragDropProviderProps) => {
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedOverPosition, setDraggedOverPosition] = useState<number | null>(null);

  return (
    <DragDropContext.Provider
      value={{
        dragItem,
        isDragging,
        draggedOverPosition,
        setDragItem,
        setIsDragging,
        setDraggedOverPosition,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
};
