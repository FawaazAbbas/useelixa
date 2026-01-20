import { useState } from "react";
import { ChevronDown, CheckCircle2, XCircle, Clock, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ToolExecution {
  toolName: string;
  success: boolean;
  executionTimeMs?: number;
  inputSummary?: string;
  outputSummary?: string;
  errorMessage?: string;
}

interface Props {
  executions: ToolExecution[];
  className?: string;
}

const TOOL_DISPLAY_NAMES: Record<string, string> = {
  gmail_send_email: "Send Email",
  gmail_search: "Search Email",
  gmail_read_email: "Read Email",
  google_sheets_read: "Read Spreadsheet",
  google_sheets_write: "Write Spreadsheet",
  google_drive_list: "List Drive Files",
  google_drive_upload: "Upload to Drive",
  google_calendar_list_events: "List Calendar Events",
  google_calendar_create_event: "Create Calendar Event",
  notion_search: "Search Notion",
  notion_create_page: "Create Notion Page",
  notion_query_database: "Query Notion Database",
  notion_update_page: "Update Notion Page",
  slack_send_message: "Send Slack Message",
  slack_list_channels: "List Slack Channels",
  slack_get_messages: "Get Slack Messages",
  calendly_list_events: "List Calendly Events",
  calendly_get_event_types: "Get Event Types",
  outlook_send_email: "Send Outlook Email",
  outlook_search_email: "Search Outlook",
  teams_send_message: "Send Teams Message",
  onedrive_list_files: "List OneDrive Files",
  hubspot_create_contact: "Create HubSpot Contact",
  hubspot_search_contacts: "Search HubSpot Contacts",
  mailchimp_list_audiences: "List Mailchimp Audiences",
  mailchimp_add_subscriber: "Add Mailchimp Subscriber",
};

const TOOL_ICONS: Record<string, string> = {
  gmail: "📧",
  google_sheets: "📊",
  google_drive: "📁",
  google_calendar: "📅",
  notion: "📝",
  slack: "💬",
  calendly: "🗓️",
  outlook: "📬",
  teams: "👥",
  onedrive: "☁️",
  hubspot: "🎯",
  mailchimp: "📮",
};

function getToolIcon(toolName: string): string {
  for (const [prefix, icon] of Object.entries(TOOL_ICONS)) {
    if (toolName.startsWith(prefix)) return icon;
  }
  return "🔧";
}

export function ToolExecutionCard({ executions, className }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (executions.length === 0) return null;

  const allSuccess = executions.every((e) => e.success);
  const totalTime = executions.reduce((sum, e) => sum + (e.executionTimeMs || 0), 0);

  return (
    <div
      className={cn(
        "my-2 rounded-lg border bg-muted/30 text-sm overflow-hidden",
        className
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors"
      >
        <Wrench className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 text-left">
          {executions.length === 1
            ? TOOL_DISPLAY_NAMES[executions[0].toolName] || executions[0].toolName
            : `Used ${executions.length} tools`}
        </span>
        {allSuccess ? (
          <Badge variant="outline" className="text-green-600 border-green-600 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </Badge>
        ) : (
          <Badge variant="outline" className="text-red-600 border-red-600 gap-1">
            <XCircle className="h-3 w-3" />
            Error
          </Badge>
        )}
        {totalTime > 0 && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {totalTime}ms
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {isExpanded && (
        <div className="border-t p-3 space-y-3 bg-background/50">
          {executions.map((execution, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2">
                <span>{getToolIcon(execution.toolName)}</span>
                <span className="font-medium">
                  {TOOL_DISPLAY_NAMES[execution.toolName] || execution.toolName}
                </span>
                {execution.success ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-600" />
                )}
              </div>

              {execution.inputSummary && (
                <div className="text-xs text-muted-foreground pl-6">
                  <span className="font-medium">Input:</span>{" "}
                  {execution.inputSummary.length > 100
                    ? execution.inputSummary.substring(0, 100) + "..."
                    : execution.inputSummary}
                </div>
              )}

              {execution.success && execution.outputSummary && (
                <div className="text-xs text-muted-foreground pl-6">
                  <span className="font-medium">Result:</span>{" "}
                  {execution.outputSummary.length > 150
                    ? execution.outputSummary.substring(0, 150) + "..."
                    : execution.outputSummary}
                </div>
              )}

              {!execution.success && execution.errorMessage && (
                <div className="text-xs text-red-600 pl-6">
                  <span className="font-medium">Error:</span> {execution.errorMessage}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
