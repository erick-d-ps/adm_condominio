import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Supabase session duration", () => {
  it("keeps the configured session timebox at 30 days", () => {
    const config = readFileSync(
      join(process.cwd(), "supabase/config.toml"),
      "utf8"
    );

    expect(config).toMatch(/\[auth\.sessions\][\s\S]*?timebox\s*=\s*"720h"/);
  });
});
