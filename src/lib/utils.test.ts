import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("skips falsy values", () => {
    expect(cn("a", undefined, null, "c")).toBe("a c");
  });

  it("lets later Tailwind classes override earlier ones", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
