import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Shield, User, Pencil, Check, X } from "lucide-react";
import type { OrgMember } from "@/pages/Hierarchy";
import { cn } from "@/lib/utils";

interface OrgChartProps {
  members: OrgMember[];
  isAdmin: boolean;
  currentUserId: string | undefined;
  onUpdateReportsTo: (userId: string, reportsTo: string | null) => void;
  onUpdateJobTitle: (userId: string, jobTitle: string) => void;
}

const roleIcons = { owner: Crown, admin: Shield, member: User };
const roleColors = {
  owner: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  admin: "bg-primary/10 text-primary border-primary/20",
  member: "bg-muted text-muted-foreground border-border",
};

interface TreeNode {
  member: OrgMember;
  children: TreeNode[];
}

function buildTree(members: OrgMember[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  members.forEach(m => map.set(m.user_id, { member: m, children: [] }));

  const roots: TreeNode[] = [];
  members.forEach(m => {
    const node = map.get(m.user_id)!;
    if (m.reports_to && map.has(m.reports_to)) {
      map.get(m.reports_to)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort: owners first, then admins, then members
  const roleOrder: Record<string, number> = { owner: 0, admin: 1, member: 2 };
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => (roleOrder[a.member.role] ?? 2) - (roleOrder[b.member.role] ?? 2));
    nodes.forEach(n => sortNodes(n.children));
  };
  sortNodes(roots);
  return roots;
}

function OrgNode({ node, depth, isAdmin, members, onUpdateReportsTo, onUpdateJobTitle }: {
  node: TreeNode;
  depth: number;
  isAdmin: boolean;
  members: OrgMember[];
  onUpdateReportsTo: (userId: string, reportsTo: string | null) => void;
  onUpdateJobTitle: (userId: string, jobTitle: string) => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(node.member.job_title || "");
  const RoleIcon = roleIcons[node.member.role as keyof typeof roleIcons] || User;

  const handleSaveTitle = () => {
    onUpdateJobTitle(node.member.user_id, titleValue);
    setEditingTitle(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className={cn(
        "relative flex flex-col items-center p-4 rounded-xl border-2 bg-card min-w-[180px] transition-shadow hover:shadow-md",
        depth === 0 ? "border-primary/30" : "border-border"
      )}>
        <Avatar className="h-12 w-12 mb-2">
          <AvatarImage src={node.member.avatar_url || undefined} />
          <AvatarFallback className="text-lg">{node.member.display_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <p className="font-medium text-sm text-foreground">{node.member.display_name}</p>
        
        {/* Job title */}
        <div className="flex items-center gap-1 mt-1 min-h-[24px]">
          {editingTitle ? (
            <div className="flex items-center gap-1">
              <Input
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                className="h-6 text-xs w-24"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
              />
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleSaveTitle}><Check className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setEditingTitle(false)}><X className="h-3 w-3" /></Button>
            </div>
          ) : (
            <>
              <span className="text-xs text-muted-foreground">{node.member.job_title || "No title"}</span>
              {isAdmin && (
                <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => { setTitleValue(node.member.job_title || ""); setEditingTitle(true); }}>
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
            </>
          )}
        </div>

        <Badge variant="outline" className={cn("mt-2 text-xs", roleColors[node.member.role as keyof typeof roleColors])}>
          <RoleIcon className="h-3 w-3 mr-1" />
          {node.member.role.charAt(0).toUpperCase() + node.member.role.slice(1)}
        </Badge>

        {/* Reports to selector (admin only) */}
        {isAdmin && node.member.role !== "owner" && (
          <div className="mt-2 w-full">
            <Select
              value={node.member.reports_to || "none"}
              onValueChange={(v) => onUpdateReportsTo(node.member.user_id, v === "none" ? null : v)}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Reports to..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No one</SelectItem>
                {members
                  .filter(m => m.user_id !== node.member.user_id)
                  .map(m => (
                    <SelectItem key={m.user_id} value={m.user_id}>{m.display_name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Children */}
      {node.children.length > 0 && (
        <div className="flex flex-col items-center mt-2">
          <div className="w-px h-6 bg-border" />
          <div className="flex gap-6">
            {node.children.map((child, i) => (
              <div key={child.member.user_id} className="flex flex-col items-center">
                {node.children.length > 1 && (
                  <div className="w-px h-4 bg-border" />
                )}
                <OrgNode
                  node={child}
                  depth={depth + 1}
                  isAdmin={isAdmin}
                  members={members}
                  onUpdateReportsTo={onUpdateReportsTo}
                  onUpdateJobTitle={onUpdateJobTitle}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrgChart({ members, isAdmin, currentUserId, onUpdateReportsTo, onUpdateJobTitle }: OrgChartProps) {
  const tree = buildTree(members);

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <User className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No team members found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto py-8">
      <div className="flex justify-center gap-8 min-w-max px-8">
        {tree.map(root => (
          <OrgNode
            key={root.member.user_id}
            node={root}
            depth={0}
            isAdmin={isAdmin}
            members={members}
            onUpdateReportsTo={onUpdateReportsTo}
            onUpdateJobTitle={onUpdateJobTitle}
          />
        ))}
      </div>
    </div>
  );
}
