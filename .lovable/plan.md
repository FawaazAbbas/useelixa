

# Simplify Hosting Type to Endpoint-First

## Problem
The `HostingTypeSelector` shows three options (Platform-Hosted, Self-Hosted, Endpoint Agent) but we've established that endpoint-first is the model. Platform-hosted is broken for real projects, and Self-Hosted overlaps with Endpoint Agent without the structured contract benefits.

## Solution
Remove "Platform-Hosted" and "Self-Hosted" from the submission flow and make "Endpoint Agent" the default (and only) option.

### Changes

**1. `src/components/developer/HostingTypeSelector.tsx`**
- Remove the three-card selector entirely
- Replace with a single informational banner explaining the endpoint model: "You host the logic. We call your endpoint with a structured contract."
- Still export the component but it now just sets `hosting_type` to `"endpoint"` automatically

**2. `src/components/developer/AgentSubmissionForm.tsx`**
- Default `hostingType` to `"endpoint"` instead of `"platform"`
- Remove the hosting type selection step (or collapse it into a description)
- Skip rendering `PlatformHostedFields` and `SelfHostedFields` — go straight to `EndpointAgentFields` on step 2
- Remove dead branches for `platform` and `self_hosted` in the review step and submit logic

**3. `src/components/developer/AgentList.tsx`**
- Remove the badge logic that distinguishes between platform/self-hosted/endpoint since all new agents will be endpoint type
- Keep a simple "Endpoint" badge or no badge at all (since it's the only type going forward)

**4. `src/components/developer/AgentDetailSheet.tsx`**
- Remove conditional branches for platform-hosted and self-hosted display
- Always show the endpoint configuration section

### What stays
- Existing platform-hosted and self-hosted agents in the database continue to work (no data migration needed)
- The `hosting_type` and `execution_mode` columns remain — old agents keep their values
- The list/detail views can still render legacy agents gracefully (show a "Legacy" badge)

### What gets removed from active UI
- `PlatformHostedFields.tsx` — no longer imported in the form (file can remain for legacy reference)
- `SelfHostedFields.tsx` — same
- The three-card hosting type picker
- Code upload flow references

