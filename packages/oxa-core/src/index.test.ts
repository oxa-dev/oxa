import { describe, it, expect } from "vitest";

describe("package exports", () => {
  it("re-exports the ATProto conversion API from the package entrypoint", async () => {
    const pkg = await import("./index.js");

    expect(pkg.flattenInlines).toBeTypeOf("function");
    expect(pkg.mapBlock).toBeTypeOf("function");
    expect(pkg.oxaToAtproto).toBeTypeOf("function");
  });
});
