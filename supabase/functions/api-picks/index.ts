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
      const eventId = params.get('event_id')
      const sportId = params.get('sport_id')
      const analystId = params.get('analyst_id')
      const status = params.get('status')
      const language = params.get('language') || 'en'
      const limit = parseInt(params.get('limit') || '50')
      const offset = parseInt(params.get('offset') || '0')

      let query = supabase
        .from('picks')
        .select(`
          *,
          event:events(
            id, event_datetime, venue, status,
            home_team:teams!events_home_team_id_fkey(id, name, slug, logo_url),
            away_team:teams!events_away_team_id_fkey(id, name, slug, logo_url),
            league:leagues(id, name, slug),
            sport:sports(id, name, slug)
          ),
          market_type:market_types(id, name, slug),
          bookmaker:bookmakers(id, name, slug, logo_url),
          analyst:analyst_profiles(id, display_name, avatar_url, win_rate, total_picks)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (siteId) query = query.eq('site_id', siteId)
      if (eventId) query = query.eq('event_id', eventId)
      if (analystId) query = query.eq('analyst_id', analystId)
      if (status) query = query.eq('status', status)
      if (language !== 'all') query = query.eq('language', language)

      let { data, error, count } = await query

      if (error) throw error

      // Filter by sport_id if provided
      if (sportId && data) {
        data = data.filter((pick: any) => pick.event?.sport?.id === sportId)
        count = data.length
      }

      console.log(`[api-picks] GET - Fetched ${data?.length || 0} picks (total: ${count})`)

      return new Response(JSON.stringify({ data, count, limit, offset }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      
      const { 
        event_id, analyst_id, market_type_id, market_type_name,
        selection, odds, odds_format, bookmaker_id, 
        analysis, confidence_level, site_id, language 
      } = body

      if (!event_id || !analyst_id || !bookmaker_id) {
        return new Response(JSON.stringify({ 
          error: 'Missing required fields: event_id, analyst_id, bookmaker_id' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Handle market_type - use existing ID or create new
      let finalMarketTypeId = market_type_id

      if (!finalMarketTypeId && market_type_name) {
        // Check if market type exists
        const { data: existingMarket } = await supabase
          .from('market_types')
          .select('id')
          .eq('name', market_type_name)
          .maybeSingle()

        if (existingMarket) {
          finalMarketTypeId = existingMarket.id
        } else {
          // Create new market type
          const slug = market_type_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          const { data: newMarket, error: marketError } = await supabase
            .from('market_types')
            .insert([{ name: market_type_name, slug, language: language || 'en' }])
            .select()
            .single()

          if (marketError) throw marketError
          finalMarketTypeId = newMarket.id
        }
      }

      if (!finalMarketTypeId) {
        return new Response(JSON.stringify({ 
          error: 'Either market_type_id or market_type_name is required' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data, error } = await supabase
        .from('picks')
        .insert([{
          event_id,
          analyst_id,
          market_type_id: finalMarketTypeId,
          selection: selection || null,
          odds: odds || 0,
          odds_format: odds_format || 'american',
          bookmaker_id,
          analysis: analysis || null,
          confidence_level: confidence_level || null,
          site_id: site_id || null,
          language: language || 'en',
          status: 'pending'
        }])
        .select()
        .single()

      if (error) throw error

      console.log(`[api-picks] POST - Created pick: ${data.id}`)

      return new Response(JSON.stringify({ data }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'PUT') {
      const body = await req.json()
      const { id, ...updateData } = body

      if (!id) {
        return new Response(JSON.stringify({ error: 'Pick ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data, error } = await supabase
        .from('picks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      console.log(`[api-picks] PUT - Updated pick: ${id}`)

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'DELETE') {
      const id = params.get('id')

      if (!id) {
        return new Response(JSON.stringify({ error: 'Pick ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabase
        .from('picks')
        .delete()
        .eq('id', id)

      if (error) throw error

      console.log(`[api-picks] DELETE - Deleted pick: ${id}`)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[api-picks] Error:', error)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})