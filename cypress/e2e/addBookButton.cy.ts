import { login } from "./helper.cy";

describe("Add Book Button", () => {
    beforeEach(() => {
        cy.task('db:seed');
    })

    it('should render button correctly', () => {
        cy.session('render session', () => {
            login();
            cy.get('#AddBookButton').click()
            cy.get('div[role="dialog"]').should('exist')
            cy.get('input[placeholder="Suche ein Buch..."]').should('exist')
        })
    })

    it('should close dialog', () => {
        cy.session('close session', () => {
            login();
            cy.get('#AddBookButton').click()
            cy.get('div[role="dialog"]').should('exist')
            cy.get('button[data-slot="dialog-close"]').click()
            cy.get('div[role="dialog"]').should('not.exist')
        })
    })

    it('should close dialog with esc button', () => {
        cy.session('close with esc session', () => {
            login();
            cy.get('#AddBookButton').click()
            cy.get('div[role="dialog"]').should('exist')
            cy.get('div[role="dialog"]').type('{esc}')
            cy.get('div[role="dialog"]').should('not.exist')
        })
    })
})