describe("Add Book Button", () => {
    beforeEach(() => {
        cy.task('db:seed');
    })

    it('should handle login', () => {
        cy.session('User session', () => {
            cy.visit('http://localhost:3000/testUser')
            cy.get('#LoginButton').click()
            cy.get('input[name="name"]').type("TestUser")
            cy.get('input[name="password"]').type("TestPassword")
            cy.get('button[type="submit"]').click()
            cy.get('#LogoutButton')
        })
    })

    it('should render button correctly', () => {
        cy.session('render session', () => {
            cy.visit('http://localhost:3000/testUser')
            cy.get('#LoginButton').click()
            cy.get('input[name="name"]').type("TestUser")
            cy.get('input[name="password"]').type("TestPassword")
            cy.get('button[type="submit"]').click()
            cy.get('#LogoutButton')
            cy.get('#AddBookButton').click()
            cy.get('div[role="dialog"]').should('exist')
            cy.get('input[placeholder="Suche ein Buch..."]').should('exist')
        })
    })

    it('should close dialog', () => {
        cy.session('close session', () => {
            cy.visit('http://localhost:3000/testUser')
            cy.get('#LoginButton').click()
            cy.get('input[name="name"]').type("TestUser")
            cy.get('input[name="password"]').type("TestPassword")
            cy.get('button[type="submit"]').click()
            cy.get('#LogoutButton')
            cy.get('#AddBookButton').click()
            cy.get('div[role="dialog"]').should('exist')
            cy.get('button[data-slot="dialog-close"]').click()
            cy.get('div[role="dialog"]').not('exist')
        })
    })

    it('should close dialog with esc button', () => {
        cy.session('close with esc session', () => {
            cy.visit('http://localhost:3000/testUser')
            cy.get('#LoginButton').click()
            cy.get('input[name="name"]').type("TestUser")
            cy.get('input[name="password"]').type("TestPassword")
            cy.get('button[type="submit"]').click()
            cy.get('#LogoutButton')
            cy.get('#AddBookButton').click()
            cy.get('div[role="dialog"]').should('exist')
            cy.get('div[role="dialog"]').type('{esc}')
            cy.get('div[role="dialog"]').not('exist')
        })
    })
})