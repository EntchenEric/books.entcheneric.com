import { login } from "./helper.cy";

describe("Sort and Filter", () => {
    beforeEach(() => {
        cy.task('db:seed');
        cy.task('db:dummybook');
        cy.task('db:dummybook2')
        cy.visit('/testUser')
        cy.get('#SortAndFilter').should('exist')
    })

    it('should render correctly', () => {
        cy.get('#SortAndFilter').find('input').should('exist')
        cy.get('#SortSelectTrigger').should('exist')
        cy.get('#WishlistFilterSelectTrigger').should('exist')
        cy.get('#FinishedFilterSelectTrigger').should('exist')
    })

    it('should filter books correctly', () => {
        cy.get('#SortAndFilter').find('input').type('Attack on ')
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist');
        cy.get('#SortAndFilter').find('input').type('No books should be found!')
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('not.exist');
    })

    it('should sort books correctly A-Z', () => {
        cy.get('#SortSelectTrigger').click()
        cy.get('#SortSelect').should('exist')
        cy.get('#SortSelect').contains('A-Z').click()
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(0).contains('Attack on Titan 2');
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(1).contains('Death Note 7');
    })

    it('should sort books correctly Z-A', () => {
        cy.get('#SortSelectTrigger').click()
        cy.get('#SortSelect').should('exist')
        cy.get('#SortSelect').contains('Z-A').click()
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(0).contains('Death Note 7');
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(1).contains('Attack on Titan 2');

    })

    it('should sort books correctly newest first', () => {
        cy.get('#SortSelectTrigger').click()
        cy.get('#SortSelect').should('exist')
        cy.get('#SortSelect').contains('Neueste').click()
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(0).contains('Death Note 7');
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(1).contains('Attack on Titan 2');
    })

    it('should sort books correctly oldest first', () => {
        cy.get('#SortSelectTrigger').click()
        cy.get('#SortSelect').should('exist')
        cy.get('#SortSelect').contains('Älteste').click()
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(0).contains('Attack on Titan 2');
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(1).contains('Death Note 7');
    })

    it('should filter books correctly all wishlist status', () => {
        cy.session('all wishlist status session', () => {
           login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
            cy.request({
                method: 'POST',
                url: '/api/update_book',
                body: { id: "2", wishlisted: true },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200)
            })
            cy.reload()
            cy.get('#WishlistFilterSelectTrigger').click()
            cy.get('#WishlistFilterSelect').should('exist')
            cy.get('#WishlistFilterSelect').contains('Alle').click()
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').contains('Death Note 7');
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').contains('Attack on Titan 2');
        })
    })

    it('should filter books correctly only on wishlist', () => {
        cy.session('only on wishlist session', () => {
           login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
            cy.request({
                method: 'POST',
                url: '/api/update_book',
                body: { id: "2", wishlisted: true },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200)
            })
            cy.reload()
            cy.get('#WishlistFilterSelectTrigger').click()
            cy.get('#WishlistFilterSelect').should('exist')
            cy.get('#WishlistFilterSelect').contains('Auf der Wunschliste').click()
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('not.contain', 'Attack on Titan 2')
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').contains('Death Note 7');
        })
    })

    it('should filter books correctly only in libary', () => {
        cy.session('only in libary session', () => {
            login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
            cy.request({
                method: 'POST',
                url: '/api/update_book',
                body: { id: "2", wishlisted: true },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200)
            })
            cy.reload()
            cy.get('#WishlistFilterSelectTrigger').click()
            cy.get('#WishlistFilterSelect').should('exist')
            cy.get('#WishlistFilterSelect').contains('In der Bibliothek').click()
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').contains('Attack on Titan 2');
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('not.contain', 'Death Note 7')
        })
    })

    it('should filter books correctly all reading status', () => {
        cy.session('all reading status session', () => {
login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
            cy.request({
                method: 'POST',
                url: '/api/update_book',
                body: { id: "2", progress: 224 },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200)
            })
            cy.reload()
            cy.get('#FinishedFilterSelectTrigger').click()
            cy.get('#FinishedFilterSelect').should('exist')
            cy.get('#FinishedFilterSelect').contains('Alle').click()
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').contains('Death Note 7');
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').contains('Attack on Titan 2');
        })
    })

    it('should filter books correctly only finished', () => {
        cy.session('only finished session', () => {
            login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
            cy.request({
                method: 'POST',
                url: '/api/update_book',
                body: { id: "2", progress: 224 },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200)
            })
            cy.reload()
            cy.get('#FinishedFilterSelectTrigger').click()
            cy.get('#FinishedFilterSelect').should('exist')
            cy.get('#FinishedFilterSelect').contains('Beendet').click()
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('not.contain', 'Attack on Titan 2')
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').contains('Death Note 7');
        })
    })

    it('should filter books correctly only not finished', () => {
        cy.session('only not finished session', () => {
            login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
            cy.request({
                method: 'POST',
                url: '/api/update_book',
                body: { id: "2", progress: 224 },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200)
            })
            cy.reload()
            cy.get('#FinishedFilterSelectTrigger').click()
            cy.get('#FinishedFilterSelect').should('exist')
            cy.get('#FinishedFilterSelect').contains('Nicht beendet').click()
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').contains('Attack on Titan 2');
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('not.contain', 'Death Note 7')
        })
    })
})


