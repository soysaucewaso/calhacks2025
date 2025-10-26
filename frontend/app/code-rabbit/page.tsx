import { CodeRabbitDashboard } from '@/components/code-rabbit/code-rabbit-dashboard'

export default function CodeRabbitPage() {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">CodeRabbit Security Scanner</h1>
        <p className="text-muted-foreground">
          AI-powered code review for security vulnerabilities and best practices
        </p>
      </div>
      
      <CodeRabbitDashboard />
    </div>
  )
}

