describe("Sort and Filter", () => {
    beforeEach(() => {
        cy.task('db:seed');
        cy.task('db:dummybook');
        cy.visit('http://localhost:3000/testUser')
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
        cy.task('db:dummybook2')
        cy.get('#SortSelectTrigger').click()
        cy.get('#SortSelect').should('exist')
        cy.get('#SortSelect').contains('A-Z').click()
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(0).contains('Attack on Titan 2');
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(1).contains('Attack on Titan 18');

    })

    it('should sort books correctly Z-A', () => {
        cy.task('db:dummybook2')
        cy.get('#SortSelectTrigger').click()
        cy.get('#SortSelect').should('exist')
        cy.get('#SortSelect').contains('Z-A').click()
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(0).contains('Attack on Titan 18');
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(1).contains('Attack on Titan 2');

    })

    it('should sort books correctly newest first', () => {
        cy.task('db:dummybook2')
        cy.get('#SortSelectTrigger').click()
        cy.get('#SortSelect').should('exist')
        cy.get('#SortSelect').contains('Neuste').click()
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(0).contains('Attack on Titan 2');
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(1).contains('Attack on Titan 18');
    })

    it('should sort books correctly oldest first', () => {
        cy.task('db:dummybook2')
        cy.get('#SortSelectTrigger').click()
        cy.get('#SortSelect').should('exist')
        cy.get('#SortSelect').contains('Älteste').click()
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(0).contains('Attack on Titan 18');
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(1).contains('Attack on Titan 2');
    })

    it('should filter books correctly all wishlist status', () => {
        cy.task('db:dummybook2')
        cy.request({
            url: 'http://localhost:3000/api/update_book',
            method: 'POST',
            body: {
                id: "2",
                wishlisted: true
            }

        })
        cy.get('#WishlistFilterSelectTrigger').click()
        cy.get('#WishlistFilterSelect').should('exist')
        cy.get('#WishlistFilterSelect').contains('Alle').click()
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(0).contains('Attack on Titan 18');
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(1).contains('Attack on Titan 2');
    })

    it('should filter books correctly only on wishlist', () => {
        cy.task('db:dummybook2')
        cy.request({
            url: 'http://localhost:3000/api/update_book',
            method: 'POST',
            body: {
                id: "2",
                wishlisted: true
            }

        })
        cy.get('#WishlistFilterSelectTrigger').click()
        cy.get('#WishlistFilterSelect').should('exist')
        cy.get('#WishlistFilterSelect').contains('Auf der Wunschliste').click()
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('not.contain', 'Attack on Titan 2')
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').contains('Attack on Titan 18');
    })

    it('should filter books correctly only in libary', () => {
        cy.task('db:dummybook2')
        cy.request({
            url: 'http://localhost:3000/api/update_book',
            method: 'POST',
            body: {
                id: "2",
                wishlisted: true
            }

        })
        cy.get('#WishlistFilterSelectTrigger').click()
        cy.get('#WishlistFilterSelect').should('exist')
        cy.get('#WishlistFilterSelect').contains('In der Bibliothek').click()
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').contains('Attack on Titan 2');
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('not.contain', 'Attack on Titan 18')
    })

    it('should filter books correctly all reading status', () => {
        cy.task('db:dummybook2')
        cy.request({
            url: 'http://localhost:3000/api/update_book',
            method: 'POST',
            body: {
                id: "2",
                progress: 178
            }

        })
        cy.get('#FinishedFilterSelectTrigger').click()
        cy.get('#FinishedFilterSelect').should('exist')
        cy.get('#FinishedFilterSelect').contains('Alle').click()
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(0).contains('Attack on Titan 18');
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').eq(1).contains('Attack on Titan 2');
    })

    it('should filter books correctly only finished', () => {
        cy.task('db:dummybook2')
        cy.request({
            url: 'http://localhost:3000/api/update_book',
            method: 'POST',
            body: {
                id: "2",
                progress: 178
            }

        })
        cy.get('#FinishedFilterSelectTrigger').click()
        cy.get('#FinishedFilterSelect').should('exist')
        cy.get('#FinishedFilterSelect').contains('Beendet').click()
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('not.contain', 'Attack on Titan 2')
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').contains('Attack on Titan 18');
    })

    it('should filter books correctly only not finished', () => {
        cy.task('db:dummybook2')
        cy.request({
            url: 'http://localhost:3000/api/update_book',
            method: 'POST',
            body: {
                id: "2",
                progress: 178
            }

        })
        cy.get('#FinishedFilterSelectTrigger').click()
        cy.get('#FinishedFilterSelect').should('exist')
        cy.get('#FinishedFilterSelect').contains('Nicht beendet').click()
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').contains('Attack on Titan 2');
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('not.contain', 'Attack on Titan 18')
    })
})


