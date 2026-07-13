import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateFullName, validateRequired } from '../utils/validation';

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com')).toEqual({ valid: true });
    expect(validateEmail('test.name+tag@domain.co.uk')).toEqual({ valid: true });
  });

  it('rejects empty email', () => {
    expect(validateEmail('').valid).toBe(false);
    expect(validateEmail('  ').valid).toBe(false);
  });

  it('rejects invalid formats', () => {
    expect(validateEmail('notanemail').valid).toBe(false);
    expect(validateEmail('missing@domain').valid).toBe(false);
    expect(validateEmail('@domain.com').valid).toBe(false);
    expect(validateEmail('user@.com').valid).toBe(false);
  });

  it('rejects overly long emails', () => {
    const longEmail = 'a'.repeat(250) + '@example.com';
    expect(validateEmail(longEmail).valid).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts valid passwords', () => {
    expect(validatePassword('StrongPass123!')).toEqual({ valid: true });
    expect(validatePassword('abcdefgh')).toEqual({ valid: true });
  });

  it('rejects empty password', () => {
    expect(validatePassword('').valid).toBe(false);
  });

  it('rejects short passwords', () => {
    expect(validatePassword('short').valid).toBe(false);
    expect(validatePassword('1234567').valid).toBe(false);
  });

  it('rejects overly long passwords', () => {
    expect(validatePassword('a'.repeat(129)).valid).toBe(false);
  });
});

describe('validateFullName', () => {
  it('accepts valid names', () => {
    expect(validateFullName('John Doe')).toEqual({ valid: true });
    expect(validateFullName('Maria Garcia-Lopez')).toEqual({ valid: true });
  });

  it('rejects empty names', () => {
    expect(validateFullName('').valid).toBe(false);
    expect(validateFullName('   ').valid).toBe(false);
  });

  it('rejects overly long names', () => {
    expect(validateFullName('a'.repeat(101)).valid).toBe(false);
  });
});

describe('validateRequired', () => {
  it('accepts non-empty values', () => {
    expect(validateRequired('hello', 'Field')).toEqual({ valid: true });
  });

  it('rejects empty values with field name', () => {
    const result = validateRequired('', 'Location');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Location');
  });
});
