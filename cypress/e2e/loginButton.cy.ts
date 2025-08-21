describe("LoginButton", () => {
    beforeEach(() => {
        cy.task('db:seed');
    })

    it('should open Login Form', () => {
        cy.visit('http://localhost:3000/testUser')
        cy.get('#LoginButton').click()
        cy.get('input[name="name"]')
        cy.get('input[name="password"]')
        cy.get('button[type="submit"]')
    })
})