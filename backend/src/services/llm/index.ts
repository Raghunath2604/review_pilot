import { ILlmService } from './llm.interface.js';
import { AnthropicLlmService } from './anthropic.service.js';
import { MockLlmService } from './mock.service.js';
import { env } from '../../config/env.js';

let defaultLlmService: ILlmService;

const hasValidAnthropicKey =
  env.ANTHROPIC_API_KEY &&
  env.ANTHROPIC_API_KEY.startsWith('sk-ant-');

if (env.NODE_ENV === 'test' || !hasValidAnthropicKey) {
  defaultLlmService = new MockLlmService();
} else {
  defaultLlmService = new AnthropicLlmService();
}

export const getLlmService = (): ILlmService => defaultLlmService;

export const setLlmService = (service: ILlmService): void => {
  defaultLlmService = service;
};

export * from './llm.interface.js';
export * from './anthropic.service.js';
export * from './gemini.service.js';
export * from './mock.service.js';
