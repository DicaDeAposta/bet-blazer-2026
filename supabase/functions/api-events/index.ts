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

  try {
    if (req.method === 'GET') {
      const siteId = params.get('site_id')
      const sportId = params.get('sport_id')
      const leagueId = params.get('league_id')
      const fromDate = params.get('from_date')
      const toDate = params.get('to_date')
      const language = params.get('language') || 'en'
      const limit = parseInt(params.get('limit') || '50')
      const offset = parseInt(params.get('offset') || '0')

      let query = supabase
        .from('events')
        .select(`
          *,
          home_team:teams!events_home_team_id_fkey(id, name, slug, logo_url),
          away_team:teams!events_away_team_id_fkey(id, name, slug, logo_url),
          league:leagues(id, name, slug),
          sport:sports(id, name, slug)
        `, { count: 'exact' })
        .order('event_datetime', { ascending: true })
        .range(offset, offset + limit - 1)

      if (siteId) query = query.eq('site_id', siteId)
      if (sportId) query = query.eq('sport_id', sportId)
      if (leagueId) query = query.eq('league_id', leagueId)
      if (fromDate) query = query.gte('event_datetime', fromDate)
      if (toDate) query = query.lte('event_datetime', toDate)
      if (language !== 'all') query = query.eq('language', language)

      const { data, error, count } = await query

      if (error) throw error

      console.log(`[api-events] GET - Fetched ${data?.length || 0} events (total: ${count})`)

      return new Response(JSON.stringify({ data, count, limit, offset }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      
      const { sport_id, league_id, home_team_id, away_team_id, event_datetime, venue, site_id, language } = body

      if (!sport_id || !league_id || !home_team_id || !away_team_id || !event_datetime) {
        return new Response(JSON.stringify({ 
          error: 'Missing required fields: sport_id, league_id, home_team_id, away_team_id, event_datetime' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data, error } = await supabase
        .from('events')
        .insert([{
          sport_id,
          league_id,
          home_team_id,
          away_team_id,
          event_datetime,
          venue: venue || null,
          site_id: site_id || null,
          language: language || 'en',
          status: 'scheduled'
        }])
        .select()
        .single()

      if (error) throw error

      console.log(`[api-events] POST - Created event: ${data.id}`)

      return new Response(JSON.stringify({ data }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[api-events] Error:', error)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})