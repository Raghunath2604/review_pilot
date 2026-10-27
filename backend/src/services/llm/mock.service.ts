import { ILlmService, FindingOutput } from './llm.interface.js';

export class MockLlmService implements ILlmService {
  private customFindings: FindingOutput[] | null = null;
  private shouldFail = false;
  private failureMessage = 'Simulated LLM failure';

  setCustomFindings(findings: FindingOutput[]) {
    this.customFindings = findings;
  }

  setFailure(fail: boolean, message = 'Simulated LLM failure') {
    this.shouldFail = fail;
    this.failureMessage = message;
  }

  async reviewDiff(diffContent: string): Promise<FindingOutput[]> {
    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }

    if (this.customFindings) {
      return this.customFindings;
    }

    // Default mock response: analyzes diff keywords to produce realistic findings
    const findings: FindingOutput[] = [];

    if (diffContent.includes('password') || diffContent.includes('secret') || diffContent.includes('eval(')) {
      findings.push({
        file: 'src/auth.ts',
        line: 12,
        severity: 'HIGH',
        category: 'SECURITY',
        message: 'Potential hardcoded secret or unsafe function evaluation detected.',
        suggestion: 'Move sensitive credentials to environment variables and avoid eval().',
      });
    }

    if (diffContent.includes('for (') || diffContent.includes('while (')) {
      findings.push({
        file: 'src/utils.ts',
        line: 45,
        severity: 'MEDIUM',
        category: 'PERFORMANCE',
        message: 'Nested iteration detected without caching collection length or indexing.',
        suggestion: 'Consider replacing nested loops with a Map/Set lookup (O(N) instead of O(N^2)).',
      });
    }

    // Always guarantee at least one realistic finding if diff has content
    if (findings.length === 0) {
      findings.push({
        file: 'src/app.ts',
        line: 20,
        severity: 'LOW',
        category: 'TESTING',
        message: 'New code path added without corresponding unit test coverage.',
        suggestion: 'Add a unit test in tests/app.test.ts verifying edge cases.',
      });
    }

    return findings;
  }
}
