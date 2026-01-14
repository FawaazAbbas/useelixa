import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate 8-character alphanumeric referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface EmailOctopusContact {
  id: string;
  email_address: string;
  fields: Record<string, string>;
  status: string;
  created_at: string;
}

interface PullRequest {
  source_filter?: string; // e.g., "FBAD" to only pull Facebook leads
  dry_run?: boolean; // If true, just return what would be imported
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("EMAILOCTOPUS_API_KEY");
    const listId = Deno.env.get("EMAILOCTOPUS_LIST_ID");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!apiKey || !listId) {
      console.error("Missing EmailOctopus configuration");
      return new Response(
        JSON.stringify({ error: "EmailOctopus not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { source_filter, dry_run }: PullRequest = await req.json();

    console.log(`Pulling contacts from EmailOctopus. Source filter: ${source_filter || 'none'}, Dry run: ${dry_run}`);

    // Fetch all contacts from EmailOctopus (paginated)
    let allContacts: EmailOctopusContact[] = [];
    let page = 1;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const url = `https://emailoctopus.com/api/1.6/lists/${listId}/contacts?api_key=${apiKey}&limit=${limit}&page=${page}`;
      console.log(`Fetching page ${page}...`);
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        console.error("EmailOctopus API error:", data);
        return new Response(
          JSON.stringify({ error: "Failed to fetch contacts from EmailOctopus", details: data }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const contacts = data.data || [];
      allContacts = [...allContacts, ...contacts];
      
      console.log(`Page ${page}: Got ${contacts.length} contacts. Total so far: ${allContacts.length}`);

      // Check if there are more pages
      if (contacts.length < limit) {
        hasMore = false;
      } else {
        page++;
      }

      // Safety limit to prevent infinite loops
      if (page > 100) {
        console.warn("Reached page limit of 100, stopping pagination");
        hasMore = false;
      }
    }

    console.log(`Total contacts fetched from EmailOctopus: ${allContacts.length}`);

    // Filter contacts by source if specified
    let filteredContacts = allContacts;
    if (source_filter) {
      filteredContacts = allContacts.filter(contact => {
        const source = contact.fields?.Source || contact.fields?.source || '';
        return source.toUpperCase() === source_filter.toUpperCase();
      });
      console.log(`Filtered to ${filteredContacts.length} contacts with source: ${source_filter}`);
    }

    // Get existing emails from waitlist to avoid duplicates
    const { data: existingSignups, error: fetchError } = await supabase
      .from('waitlist_signups')
      .select('email');

    if (fetchError) {
      console.error("Error fetching existing signups:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to check existing signups" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const existingEmails = new Set((existingSignups || []).map(s => s.email.toLowerCase()));
    console.log(`Found ${existingEmails.size} existing emails in waitlist`);

    // Filter out contacts that already exist
    const newContacts = filteredContacts.filter(contact => 
      !existingEmails.has(contact.email_address.toLowerCase())
    );

    console.log(`${newContacts.length} new contacts to import`);

    if (dry_run) {
      return new Response(
        JSON.stringify({
          success: true,
          dry_run: true,
          total_in_emailoctopus: allContacts.length,
          filtered_count: filteredContacts.length,
          already_exists: filteredContacts.length - newContacts.length,
          to_import: newContacts.length,
          preview: newContacts.slice(0, 10).map(c => ({
            email: c.email_address,
            name: c.fields?.FullName || c.fields?.full_name || '',
            source: c.fields?.Source || c.fields?.source || '',
            company: c.fields?.Company || c.fields?.company || '',
          })),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current max waitlist position
    const { data: maxPosData } = await supabase
      .from('waitlist_signups')
      .select('waitlist_position')
      .order('waitlist_position', { ascending: false })
      .limit(1)
      .single();

    let nextPosition = (maxPosData?.waitlist_position || 0) + 1;

    // Import new contacts
    const results: Array<{ email: string; status: string; error?: string }> = [];
    
    for (const contact of newContacts) {
      const email = contact.email_address.toLowerCase();
      const fields = contact.fields || {};
      
      // Build name from fields
      const firstName = fields.FirstName || fields.first_name || '';
      const lastName = fields.LastName || fields.last_name || '';
      const fullName = fields.FullName || fields.full_name || '';
      const name = fullName || `${firstName} ${lastName}`.trim() || null;

      const source = fields.Source || fields.source || 'emailoctopus';
      const company = fields.Company || fields.company || null;
      const useCase = fields.use_case || fields.UseCase || null;
      
      // Generate a unique referral code
      const referralCode = generateReferralCode();

      const signupData = {
        email,
        name,
        company,
        use_case: useCase,
        source,
        referral_code: referralCode,
        waitlist_position: nextPosition,
        referral_count: 0,
        reward_unlocked: false,
      };

      const { error: insertError } = await supabase
        .from('waitlist_signups')
        .insert(signupData);

      if (insertError) {
        console.error(`Failed to insert ${email}:`, insertError);
        results.push({ email, status: 'error', error: insertError.message });
      } else {
        console.log(`Imported: ${email}`);
        results.push({ email, status: 'imported' });
        nextPosition++;

        // Also create referral code entry
        await supabase
          .from('referral_codes')
          .insert({
            code: referralCode,
            user_email: email,
            max_uses: 3,
            reward_type: '3_free_agents',
          });
      }
    }

    const imported = results.filter(r => r.status === 'imported').length;
    const errors = results.filter(r => r.status === 'error').length;

    console.log(`Import complete: ${imported} imported, ${errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        total_in_emailoctopus: allContacts.length,
        filtered_count: filteredContacts.length,
        already_existed: filteredContacts.length - newContacts.length,
        imported,
        errors,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in pull-emailoctopus-contacts function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
