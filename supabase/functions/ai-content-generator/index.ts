
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const moduleTemplates = {
  content: {
    prompts: {
      text_content: 'Create educational content about {topic} for {moduleType} module',
      examples: 'Provide practical examples for {topic}',
      activities: 'Design interactive activities for {topic}'
    }
  },
  quiz: {
    prompts: {
      questions: 'Create quiz questions about {topic} with multiple choice and short answer formats',
      explanations: 'Provide detailed explanations for quiz answers about {topic}'
    }
  },
  game: {
    prompts: {
      game_mechanics: 'Design educational game mechanics for learning {topic}',
      challenges: 'Create progressive challenges for {topic} learning game'
    }
  },
  video: {
    prompts: {
      script: 'Write a video script explaining {topic} concepts',
      storyboard: 'Create a storyboard outline for {topic} educational video'
    }
  },
  image: {
    prompts: {
      descriptions: 'Generate descriptive text for educational images about {topic}',
      diagrams: 'Describe visual diagrams that would help explain {topic}'
    }
  },
  assessment: {
    prompts: {
      rubric: 'Create an assessment rubric for {topic} understanding',
      tasks: 'Design assessment tasks that measure {topic} comprehension'
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, prompt, moduleId, moduleType } = await req.json();
    const groqApiKey = Deno.env.get('GROQ_API_KEY');

    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not found');
    }

    // Handle SAGE module content generation
    if (type === 'module_content' && moduleType) {
      const template = moduleTemplates[moduleType as keyof typeof moduleTemplates];
      if (!template) {
        throw new Error(`Unsupported module type: ${moduleType}`);
      }

      const generatedContent: any = {
        moduleId,
        moduleType,
        generatedAt: new Date().toISOString(),
        aiSystem: 'SAGE v2.0',
        content: {}
      };

      // Generate content for each template section
      for (const [section, sectionPrompt] of Object.entries(template.prompts)) {
        const enhancedPrompt = `${sectionPrompt.replace('{topic}', prompt).replace('{moduleType}', moduleType)}

Additional context: ${prompt}`;

        const systemPrompt = `You are SAGE, an advanced AI content generation engine for K-12 education. 
        Create high-quality, engaging educational content that is:
        - Age-appropriate and pedagogically sound
        - Interactive and engaging
        - Aligned with learning objectives
        - Structured for easy consumption
        
        Module Type: ${moduleType}
        Focus on creating content that fits the specific module type and educational goals.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: enhancedPrompt }
            ],
            max_tokens: 2000,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          generatedContent.content[section] = data.choices[0].message.content;
        } else {
          console.error(`Failed to generate ${section}:`, await response.text());
          generatedContent.content[section] = `Content generation temporarily unavailable for ${section}`;
        }
      }

      return new Response(JSON.stringify(generatedContent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle legacy content generation
    const { subject, gradeLevel, topic, difficulty, learningStyle, duration } = await req.json();
    
    const contentTemplates = {
      lesson: {
        structure: ['introduction', 'concept_explanation', 'examples', 'practice_problems', 'summary'],
        prompts: {
          introduction: 'Create an engaging introduction for {topic} at grade {gradeLevel} level',
          concept_explanation: 'Explain the core concepts of {topic} in simple, clear language for {gradeLevel} grade students',
          examples: 'Provide 3 worked examples for {topic} with step-by-step solutions',
          practice_problems: 'Create 5 practice problems for {topic} with varying difficulty levels',
          summary: 'Summarize the key points of {topic} lesson for grade {gradeLevel}'
        }
      }
    };

    const template = contentTemplates[type as keyof typeof contentTemplates];
    if (!template) {
      throw new Error(`Unsupported content type: ${type}`);
    }

    const generatedContent: any = {
      type,
      subject,
      gradeLevel,
      topic,
      difficulty,
      learningStyle,
      duration,
      sections: {}
    };

    // Generate content for each section
    for (const section of template.structure) {
      const prompt = template.prompts[section as keyof typeof template.prompts]
        .replace('{topic}', topic)
        .replace('{gradeLevel}', gradeLevel.toString())
        .replace('{subject}', subject);

      const systemPrompt = `You are SAGE, an AI content generation engine for K-12 mathematics education. 
      Create high-quality, engaging educational content that adapts to different learning styles.
      Focus on ${learningStyle || 'mixed'} learning approach.
      Difficulty level: ${difficulty}.
      Keep content appropriate for grade ${gradeLevel} students.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        generatedContent.sections[section] = data.choices[0].message.content;
      } else {
        console.error(`Failed to generate ${section}:`, await response.text());
        generatedContent.sections[section] = `Content generation temporarily unavailable for ${section}`;
      }
    }

    generatedContent.metadata = {
      generatedAt: new Date().toISOString(),
      estimatedDuration: duration || 30,
      aiSystem: 'SAGE v2.0'
    };

    return new Response(JSON.stringify(generatedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-content-generator:', error);
    return new Response(JSON.stringify({ 
      error: 'Content generation failed',
      message: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
