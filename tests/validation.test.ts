import { describe, expect, it } from "vitest";

import { emailSchema, isValidEmail, sanitizeOptional } from "@/lib/validation";

describe("validation", () => {
  it("accepts ordinary addresses", () => {
    expect(isValidEmail("person@example.com")).toBe(true);
    expect(isValidEmail(" Person+Tag@Example.COM ")).toBe(true);
  });

  it("normalizes email case and whitespace", () => {
    expect(emailSchema.parse("  Person@Example.COM ")).toBe("person@example.com");
  });

  it("rejects missing or malformed addresses", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail(`${"a".repeat(321)}@example.com`)).toBe(false);
  });

  it("strips control characters and caps length", () => {
    expect(sanitizeOptional("  hello\u0000world  ")).toBe("helloworld");
    expect(sanitizeOptional("x".repeat(500), 20)).toHaveLength(20);
    expect(sanitizeOptional(42)).toBeNull();
    expect(sanitizeOptional("   ")).toBeNull();
  });
});
