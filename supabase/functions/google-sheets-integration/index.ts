import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getDecryptedCredentials, updateRefreshedToken } from "../_shared/credentials.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getValidAccessToken(
  supabase: any,
  userId: string
): Promise<string> {
  console.log(`[GoogleSheets] Getting credentials for user ${userId}`);

  // Try google_sheets bundle first, then fall back to general googleOAuth2Api
  let credential = await getDecryptedCredentials(supabase, userId, "googleOAuth2Api", "google_sheets");
  
  if (!credential) {
    // Fall back to general Google OAuth credential
    credential = await getDecryptedCredentials(supabase, userId, "googleOAuth2Api");
  }

  if (!credential) {
    throw new Error("No Google Sheets credentials found. Please connect Google Sheets in the Connections page.");
  }

  console.log(`[GoogleSheets] Found credential, encrypted: ${credential.is_encrypted}, expires: ${credential.expires_at}`);

  // Check if token is expired
  const isExpired = credential.expires_at && new Date(credential.expires_at) < new Date();
  
  if (isExpired && credential.refresh_token) {
    console.log("[GoogleSheets] Token expired, refreshing...");
    return await refreshGoogleToken(supabase, userId, credential.refresh_token);
  }

  return credential.access_token;
}

async function refreshGoogleToken(
  supabase: any,
  userId: string,
  refreshToken: string
): Promise<string> {
  const clientId = Deno.env.get("GOOGLEOAUTH2API_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLEOAUTH2API_CLIENT_SECRET");

  if (!clientId || !clientSecret || !refreshToken) {
    console.error("[GoogleSheets] Missing refresh credentials");
    throw new Error("Token refresh failed. Please reconnect your Google account.");
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }).toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[GoogleSheets] Token refresh failed:", errorText);
      throw new Error("Token refresh failed. Please reconnect your Google account.");
    }

    const tokens = await response.json();
    
    // Update the refreshed token in the database
    const updated = await updateRefreshedToken(
      supabase,
      userId,
      "googleOAuth2Api",
      tokens.access_token,
      tokens.expires_in,
      "google_sheets"
    );

    if (!updated) {
      // Try updating without bundle_type as fallback
      await updateRefreshedToken(
        supabase,
        userId,
        "googleOAuth2Api",
        tokens.access_token,
        tokens.expires_in
      );
    }

    console.log("[GoogleSheets] Google token refreshed successfully");
    return tokens.access_token;
  } catch (e) {
    console.error("[GoogleSheets] Refresh error:", e);
    throw new Error("Token refresh failed. Please reconnect your Google account.");
  }
}

async function listSpreadsheets(accessToken: string, params: any): Promise<any> {
  const maxResults = params.maxResults || 20;
  const query = params.query || "";
  
  // Use Drive API to list spreadsheet files
  let url = `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'`;
  if (query) {
    url += ` and name contains '${query}'`;
  }
  url += `&pageSize=${maxResults}&fields=files(id,name,createdTime,modifiedTime,owners)`;
  
  console.log(`[GoogleSheets] Listing spreadsheets`);
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!response.ok) {
    const errText = await response.text();
    console.error("[GoogleSheets] List error:", errText);
    throw new Error(`Failed to list spreadsheets: ${errText}`);
  }
  
  const data = await response.json();
  return {
    spreadsheets: (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      owner: file.owners?.[0]?.emailAddress,
    })),
  };
}

async function getSpreadsheet(accessToken: string, params: any): Promise<any> {
  const { spreadsheetId } = params;
  if (!spreadsheetId) {
    throw new Error("spreadsheetId is required");
  }
  
  console.log(`[GoogleSheets] Getting spreadsheet ${spreadsheetId}`);
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties,sheets.properties`;
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!response.ok) {
    const errText = await response.text();
    console.error("[GoogleSheets] Get spreadsheet error:", errText);
    throw new Error(`Failed to get spreadsheet: ${errText}`);
  }
  
  const data = await response.json();
  return {
    id: data.spreadsheetId,
    title: data.properties?.title,
    sheets: (data.sheets || []).map((sheet: any) => ({
      id: sheet.properties?.sheetId,
      title: sheet.properties?.title,
      index: sheet.properties?.index,
      rowCount: sheet.properties?.gridProperties?.rowCount,
      columnCount: sheet.properties?.gridProperties?.columnCount,
    })),
  };
}

async function readSheetData(accessToken: string, params: any): Promise<any> {
  const { spreadsheetId, range } = params;
  if (!spreadsheetId) {
    throw new Error("spreadsheetId is required");
  }
  
  const sheetRange = range || "Sheet1";
  
  console.log(`[GoogleSheets] Reading data from ${spreadsheetId} range: ${sheetRange}`);
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetRange)}?valueRenderOption=FORMATTED_VALUE`;
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!response.ok) {
    const errText = await response.text();
    console.error("[GoogleSheets] Read data error:", errText);
    throw new Error(`Failed to read sheet data: ${errText}`);
  }
  
  const data = await response.json();
  return {
    range: data.range,
    values: data.values || [],
    rowCount: (data.values || []).length,
    _hint: (data.values || []).length === 0 
      ? "No data found in the specified range. Check that the sheet and range exist." 
      : undefined,
  };
}

async function updateSheetData(accessToken: string, params: any): Promise<any> {
  const { spreadsheetId, range, values } = params;
  if (!spreadsheetId || !range || !values) {
    throw new Error("spreadsheetId, range, and values are required");
  }
  
  console.log(`[GoogleSheets] Updating data in ${spreadsheetId} range: ${range}`);
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  
  const response = await fetch(url, {
    method: "PUT",
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });
  
  if (!response.ok) {
    const errText = await response.text();
    console.error("[GoogleSheets] Update data error:", errText);
    throw new Error(`Failed to update sheet data: ${errText}`);
  }
  
  const data = await response.json();
  return {
    updatedRange: data.updatedRange,
    updatedRows: data.updatedRows,
    updatedColumns: data.updatedColumns,
    updatedCells: data.updatedCells,
  };
}

async function appendSheetData(accessToken: string, params: any): Promise<any> {
  const { spreadsheetId, range, values } = params;
  if (!spreadsheetId || !range || !values) {
    throw new Error("spreadsheetId, range, and values are required");
  }
  
  console.log(`[GoogleSheets] Appending data to ${spreadsheetId} range: ${range}`);
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });
  
  if (!response.ok) {
    const errText = await response.text();
    console.error("[GoogleSheets] Append data error:", errText);
    throw new Error(`Failed to append sheet data: ${errText}`);
  }
  
  const data = await response.json();
  return {
    tableRange: data.tableRange,
    updatedRange: data.updates?.updatedRange,
    updatedRows: data.updates?.updatedRows,
    updatedCells: data.updates?.updatedCells,
  };
}

async function clearSheetData(accessToken: string, params: any): Promise<any> {
  const { spreadsheetId, range } = params;
  if (!spreadsheetId || !range) {
    throw new Error("spreadsheetId and range are required");
  }
  
  console.log(`[GoogleSheets] Clearing data in ${spreadsheetId} range: ${range}`);
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const errText = await response.text();
    console.error("[GoogleSheets] Clear data error:", errText);
    throw new Error(`Failed to clear sheet data: ${errText}`);
  }
  
  const data = await response.json();
  return {
    clearedRange: data.clearedRange,
  };
}

async function createSpreadsheet(accessToken: string, params: any): Promise<any> {
  const { title, sheets } = params;
  if (!title) {
    throw new Error("title is required");
  }
  
  console.log(`[GoogleSheets] Creating spreadsheet: ${title}`);
  
  const sheetsData = sheets || [{ properties: { title: "Sheet1" } }];
  
  const url = "https://sheets.googleapis.com/v4/spreadsheets";
  
  const response = await fetch(url, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: { title },
      sheets: sheetsData,
    }),
  });
  
  if (!response.ok) {
    const errText = await response.text();
    console.error("[GoogleSheets] Create spreadsheet error:", errText);
    throw new Error(`Failed to create spreadsheet: ${errText}`);
  }
  
  const data = await response.json();
  return {
    id: data.spreadsheetId,
    title: data.properties?.title,
    url: data.spreadsheetUrl,
    sheets: (data.sheets || []).map((sheet: any) => ({
      id: sheet.properties?.sheetId,
      title: sheet.properties?.title,
    })),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { action, params } = await req.json();
    console.log(`[GoogleSheets] Action: ${action}`, params);

    const accessToken = await getValidAccessToken(supabase, user.id);
    
    let result;
    switch (action) {
      case "list":
        result = await listSpreadsheets(accessToken, params || {});
        break;
      case "get":
        result = await getSpreadsheet(accessToken, params);
        break;
      case "read":
        result = await readSheetData(accessToken, params);
        break;
      case "update":
        result = await updateSheetData(accessToken, params);
        break;
      case "append":
        result = await appendSheetData(accessToken, params);
        break;
      case "clear":
        result = await clearSheetData(accessToken, params);
        break;
      case "create":
        result = await createSpreadsheet(accessToken, params);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log execution
    await supabase.from("tool_execution_log").insert({
      user_id: user.id,
      tool_name: `sheets_${action}`,
      credential_type: "googleOAuth2Api",
      success: true,
      input_summary: JSON.stringify(params).substring(0, 500),
      output_summary: JSON.stringify(result).substring(0, 500),
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[GoogleSheets] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
