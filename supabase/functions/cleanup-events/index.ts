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

    // Delete events and picks at end of day X+1
    // If event is dated for day X, delete on day X+1 (regardless of time)
    // We calculate midnight of today (start of current day) and delete anything before that
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cutoffDate = todayMidnight.toISOString();

    console.log(`[cleanup-events] Running cleanup. Cutoff date: ${cutoffDate}`);

    // First, get events to be deleted so we can also delete their picks
    const { data: eventsToDelete, error: fetchError } = await supabase
      .from('events')
      .select('id')
      .lt('event_datetime', cutoffDate);

    if (fetchError) {
      console.error('[cleanup-events] Error fetching events to delete:', fetchError);
      throw fetchError;
    }

    const eventIds = eventsToDelete?.map(e => e.id) || [];
    console.log(`[cleanup-events] Found ${eventIds.length} events to delete`);

    let deletedPicksCount = 0;
    let deletedPickSitesCount = 0;

    if (eventIds.length > 0) {
      // Delete pick_sites for picks associated with these events
      const { data: picksToDelete } = await supabase
        .from('picks')
        .select('id')
        .in('event_id', eventIds);

      const pickIds = picksToDelete?.map(p => p.id) || [];

      if (pickIds.length > 0) {
        const { data: deletedPickSites, error: pickSitesError } = await supabase
          .from('pick_sites')
          .delete()
          .in('pick_id', pickIds)
          .select('id');

        if (pickSitesError) {
          console.error('[cleanup-events] Error deleting pick_sites:', pickSitesError);
        } else {
          deletedPickSitesCount = deletedPickSites?.length || 0;
        }
      }

      // Delete picks associated with events to be deleted
      const { data: deletedPicks, error: picksDeleteError } = await supabase
        .from('picks')
        .delete()
        .in('event_id', eventIds)
        .select('id');

      if (picksDeleteError) {
        console.error('[cleanup-events] Error deleting picks:', picksDeleteError);
      } else {
        deletedPicksCount = deletedPicks?.length || 0;
      }
    }

    // Delete events whose event_datetime is before today midnight
    const { data: deletedEvents, error: eventsDeleteError } = await supabase
      .from('events')
      .delete()
      .lt('event_datetime', cutoffDate)
      .select('id');

    if (eventsDeleteError) {
      console.error('[cleanup-events] Error deleting events:', eventsDeleteError);
      throw eventsDeleteError;
    }

    const deletedEventsCount = deletedEvents?.length || 0;
    
    console.log(`[cleanup-events] Cleanup completed. Deleted: ${deletedEventsCount} events, ${deletedPicksCount} picks, ${deletedPickSitesCount} pick_sites`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Deleted ${deletedEventsCount} events, ${deletedPicksCount} picks, ${deletedPickSitesCount} pick_sites`,
        deleted_events: deletedEventsCount,
        deleted_picks: deletedPicksCount,
        deleted_pick_sites: deletedPickSitesCount,
        cutoff_date: cutoffDate
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[cleanup-events] Cleanup error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
