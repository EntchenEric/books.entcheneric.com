describe("Logout", () => {
    beforeEach(() => {
        cy.task('db:seed');
    })

    it('should display Login correctly', () => {
        cy.visit('http://localhost:3000/testUser')
        cy.get('#LoginButton').click()
        cy.get('input[name="name"]')
        cy.get('input[name="password"]')
        cy.get('button[type="submit"]')
    })

    it('should display logout correctly', () => {
        cy.session('lgogut display session', () => {
            cy.visit('http://localhost:3000/testUser')
            cy.get('#LoginButton').click()
            cy.get('input[name="name"]').type("TestUser")
            cy.get('input[name="password"]').type("TestPassword")
            cy.get('button[type="submit"]').click()
            cy.get('#LogoutButton').click()
            cy.get('div[data-slot="alert-dialog-content"]').should('exist')
            cy.get('div[data-slot="alert-dialog-content"]').contains('Abbrechen')
            cy.get('div[data-slot="alert-dialog-content"]').contains('Ja, abmelden')
        })
    })
    
    it('should handle logout correctly', () => {
        cy.session('handle logout session', () => {
            cy.visit('http://localhost:3000/testUser')
            cy.get('#LoginButton').click()
            cy.get('input[name="name"]').type("TestUser")
            cy.get('input[name="password"]').type("TestPassword")
            cy.get('button[type="submit"]').click()
            cy.get('#LogoutButton').click()
            cy.get('div[data-slot="alert-dialog-content"]').should('exist')
            cy.get('div[data-slot="alert-dialog-content"]').contains('Abbrechen')
            cy.get('div[data-slot="alert-dialog-content"]').contains('Ja, abmelden').click()
            cy.get('#LogoutButton').should('not.exist')
            cy.get('#LoginButton').should('exist')
        })
    })

    it('should cancel logout correctly', () => {
        cy.session('handle cancel logout session', () => {
            cy.visit('http://localhost:3000/testUser')
            cy.get('#LoginButton').click()
            cy.get('input[name="name"]').type("TestUser")
            cy.get('input[name="password"]').type("TestPassword")
            cy.get('button[type="submit"]').click()
            cy.get('#LogoutButton').click()
            cy.get('div[data-slot="alert-dialog-content"]').should('exist')
            cy.get('div[data-slot="alert-dialog-content"]').contains('Ja, abmelden')
            cy.get('div[data-slot="alert-dialog-content"]').contains('Abbrechen').click()
            cy.get('#LoginButton').should('not.exist')
            cy.get('#LogoutButton').should('exist')
        })
    })

})
