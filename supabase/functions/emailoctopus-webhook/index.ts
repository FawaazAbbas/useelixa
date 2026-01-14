import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, emailoctopus-signature',
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

// Validate EmailOctopus webhook signature using HMAC-SHA256
async function validateSignature(payload: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature) {
    console.log('No signature provided');
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    console.log('Expected signature:', expectedSignature);
    console.log('Received signature:', signature);
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
}

// Build full name from contact fields
function buildName(fields: Record<string, string> | null): string {
  if (!fields) return '';
  
  const firstName = fields.FirstName || fields.first_name || '';
  const lastName = fields.LastName || fields.last_name || '';
  const fullName = fields.FullName || fields.full_name || '';
  
  if (fullName) return fullName.trim();
  return `${firstName} ${lastName}`.trim();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get('EMAILOCTOPUS_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('EMAILOCTOPUS_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get raw body for signature validation
    const rawBody = await req.text();
    console.log('Received webhook payload:', rawBody);

    // Validate signature
    const signature = req.headers.get('EmailOctopus-Signature');
    const isValid = await validateSignature(rawBody, signature, webhookSecret);
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the payload
    const payload = JSON.parse(rawBody);
    console.log('Parsed payload:', JSON.stringify(payload, null, 2));

    // EmailOctopus sends events in an array or as a single object
    const events = Array.isArray(payload) ? payload : [payload];
    
    let processedCount = 0;
    let skippedCount = 0;
    const results: Array<{ email: string; status: string; reason?: string }> = [];

    for (const event of events) {
      // Only process contact.created events
      const eventType = event.type || event.event_type;
      if (eventType !== 'contact.created') {
        console.log(`Skipping event type: ${eventType}`);
        skippedCount++;
        results.push({ 
          email: event.contact_email_address || 'unknown', 
          status: 'skipped', 
          reason: `Event type ${eventType} not processed` 
        });
        continue;
      }

      const email = event.contact_email_address || event.email;
      if (!email) {
        console.log('No email found in event:', event);
        skippedCount++;
        results.push({ email: 'unknown', status: 'skipped', reason: 'No email in event' });
        continue;
      }

      // Check if email already exists in waitlist
      const { data: existing, error: checkError } = await supabase
        .from('waitlist_signups')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for existing email:', checkError);
        results.push({ email, status: 'error', reason: checkError.message });
        continue;
      }

      if (existing) {
        console.log(`Email ${email} already exists in waitlist, skipping`);
        skippedCount++;
        results.push({ email, status: 'skipped', reason: 'Already in waitlist' });
        continue;
      }

      // Extract contact fields
      const fields = event.contact_fields || event.fields || {};
      const tags = event.contact_tags || event.tags || [];
      
      // Determine source based on tags
      const isFBLead = Array.isArray(tags) && 
        tags.some((tag: string) => tag.toLowerCase().includes('fb_lead') || tag.toLowerCase().includes('facebook'));
      const source = isFBLead ? 'facebook_lead' : 'emailoctopus';

      // Get current waitlist count for position
      const { count, error: countError } = await supabase
        .from('waitlist_signups')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error getting waitlist count:', countError);
      }

      const waitlistPosition = (count || 0) + 1;
      const referralCode = generateReferralCode();

      // Build signup data
      const signupData = {
        email: email.toLowerCase(),
        name: buildName(fields) || null,
        company: fields.Company || fields.company || null,
        use_case: fields.use_case || fields.UseCase || fields.use_case_description || null,
        referral_code: referralCode,
        waitlist_position: waitlistPosition,
        source,
        synced_to_emailoctopus: true, // Already in EmailOctopus
      };

      console.log('Inserting signup:', signupData);

      // Insert into waitlist_signups
      const { data: insertData, error: insertError } = await supabase
        .from('waitlist_signups')
        .insert(signupData)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting signup:', insertError);
        results.push({ email, status: 'error', reason: insertError.message });
        continue;
      }

      console.log('Successfully inserted:', insertData);
      processedCount++;
      results.push({ email, status: 'created' });

      // Also create entry in referral_codes table
      const { error: referralError } = await supabase
        .from('referral_codes')
        .insert({
          code: referralCode,
          user_email: email.toLowerCase(),
          max_uses: 3,
          reward_type: '3_free_agents',
        })
        .select()
        .single();

      if (referralError) {
        console.error('Error creating referral code entry:', referralError);
        // Non-fatal error, continue
      }
    }

    console.log(`Webhook processed: ${processedCount} created, ${skippedCount} skipped`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount, 
        skipped: skippedCount,
        results 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('EmailOctopus webhook error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
