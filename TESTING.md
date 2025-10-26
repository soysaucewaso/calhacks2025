# Testing CodeRabbit Integration

## Quick Test

### Option 1: Visual Frontend (Recommended)

1. **Start the test server:**
   ```bash
   node test-api-server.js
   ```

2. **Open your browser:**
   ```
   http://localhost:3000/test-coderabbit.html
   ```

3. **Enter repository details:**
   - Repository URL: e.g., `https://github.com/microsoft/vscode`
   - PR Number: e.g., `123`
   - Click "Analyze Security"

4. **View results:**
   - Color-coded severity (red=critical, orange=high, yellow=medium, green=low)
   - File locations with line numbers
   - Fix suggestions for each issue

### Option 2: Command Line Test

```bash
# Test with any public repository
node test-simple.js <repo-url> <pr-number>

# Example:
node test-simple.js https://github.com/microsoft/vscode 123
```

## What You'll See

### Summary Output
```
Summary
24 issues across 6 files

2 critical (SQL Injection)
15 high (Hardcoded Secrets/Passwords)
3 medium (Missing Error Handling)
4 low (Logging Issues)
```

### Color Coding
- 🔴 **Critical** (Red) - SQL injection, hardcoded passwords, code injection
- 🟠 **High** (Orange) - Hardcoded API keys, XSS vulnerabilities
- 🟡 **Medium** (Yellow) - Missing error handling, insecure practices
- 🔵 **Low** (Green) - Code quality issues, logging

## Testing with Your Own Repository

1. Get your repo URL (must be public or authenticated):
   ```
   https://github.com/yourusername/yourrepo
   ```

2. Find a PR number:
   - Go to your repo on GitHub
   - Open "Pull requests"
   - Copy the PR number

3. Run the test:
   ```bash
   node test-simple.js https://github.com/yourusername/yourrepo 1
   ```

## API Key Configuration

Your API key is in `.env`:
```
CODERABBIT_API_KEY=cr-44fa3c9f29f9fe26429fc21d99d3a26ff47e52550de7fdc477ae501436
```

To use a different key, update `.env` or set environment variable:
```bash
export CODERABBIT_API_KEY=your-key-here
```

## Example Output

### Security Issues Detected:
1. **Hardcoded passwords** → Use environment variables
2. **SQL injection** → Use parameterized queries  
3. **XSS vulnerabilities** → Sanitize user input
4. **Code injection** → Avoid eval()
5. **Insecure HTTP** → Use HTTPS

### Each Issue Shows:
- 🔴 File and line number
- 📝 Description of the vulnerability
- 💻 Vulnerable code snippet
- 💡 Fix suggestion with example code

## Troubleshooting

If API fails:
- The test server includes **fallback mock data**
- You'll see example security issues
- Perfect for demonstration purposes

For authentication issues:
- Make sure your API key is correct
- Check if the repository is public
- For private repos, you need a GitHub token

