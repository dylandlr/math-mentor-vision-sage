
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback responses for when Groq API is down
const fallbackResponses = [
  "I'm experiencing some connection issues right now, but I'm still here to help! Could you try asking your question again in a moment?",
  "It looks like I'm having trouble connecting to my AI service. In the meantime, can you tell me what specific math topic you're working on?",
  "I'm temporarily offline but will be back soon! While we wait, feel free to review your lesson materials or try working through some practice problems.",
  "My AI service is currently unavailable, but I'll be back online shortly. Is there a particular math concept you'd like to discuss when I'm back?",
];

const getRandomFallback = () => {
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, chatHistory = [] } = await req.json();
    const groqApiKey = Deno.env.get('GROQ_API_KEY');

    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not found');
    }

    // Prepare messages for Groq API
    const messages = [
      {
        role: 'system',
        content: 'You are an AI Math Mentor for students. You are helpful, patient, and encouraging. You explain math concepts clearly, break down complex problems into simple steps, and provide examples. You adapt your explanations to the student\'s level and always encourage learning. Keep responses conversational and supportive.'
      },
      ...chatHistory.map((msg: any) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    console.log('Sending request to Groq API...');

    // Try multiple times with exponential backoff
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.choices[0].message.content;
          console.log('AI response received successfully');
          
          return new Response(JSON.stringify({ response: aiResponse }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          const errorText = await response.text();
          console.error(`Groq API error (attempt ${attempt}):`, response.status, errorText);
          lastError = new Error(`Groq API error: ${response.status} - ${errorText}`);
          
          // Don't retry on client errors (4xx), only server errors (5xx)
          if (response.status < 500) {
            break;
          }
        }
      } catch (fetchError) {
        console.error(`Network error (attempt ${attempt}):`, fetchError);
        lastError = fetchError;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < 3) {
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s
        console.log(`Waiting ${waitTime}ms before retry...`);
        await sleep(waitTime);
      }
    }

    // If all retries failed, return a fallback response
    console.log('All retry attempts failed, using fallback response');
    const fallbackResponse = getRandomFallback();
    
    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      isOffline: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-mentor-chat function:', error);
    
    // Return a user-friendly fallback response
    const fallbackResponse = "I'm having some technical difficulties right now. Please try again in a few moments, and I'll be ready to help with your math questions!";
    
    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      isOffline: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
