// Import the compiled output to avoid bringing in VS Code-only modules from src/
const { generateReport } = require('../../out/reportapi');

(async () => {
  const constraints = [
    { name: 'Constraint A', section: 'S1', granular: 'Do X', kaliTest: 'Try X' },
    { name: 'Constraint B', section: 'S2', granular: 'Do Y', kaliTest: 'Try Y' },
  ];


  const result = await generateReport('OWASP', ['127.0.0.1']);
  console.log(JSON.stringify(result, null, 2));
})();
