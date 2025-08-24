describe("Purchase Option Fetcher", () => {
    beforeEach(() => {
        cy.task('db:seed');
        cy.task('db:dummybook');
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

    it('should load buy options correctly', () => {
        cy.session('load buy options session', () => {
            cy.visit('http://localhost:3000/testUser')
            cy.get('#LoginButton').click()
            cy.get('input[name="name"]').type("TestUser")
            cy.get('input[name="password"]').type("TestPassword")
            cy.get('button[type="submit"]').click()
            cy.get('#LogoutButton')
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist').click();
            cy.get('div[data-slot="dialog-content"]').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('img[alt="Attack on Titan 2 Cover"]').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('div[data-slot="dialog-header"]').contains('Attack on Titan 2')
            cy.get('div[data-slot="dialog-content"]').find('div[data-slot="dialog-header"]').contains('Hajime Isayama')
            cy.get('div[data-slot="dialog-content"]').find('#CardButtonActions').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('#CardButtonActions').find('button').first().contains('Auf die Wunschliste').click()
            cy.get('div[data-slot="dialog-content"]').contains('Kaufoptionen')
            cy.get('div[data-slot="dialog-content"]').find('#BuyOptionList').should('not.be.empty')
        })
    })
})


