
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    const groqApiKey = Deno.env.get('GROQ_API_KEY');

    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not found');
    }

    // Simulate user performance data (would be fetched from database in production)
    const userPerformance = {
      recentScores: [78, 85, 72, 91, 68, 88, 76],
      completedTopics: ['basic_addition', 'subtraction', 'multiplication'],
      strugglingTopics: ['division', 'fractions'],
      learningStyle: 'visual',
      sessionDuration: 25, // minutes
      preferredDifficulty: 'intermediate',
      mistakes: {
        'division': ['forgot remainder', 'calculation errors'],
        'fractions': ['denominator confusion', 'improper fractions']
      }
    };

    const adaptivePrompt = `Based on this student's performance data, create personalized learning recommendations:
    
    Recent quiz scores: ${userPerformance.recentScores.join(', ')}%
    Mastered topics: ${userPerformance.completedTopics.join(', ')}
    Struggling with: ${userPerformance.strugglingTopics.join(', ')}
    Learning style: ${userPerformance.learningStyle}
    Preferred session length: ${userPerformance.sessionDuration} minutes
    Common mistakes: ${JSON.stringify(userPerformance.mistakes)}
    
    Recommend:
    1. Next 3 topics to study
    2. Specific areas that need remediation
    3. Difficulty adjustments
    4. Learning activities that match their style`;

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
            content: 'You are ADAPT, an AI adaptive learning engine. Analyze student performance and create personalized learning paths. Focus on identifying knowledge gaps and providing targeted recommendations for improvement.'
          },
          { role: 'user', content: adaptivePrompt }
        ],
        max_tokens: 1200,
        temperature: 0.4,
      }),
    });

    let aiRecommendations = 'Adaptive recommendations temporarily unavailable';
    if (response.ok) {
      const data = await response.json();
      aiRecommendations = data.choices[0].message.content;
    }

    // Calculate adaptive adjustments
    const avgScore = userPerformance.recentScores.reduce((a, b) => a + b, 0) / userPerformance.recentScores.length;
    let difficultyAdjustment = 0;
    
    if (avgScore > 85) difficultyAdjustment = 1; // Increase difficulty
    else if (avgScore < 70) difficultyAdjustment = -1; // Decrease difficulty

    const adaptiveResponse = {
      userId,
      performanceAnalysis: {
        averageScore: Math.round(avgScore),
        trend: userPerformance.recentScores[userPerformance.recentScores.length - 1] > userPerformance.recentScores[0] ? 'improving' : 'declining',
        consistency: Math.max(...userPerformance.recentScores) - Math.min(...userPerformance.recentScores) < 20 ? 'consistent' : 'variable'
      },
      recommendations: {
        nextTopics: ['basic_division', 'introduction_to_fractions', 'decimal_basics'],
        remediationAreas: userPerformance.strugglingTopics,
        difficultyAdjustment,
        suggestedActivities: [
          'Visual fraction manipulatives',
          'Step-by-step division practice',
          'Interactive problem solving'
        ]
      },
      learningPath: {
        immediate: 'Review division with visual aids',
        shortTerm: 'Master basic fractions',
        longTerm: 'Progress to advanced arithmetic'
      },
      aiInsights: aiRecommendations,
      generatedAt: new Date().toISOString(),
      aiSystem: 'ADAPT v1.0'
    };

    return new Response(JSON.stringify(adaptiveResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-adaptive-learning:', error);
    return new Response(JSON.stringify({ 
      error: 'Adaptive learning analysis failed',
      message: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
