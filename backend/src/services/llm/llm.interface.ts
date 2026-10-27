export interface FindingOutput {
  file: string;
  line: number | null;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  category: 'BUG' | 'SECURITY' | 'PERFORMANCE' | 'TESTING' | 'STYLE';
  message: string;
  suggestion: string;
}

export interface ILlmService {
  reviewDiff(diffContent: string): Promise<FindingOutput[]>;
}
