import { z } from 'zod';

const MAX_DIFF_BYTES = 200 * 1024; // 200 KB

export const createReviewSchema = z.object({
  body: z
    .object({
      sourceType: z.enum(['DIFF', 'GITHUB_PR'], {
        required_error: 'sourceType is required (DIFF or GITHUB_PR)',
      }),
      diff: z.string().optional(),
      prUrl: z.string().url('Invalid GitHub PR URL format').optional(),
      apiKey: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.sourceType === 'DIFF') {
        if (!data.diff || data.diff.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'diff content is required when sourceType is DIFF',
            path: ['diff'],
          });
        } else if (Buffer.byteLength(data.diff, 'utf8') > MAX_DIFF_BYTES) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `diff content exceeds maximum allowed size of 200 KB (${MAX_DIFF_BYTES} bytes)`,
            path: ['diff'],
          });
        }
      }

      if (data.sourceType === 'GITHUB_PR') {
        if (!data.prUrl || !data.prUrl.includes('github.com')) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'A valid public GitHub PR URL is required when sourceType is GITHUB_PR',
            path: ['prUrl'],
          });
        } else {
          const githubPrRegex = /^https?:\/\/(www\.)?github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)(\/.*)?$/;
          if (!githubPrRegex.test(data.prUrl)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'URL must follow the pattern https://github.com/:owner/:repo/pull/:number',
              path: ['prUrl'],
            });
          }
        }
      }
    }),
});

export const findingOutputSchema = z.object({
  file: z.string().min(1, 'File path is required'),
  line: z.number().int().positive().nullable().optional().transform((val) => val ?? null),
  severity: z.preprocess(
    (val) => (typeof val === 'string' ? val.toUpperCase() : val),
    z.enum(['LOW', 'MEDIUM', 'HIGH'], {
      required_error: 'Severity must be LOW, MEDIUM, or HIGH',
    })
  ),
  category: z.preprocess(
    (val) => (typeof val === 'string' ? val.toUpperCase() : val),
    z.enum(['BUG', 'SECURITY', 'PERFORMANCE', 'TESTING', 'STYLE'], {
      required_error: 'Category must be BUG, SECURITY, PERFORMANCE, TESTING, or STYLE',
    })
  ),
  message: z.string().min(1, 'Message is required'),
  suggestion: z.string().min(1, 'Suggestion is required'),
});

export const findingsListSchema = z.array(findingOutputSchema);

export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
export type ValidatedFinding = z.infer<typeof findingOutputSchema>;
