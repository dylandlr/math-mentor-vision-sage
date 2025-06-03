
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  },
  quiz: {
    structure: ['multiple_choice', 'short_answer', 'problem_solving'],
    prompts: {
      multiple_choice: 'Create 5 multiple choice questions about {topic} for grade {gradeLevel}',
      short_answer: 'Create 3 short answer questions about {topic} for grade {gradeLevel}',
      problem_solving: 'Create 2 problem-solving questions about {topic} for grade {gradeLevel}'
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, subject, gradeLevel, topic, difficulty, learningStyle, duration } = await req.json();
    const groqApiKey = Deno.env.get('GROQ_API_KEY');

    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not found');
    }

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
      aiSystem: 'SAGE v1.0'
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
