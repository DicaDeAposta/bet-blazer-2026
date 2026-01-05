import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Localization strings
const translations = {
  en: {
    odds: 'Odds',
    analysis: 'Analysis',
    analyst: 'Analyst',
    picks: 'PICKS',
    bet: 'Bet',
    noPicks: 'No picks available at the moment.',
    now: 'now',
    minAgo: (n: number) => `${n} min ago`,
    hoursAgo: (n: number) => `${n} hour${n !== 1 ? 's' : ''} ago`,
    daysAgo: (n: number) => `${n} day${n !== 1 ? 's' : ''} ago`,
    dateLocale: 'en-US',
  },
  pt: {
    odds: 'Odds',
    analysis: 'Análise',
    analyst: 'Analista',
    picks: 'PALPITES',
    bet: 'Apostar',
    noPicks: 'Nenhum palpite disponível no momento.',
    now: 'agora',
    minAgo: (n: number) => `${n} min atrás`,
    hoursAgo: (n: number) => `${n} hora${n !== 1 ? 's' : ''} atrás`,
    daysAgo: (n: number) => `${n} dia${n !== 1 ? 's' : ''} atrás`,
    dateLocale: 'pt-BR',
  },
  es: {
    odds: 'Cuotas',
    analysis: 'Análisis',
    analyst: 'Analista',
    picks: 'PICKS',
    bet: 'Apostar',
    noPicks: 'No hay pronósticos disponibles en este momento.',
    now: 'ahora',
    minAgo: (n: number) => `hace ${n} min`,
    hoursAgo: (n: number) => `hace ${n} hora${n !== 1 ? 's' : ''}`,
    daysAgo: (n: number) => `hace ${n} día${n !== 1 ? 's' : ''}`,
    dateLocale: 'es-ES',
  },
};

type Language = keyof typeof translations;

function getTranslations(lang: string) {
  return translations[lang as Language] || translations.en;
}

function getRelativeTime(dateString: string, lang: string): string {
  const t = getTranslations(lang);
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return t.now;
  if (diffMins < 60) return t.minAgo(diffMins);
  if (diffHours < 24) return t.hoursAgo(diffHours);
  return t.daysAgo(diffDays);
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatEventDate(datetime: string, lang: string): string {
  const t = getTranslations(lang);
  const date = new Date(datetime);
  return new Intl.DateTimeFormat(t.dateLocale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

function formatEventTime(datetime: string): string {
  const date = new Date(datetime);
  const et = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
  return et.replace(' ', '').toUpperCase();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const siteId = url.searchParams.get('id');

    if (!siteId) {
      return new Response('Missing site id', { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id, name, display_name, primary_color, language')
      .eq('id', siteId)
      .maybeSingle();

    if (siteError || !site) {
      console.error('[embed-site] Site not found:', siteId);
      return new Response('Site not found', { status: 404, headers: corsHeaders });
    }

    const { data: pickSites, error: picksError } = await supabase
      .from('pick_sites')
      .select(`
        pick:picks(
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
            id,
            event_datetime,
            venue,
            home_team:teams!events_home_team_id_fkey(name, logo_url),
            away_team:teams!events_away_team_id_fkey(name, logo_url),
            league:leagues(name, logo_url),
            sport:sports(name)
          ),
          market_type:market_types(name),
          bookmaker:bookmakers(name, logo_url, affiliate_link),
          analyst:analyst_profiles(display_name, avatar_url, bio),
          related_player:players(name, photo_url),
          related_team:teams(name, logo_url)
        )
      `)
      .eq('site_id', siteId);

    if (picksError) {
      console.error('[embed-site] Error fetching picks:', picksError);
      return new Response('Error fetching picks', { status: 500, headers: corsHeaders });
    }

    const picks = (pickSites || [])
      .map((ps: any) => ps.pick)
      .filter(Boolean)
      .filter((pick: any) => {
        const event = pick.event;
        if (!event) return true;
        const endTime = event.event_datetime;
        if (!endTime) return true;
        const eventDate = new Date(endTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60);
        return hoursDiff < 24;
      });

    const eventMap = new Map<string, { event: any; picks: any[] }>();
    for (const pick of picks) {
      const eventId = pick.event?.id || 'no-event';
      if (!eventMap.has(eventId)) {
        eventMap.set(eventId, { event: pick.event, picks: [] });
      }
      eventMap.get(eventId)!.picks.push(pick);
    }

    const primaryColor = site.primary_color || '#22c55e';
    const accentColor = '#f59e0b';
    const displayName = site.display_name || site.name || 'Picks';
    const embedId = `spe-${siteId.substring(0, 8)}`;
    const lang = site.language || 'en';
    const t = getTranslations(lang);

    let eventsHtml = '';

    if (eventMap.size > 0) {
      for (const [eventId, { event, picks: eventPicks }] of eventMap) {
        const homeTeam = event?.home_team?.name || 'TBD';
        const awayTeam = event?.away_team?.name || 'TBD';
        const homeTeamLogo = event?.home_team?.logo_url || '';
        const awayTeamLogo = event?.away_team?.logo_url || '';
        const eventDatetime = event?.event_datetime || '';
        const expertCount = eventPicks.length;

        eventsHtml += `
        <section class="${embedId}-event-section">
          <article class="${embedId}-event-card">
            <!-- Event Title Header -->
            <header class="${embedId}-event-header">
              <h2 class="${embedId}-event-title">
                ${escapeHtml(homeTeam)} vs ${escapeHtml(awayTeam)}
              </h2>
              <div class="${embedId}-header-meta">
                <div class="${embedId}-teams-row">
                  ${homeTeamLogo ? `<img src="${escapeHtml(homeTeamLogo)}" alt="${escapeHtml(homeTeam)}" class="${embedId}-team-logo">` : ''}
                  <span class="${embedId}-vs">vs</span>
                  ${awayTeamLogo ? `<img src="${escapeHtml(awayTeamLogo)}" alt="${escapeHtml(awayTeam)}" class="${embedId}-team-logo">` : ''}
                </div>
                <span class="${embedId}-event-time">${formatEventDate(eventDatetime, lang)} • ${formatEventTime(eventDatetime)} ET</span>
                <span class="${embedId}-expert-badge">${expertCount} ${t.picks}</span>
              </div>
            </header>
            
            <!-- Picks List -->
            <div class="${embedId}-picks-list">
              ${eventPicks.map((pick: any, idx: number) => {
                const selection = pick.selection || '';
                const marketType = pick.market_type?.name || '';
                const odds = pick.odds != null ? String(pick.odds) : '';
                const bookmakerLogo = pick.bookmaker?.logo_url || '';
                const bookmakerLink = pick.bookmaker?.affiliate_link || '#';
                const bookmakerName = pick.bookmaker?.name || 'Bet';
                const analyst = pick.analyst?.display_name || 'Expert';
                const analystAvatar = pick.analyst?.avatar_url || '';
                const pickTime = pick.created_at ? getRelativeTime(pick.created_at, lang) : '';
                const analysis = pick.analysis || '';
                const relatedPlayer = pick.related_player;
                const relatedTeam = pick.related_team;
                const pickId = `${embedId}-pick-${eventId}-${idx}`;

                // Build selection column content - only show image if available
                let selectionImageHtml = '';
                if (relatedPlayer?.photo_url) {
                  selectionImageHtml = `<img src="${escapeHtml(relatedPlayer.photo_url)}" alt="${escapeHtml(relatedPlayer.name)}" class="${embedId}-subject-logo">`;
                } else if (relatedTeam?.logo_url) {
                  selectionImageHtml = `<img src="${escapeHtml(relatedTeam.logo_url)}" alt="${escapeHtml(relatedTeam.name)}" class="${embedId}-subject-logo">`;
                }

                return `
                <article class="${embedId}-pick-card">
                  <div class="${embedId}-pick-grid">
                    <!-- Column 1: Selection -->
                    <div class="${embedId}-col-selection">
                      ${selectionImageHtml}
                      <div class="${embedId}-selection-info">
                        ${marketType ? `<span class="${embedId}-market-type">${escapeHtml(marketType)}</span>` : ''}
                        ${selection ? `<h3 class="${embedId}-selection-name">${escapeHtml(selection)}</h3>` : ''}
                        <span class="${embedId}-pick-time">🕐 ${pickTime}</span>
                      </div>
                    </div>

                    <!-- Column 2: Odds -->
                    <div class="${embedId}-col-odds">
                      <span class="${embedId}-odds-label">${t.odds}</span>
                      <div class="${embedId}-odds-container">
                        ${odds ? `<span class="${embedId}-odds-value">${escapeHtml(odds)}</span>` : ''}
                        <a href="${escapeHtml(bookmakerLink)}" target="_blank" rel="noopener noreferrer" class="${embedId}-bookmaker-btn">
                          ${bookmakerLogo 
                            ? `<img src="${escapeHtml(bookmakerLogo)}" alt="${escapeHtml(bookmakerName)}" class="${embedId}-bookmaker-logo">`
                            : `<span>${escapeHtml(bookmakerName)}</span>`
                          }
                        </a>
                      </div>
                    </div>

                    <!-- Column 3: Expert -->
                    <div class="${embedId}-col-expert">
                      <div class="${embedId}-analyst-row">
                        ${analystAvatar 
                          ? `<img src="${escapeHtml(analystAvatar)}" alt="${escapeHtml(analyst)}" class="${embedId}-analyst-avatar">`
                          : ''
                        }
                        <div class="${embedId}-analyst-info">
                          <h4 class="${embedId}-analyst-name">${escapeHtml(analyst)}</h4>
                          <span class="${embedId}-analyst-role">${t.analyst}</span>
                        </div>
                      </div>
                      ${analysis ? `
                      <button type="button" class="${embedId}-analysis-btn" onclick="(function(el){var c=document.getElementById('${pickId}-analysis');var isOpen=c.style.maxHeight&&c.style.maxHeight!=='0px';c.style.maxHeight=isOpen?'0px':c.scrollHeight+'px';el.querySelector('.${embedId}-chevron').style.transform=isOpen?'rotate(0deg)':'rotate(180deg)';})(this)">
                        ${t.analysis} <span class="${embedId}-chevron">▼</span>
                      </button>
                      ` : ''}
                    </div>
                  </div>

                  ${analysis ? `
                  <div id="${pickId}-analysis" class="${embedId}-analysis-panel">
                    <div class="${embedId}-analysis-content">
                      <p>${escapeHtml(analysis)}</p>
                    </div>
                  </div>
                  ` : ''}
                </article>`;
              }).join('')}
            </div>
          </article>
        </section>`;
      }
    } else {
      eventsHtml = `<div class="${embedId}-empty">${t.noPicks}</div>`;
    }

    const html = `<div class="${embedId}-container" data-site-id="${siteId}">
  <style>
    .${embedId}-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 100%;
      color: #1f2937;
      line-height: 1.5;
      background: #f8fafc;
      padding: 16px;
    }
    .${embedId}-event-section {
      margin-bottom: 24px;
    }
    .${embedId}-event-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }
    .${embedId}-event-header {
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      text-align: center;
    }
    .${embedId}-event-title {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }
    .${embedId}-header-meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .${embedId}-teams-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .${embedId}-team-logo {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      object-fit: cover;
    }
    .${embedId}-vs {
      color: #9ca3af;
      font-size: 12px;
    }
    .${embedId}-event-time {
      color: #6b7280;
      font-size: 12px;
    }
    .${embedId}-expert-badge {
      background: ${accentColor};
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .${embedId}-picks-list {
      background: #ffffff;
    }
    .${embedId}-pick-card {
      padding: 12px 16px;
      border-bottom: 1px solid #f3f4f6;
    }
    .${embedId}-pick-card:last-child {
      border-bottom: none;
    }
    .${embedId}-pick-card:hover {
      background: #fafafa;
    }
    .${embedId}-pick-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      align-items: center;
    }
    .${embedId}-col-selection {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .${embedId}-subject-logo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }
    .${embedId}-selection-info {
      display: flex;
      flex-direction: column;
    }
    .${embedId}-market-type {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 2px;
    }
    .${embedId}-selection-name {
      font-size: 13px;
      font-weight: 700;
      color: #111827;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin: 0 0 2px 0;
    }
    .${embedId}-pick-time {
      font-size: 11px;
      color: #9ca3af;
    }
    .${embedId}-col-odds {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .${embedId}-odds-label {
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }
    .${embedId}-odds-container {
      display: flex;
      align-items: center;
      gap: 0;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(0,0,0,0.08);
      border: 1px solid #e5e7eb;
    }
    .${embedId}-odds-value {
      background: #ffffff;
      border-right: 1px solid #e5e7eb;
      padding: 8px 12px;
      font-size: 14px;
      font-weight: 700;
      color: #111827;
      min-width: 50px;
      text-align: center;
    }
    .${embedId}-bookmaker-btn {
      background: #0f172a;
      color: #ffffff;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 70px;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .${embedId}-bookmaker-btn:hover {
      opacity: 0.9;
    }
    .${embedId}-bookmaker-logo {
      height: 16px;
      max-width: 60px;
      object-fit: contain;
      filter: brightness(0) invert(1);
    }
    .${embedId}-bookmaker-btn span {
      font-size: 12px;
      font-weight: 600;
    }
    .${embedId}-col-expert {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }
    .${embedId}-analyst-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .${embedId}-analyst-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .${embedId}-analyst-info {
      text-align: right;
    }
    .${embedId}-analyst-name {
      font-size: 12px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }
    .${embedId}-analyst-role {
      font-size: 11px;
      color: #6b7280;
    }
    .${embedId}-analysis-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      background: ${accentColor};
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      color: #ffffff;
      cursor: pointer;
    }
    .${embedId}-analysis-btn:hover,
    .${embedId}-analysis-btn:focus,
    .${embedId}-analysis-btn:active {
      background: ${accentColor};
      color: #ffffff;
    }
    .${embedId}-chevron {
      font-size: 8px;
      transition: transform 0.2s;
    }
    .${embedId}-analysis-panel {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    .${embedId}-analysis-content {
      margin-top: 12px;
      padding: 12px;
      background: #f1f5f9;
      border-left: 4px solid ${primaryColor};
      border-radius: 0 6px 6px 0;
    }
    .${embedId}-analysis-content p {
      margin: 0;
      font-size: 12px;
      color: #111827;
      line-height: 1.5;
    }
    .${embedId}-empty {
      text-align: center;
      padding: 40px 20px;
      color: #9ca3af;
      font-size: 14px;
      background: #ffffff;
      border-radius: 12px;
      border: 1px dashed #e5e7eb;
    }
    @media (max-width: 768px) {
      .${embedId}-pick-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      .${embedId}-col-selection,
      .${embedId}-col-odds,
      .${embedId}-col-expert {
        align-items: flex-start;
      }
      .${embedId}-analyst-info {
        text-align: left;
      }
      .${embedId}-event-title {
        font-size: 16px;
      }
      .${embedId}-odds-value,
      .${embedId}-bookmaker-btn span {
        font-size: 12px;
      }
    }
  </style>
  ${eventsHtml}
</div>`;

    console.log(`[embed-site] Rendered ${picks.length} picks for site ${siteId}`);

    return new Response(html, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[embed-site] Error:', message);
    return new Response(`<div style="color:#dc2626;padding:20px;text-align:center;font-family:sans-serif;">Error loading picks. Please try again later.</div>`, { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' } 
    });
  }
});
