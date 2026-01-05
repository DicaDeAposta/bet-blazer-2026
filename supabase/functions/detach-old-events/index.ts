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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find picks with events that ended 24+ hours ago
    // We'll set event_id to null for these picks (detach, not delete)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Get events that ended more than 24 hours ago
    const { data: oldEvents, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .or(`end_time.lt.${twentyFourHoursAgo},and(end_time.is.null,event_datetime.lt.${twentyFourHoursAgo})`);

    if (eventsError) {
      console.error('[detach-old-events] Error fetching old events:', eventsError);
      throw eventsError;
    }

    if (!oldEvents || oldEvents.length === 0) {
      console.log('[detach-old-events] No old events found to detach');
      return new Response(
        JSON.stringify({ success: true, message: 'No old events to detach', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const oldEventIds = oldEvents.map(e => e.id);
    console.log(`[detach-old-events] Found ${oldEventIds.length} old events`);

    // Note: We cannot set event_id to null because it's NOT NULL in the schema
    // Instead, we'll just log this for visibility - the embed-site function 
    // already filters out picks with old events when rendering
    
    console.log(`[detach-old-events] Old events will be hidden from embeds: ${oldEventIds.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${oldEventIds.length} events are 24+ hours old and will be hidden from embeds`,
        old_event_ids: oldEventIds
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[detach-old-events] Error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
