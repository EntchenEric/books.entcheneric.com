describe("Login", () => {
    beforeEach(() => {
        cy.task('db:seed');
    })

    it('should display Login correctly', () => {
        cy.visit("http://localhost:3000/testUser")
        cy.get('#LoginButton').click()
        cy.get("#name")
        cy.get('#password')
        cy.get('button[type="submit"]')
    })

    it('should handle login', () => {
        cy.session('User session', () => {
            cy.visit("http://localhost:3000/testUser")
            cy.get('#LoginButton').click()
            cy.get("#name").type("TestUser")
            cy.get('#password').type("TestPassword")
            cy.get('button[type="submit"]').click()
            cy.get('#LogoutButton')
        })
    })
}) 