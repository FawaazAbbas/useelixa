

# Google Analytics Admin API Enhancement Plan

## Overview

You've enabled the required Google APIs and already have the `analytics.edit` OAuth scope configured. The current implementation only uses read-only reporting capabilities. This plan adds **Admin API management tools** to give the AI full configuration access to Google Analytics.

---

## Current State

### What We Have (9 Read-Only Tools)
| Tool | Purpose |
|------|---------|
| `ga_list_accounts` | List GA accounts |
| `ga_list_properties` | List GA4 properties |
| `ga_get_traffic` | Traffic metrics |
| `ga_get_user_behavior` | Engagement metrics |
| `ga_get_conversions` | Conversion data |
| `ga_get_top_pages` | Top pages report |
| `ga_get_traffic_sources` | Traffic sources |
| `ga_get_realtime` | Realtime users |
| `ga_get_demographics` | Location data |

### OAuth Scopes (Already Configured)
- `analytics.readonly` - For Data API reporting
- `analytics.edit` - For Admin API management

---

## New Capabilities to Add

### 1. Custom Event Management (Admin API)

**New Tools:**
- `ga_list_custom_events` - List configured custom events
- `ga_create_conversion_event` - Mark an event as a conversion (HITL)
- `ga_update_conversion_event` - Modify conversion settings (HITL)
- `ga_delete_conversion_event` - Remove conversion marking (HITL)

### 2. Custom Dimensions and Metrics

**New Tools:**
- `ga_list_custom_dimensions` - List custom dimensions
- `ga_create_custom_dimension` - Create new dimension (HITL)
- `ga_list_custom_metrics` - List custom metrics
- `ga_create_custom_metric` - Create new metric (HITL)

### 3. Data Streams Management

**New Tools:**
- `ga_list_data_streams` - List web/app data streams
- `ga_get_data_stream` - Get stream details including Measurement ID
- `ga_update_data_stream` - Modify stream settings (HITL)

### 4. Audience Management

**New Tools:**
- `ga_list_audiences` - List configured audiences
- `ga_get_audience` - Get audience definition details

### 5. Additional Reporting Tools

**New Tools:**
- `ga_get_devices` - Device category breakdown (desktop, mobile, tablet)
- `ga_get_ecommerce` - E-commerce metrics (transactions, revenue, products)
- `ga_get_landing_pages` - Landing page performance

---

## Implementation Details

### Files to Modify

**1. Edge Function: `supabase/functions/google-analytics-integration/index.ts`**

Add new action handlers for Admin API operations:

```text
New Actions:
- list_custom_events
- create_conversion_event (writes to pending_actions for HITL)
- list_custom_dimensions
- create_custom_dimension (writes to pending_actions for HITL)
- list_data_streams
- get_data_stream
- list_audiences
- get_devices
- get_ecommerce
- get_landing_pages
```

**2. Chat Tool Definitions: `supabase/functions/chat/index.ts`**

Add new tool definitions for the AI to use:

```text
New GA Tools (Read):
- ga_list_custom_events
- ga_list_custom_dimensions
- ga_list_custom_metrics
- ga_list_data_streams
- ga_get_data_stream
- ga_list_audiences
- ga_get_devices
- ga_get_ecommerce
- ga_get_landing_pages

New GA Tools (Write - HITL Required):
- ga_create_conversion_event
- ga_create_custom_dimension
- ga_create_custom_metric
```

**3. Tool Executor: Update tool routing in chat/index.ts**

Map new tool names to google-analytics-integration actions.

---

## API Endpoints Used

### Google Analytics Admin API (v1beta)
```text
Base: https://analyticsadmin.googleapis.com/v1beta

GET  /properties/{propertyId}/conversionEvents      - List conversion events
POST /properties/{propertyId}/conversionEvents      - Create conversion event
GET  /properties/{propertyId}/customDimensions      - List custom dimensions
POST /properties/{propertyId}/customDimensions      - Create custom dimension
GET  /properties/{propertyId}/customMetrics         - List custom metrics
POST /properties/{propertyId}/customMetrics         - Create custom metric
GET  /properties/{propertyId}/dataStreams           - List data streams
GET  /properties/{propertyId}/dataStreams/{id}      - Get stream details
GET  /properties/{propertyId}/audiences             - List audiences
```

### Google Analytics Data API (v1beta) - New Reports
```text
Base: https://analyticsdata.googleapis.com/v1beta

POST /properties/{propertyId}:runReport
- Device report: dimension "deviceCategory"
- E-commerce report: metrics "transactions", "purchaseRevenue", "itemsPurchased"
- Landing pages: dimension "landingPage"
```

---

## Tool Summary (After Implementation)

| Category | Read Tools | Write Tools (HITL) |
|----------|-----------|-------------------|
| Accounts/Properties | 2 | 0 |
| Traffic Reports | 6 → 9 | 0 |
| Configuration | 0 → 6 | 0 → 3 |
| **Total** | **8 → 17** | **0 → 3** |

---

## Human-In-The-Loop (HITL) Integration

Write operations will use the existing `pending_actions` table:

```text
Actions requiring HITL approval:
- ga_create_conversion_event
- ga_create_custom_dimension  
- ga_create_custom_metric
```

The AI will propose the action, user sees an approve/deny button, and execution only happens on approval.

---

## Deployment Steps

1. Update `google-analytics-integration/index.ts` with new action handlers
2. Update `chat/index.ts` with new tool definitions
3. Update tool routing in the chat function
4. Deploy edge functions automatically on save

---

## Expected Outcome

After implementation, the AI will be able to:
- List and create conversion events
- Configure custom dimensions and metrics
- View data stream details (including Measurement IDs)
- Browse configured audiences
- Generate device, e-commerce, and landing page reports
- All write operations require user approval

