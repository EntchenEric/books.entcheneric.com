export const login = () => {
    cy.visit('/testUser')
    cy.get('#LoginButton').click()
    cy.get('input[name="name"]').type("TestUser")
    cy.get('input[name="password"]').type("TestPassword")
    cy.get('button[type="submit"]').click()
    cy.get('#LogoutButton')
}