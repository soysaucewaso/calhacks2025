"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getSuggestedTasks } from "@/app/playbook/actions";
import { type SuggestPentestPlaybookTasksOutput } from "@/ai/flows/suggest-pentest-playbook-tasks";
import { TaskCard } from "./task-card";
import { Bot, Loader2, Play, TestTube2, Shield, LayoutDashboard } from "lucide-react";
import { Separator } from "../ui/separator";

const FormSchema = z.object({
  target: z.enum(["Juice Shop", "Metasploitable"], {
    required_error: "Please select a target.",
  }),
  benchmark: z.enum(["NIST SP 800-115", "OWASP Top 10 (web apps)", "PCI DSS", "CIS Controls", "HIPAA"], {
    required_error: "Please select a benchmark.",
  }),
});

export function PlaybookPageClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<SuggestPentestPlaybookTasksOutput>([]);
  const [approvedTasks, setApprovedTasks] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setTasks([]);
    setApprovedTasks(new Set());
    const result = await getSuggestedTasks(data);
    setIsLoading(false);

    if (result.success && result.data) {
      setTasks(result.data);
      toast({
        title: "Playbook Generated",
        description: `${result.data.length} tasks suggested for ${data.target}.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  }

  const handleApproveToggle = (title: string, approved: boolean) => {
    setApprovedTasks((prev) => {
      const newSet = new Set(prev);
      if (approved) {
        newSet.add(title);
      } else {
        newSet.delete(title);
      }
      return newSet;
    });
  };

  const handleGenerateReport = async () => {
    const formValues = form.getValues();
    const target = formValues.target;
    const benchmark = formValues.benchmark;

    if (!target || !benchmark) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both target and benchmark before generating report.",
      });
      return;
    }

    try {
      // Connect to WebSocket server
      const ws = new WebSocket('ws://localhost:8081');
      
      ws.onopen = () => {
        console.log('WebSocket connection opened');
        
        // Send generateReport action
        const message = {
          action: 'generateReport',
          benchmark: benchmark,
          target: target
        };
        
        ws.send(JSON.stringify(message));
        
        toast({
          title: "Report Generation Started",
          description: `Generating report for ${target} using ${benchmark} benchmark...`,
        });
      };
      
      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        console.log('WebSocket response:', response);
        
        toast({
          title: "Report Generated",
          description: "Report generation completed successfully.",
        });
        
        ws.close();
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Could not connect to the WebSocket server at ws://localhost:8081",
        });
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report. Please try again.",
      });
    }
  };

  const handleExecute = () => {
    toast({
      title: "Execution Started",
      description: `${approvedTasks.size} tasks sent to the runner.`,
    });
  };

  return (
    <div className="grid gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Playbook Generator</h1>
          <p className="text-muted-foreground">
            Generate and execute AI-powered penetration testing playbooks.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>1. Select Target</CardTitle>
          <CardDescription>
            Choose a sandboxed target and let our AI suggest relevant tests.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="target"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Application</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a sandboxed target..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Juice Shop">
                            <div className="flex items-center gap-2">
                              <TestTube2 className="h-4 w-4 text-muted-foreground" />
                              <span>OWASP Juice Shop</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Metasploitable">
                            <div className="flex items-center gap-2">
                              <TestTube2 className="h-4 w-4 text-muted-foreground" />
                              <span>Metasploitable</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="benchmark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benchmarks</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a security benchmark..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NIST SP 800-115">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span>NIST SP 800-115</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="OWASP Top 10 (web apps)">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span>OWASP Top 10 (web apps)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="PCI DSS">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span>PCI DSS</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="CIS Controls">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span>CIS Controls</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="HIPAA">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span>HIPAA</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="mr-2 h-4 w-4" />
                )}
                Suggest Tests
              </Button>
              <Button type="button" onClick={handleGenerateReport} variant="secondary" disabled={isLoading}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {(isLoading || tasks.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>2. Confirmed - Generating Report</CardTitle>
            <CardDescription>
              Your penetration testing tasks have been confirmed and the report is being generated.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {isLoading && (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                <span className="font-medium">AI is thinking...</span>
              </div>
            )}
            {tasks.map((task, index) => (
              <div key={`${task.title}-${index}`} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.estimatedSeverity === 'High' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : task.estimatedSeverity === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {task.estimatedSeverity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          {(isLoading || tasks.length > 0) && (
            <>
              <Separator />
              <CardFooter className="flex justify-center pt-6">
                <Button onClick={() => window.location.href = '/'} className="w-full sm:w-auto">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
