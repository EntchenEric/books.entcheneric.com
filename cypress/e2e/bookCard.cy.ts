import { login } from "./helper.cy";

describe("Book Card", () => {
    beforeEach(() => {
        cy.task('db:seed');
        cy.task('db:dummybook');
    })

    it('should render correctly', () => {
        cy.session('render session', () => {
            login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist');
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').find('div[data-slot="card-title"]').should('exist')
                .contains('Attack on Titan 2').contains('Hajime Isayama')
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').find('img[alt="Attack on Titan 2 Cover"]').should('exist')
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').find('div[data-slot="card-description"]').should('exist')
                .contains('erschienen 2017')
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').find('div[data-slot="card-description"]').should('exist')
                .contains("190 Seiten")
        })
    })

    it('should render dialog correctly', () => {
        cy.session('render dialog session', () => {
            login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist').click();
            cy.get('div[data-slot="dialog-content"]').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('img[alt="Attack on Titan 2 Cover"]').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('div[data-slot="dialog-header"]').contains('Attack on Titan 2')
            cy.get('div[data-slot="dialog-content"]').find('div[data-slot="dialog-header"]').contains('Hajime Isayama')
            cy.get('div[data-slot="dialog-content"]').find('#CardButtonActions').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('#CardButtonActions').find('button').first().contains('Auf die Wunschliste')
            cy.get('div[data-slot="dialog-content"]').find('#CardButtonActions').find('input').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('#CardButtonActions').find('button[data-slot="dialog-trigger"]').should('exist')
        })
    })

    it('should add book to wishlist correctly', () => {
        cy.session('add to wishlist session', () => {
            login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist').click();
            cy.get('div[data-slot="dialog-content"]').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('img[alt="Attack on Titan 2 Cover"]').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('div[data-slot="dialog-header"]').contains('Attack on Titan 2')
            cy.get('div[data-slot="dialog-content"]').find('div[data-slot="dialog-header"]').contains('Hajime Isayama')
            cy.get('div[data-slot="dialog-content"]').find('#CardButtonActions').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('#CardButtonActions').find('button').first().contains('Auf die Wunschliste').click()
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist').contains("Wunschliste")
            cy.get('div[data-slot="dialog-content"]').find('#CardButtonActions').find('button').first().contains('Als gekauft makieren').click()
        })
    })


    it('should set page progress correctly', () => {
        cy.session('set page progress session', () => {
            login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist').click();
            cy.get('div[data-slot="dialog-content"]').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('img[alt="Attack on Titan 2 Cover"]').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('div[data-slot="dialog-header"]').contains('Attack on Titan 2')
            cy.get('div[data-slot="dialog-content"]').find('div[data-slot="dialog-header"]').contains('Hajime Isayama')
            cy.get('div[data-slot="dialog-content"]').find('#CardButtonActions').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('#CardButtonActions').find('input').type('19')
            cy.get('div[data-slot="dialog-content"]').find('#CardButtonActions').find('input').parent().find('button').click()
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist').contains("19")

        })
    })

    it('should delete book correctly', () => {
        cy.session('delete book session', () => {
            login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist').click();
            cy.get('div[data-slot="dialog-content"]').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('img[alt="Attack on Titan 2 Cover"]').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('div[data-slot="dialog-header"]').contains('Attack on Titan 2')
            cy.get('div[data-slot="dialog-content"]').find('div[data-slot="dialog-header"]').contains('Hajime Isayama')
            cy.get('div[data-slot="dialog-content"]').find('#CardButtonActions').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('#CardButtonActions').find('button[data-slot="dialog-trigger"]').click()
            cy.get('#BookDeleteConfirmDialog').should('exist')
            cy.get('#BookDeleteConfirmDialog').find('#BookDeleteConfirmCancel').should('exist')
            cy.get('#BookDeleteConfirmDialog').find('#BookDeleteConfirmConfirm').should('exist').click()
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('not.exist');
        })
    })

    it('should cancel delete book correctly', () => {
        cy.session('cancel delete book session', () => {
            login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist').click();
            cy.get('div[data-slot="dialog-content"]').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('img[alt="Attack on Titan 2 Cover"]').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('div[data-slot="dialog-header"]').contains('Attack on Titan 2')
            cy.get('div[data-slot="dialog-content"]').find('div[data-slot="dialog-header"]').contains('Hajime Isayama')
            cy.get('div[data-slot="dialog-content"]').find('#CardButtonActions').should('exist')
            cy.get('div[data-slot="dialog-content"]').find('#CardButtonActions').find('button[data-slot="dialog-trigger"]').click()
            cy.get('#BookDeleteConfirmDialog').should('exist')
            cy.get('#BookDeleteConfirmDialog').find('#BookDeleteConfirmConfirm').should('exist')
            cy.get('#BookDeleteConfirmDialog').find('#BookDeleteConfirmCancel').should('exist').click()
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist');
            cy.get('#BookDeleteConfirmDialog').should('not.exist')
        })
    })

    it('should load buy options correctly', () => {
        cy.session('load buy options session', () => {
            login();
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


