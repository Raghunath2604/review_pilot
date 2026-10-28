import { ILlmService } from './llm.interface.js';
import { AnthropicLlmService } from './anthropic.service.js';
import { GeminiLlmService } from './gemini.service.js';
import { MockLlmService } from './mock.service.js';
import { env } from '../../config/env.js';

let defaultLlmService: ILlmService;

const hasValidAnthropicKey =
  env.ANTHROPIC_API_KEY &&
  env.ANTHROPIC_API_KEY.startsWith('sk-ant-');

const hasValidGeminiKey =
  env.GEMINI_API_KEY &&
  env.GEMINI_API_KEY.startsWith('AIza');

if (env.NODE_ENV === 'test') {
  defaultLlmService = new MockLlmService();
} else if (hasValidGeminiKey) {
  defaultLlmService = new GeminiLlmService(env.GEMINI_API_KEY, env.GEMINI_MODEL);
} else if (hasValidAnthropicKey) {
  defaultLlmService = new AnthropicLlmService(env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL);
} else {
  defaultLlmService = new MockLlmService();
}

export const getLlmService = (): ILlmService => defaultLlmService;

export const setLlmService = (service: ILlmService): void => {
  defaultLlmService = service;
};

export * from './llm.interface.js';
export * from './anthropic.service.js';
export * from './gemini.service.js';
export * from './mock.service.js';
