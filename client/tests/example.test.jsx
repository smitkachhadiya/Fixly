import { describe, test, expect } from '@jest/globals';

describe('Example Test Suite', () => {
  test('should add two numbers correctly', () => {
    const sum = 2 + 2;
    expect(sum).toBe(4);
  });

  test('should return true for valid input', () => {
    const isValid = true;
    expect(isValid).toBe(true);
  });

  test('should handle string comparison', () => {
    const message = 'Hello Jest';
    expect(message).toContain('Jest');
  });

  test('should work with arrays', () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers).toHaveLength(5);
    expect(numbers).toContain(3);
  });

  test('should work with objects', () => {
    const user = { name: 'John', age: 30 };
    expect(user).toHaveProperty('name');
    expect(user.name).toBe('John');
  });
});
