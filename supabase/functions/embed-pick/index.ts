import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pickId = url.searchParams.get('id');

    if (!pickId) {
      return new Response('Missing pick id', { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: pick, error } = await supabase
      .from('picks')
      .select(`
        id,
        selection,
        odds,
        odds_format,
        analysis,
        confidence_level,
        status,
        category,
        created_at,
        event:events(
          event_datetime,
          home_team:teams!events_home_team_id_fkey(name, logo_url),
          away_team:teams!events_away_team_id_fkey(name, logo_url),
          league:leagues(name)
        ),
        market_type:market_types(name),
        bookmaker:bookmakers(name, logo_url),
        analyst:analyst_profiles(display_name, avatar_url)
      `)
      .eq('id', pickId)
      .maybeSingle();

    if (error || !pick) {
      return new Response('Pick not found', { status: 404, headers: corsHeaders });
    }

    const event = pick.event as any;
    const homeTeam = event?.home_team?.name || 'TBD';
    const awayTeam = event?.away_team?.name || 'TBD';
    const league = event?.league?.name || '';
    const eventDate = event?.event_datetime 
      ? new Date(event.event_datetime).toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        })
      : '';
    const marketType = (pick.market_type as any)?.name || '';
    const bookmaker = (pick.bookmaker as any)?.name || '';
    const analyst = (pick.analyst as any)?.display_name || '';
    const confidence = pick.confidence_level || 3;

    // Generate HTML fragment only (no DOCTYPE, html, head, body)
    const html = `<div class="pick-embed-widget" data-pick-id="${pickId}">
  <style>
    .pick-embed-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 400px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px;
      background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .pew-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .pew-league {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .pew-date {
      font-size: 12px;
      color: #9ca3af;
    }
    .pew-matchup {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 16px;
      text-align: center;
    }
    .pew-details {
      background: #f3f4f6;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .pew-market {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .pew-selection {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }
    .pew-odds {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 600;
      margin-left: 8px;
    }
    .pew-analysis {
      font-size: 14px;
      color: #4b5563;
      line-height: 1.5;
      margin-bottom: 12px;
    }
    .pew-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
    }
    .pew-confidence {
      display: flex;
      gap: 2px;
    }
    .pew-star {
      font-size: 14px;
      color: #d1d5db;
    }
    .pew-star-filled {
      color: #fbbf24;
    }
  </style>
  <div class="pew-header">
    <span class="pew-league">${league}</span>
    <span class="pew-date">${eventDate}</span>
  </div>
  <div class="pew-matchup">${homeTeam} vs ${awayTeam}</div>
  <div class="pew-details">
    <div class="pew-market">${marketType}</div>
    <div>
      <span class="pew-selection">${pick.selection || '-'}</span>
      <span class="pew-odds">${pick.odds > 0 ? '+' : ''}${pick.odds}</span>
    </div>
  </div>
  ${pick.analysis ? `<div class="pew-analysis">${pick.analysis}</div>` : ''}
  <div class="pew-footer">
    <span>By ${analyst} @ ${bookmaker}</span>
    <div class="pew-confidence">
      ${Array.from({length: 5}, (_, i) => 
        `<span class="pew-star ${i < confidence ? 'pew-star-filled' : ''}">★</span>`
      ).join('')}
    </div>
  </div>
</div>`;

    return new Response(html, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Embed error:', message);
    return new Response(`Error: ${message}`, { status: 500, headers: corsHeaders });
  }
});
