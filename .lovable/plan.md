

# Add Exit and Scroll Metrics to GA Top Pages Report

## Overview

Enhance the `ga_get_top_pages` tool to include scroll depth data. For exit rate, GA4 has important differences from Universal Analytics that affect what's available.

---

## What GA4 Actually Provides

### Scroll Depth
GA4 has a built-in metric that can be added directly:
- **`scrolledUsers`** - Count of unique users who scrolled at least 90% of the page
- This is automatically collected when Enhanced Measurement is enabled

### Exit Rate - Important Context
GA4 handles exits differently than Universal Analytics:
- There is **no direct `exitRate` metric** in the GA4 Data API
- Exits are tracked through the `session_end` event and exit page dimension
- To get exit data per page, we need to use the `exitPage` dimension instead of `pagePath`

---

## Implementation Approach

### Option 1: Add Scroll to Existing Top Pages (Recommended)
Add `scrolledUsers` metric to the current `get_top_pages` action.

### Option 2: Create Separate Exit Pages Report
Create a new `get_exit_pages` tool using the `exitPage` dimension to show which pages users leave from most.

---

## File Changes

### 1. Update `google-analytics-integration/index.ts`

**Modify `get_top_pages` action (lines 240-276):**

Current metrics:
```javascript
metrics: [
  { name: "screenPageViews" },
  { name: "activeUsers" },
  { name: "averageSessionDuration" },
  { name: "bounceRate" },
]
```

Updated metrics:
```javascript
metrics: [
  { name: "screenPageViews" },
  { name: "activeUsers" },
  { name: "averageSessionDuration" },
  { name: "bounceRate" },
  { name: "scrolledUsers" },  // NEW: Users who scrolled 90%+
]
```

**Add new `get_exit_pages` action:**

```javascript
case "get_exit_pages": {
  const propertyId = params?.propertyId;
  if (!propertyId) throw new Error("propertyId is required");

  const startDate = params?.startDate || "30daysAgo";
  const endDate = params?.endDate || "today";

  const response = await fetch(`${GA_API_BASE}/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "exitPage" }],  // Exit page dimension
      metrics: [
        { name: "sessions" },       // Sessions that exited from this page
        { name: "activeUsers" },
        { name: "bounceRate" },
        { name: "engagementRate" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: params?.limit || 20,
    }),
  });

  // ... response handling
}
```

### 2. Update `chat/index.ts`

Add new tool definition:

```javascript
{
  name: "ga_get_exit_pages",
  description: "Get exit page analysis showing which pages users most frequently leave from. Returns exit page paths with session counts and engagement metrics.",
  input_schema: {
    type: "object",
    properties: {
      propertyId: {
        type: "string",
        description: "GA4 property ID (e.g., 'properties/123456789')",
      },
      startDate: {
        type: "string",
        description: "Start date (YYYY-MM-DD or relative like '30daysAgo')",
      },
      endDate: {
        type: "string",
        description: "End date (YYYY-MM-DD or 'today')",
      },
      limit: {
        type: "number",
        description: "Maximum number of pages to return (default: 20)",
      },
    },
    required: ["propertyId"],
  },
}
```

Add tool routing in switch statement.

---

## Summary of Changes

| Change | File | Description |
|--------|------|-------------|
| Add `scrolledUsers` metric | google-analytics-integration | Add to existing `get_top_pages` |
| Add `get_exit_pages` action | google-analytics-integration | New action for exit analysis |
| Add `ga_get_exit_pages` tool | chat/index.ts | New tool definition |
| Add tool routing | chat/index.ts | Map tool to action |

---

## What the AI Can Report After Implementation

**Top Pages Report** will now include:
- Page path and title
- Page views
- Active users
- Average session duration
- Bounce rate
- **Scrolled users** (90%+ scroll depth)

**Exit Pages Report** (new) will show:
- Which pages users exit from most
- Session counts per exit page
- Engagement metrics for those pages

---

## Important Notes

1. **Scroll tracking requires Enhanced Measurement** to be enabled in GA4 property settings
2. **Exit page** is different from page path - it shows where sessions ended, not general page views
3. If scroll data returns 0, the user should check their GA4 Enhanced Measurement settings

