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
  const leagueId = params.get('league_id')
  const sportId = params.get('sport_id')
  const language = params.get('language') || 'en'
  const limit = parseInt(params.get('limit') || '100')
  const offset = parseInt(params.get('offset') || '0')

  try {
    let query = supabase
      .from('teams')
      .select('*, league:leagues(id, name, slug, sport_id)', { count: 'exact' })
      .order('name')
      .range(offset, offset + limit - 1)

    if (leagueId) {
      query = query.eq('league_id', leagueId)
    }
    if (language !== 'all') {
      query = query.eq('language', language)
    }

    let { data, error, count } = await query

    if (error) throw error

    // Filter by sport_id if provided (through league relationship)
    if (sportId && data) {
      data = data.filter((team: any) => team.league?.sport_id === sportId)
      count = data.length
    }

    console.log(`[api-teams] Fetched ${data?.length || 0} teams (total: ${count})`)

    return new Response(JSON.stringify({ data, count, limit, offset }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[api-teams] Error:', error)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})