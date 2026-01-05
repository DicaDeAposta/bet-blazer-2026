import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  const url = new URL(req.url)
  const params = url.searchParams
  const sportId = params.get('sport_id')
  const language = params.get('language') || 'en'

  try {
    let query = supabase
      .from('market_types')
      .select('*')
      .order('name')

    if (sportId) {
      query = query.eq('sport_id', sportId)
    }
    if (language !== 'all') {
      query = query.eq('language', language)
    }

    const { data, error } = await query

    if (error) throw error

    console.log(`[api-market-types] Fetched ${data?.length || 0} market types`)

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[api-market-types] Error:', error)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})