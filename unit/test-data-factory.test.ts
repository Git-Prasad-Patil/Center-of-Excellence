import { describe, it, expect } from 'vitest';
import { createUser, RegistrationDataBuilder } from '../utils/test-data-factory';

describe('createUser', () => {
  it('creates a user with all default fields when no overrides are given (Zero case)', () => {
    const user = createUser();
    expect(user.password).toBe('Test@1234');
    expect(user.firstName).toBe('Test');
    expect(user.lastName).toBe('User');
    expect(user.email).toMatch(/^user_\d+_[a-z0-9]+@example\.com$/);
  });

  it('overrides a single field while keeping the rest default (One case)', () => {
    const user = createUser({ firstName: 'Ada' });
    expect(user.firstName).toBe('Ada');
    expect(user.lastName).toBe('User');
  });

  it('overrides multiple fields at once (Many case)', () => {
    const user = createUser({ firstName: 'Ada', lastName: 'Lovelace', password: 'Secret1!' });
    expect(user).toMatchObject({ firstName: 'Ada', lastName: 'Lovelace', password: 'Secret1!' });
  });

  it('generates a different email on each call (Boundary case — uniqueness)', () => {
    const first = createUser();
    const second = createUser();
    expect(first.email).not.toBe(second.email);
  });
});

describe('RegistrationDataBuilder', () => {
  it('builds plain user data with no optional fields set (Zero case)', () => {
    const data = new RegistrationDataBuilder().build();
    expect(data.gender).toBeUndefined();
    expect(data.newsletter).toBeUndefined();
    expect(data.companyName).toBeUndefined();
  });

  it('sets a single optional field (One case)', () => {
    const data = new RegistrationDataBuilder().withGender('F').build();
    expect(data.gender).toBe('F');
  });

  it('chains multiple optional fields together (Many case)', () => {
    const data = new RegistrationDataBuilder()
      .withGender('M')
      .withNewsletter(true)
      .withCompanyName('Incubyte')
      .build();

    expect(data).toMatchObject({ gender: 'M', newsletter: true, companyName: 'Incubyte' });
  });

  it('lets withUser override a flat field alongside builder-set optional fields (Interface case)', () => {
    const data = new RegistrationDataBuilder()
      .withGender('F')
      .withUser({ firstName: 'Grace' })
      .build();

    expect(data.firstName).toBe('Grace');
    expect(data.gender).toBe('F');
  });
});
