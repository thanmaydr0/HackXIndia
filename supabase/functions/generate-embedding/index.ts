import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { log_id, content } = await req.json()

        if (!content) {
            throw new Error('Missing content')
        }

        // Initialize OpenAI
        const configuration = new Configuration({
            apiKey: Deno.env.get('OPENAI_API_KEY'),
        })
        const openai = new OpenAIApi(configuration)

        // Generate Embedding
        const embeddingResponse = await openai.createEmbedding({
            model: 'text-embedding-3-small',
            input: content,
        })

        const embedding = embeddingResponse.data.data[0].embedding

        if (log_id) {
            // Initialize Supabase Client
            const supabaseClient = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            )

            // Update the log with the embedding
            const { error: updateError } = await supabaseClient
                .from('learning_logs')
                .update({ embedding })
                .eq('id', log_id)

            if (updateError) throw updateError

            return new Response(
                JSON.stringify({ success: true, embedding }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({ success: true, embedding }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
