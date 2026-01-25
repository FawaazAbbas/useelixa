import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getDecryptedCredentials, updateRefreshedToken } from "../_shared/credentials.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Google Places API (new)
const PLACES_API = "https://places.googleapis.com/v1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { action, params } = await req.json();
    console.log(`[Places] Action: ${action}, User: ${user.id}`);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const creds = await getDecryptedCredentials(serviceClient, user.id, "googleOAuth2Api", "places");
    if (!creds) {
      throw new Error("Google Places not connected. Please connect your Google account first.");
    }

    let accessToken = creds.access_token;

    if (creds.expires_at && new Date(creds.expires_at) < new Date()) {
      console.log("[Places] Token expired, refreshing...");
      if (!creds.refresh_token) {
        throw new Error("No refresh token available. Please reconnect your account.");
      }
      const refreshed = await refreshGoogleToken(serviceClient, user.id, creds.refresh_token);
      if (!refreshed) {
        throw new Error("Failed to refresh Google token. Please reconnect your account.");
      }
      accessToken = refreshed;
    }

    let result;

    switch (action) {
      // ============= SEARCH PLACES =============
      case "search_nearby": {
        const latitude = params?.latitude;
        const longitude = params?.longitude;
        const radius = params?.radius || 1000; // meters
        const types = params?.types; // e.g., ["restaurant", "cafe"]

        if (!latitude || !longitude) {
          throw new Error("latitude and longitude are required");
        }

        const requestBody: any = {
          includedTypes: types || ["restaurant"],
          maxResultCount: params?.maxResults || 20,
          locationRestriction: {
            circle: {
              center: { latitude, longitude },
              radius,
            },
          },
        };

        const response = await fetch(`${PLACES_API}/places:searchNearby`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.types,places.regularOpeningHours,places.photos,places.id",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[Places] Search error:", error);
          throw new Error(`Places API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          places: data.places?.map(formatPlace) || [],
        };
        break;
      }

      case "search_text": {
        const query = params?.query;
        if (!query) throw new Error("query is required");

        const requestBody: any = {
          textQuery: query,
          maxResultCount: params?.maxResults || 20,
        };

        if (params?.latitude && params?.longitude) {
          requestBody.locationBias = {
            circle: {
              center: { latitude: params.latitude, longitude: params.longitude },
              radius: params.radius || 5000,
            },
          };
        }

        const response = await fetch(`${PLACES_API}/places:searchText`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.types,places.regularOpeningHours,places.id,places.websiteUri,places.internationalPhoneNumber",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error(`Places API error: ${response.status}`);
        const data = await response.json();
        result = {
          places: data.places?.map(formatPlace) || [],
        };
        break;
      }

      // ============= GET PLACE DETAILS =============
      case "get_place": {
        const placeId = params?.placeId;
        if (!placeId) throw new Error("placeId is required");

        const response = await fetch(`${PLACES_API}/places/${placeId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Goog-FieldMask": "displayName,formattedAddress,location,rating,userRatingCount,priceLevel,types,regularOpeningHours,reviews,photos,websiteUri,internationalPhoneNumber,googleMapsUri,currentOpeningHours,editorialSummary,accessibilityOptions",
          },
        });

        if (!response.ok) throw new Error(`Places API error: ${response.status}`);
        result = formatPlace(await response.json());
        break;
      }

      // ============= AUTOCOMPLETE =============
      case "autocomplete": {
        const input = params?.input;
        if (!input) throw new Error("input is required");

        const requestBody: any = {
          input,
          includedPrimaryTypes: params?.types,
        };

        if (params?.latitude && params?.longitude) {
          requestBody.locationBias = {
            circle: {
              center: { latitude: params.latitude, longitude: params.longitude },
              radius: params.radius || 5000,
            },
          };
        }

        const response = await fetch(`${PLACES_API}/places:autocomplete`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error(`Places API error: ${response.status}`);
        const data = await response.json();
        result = {
          suggestions: data.suggestions?.map((s: any) => ({
            placeId: s.placePrediction?.placeId,
            text: s.placePrediction?.text?.text,
            structuredFormat: s.placePrediction?.structuredFormat,
          })) || [],
        };
        break;
      }

      // ============= COMPETITOR ANALYSIS =============
      case "find_competitors": {
        const businessType = params?.businessType;
        const latitude = params?.latitude;
        const longitude = params?.longitude;
        const radius = params?.radius || 2000;

        if (!businessType || !latitude || !longitude) {
          throw new Error("businessType, latitude, and longitude are required");
        }

        const response = await fetch(`${PLACES_API}/places:searchNearby`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.types,places.regularOpeningHours,places.id,places.websiteUri",
          },
          body: JSON.stringify({
            includedTypes: [businessType],
            maxResultCount: 20,
            locationRestriction: {
              circle: {
                center: { latitude, longitude },
                radius,
              },
            },
            rankPreference: "POPULARITY",
          }),
        });

        if (!response.ok) throw new Error(`Places API error: ${response.status}`);
        const data = await response.json();

        const competitors = data.places?.map(formatPlace) || [];
        
        // Calculate competitive insights
        const avgRating = competitors.length > 0
          ? competitors.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / competitors.length
          : 0;
        const avgReviews = competitors.length > 0
          ? competitors.reduce((sum: number, p: any) => sum + (p.userRatingCount || 0), 0) / competitors.length
          : 0;

        result = {
          competitors,
          insights: {
            totalCompetitors: competitors.length,
            averageRating: avgRating.toFixed(2),
            averageReviewCount: Math.round(avgReviews),
            topRated: competitors.filter((p: any) => p.rating >= 4.5).length,
            priceDistribution: getPriceDistribution(competitors),
          },
        };
        break;
      }

      // ============= AREA ANALYSIS =============
      case "analyze_area": {
        const latitude = params?.latitude;
        const longitude = params?.longitude;
        const radius = params?.radius || 1000;

        if (!latitude || !longitude) {
          throw new Error("latitude and longitude are required");
        }

        // Search for various business types
        const businessTypes = ["restaurant", "cafe", "store", "gym", "bank", "pharmacy"];
        const areaCounts: Record<string, number> = {};

        for (const type of businessTypes) {
          const response = await fetch(`${PLACES_API}/places:searchNearby`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              "X-Goog-FieldMask": "places.id",
            },
            body: JSON.stringify({
              includedTypes: [type],
              maxResultCount: 20,
              locationRestriction: {
                circle: {
                  center: { latitude, longitude },
                  radius,
                },
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            areaCounts[type] = data.places?.length || 0;
          }
        }

        result = {
          location: { latitude, longitude },
          radiusMeters: radius,
          businessCounts: areaCounts,
          totalBusinesses: Object.values(areaCounts).reduce((a, b) => a + b, 0),
          dominantCategory: Object.entries(areaCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown",
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Places] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatPlace(place: any): any {
  return {
    id: place.id,
    name: place.displayName?.text,
    address: place.formattedAddress,
    location: place.location,
    rating: place.rating,
    userRatingCount: place.userRatingCount,
    priceLevel: place.priceLevel,
    types: place.types,
    website: place.websiteUri,
    phone: place.internationalPhoneNumber,
    googleMapsUrl: place.googleMapsUri,
    openingHours: place.regularOpeningHours?.weekdayDescriptions,
    isOpen: place.currentOpeningHours?.openNow,
    editorialSummary: place.editorialSummary?.text,
    reviews: place.reviews?.map((r: any) => ({
      author: r.authorAttribution?.displayName,
      rating: r.rating,
      text: r.text?.text,
      time: r.publishTime,
    })),
  };
}

function getPriceDistribution(places: any[]): Record<string, number> {
  const distribution: Record<string, number> = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 0,
    PRICE_LEVEL_MODERATE: 0,
    PRICE_LEVEL_EXPENSIVE: 0,
    PRICE_LEVEL_VERY_EXPENSIVE: 0,
    UNKNOWN: 0,
  };

  for (const place of places) {
    const level = place.priceLevel || "UNKNOWN";
    distribution[level] = (distribution[level] || 0) + 1;
  }

  return distribution;
}

async function refreshGoogleToken(
  serviceClient: any,
  userId: string,
  refreshToken: string
): Promise<string | null> {
  try {
    const clientId = Deno.env.get("GOOGLEOAUTH2API_CLIENT_ID")?.trim();
    const clientSecret = Deno.env.get("GOOGLEOAUTH2API_CLIENT_SECRET")?.trim();

    if (!clientId || !clientSecret) {
      console.error("[Places] Missing Google OAuth credentials");
      return null;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Places] Token refresh failed:", error);
      return null;
    }

    const tokens = await response.json();
    await updateRefreshedToken(serviceClient, userId, "googleOAuth2Api", tokens.access_token, tokens.expires_in, "places");
    return tokens.access_token;
  } catch (error) {
    console.error("[Places] Token refresh error:", error);
    return null;
  }
}
