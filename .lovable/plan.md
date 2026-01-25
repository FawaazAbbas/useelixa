

# Comprehensive Google Analytics Implementation Plan

## Current State Analysis

### What We Currently Have (22 Tools)

| Category | Tools | Count |
|----------|-------|-------|
| **Account Discovery** | `ga_list_accounts`, `ga_list_properties` | 2 |
| **Traffic Reporting** | `ga_get_traffic`, `ga_get_user_behavior`, `ga_get_realtime` | 3 |
| **Page Analysis** | `ga_get_top_pages`, `ga_get_exit_pages`, `ga_get_landing_pages` | 3 |
| **Acquisition** | `ga_get_traffic_sources` | 1 |
| **Audience** | `ga_get_demographics`, `ga_get_devices` | 2 |
| **E-commerce** | `ga_get_ecommerce`, `ga_get_conversions` | 2 |
| **Configuration (Read)** | `ga_list_conversion_events`, `ga_list_custom_dimensions`, `ga_list_custom_metrics`, `ga_list_data_streams`, `ga_get_data_stream`, `ga_list_audiences` | 6 |
| **Configuration (Write)** | `ga_create_conversion_event`, `ga_create_custom_dimension`, `ga_create_custom_metric` | 3 |

---

## What's Missing (Based on Google's APIs)

### Data API - Additional Reporting Capabilities

| Missing Tool | Purpose | Priority |
|--------------|---------|----------|
| `ga_get_page_traffic_sources` | Traffic source breakdown per page (requested!) | **High** |
| `ga_get_user_journey` | Path exploration / funnel analysis | High |
| `ga_get_events` | All events with parameters | High |
| `ga_get_content_groups` | Content group performance | Medium |
| `ga_get_browser_os` | Browser and OS breakdown | Medium |
| `ga_get_screen_resolution` | Screen size analytics | Low |
| `ga_get_age_gender` | Age/gender demographics | Medium |
| `ga_get_interests` | Interest categories | Medium |
| `ga_get_new_vs_returning` | New vs returning user comparison | Medium |
| `ga_get_hourly` | Hour-of-day performance patterns | Medium |
| `ga_get_campaigns` | UTM campaign performance | High |
| `ga_run_custom_report` | Flexible custom dimension/metric combinations | **High** |
| `ga_get_cohort_analysis` | Cohort retention reports | Medium |
| `ga_compare_periods` | Period-over-period comparison | High |

### Admin API - Additional Management Capabilities

| Missing Tool | Purpose | Priority |
|--------------|---------|----------|
| `ga_create_property` | Create new GA4 property | Medium |
| `ga_update_property` | Update property settings | Medium |
| `ga_get_data_retention` | View data retention settings | Low |
| `ga_update_data_retention` | Modify retention period | Low |
| `ga_list_key_events` | List key events (new naming) | Medium |
| `ga_create_key_event` | Create key event | Medium |
| `ga_list_google_ads_links` | View GA4-Google Ads connections | Medium |
| `ga_create_google_ads_link` | Link GA4 to Google Ads | Medium |
| `ga_list_firebase_links` | View Firebase connections | Low |
| `ga_list_measurement_secrets` | View Measurement Protocol secrets | Low |
| `ga_get_change_history` | View property change history | Medium |
| `ga_archive_dimension` | Archive custom dimension | Low |
| `ga_archive_metric` | Archive custom metric | Low |
| `ga_update_custom_dimension` | Modify existing dimension | Medium |
| `ga_update_custom_metric` | Modify existing metric | Medium |
| `ga_create_audience` | Create new audience | High |
| `ga_get_access_report` | View data access logs | Low |

---

## Implementation Phases

### Phase 1: High-Priority Reporting (Immediate Value)
**7 new tools focusing on common use cases**

1. **`ga_get_page_traffic_sources`** - You specifically asked for this!
2. **`ga_run_custom_report`** - Flexible reporting with any dimension/metric combo
3. **`ga_get_events`** - Complete event listing with parameters
4. **`ga_get_campaigns`** - UTM campaign performance
5. **`ga_compare_periods`** - Period comparison (e.g., this week vs last week)
6. **`ga_get_user_journey`** - Path/funnel analysis
7. **`ga_get_hourly`** - Time-of-day patterns

### Phase 2: Extended Demographics & Behavior
**6 new tools for deeper audience insights**

1. **`ga_get_age_gender`** - Age and gender breakdown
2. **`ga_get_interests`** - Interest categories
3. **`ga_get_browser_os`** - Technology breakdown
4. **`ga_get_new_vs_returning`** - User type comparison
5. **`ga_get_content_groups`** - Content performance by group
6. **`ga_get_cohort_analysis`** - Retention cohorts

### Phase 3: Advanced Admin API
**10 new management tools**

1. **`ga_list_key_events`** - Updated key events API
2. **`ga_create_key_event`** - Create key events (HITL)
3. **`ga_update_custom_dimension`** - Modify dimensions (HITL)
4. **`ga_update_custom_metric`** - Modify metrics (HITL)
5. **`ga_archive_dimension`** - Archive dimension (HITL)
6. **`ga_archive_metric`** - Archive metric (HITL)
7. **`ga_list_google_ads_links`** - View Ads links
8. **`ga_create_google_ads_link`** - Link to Ads (HITL)
9. **`ga_get_change_history`** - Audit trail
10. **`ga_create_audience`** - Create audiences (HITL)

---

## File Changes Summary

### `supabase/functions/google-analytics-integration/index.ts`

Add action handlers for each new tool:

```text
// Phase 1 Actions
- get_page_traffic_sources (pagePath + source/medium dimensions with filtering)
- run_custom_report (accepts arbitrary dimensions/metrics arrays)
- get_events (eventName dimension with all event metrics)
- get_campaigns (UTM dimensions: campaign, source, medium, term, content)
- compare_periods (two dateRanges in single request)
- get_user_journey (multiple page dimensions for path analysis)
- get_hourly (hour + dayOfWeek dimensions)

// Phase 2 Actions
- get_age_gender (userAgeBracket, userGender dimensions)
- get_interests (brandingInterest dimension)
- get_browser_os (browser, operatingSystem dimensions)
- get_new_vs_returning (newVsReturning dimension)
- get_content_groups (contentGroup dimension)
- get_cohort_analysis (cohort dimensions with cohort spec)

// Phase 3 Actions
- list_key_events (Admin API v1beta keyEvents endpoint)
- create_key_event (POST to keyEvents - HITL)
- update_custom_dimension (PATCH customDimensions - HITL)
- update_custom_metric (PATCH customMetrics - HITL)
- archive_dimension (POST archive - HITL)
- archive_metric (POST archive - HITL)
- list_google_ads_links (GET googleAdsLinks)
- create_google_ads_link (POST googleAdsLinks - HITL)
- get_change_history (searchChangeHistoryEvents)
- create_audience (POST audiences - HITL)
```

### `supabase/functions/chat/index.ts`

Add tool definitions with appropriate input schemas and update WRITE_TOOLS array for HITL tools:

```text
New Read Tools (13):
- ga_get_page_traffic_sources
- ga_run_custom_report
- ga_get_events
- ga_get_campaigns
- ga_compare_periods
- ga_get_user_journey
- ga_get_hourly
- ga_get_age_gender
- ga_get_interests
- ga_get_browser_os
- ga_get_new_vs_returning
- ga_get_content_groups
- ga_get_cohort_analysis
- ga_list_key_events
- ga_list_google_ads_links
- ga_get_change_history

New Write Tools (HITL required) (7):
- ga_create_key_event
- ga_update_custom_dimension
- ga_update_custom_metric
- ga_archive_dimension
- ga_archive_metric
- ga_create_google_ads_link
- ga_create_audience
```

---

## The Power Feature: `ga_run_custom_report`

This single tool enables virtually unlimited flexibility by accepting any valid dimension/metric combination:

```javascript
{
  name: "ga_run_custom_report",
  description: "Run a custom GA4 report with any combination of dimensions and metrics. Maximum 9 dimensions and 10 metrics per query.",
  parameters: {
    propertyId: "string (required)",
    dimensions: "array of dimension names (e.g., ['pagePath', 'sessionSource'])",
    metrics: "array of metric names (e.g., ['sessions', 'bounceRate'])",
    startDate: "string",
    endDate: "string",
    dimensionFilter: "object (optional filter)",
    orderBy: "object (optional sorting)",
    limit: "number (max results)"
  }
}
```

This would enable answering complex questions like:
- "Show me sessions by browser and device for mobile users only"
- "Get conversion rate by landing page and traffic source"
- "Compare engagement by content group and country"

---

## API Limitations to Note

1. **Dimensions per query**: Maximum 9
2. **Metrics per query**: Maximum 10  
3. **Realtime API**: Limited dimensions/metrics available
4. **Demographics**: Requires thresholds (privacy protection)
5. **Some Admin operations**: Require v1alpha (beta has limits)

---

## Final Tool Count After Full Implementation

| Category | Current | After Phase 1 | After Phase 2 | After Phase 3 |
|----------|---------|---------------|---------------|---------------|
| Reporting | 13 | 20 | 26 | 26 |
| Configuration (Read) | 6 | 6 | 6 | 9 |
| Configuration (Write) | 3 | 3 | 3 | 10 |
| **Total** | **22** | **29** | **35** | **45** |

---

## Recommendation

Start with **Phase 1** to immediately address your request for page-level traffic sources and add the most impactful flexible reporting tools. The `ga_run_custom_report` tool alone covers most edge cases where specific dimension/metric combinations are needed.

Would you like me to implement all three phases, or start with Phase 1?

