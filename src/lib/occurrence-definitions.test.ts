import {
  formatCommentAuthorLabel,
  formatOccurrenceAuthorLabel,
} from "@/lib/occurrence-definitions";

describe("occurrence author labels", () => {
  it("identifies who opened an occurrence without the unit", () => {
    expect(formatOccurrenceAuthorLabel("resident", "Ana Souza")).toBe(
      "Morador: Ana Souza"
    );
    expect(formatOccurrenceAuthorLabel("employee", "Carlos Lima")).toBe(
      "Administração: Carlos Lima"
    );
  });

  it("shows a resident comment by name and an employee comment as administration", () => {
    expect(formatCommentAuthorLabel("resident", "Ana Souza")).toBe("Ana Souza");
    expect(formatCommentAuthorLabel("employee", "Carlos Lima")).toBe(
      "Administração: Carlos Lima"
    );
  });

  it("does not invent a role when the author cannot be identified", () => {
    expect(formatOccurrenceAuthorLabel(null, "Ana Souza")).toBe(
      "Usuário do condomínio"
    );
    expect(formatCommentAuthorLabel("employee", null)).toBe(
      "Usuário do condomínio"
    );
  });
});
