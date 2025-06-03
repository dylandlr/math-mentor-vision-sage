
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, timeframe } = await req.json();
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!groqApiKey || !supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user learning data (mock for now - would be real data in production)
    const learningData = {
      lessonsCompleted: Math.floor(Math.random() * 50) + 10,
      averageScore: Math.floor(Math.random() * 30) + 70,
      timeSpent: Math.floor(Math.random() * 100) + 50, // hours
      topicsStruggling: ['fractions', 'geometry'],
      topicsExcelling: ['basic arithmetic', 'patterns'],
      learningPattern: 'visual',
      streakDays: Math.floor(Math.random() * 30),
      weeklyProgress: [85, 78, 92, 88, 76, 94, 89]
    };

    const analyticsPrompt = `Analyze this student's learning data and provide insights:
    - Lessons completed: ${learningData.lessonsCompleted}
    - Average score: ${learningData.averageScore}%
    - Time spent learning: ${learningData.timeSpent} hours
    - Struggling with: ${learningData.topicsStruggling.join(', ')}
    - Excelling at: ${learningData.topicsExcelling.join(', ')}
    - Preferred learning style: ${learningData.learningPattern}
    - Current streak: ${learningData.streakDays} days
    - Weekly scores: ${learningData.weeklyProgress.join(', ')}
    
    Provide specific recommendations for improvement and highlight strengths.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are INSIGHT, an AI analytics engine for educational data. Provide clear, actionable insights about student learning patterns and performance. Focus on specific recommendations and growth opportunities.'
          },
          { role: 'user', content: analyticsPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    let aiInsights = 'Analytics temporarily unavailable';
    if (response.ok) {
      const data = await response.json();
      aiInsights = data.choices[0].message.content;
    }

    const analyticsReport = {
      userId,
      timeframe,
      rawData: learningData,
      insights: aiInsights,
      recommendations: [
        'Practice fractions with visual aids',
        'Try interactive geometry tools',
        'Maintain your excellent streak!',
        'Focus on problem-solving techniques'
      ],
      riskFactors: learningData.averageScore < 75 ? ['Below average performance'] : [],
      strengths: learningData.streakDays > 7 ? ['Consistent learning habit'] : [],
      generatedAt: new Date().toISOString(),
      aiSystem: 'INSIGHT v1.0'
    };

    return new Response(JSON.stringify(analyticsReport), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-analytics:', error);
    return new Response(JSON.stringify({ 
      error: 'Analytics generation failed',
      message: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
