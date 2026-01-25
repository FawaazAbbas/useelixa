import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Users,
  Zap,
  Filter,
  Search,
  CheckCheck,
  Trash2,
  ArrowLeft,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MainNavSidebar } from "@/components/MainNavSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { ElixaMascot } from "@/components/ElixaMascot";

const typeIcons: Record<Notification["type"], React.ReactNode> = {
  pending_action: <Bell className="h-5 w-5 text-amber-500" />,
  task_complete: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  team_activity: <Users className="h-5 w-5 text-blue-500" />,
  integration_error: <AlertTriangle className="h-5 w-5 text-destructive" />,
  system: <Zap className="h-5 w-5 text-primary" />,
};

const typeLabels: Record<Notification["type"], string> = {
  pending_action: "Pending Actions",
  task_complete: "Task Complete",
  team_activity: "Team Activity",
  integration_error: "Integration Errors",
  system: "System",
};

const Notifications = () => {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      searchQuery === "" ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || n.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Group by date
  const groupedNotifications = filteredNotifications.reduce((acc, n) => {
    const dateKey = format(new Date(n.created_at), "yyyy-MM-dd");
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
    
    let label = format(new Date(n.created_at), "MMMM d, yyyy");
    if (dateKey === today) label = "Today";
    else if (dateKey === yesterday) label = "Yesterday";

    if (!acc[label]) acc[label] = [];
    acc[label].push(n);
    return acc;
  }, {} as Record<string, Notification[]>);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkMarkRead = async () => {
    for (const id of selectedIds) {
      await markAsRead(id);
    }
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteNotification(id);
    }
    setSelectedIds(new Set());
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block">
        <MainNavSidebar />
      </div>

      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="py-6 px-4 md:py-8 max-w-4xl mx-auto animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
                <p className="text-muted-foreground text-sm">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pending_action">Pending Actions</SelectItem>
                    <SelectItem value="task_complete">Task Complete</SelectItem>
                    <SelectItem value="team_activity">Team Activity</SelectItem>
                    <SelectItem value="integration_error">Integration Errors</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedIds.size} selected
              </span>
              <Button size="sm" variant="outline" onClick={handleBulkMarkRead}>
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark Read
              </Button>
              <Button size="sm" variant="outline" onClick={handleBulkDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                Cancel
              </Button>
            </div>
          )}

          {/* Notifications List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ElixaMascot pose="celebrating" size="lg" animation="bounce" className="mb-4" />
                <h3 className="font-medium text-lg mb-1">
                  {searchQuery || typeFilter !== "all" ? "No matches" : "You're all caught up!"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {searchQuery || typeFilter !== "all"
                    ? "No notifications match your filters"
                    : "Great job staying on top of things!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Select All */}
              <div className="flex items-center gap-2 px-1">
                <Checkbox
                  id="select-all"
                  checked={selectedIds.size === filteredNotifications.length && filteredNotifications.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer">
                  Select all
                </label>
              </div>

              {Object.entries(groupedNotifications).map(([date, items]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
                    {date}
                  </h3>
                  <div className="space-y-2">
                    {items.map((notification) => (
                      <Card
                        key={notification.id}
                        className={cn(
                          "transition-all cursor-pointer hover:shadow-md",
                          !notification.read && "border-primary/30 bg-primary/5",
                          selectedIds.has(notification.id) && "ring-2 ring-primary"
                        )}
                      >
                        <CardContent className="pt-4">
                          <div className="flex gap-4">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={selectedIds.has(notification.id)}
                                onCheckedChange={() => handleToggleSelect(notification.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="mt-0.5">
                                {typeIcons[notification.type]}
                              </div>
                            </div>

                            <div
                              className="flex-1 min-w-0"
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className={cn(
                                    "text-sm",
                                    !notification.read && "font-medium"
                                  )}>
                                    {notification.title}
                                  </p>
                                  {notification.message && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {notification.message}
                                    </p>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {typeLabels[notification.type]}
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.created_at), {
                                    addSuffix: true,
                                  })}
                                </span>

                                <div className="flex gap-1">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification.id);
                                      }}
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Notifications;