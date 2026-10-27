import { z } from 'zod';

export const updateFeedbackSchema = z.object({
  body: z.object({
    feedback: z.enum(['ACCEPTED', 'FALSE_POSITIVE', 'PENDING'], {
      required_error: 'Feedback must be ACCEPTED, FALSE_POSITIVE, or PENDING',
    }),
  }),
});

export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>['body'];
