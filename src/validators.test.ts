import { describe, it, expect } from 'vitest';
import { loginSchema, signupSchema } from './lib/validators';

describe('login validation', () => {
  it('rejects empty identifier/password', () => {
    expect(loginSchema.safeParse({ identifier: '', password: '' }).success).toBe(false);
  });
  it('accepts email identifier', () => {
    expect(loginSchema.safeParse({ identifier: 'a@b.com', password: 'x'.repeat(10) }).success).toBe(true);
  });
});

describe('signup validation', () => {
  const good = { firstName: 'A', lastName: 'B', email: 'a@b.com', mobileNumber: '+14155550101', username: 'ab.cd', profilePicUrl: '', password: 'Str0ng!Pass1', confirmPassword: 'Str0ng!Pass1', acceptTerms: true };
  it('accepts valid input in required order', () => {
    expect(signupSchema.safeParse(good).success).toBe(true);
  });
  it('rejects mismatch', () => {
    expect(signupSchema.safeParse({ ...good, confirmPassword: 'other' }).success).toBe(false);
  });
  it('rejects weak password', () => {
    expect(signupSchema.safeParse({ ...good, password: 'weak', confirmPassword: 'weak' }).success).toBe(false);
  });
  it('rejects unsafe avatar protocols', () => {
    for (const u of ['javascript:alert(1)', 'data:image/png;base64,x', 'file:///x', 'http://x.com/a.png'])
      expect(signupSchema.safeParse({ ...good, profilePicUrl: u }).success).toBe(false);
    expect(signupSchema.safeParse({ ...good, profilePicUrl: 'https://x.com/a.png' }).success).toBe(true);
  });
  it('rejects bad username', () => {
    expect(signupSchema.safeParse({ ...good, username: 'a!' }).success).toBe(false);
  });
});
