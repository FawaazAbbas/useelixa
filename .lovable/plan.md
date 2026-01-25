
# Google Ads Integration - Full Capability Expansion

## Current State Assessment

### Existing Tools (14)
| Category | Tools |
|----------|-------|
| Account | `gads_list_customers` |
| Campaigns | `gads_get_campaigns`, `gads_update_campaign_status`, `gads_update_campaign_budget` |
| Ad Groups | `gads_get_ad_groups`, `gads_update_ad_group_status` |
| Ads | `gads_get_ads`, `gads_update_ad_status` |
| Keywords | `gads_get_keywords`, `gads_update_keyword_status`*, `gads_add_keyword`* |
| Reporting | `gads_get_budget_summary`, `gads_get_account_performance` |

*Backend implemented but missing frontend tool definitions

---

## Proposed Additions: 35+ New Tools

### 1. Conversion Tracking (High Priority)
| Tool | Description |
|------|-------------|
| `gads_list_conversions` | List all conversion actions with tracking status |
| `gads_get_conversion_stats` | Get conversion metrics by action type |
| `gads_create_conversion` | Create a new conversion action (HITL) |
| `gads_update_conversion` | Update conversion action settings (HITL) |
| `gads_upload_offline_conversions` | Upload offline/CRM conversions (HITL) |

### 2. Audience Management (High Priority)
| Tool | Description |
|------|-------------|
| `gads_list_audiences` | List all custom and remarketing audiences |
| `gads_get_audience_insights` | Get audience size and demographics |
| `gads_create_audience` | Create custom audience segment (HITL) |
| `gads_list_remarketing_lists` | List remarketing/user lists |
| `gads_add_audience_to_campaign` | Add audience targeting to campaign (HITL) |

### 3. Bidding & Optimization
| Tool | Description |
|------|-------------|
| `gads_list_bidding_strategies` | List all bidding strategies |
| `gads_get_bidding_performance` | Get bidding strategy performance |
| `gads_update_bidding_strategy` | Update bidding strategy settings (HITL) |
| `gads_set_keyword_bid` | Set individual keyword CPC bid (HITL) |
| `gads_get_bid_simulator` | Get bid simulator projections |

### 4. Extensions/Assets
| Tool | Description |
|------|-------------|
| `gads_list_extensions` | List all ad extensions by type |
| `gads_create_sitelink` | Create sitelink extension (HITL) |
| `gads_create_callout` | Create callout extension (HITL) |
| `gads_create_call_extension` | Create call extension (HITL) |
| `gads_update_extension_status` | Enable/disable extensions (HITL) |

### 5. Targeting Criteria
| Tool | Description |
|------|-------------|
| `gads_get_location_targeting` | Get geographic targeting settings |
| `gads_set_location_targeting` | Update location targeting (HITL) |
| `gads_get_device_targeting` | Get device bid adjustments |
| `gads_set_device_bid_adjustment` | Set device bid modifiers (HITL) |
| `gads_get_schedule_targeting` | Get ad schedule settings |
| `gads_set_ad_schedule` | Update ad scheduling/dayparting (HITL) |
| `gads_get_demographics` | Get demographic targeting |
| `gads_set_demographic_targeting` | Update demographic bids (HITL) |

### 6. Search Terms & Negatives
| Tool | Description |
|------|-------------|
| `gads_get_search_terms` | Get search terms report with metrics |
| `gads_add_negative_keyword` | Add negative keywords (HITL) |
| `gads_list_negative_keywords` | List all negative keywords |
| `gads_add_search_term_as_keyword` | Promote search term to keyword (HITL) |

### 7. Recommendations & Insights
| Tool | Description |
|------|-------------|
| `gads_get_recommendations` | Get Google's optimization recommendations |
| `gads_apply_recommendation` | Apply a recommendation (HITL) |
| `gads_dismiss_recommendation` | Dismiss a recommendation (HITL) |
| `gads_get_quality_score_insights` | Get detailed quality score breakdown |

### 8. Campaign Creation (Advanced)
| Tool | Description |
|------|-------------|
| `gads_create_campaign` | Create new campaign (HITL) |
| `gads_create_ad_group` | Create new ad group (HITL) |
| `gads_create_responsive_search_ad` | Create responsive search ad (HITL) |

### 9. Labels & Organization
| Tool | Description |
|------|-------------|
| `gads_list_labels` | List all account labels |
| `gads_create_label` | Create a new label (HITL) |
| `gads_apply_label` | Apply label to campaign/ad group/ad (HITL) |

### 10. Keyword Planning
| Tool | Description |
|------|-------------|
| `gads_generate_keyword_ideas` | Generate keyword suggestions |
| `gads_get_keyword_forecast` | Get traffic/cost forecasts for keywords |

### 11. Change History
| Tool | Description |
|------|-------------|
| `gads_get_change_history` | View recent account changes |

---

## Implementation Priority

### Phase 1 - Essential (Fix + Core Reporting)
1. **Fix missing tool definitions** for `gads_update_keyword_status` and `gads_add_keyword`
2. **Add search terms report** - Critical for optimization
3. **Add negative keywords** - Essential for waste reduction
4. **Add conversion tracking** - Core to measuring ROI

### Phase 2 - Optimization
5. **Bidding controls** - Manual bid adjustments
6. **Recommendations** - Apply Google's suggestions
7. **Quality score insights** - Detailed breakdowns
8. **Location targeting** - Geo-targeting controls

### Phase 3 - Advanced
9. **Extensions management** - Sitelinks, callouts
10. **Audience management** - Remarketing lists
11. **Campaign creation** - Full creation capabilities
12. **Keyword planning** - Idea generation

---

## Technical Notes

### Required Scopes
The current `adwords` scope covers all Google Ads API operations.

### HITL (Human-in-the-Loop)
All "write" operations will require user confirmation before execution, following the existing pattern.

### API Version
Using Google Ads API v17 (already configured in the integration).

---

## User Requirements

Before implementation, you'll need to confirm:
1. **Do you have access to all Google Ads API features?** Some features like Audience Insights require allowlisting.
2. **Conversion upload**: Do you want to support offline conversion uploads from CRM data?
3. **Keyword planning**: This may require separate API access approval from Google.

---

## Summary

| Current State | Proposed State |
|---------------|----------------|
| 14 tools (12 exposed) | 50+ tools |
| Basic CRUD | Full account control |
| Read-heavy | Balanced read/write |
| No conversion tracking | Full conversion management |
| No audience management | Complete audience control |
| No keyword planning | Idea generation + forecasts |
| No extensions | All extension types |
| No targeting controls | Location, device, schedule, demographics |
