import { describe, it, expect } from 'vitest';
import { profileSchema, passwordChangeSchema } from '../../lib/validators';

describe('profile form validation', () => {
  const good = {
    firstName: 'Priya', lastName: 'Verma', email: 'priya@example.com',
    mobileNumber: '+14155550101', profilePicUrl: 'https://example.com/p.png',
  };

  it('accepts all profile fields', () => {
    expect(profileSchema.safeParse(good).success).toBe(true);
  });

  it('rejects bad email, unsafe avatar URL, missing names', () => {
    expect(profileSchema.safeParse({ ...good, email: 'nope' }).success).toBe(false);
    expect(profileSchema.safeParse({ ...good, profilePicUrl: 'javascript:alert(1)' }).success).toBe(false);
    expect(profileSchema.safeParse({ ...good, firstName: '' }).success).toBe(false);
  });
});

describe('password change validation', () => {
  const good = { currentPassword: 'Str0ng!Pass123', newPassword: 'N3w!StrongPass1', confirmNewPassword: 'N3w!StrongPass1' };

  it('accepts matching strong passwords', () => {
    expect(passwordChangeSchema.safeParse(good).success).toBe(true);
  });

  it('rejects mismatch, weak password, missing current', () => {
    expect(passwordChangeSchema.safeParse({ ...good, confirmNewPassword: 'other' }).success).toBe(false);
    expect(passwordChangeSchema.safeParse({ ...good, newPassword: 'weak', confirmNewPassword: 'weak' }).success).toBe(false);
    expect(passwordChangeSchema.safeParse({ ...good, currentPassword: '' }).success).toBe(false);
  });
});
