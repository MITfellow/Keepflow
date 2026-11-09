import { describe, expect, it } from "vitest";

import { formatNumber, formatOrdinal, formatPosition } from "@/lib/format";

describe("formatting", () => {
  it("formats ordinals with the right suffix", () => {
    expect(formatOrdinal(1)).toBe("1st");
    expect(formatOrdinal(2)).toBe("2nd");
    expect(formatOrdinal(3)).toBe("3rd");
    expect(formatOrdinal(4)).toBe("4th");
    expect(formatOrdinal(11)).toBe("11th");
    expect(formatOrdinal(12)).toBe("12th");
    expect(formatOrdinal(13)).toBe("13th");
    expect(formatOrdinal(21)).toBe("21st");
    expect(formatOrdinal(22)).toBe("22nd");
    expect(formatOrdinal(23)).toBe("23rd");
    expect(formatOrdinal(101)).toBe("101st");
    expect(formatOrdinal(111)).toBe("111th");
  });

  it("formats positions and grouped numbers", () => {
    expect(formatPosition(1204)).toBe("#1,204");
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(-9)).toBe("0");
    expect(formatNumber(13000)).toBe("13,000");
  });
});
