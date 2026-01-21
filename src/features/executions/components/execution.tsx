"use client";

import { useSuspenseExecution } from "../hooks/use-executions";
import { ExecutionStatus, LogLevel } from "@/generated/prisma/enums";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  Loader2Icon,
  BanIcon,
  HistoryIcon,
  InfoIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  BugIcon,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const statusConfig: Record<
  ExecutionStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  [ExecutionStatus.PENDING]: {
    label: "Pending",
    icon: ClockIcon,
    variant: "outline",
  },
  [ExecutionStatus.RUNNING]: {
    label: "Running",
    icon: Loader2Icon,
    variant: "default",
  },
  [ExecutionStatus.SUCCESS]: {
    label: "Success",
    icon: CheckCircle2Icon,
    variant: "default",
  },
  [ExecutionStatus.ERROR]: {
    label: "Error",
    icon: XCircleIcon,
    variant: "destructive",
  },
  [ExecutionStatus.CANCELLED]: {
    label: "Cancelled",
    icon: BanIcon,
    variant: "secondary",
  },
};

const logLevelConfig: Record<
  LogLevel,
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  [LogLevel.INFO]: {
    label: "Info",
    icon: InfoIcon,
    className: "text-blue-500",
  },
  [LogLevel.WARN]: {
    label: "Warn",
    icon: AlertTriangleIcon,
    className: "text-yellow-500",
  },
  [LogLevel.ERROR]: {
    label: "Error",
    icon: AlertCircleIcon,
    className: "text-red-500",
  },
  [LogLevel.DEBUG]: {
    label: "Debug",
    icon: BugIcon,
    className: "text-gray-500",
  },
};

export const ExecutionView = ({ executionId }: { executionId: string }) => {
  const { data: execution } = useSuspenseExecution(executionId);
  const statusInfo = statusConfig[execution.status];
  const StatusIcon = statusInfo.icon;

  const duration = execution.completedAt
    ? Math.round((execution.completedAt.getTime() - execution.startedAt.getTime()) / 1000)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Execution Details</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View execution logs and details
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/executions" prefetch>Back to Executions</Link>
        </Button>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Status</CardTitle>
            <Badge
              variant={statusInfo.variant}
              className={cn(
                "flex items-center gap-1",
                execution.status === ExecutionStatus.RUNNING && "animate-pulse"
              )}
            >
              <StatusIcon
                className={cn(
                  "size-3",
                  execution.status === ExecutionStatus.RUNNING && "animate-spin"
                )}
              />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Workflow</p>
              <Link
                href={`/workflows/${execution.workflow.id}`}
                className="text-sm font-medium hover:underline"
              >
                {execution.workflow.name}
              </Link>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Started</p>
              <p className="text-sm font-medium">
                {format(execution.startedAt, "PPpp")}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(execution.startedAt)} ago
              </p>
            </div>
            {execution.completedAt && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-sm font-medium">
                    {format(execution.completedAt, "PPpp")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(execution.completedAt)} ago
                  </p>
                </div>
                {duration !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium">{duration}s</p>
                  </div>
                )}
              </>
            )}
          </div>
          {execution.error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm font-medium text-destructive mb-1">Error</p>
              <p className="text-sm text-destructive">{execution.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="size-5" />
            Execution Logs ({execution.logs.length})
          </CardTitle>
          <CardDescription>
            Timeline of events during workflow execution
          </CardDescription>
        </CardHeader>
        <CardContent>
          {execution.logs.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No logs available for this execution
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {execution.logs.map((log, index) => {
                  const logInfo = logLevelConfig[log.level];
                  const LogIcon = logInfo.icon;
                  return (
                    <div key={log.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "size-8 rounded-full flex items-center justify-center",
                            log.level === LogLevel.ERROR && "bg-red-100",
                            log.level === LogLevel.WARN && "bg-yellow-100",
                            log.level === LogLevel.INFO && "bg-blue-100",
                            log.level === LogLevel.DEBUG && "bg-gray-100"
                          )}
                        >
                          <LogIcon className={cn("size-4", logInfo.className)} />
                        </div>
                        {index < execution.logs.length - 1 && (
                          <div className="w-0.5 h-full bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {logInfo.label}
                              </Badge>
                              {log.nodeName && (
                                <span className="text-xs font-medium text-muted-foreground">
                                  {log.nodeName}
                                </span>
                              )}
                            </div>
                            <p className="text-sm">{log.message}</p>
                            {log.data && (
                              <details className="mt-2">
                                <summary className="text-xs text-muted-foreground cursor-pointer">
                                  View data
                                </summary>
                                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                  {JSON.stringify(log.data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground ml-4">
                            {format(log.createdAt, "HH:mm:ss.SSS")}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Result */}
      {execution.result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>Final output from workflow execution</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <pre className="p-4 bg-muted rounded text-sm overflow-x-auto">
                {JSON.stringify(execution.result, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

