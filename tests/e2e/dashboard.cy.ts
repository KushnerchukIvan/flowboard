describe("Flowboard dashboard", () => {
  it("shows the project overview and navigates to tasks", () => {
    cy.visit("/");
    cy.contains("Доброго ранку, Анно");
    cy.contains("Мобільний банкінг");
    cy.visit("/tasks");
    cy.contains("Мої завдання");
    cy.contains("До виконання");
  });
});
