"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const initialLogs = [
  { level: "info", message: "Runner initialized. Waiting for tasks..." },
  { level: "info", message: "Received 5 approved tasks for target 'Juice Shop'." },
  { level: "info", message: "Starting task: Check robots.txt" },
  { level: "success", message: "Task 'Check robots.txt' completed. Found 1 disallowed path." },
  { level: "info", message: "Starting task: SQL Injection on login" },
  { level: "info", message: "Probing endpoint: /rest/user/login" },
];

const newLogs = [
  { level: "info", message: "Testing payload: ' OR 1=1 --" },
  { level: "warn", message: "Received 500 Internal Server Error. Potential vulnerability." },
  { level: "info", message: "Confirming vulnerability with time-based blind." },
  { level: "success", message: "Vulnerability confirmed: SQL Injection. Severity: High." },
  { level: "info", message: "Saving evidence bundle: sqli-login-1678886400.json" },
  { level: "info", message: "Starting task: XSS on search page" },
];

export function LogsPanel() {
  const [logs, setLogs] = useState(initialLogs);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < newLogs.length) {
        setLogs(prevLogs => [...prevLogs, newLogs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [logs]);

  const getLevelClass = (level: string) => {
    switch (level) {
      case "info":
        return "text-muted-foreground";
      case "success":
        return "text-green-400";
      case "warn":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Runner Logs</CardTitle>
        <CardDescription>Real-time stream of logs from the active runner.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 w-full rounded-md bg-muted/50 font-code" ref={scrollAreaRef}>
          <div className="p-4 text-sm">
            {logs.map((log, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-muted-foreground/50">{String(index + 1).padStart(2, '0')}</span>
                <p className={cn(getLevelClass(log.level))}>
                    <span className="font-semibold mr-2">{`[${log.level.toUpperCase()}]`}</span>
                    {log.message}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
