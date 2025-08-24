import { login } from "./helper.cy";

describe("Add Book form", () => {
    beforeEach(() => {
        cy.task('db:seed');
    })

    it('should render form correctly', () => {
        cy.session('render session', () => {
            login();
            cy.get('#AddBookButton').click()
            cy.get('div[role="dialog"]').should('exist')
            cy.get('input[placeholder="Suche ein Buch..."]').should('exist')
            cy.get('input[placeholder="Suche ein Buch..."]').type('Attack on titan')
            cy.get('div[role="listbox"]').should('exist')
            cy.get('div[role="listbox"]').get('button').should('exist')
        })
    })

    it('should select book correctly', () => {
        cy.session('select book session', () => {
            login();
            cy.get('#AddBookButton').click()
            cy.get('div[role="dialog"]').should('exist')
            cy.get('input[placeholder="Suche ein Buch..."]').should('exist')
            cy.get('input[placeholder="Suche ein Buch..."]').type('Attack on titan')
            cy.get('div[role="listbox"]').should('exist')
            cy.get('div[role="listbox"]').find('button').first().should('exist').click()
            cy.get('input[name="pageProgress"]').should('exist')
            cy.get('input[name="Wishlisted"]').parent().find('button').should('exist')
            cy.get('input[name="EntireSeries"]').parent().find('button').should('exist')
            cy.get('input[name="KeepOpen"]').parent().find('button').should('exist')
            cy.get('div[role="dialog"]').find('button[type="submit"]').should('exist')
        })
    })

    it('should add book correctly', () => {
        cy.session('add book session', () => {
            login();
            cy.get('#AddBookButton').click()
            cy.get('div[role="dialog"]').should('exist')
            cy.get('input[placeholder="Suche ein Buch..."]').should('exist')
            cy.get('input[placeholder="Suche ein Buch..."]').type('Attack on titan')
            cy.get('div[role="listbox"]').should('exist')
            cy.get('div[role="listbox"]').find('button').first().should('exist').click()
            cy.get('input[name="pageProgress"]').should('exist')
            cy.get('input[name="Wishlisted"]').parent().find('button').should('exist')
            cy.get('input[name="EntireSeries"]').parent().find('button').should('exist')
            cy.get('input[name="KeepOpen"]').parent().find('button').should('exist')
            cy.get('div[role="dialog"]').find('button[type="submit"]').click()
            cy.get('div[role="dialog"]').should('not.exist')
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
        })
    })

    it('should keep dialog open', () => {
        cy.session('keep dialog open session', () => {
            login();
            cy.get('#AddBookButton').click()
            cy.get('div[role="dialog"]').should('exist')
            cy.get('input[placeholder="Suche ein Buch..."]').should('exist')
            cy.get('input[placeholder="Suche ein Buch..."]').type('Attack on titan')
            cy.get('div[role="listbox"]').should('exist')
            cy.get('div[role="listbox"]').find('button').first().should('exist').click()
            cy.get('input[name="pageProgress"]').should('exist')
            cy.get('input[name="Wishlisted"]').parent().find('button').should('exist')
            cy.get('input[name="EntireSeries"]').parent().find('button').should('exist')
            cy.get('input[name="KeepOpen"]').parent().find('button').should('exist').click()
            cy.get('div[role="dialog"]').find('button[type="submit"]').click()
            cy.get('div[role="dialog"]').should('exist')
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
        })
    })

    it('should add wishlisted', () => {
        cy.session('addwishlisted session', () => {
            login();
            cy.get('#AddBookButton').click()
            cy.get('div[role="dialog"]').should('exist')
            cy.get('input[placeholder="Suche ein Buch..."]').should('exist')
            cy.get('input[placeholder="Suche ein Buch..."]').type('Attack on titan')
            cy.get('div[role="listbox"]').should('exist')
            cy.get('div[role="listbox"]').find('button').first().should('exist').click()
            cy.get('input[name="pageProgress"]').should('exist')
            cy.get('input[name="Wishlisted"]').parent().find('button').should('exist').click()
            cy.get('input[name="EntireSeries"]').parent().find('button').should('exist')
            cy.get('input[name="KeepOpen"]').parent().find('button').should('exist')
            cy.get('div[role="dialog"]').find('button[type="submit"]').click()
            cy.get('div[role="dialog"]').should('not.exist')
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist').contains("Wunschliste")
        })
    })

    it('should add with page progress', () => {
        cy.session('add with page progress session', () => {
            login();
            cy.get('#AddBookButton').click()
            cy.get('div[role="dialog"]').should('exist')
            cy.get('input[placeholder="Suche ein Buch..."]').should('exist')
            cy.get('input[placeholder="Suche ein Buch..."]').type('Attack on titan')
            cy.get('div[role="listbox"]').should('exist')
            cy.get('div[role="listbox"]').find('button').first().should('exist').click()
            cy.get('input[name="pageProgress"]').should('exist').type("7")
            cy.get('input[name="Wishlisted"]').parent().find('button').should('exist')
            cy.get('input[name="EntireSeries"]').parent().find('button').should('exist')
            cy.get('input[name="KeepOpen"]').parent().find('button').should('exist')
            cy.get('div[role="dialog"]').find('button[type="submit"]').click()
            cy.get('div[role="dialog"]').should('not.exist')
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist').contains("7")
        })
    })
})
