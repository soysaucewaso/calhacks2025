export type ReportItem = {
  group: string;
  report: string; // markdown
};

export type GenerateReportRequest = {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  prompt?: string;
  template?: 'Daily Standup Report' | 'Sprint Report' | 'Release Notes' | 'Custom';
  filters?: any[]; // passthrough, not typed here
  groupBy?: 'NONE' | 'REPOSITORY' | 'LABEL' | 'TEAM' | 'USER' | 'SOURCEBRANCH' | 'TARGETBRANCH' | 'STATE';
  secondaryGroupBy?: 'NONE' | 'REPOSITORY' | 'LABEL' | 'TEAM' | 'USER' | 'SOURCEBRANCH' | 'TARGETBRANCH' | 'STATE';
  organizationId?: string;
};

export async function generateReport(params: GenerateReportRequest, apiKey?: string): Promise<string> {
  const key = apiKey || process.env.CODERABBIT_API_KEY;
  if (!key) {
    throw new Error('CODERABBIT_API_KEY is not set in environment.');
  }

  const res = await fetch('https://api.coderabbit.ai/api/v1/report.generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-coderabbitai-api-key': key,
    },
    body: JSON.stringify({
      from: params.from,
      to: params.to,
      prompt: params.prompt,
      template: params.template,
      filters: params.filters,
      groupBy: params.groupBy,
      secondaryGroupBy: params.secondaryGroupBy,
      organizationId: params.organizationId,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`CodeRabbit API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as ReportItem[];
  // Concatenate group headers and reports into one markdown doc
  const md = data
    .map((item) => `# ${item.group}\n\n${item.report}`)
    .join('\n\n---\n\n');
  return md || '# Report\n\n(No content)';
}
