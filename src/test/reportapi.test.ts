import * as assert from 'assert';
import { ModelMessage } from 'ai';
import { generateReport } from '../reportapi';

suite('reportapi.generateReport', () => {
  test('aggregates per-constraint JSON results using injected llmCall and constraints', async () => {
    const constraints = [
      { name: 'Constraint A', section: 'S1', granular: 'Do X', kaliTest: 'Try X' },
      { name: 'Constraint B', section: 'S2', granular: 'Do Y', kaliTest: 'Try Y' },
    ];

    const llmCall = async (messages: ModelMessage[]): Promise<string> => {
      // The user message content is a JSON string produced by generateReport
      const userMsg = messages.find(m => m.role === 'user');
      assert.ok(userMsg, 'User message should exist');
      assert.strictEqual(typeof userMsg!.content, 'string');
      const payload = JSON.parse(userMsg!.content as string);
      // Return a valid JSON string as the model output
      return JSON.stringify({
        constraint: payload.constraint_name,
        status: 'PASS',
        evidence: `Checked ${payload.constraint_description}`,
        commands: [payload.constraint_suggested_strategy].filter(Boolean),
      });
    };

    const result = await generateReport('OWASP', ['127.0.0.1'], { llmCall, constraints });

    assert.ok(result, 'Result should be defined');
    assert.deepStrictEqual(result.benchmark, 'OWASP');
    assert.deepStrictEqual(result.targets, ['127.0.0.1']);
    assert.ok(Array.isArray(result.results));
    assert.strictEqual(result.results.length, constraints.length);

    for (let i = 0; i < constraints.length; i++) {
      const expected = constraints[i];
      const actual = result.results[i];
      assert.strictEqual(actual.constraint, expected.name);
      assert.strictEqual(actual.status, 'PASS');
      assert.ok(typeof actual.evidence === 'string');
      assert.ok(Array.isArray(actual.commands));
    }
  });
});
