# AI Pentester Frontend

A modern web interface for the AI Pentester cybersecurity platform built with Next.js, React, and Tailwind CSS.

## 🚀 Features

- **AI-Powered Command Interface** - Execute commands on Kali Linux VM using natural language
- **Real-time Command Execution** - Direct SSH connection to Kali Linux VM
- **Command History** - Track and review executed commands
- **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- **Responsive Design** - Works on desktop and mobile devices
- **Dashboard Integration** - Seamlessly integrated with existing PentestAI platform

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with shadcn/ui components
- **Styling**: Tailwind CSS with custom design system
- **AI Integration**: DeepInfra API with DeepSeek-R1 model
- **SSH Connection**: node-ssh for Kali Linux VM access
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── ai-pentester/      # AI Pentester page
│   ├── api/               # API routes
│   │   ├── connect-kali/  # Kali connection endpoint
│   │   └── execute-command/ # Command execution endpoint
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Dashboard page
│   └── globals.css       # Global styles
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── layout/       # Layout components
│   │   ├── dashboard/    # Dashboard components
│   │   └── ai-pentester-page.tsx # Main AI Pentester component
│   ├── lib/              # Utilities and data
│   ├── hooks/            # Custom React hooks
│   └── ai/               # AI flows and integrations
├── package.json          # Dependencies
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to Kali Linux VM (configured in API routes)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file:
   ```env
   DEEPINFRA_API_KEY=your_deepinfra_api_key_here
   ```

3. **Configure Kali Linux connection:**
   Update the SSH connection details in:
   - `app/api/connect-kali/route.ts`
   - `app/api/execute-command/route.ts`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Kali Linux VM Connection

The frontend connects to a Kali Linux VM via SSH. Update the connection details in the API routes:

```typescript
await ssh.connect({
  host: "your-kali-vm-host",
  port: your-port,
  username: "your-username",
  password: "your-password",
});
```

### AI Model Configuration

The AI integration uses DeepInfra's DeepSeek-R1 model. Configure your API key in the environment variables.

## 📱 Usage

1. **Connect to Kali VM**: Click the "Connect to Kali" button
2. **Execute Commands**: 
   - Enter natural language requests (e.g., "scan for open ports")
   - Or enter direct commands (e.g., "nmap -sS 192.168.1.1")
3. **View Results**: Check the command history for outputs and errors
4. **Monitor Status**: Connection status is shown in the header

## 🎨 UI Components

The frontend uses a comprehensive set of UI components from shadcn/ui:

- **Forms**: Input, Textarea, Select, Checkbox, Radio Group
- **Navigation**: Sidebar, Tabs, Breadcrumbs
- **Feedback**: Toast, Alert, Progress, Skeleton
- **Data Display**: Table, Card, Badge, Avatar
- **Overlays**: Dialog, Sheet, Popover, Tooltip

## 🔒 Security Considerations

- SSH connections are handled server-side only
- API keys are stored in environment variables
- Command execution is sandboxed to the Kali VM
- Input validation using Zod schemas

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure these are set in your production environment:

- `DEEPINFRA_API_KEY`
- `KALI_VM_HOST` (optional)
- `KALI_VM_PORT` (optional)
- `KALI_VM_USERNAME` (optional)
- `KALI_VM_PASSWORD` (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the CalHacks 2025 AI Pentester platform.

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include error logs and steps to reproduce


