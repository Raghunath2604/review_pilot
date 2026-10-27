import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnthropicLlmService } from '../../src/services/llm/anthropic.service.js';
import { AppError } from '../../src/middlewares/error.middleware.js';

// Mock the Anthropic SDK client
const mockCreate = vi.fn();
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: mockCreate,
      },
    })),
  };
});

describe('AnthropicLlmService Unit Tests', () => {
  let service: AnthropicLlmService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AnthropicLlmService('test-key', 'claude-test-model');
  });

  it('should parse valid raw JSON findings array on the first attempt', async () => {
    const validFindings = [
      {
        file: 'src/index.ts',
        line: 10,
        severity: 'HIGH',
        category: 'SECURITY',
        message: 'SQL Injection possibility',
        suggestion: 'Use parameterized queries',
      },
    ];

    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: JSON.stringify(validFindings) }],
    });

    const result = await service.reviewDiff('+ const query = `SELECT * FROM ${user}`;');

    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('src/index.ts');
    expect(result[0].severity).toBe('HIGH');
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('should strip markdown code fences (```json) returned by the model', async () => {
    const validFindings = [
      {
        file: 'src/app.ts',
        line: null,
        severity: 'LOW',
        category: 'STYLE',
        message: 'Missing semicolon',
        suggestion: 'Add semicolon',
      },
    ];

    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: `\`\`\`json\n${JSON.stringify(validFindings)}\n\`\`\``,
        },
      ],
    });

    const result = await service.reviewDiff('+ console.log("hello")');
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('STYLE');
  });

  it('should retry once when the first attempt fails schema validation and succeed if retry is valid', async () => {
    const invalidFirst = [{ invalidField: true }]; // Missing file, severity, etc.
    const validSecond = [
      {
        file: 'src/calc.ts',
        line: 5,
        severity: 'MEDIUM',
        category: 'BUG',
        message: 'Division by zero potential',
        suggestion: 'Add denominator check',
      },
    ];

    mockCreate
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(invalidFirst) }],
      })
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(validSecond) }],
      });

    const result = await service.reviewDiff('+ return a / b;');

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('src/calc.ts');
  });

  it('should throw AppError if retry also fails schema validation', async () => {
    const invalidOutput = 'not valid json at all';

    mockCreate
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: invalidOutput }],
      })
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: invalidOutput }],
      });

    await expect(service.reviewDiff('diff content')).rejects.toThrow(AppError);
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });
});
