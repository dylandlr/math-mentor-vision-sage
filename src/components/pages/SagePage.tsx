
import { useState } from 'react';
import { SageCourseLibrary } from '../sage/SageCourseLibrary';
import { SageVisualBuilder } from '../sage/SageVisualBuilder';
import { SageCourse } from '@/services/sageService';

export const SagePage = () => {
  const [selectedCourse, setSelectedCourse] = useState<SageCourse | null>(null);

  if (selectedCourse) {
    return (
      <SageVisualBuilder 
        course={selectedCourse} 
        onBack={() => setSelectedCourse(null)} 
      />
    );
  }

  return <SageCourseLibrary onCourseSelect={setSelectedCourse} />;
};
