const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior)\s+instructions/i,
  /you\s+are\s+(now|actually)\s+/i,
  /forget\s+(everything|all)\s+/i,
  /new\s+instructions?:/i,
  /system\s+prompt/i,
  /system\s+instructions/i,
  /reveal\s+(your|the)\s+(system|prompt|instructions)/i,
  /act\s+as\s+(if|a|an)\s+/i,
  /pretend\s+(you|to)\s+/i,
  /\b(?:DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|TRUNCATE)\s+/i,
];

const MAX_INPUT_LENGTH = 1000;

export function sanitizeInput(input: string): string {
  const trimmed = input.trim().slice(0, MAX_INPUT_LENGTH);
  return trimmed.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] ?? char);
}

export function detectPromptInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

export function sanitizeAndValidateInput(input: string): {
  sanitized: string;
  isInjection: boolean;
  error?: string;
} {
  if (!input || input.trim().length === 0) {
    return { sanitized: '', isInjection: false, error: 'Please enter a message.' };
  }
  if (input.length > MAX_INPUT_LENGTH) {
    return {
      sanitized: '',
      isInjection: false,
      error: `Message too long. Maximum ${MAX_INPUT_LENGTH} characters.`,
    };
  }
  const sanitized = sanitizeInput(input);
  const isInjection = detectPromptInjection(input);
  return { sanitized, isInjection };
}
