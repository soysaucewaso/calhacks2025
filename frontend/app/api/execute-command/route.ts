import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json();

    if (!command) {
      return NextResponse.json({
        success: false,
        error: 'No command provided',
      }, { status: 400 });
    }

    // Simulate command execution delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate dummy output based on command type
    let dummyOutput = '';
    let dummyError = '';

    if (command.toLowerCase().includes('nmap')) {
      dummyOutput = `Starting Nmap 7.94 ( https://nmap.org ) at 2025-10-25 18:47 UTC
Nmap scan report for 192.168.1.1
Host is up (0.001s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
443/tcp  open  https
8080/tcp open  http-proxy

Nmap done: 1 IP address (1 host up) scanned in 2.34 seconds`;
    } else if (command.toLowerCase().includes('whoami')) {
      dummyOutput = 'kali';
    } else if (command.toLowerCase().includes('pwd')) {
      dummyOutput = '/home/kali';
    } else if (command.toLowerCase().includes('ls')) {
      dummyOutput = `Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos
pentest-tools  scripts  reports`;
    } else if (command.toLowerCase().includes('scan')) {
      dummyOutput = `Scanning target...
Found 3 open ports: 22, 80, 443
Vulnerability assessment complete.
High severity: 1 vulnerability found
Medium severity: 2 vulnerabilities found
Low severity: 5 vulnerabilities found`;
    } else {
      dummyOutput = `Command executed successfully: ${command}
Output: Demo mode - command simulated
Timestamp: ${new Date().toISOString()}`;
    }

    return NextResponse.json({
      success: true,
      output: dummyOutput,
      error: dummyError,
      originalRequest: command,
      aiSuggestion: command.includes(' ') ? `Suggested command: ${command}` : undefined,
    });
  } catch (error) {
    console.error('Command execution error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Command execution failed',
    }, { status: 500 });
  }
}
