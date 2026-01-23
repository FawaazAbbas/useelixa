import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Encryption key for decrypting credentials
const ENCRYPTION_KEY = Deno.env.get("CREDENTIAL_ENCRYPTION_KEY");

async function decryptToken(encryptedData: string): Promise<string> {
  if (!ENCRYPTION_KEY) {
    throw new Error("Encryption key not configured");
  }

  try {
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const keyData = Uint8Array.from(atob(ENCRYPTION_KEY), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("[GoogleSheets] Decryption error:", error);
    throw new Error("Failed to decrypt token");
  }
}

async function getValidAccessToken(
  supabase: any,
  userId: string
): Promise<string> {
  console.log(`[GoogleSheets] Getting credentials for user ${userId}`);

  // Get credentials for google_sheets bundle type or general google OAuth
  const { data: credential, error } = await supabase
    .from("user_credentials")
    .select("*")
    .eq("user_id", userId)
    .eq("credential_type", "googleOAuth2Api")
    .or("bundle_type.eq.google_sheets,bundle_type.is.null")
    .order("bundle_type", { ascending: false, nullsFirst: false })
    .limit(1)
    .single();

  if (error || !credential) {
    console.error("[GoogleSheets] Credential fetch error:", error);
    throw new Error("No Google Sheets credentials found. Please connect Google Sheets in the Connections page.");
  }

  console.log(`[GoogleSheets] Found credential, encrypted: ${credential.is_encrypted}, expires: ${credential.expires_at}`);

  // Check if token is expired
  const isExpired = credential.expires_at && new Date(credential.expires_at) < new Date();
  
  if (isExpired && credential.refresh_token) {
    console.log("[GoogleSheets] Token expired, refreshing...");
    const refreshUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/refresh-oauth-token`;
    const refreshResponse = await fetch(refreshUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        credentialType: "googleOAuth2Api",
        userId,
        refreshToken: credential.is_encrypted 
          ? await decryptToken(credential.encrypted_refresh_token)
          : credential.refresh_token,
      }),
    });
    
    if (!refreshResponse.ok) {
      const errText = await refreshResponse.text();
      console.error("[GoogleSheets] Token refresh failed:", errText);
      throw new Error("Token refresh failed. Please reconnect your Google account.");
    }
    
    const refreshedData = await refreshResponse.json();
    return refreshedData.access_token;
  }

  // Return the current access token
  if (credential.is_encrypted && credential.encrypted_access_token) {
    return await decryptToken(credential.encrypted_access_token);
  }
  
  return credential.access_token;
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
