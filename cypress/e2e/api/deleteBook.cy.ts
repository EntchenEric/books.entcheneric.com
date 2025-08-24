import { login } from "../helper.cy";

describe("delete book route", () => {
    beforeEach(() => {
        cy.task('db:seed');
        cy.task('db:dummybook');
    })

    it('should find Book', () => {
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
    })

    it('should delete Book', () => {
        cy.session('delete book session', () => {
            login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
            cy.request({
                method: 'POST',
                url: '/api/delete_book',
                body: { id: "1" },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body.message).to.equal('Book deleted successfully')
            })
            cy.reload()
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('not.exist')
        })
    })

    it('should be unauthorized if not logged in', () => {
        cy.session('not logged in session', () => {
            cy.visit('/testUser')
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
            cy.request({
                method: 'POST',
                url: '/api/delete_book',
                body: { id: "2" },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(401)
                expect(response.body.error).to.equal('Unauthorized')
            })
            cy.reload()
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
        })
    })

    it('should return 404 if Book not found', () => {
        cy.session('no book found session', () => {
            login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
            cy.request({
                method: 'POST',
                url: '/api/delete_book',
                body: { id: "187" },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(404)
                expect(response.body.error).to.equal('Book not found')
            })
            cy.reload()
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
        })
    })

    it('should return 401 if not Book owner', () => {
        cy.task('db:dummybook3');
        cy.session('not book owner session', () => {
            login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
            cy.request({
                method: 'POST',
                url: '/api/delete_book',
                body: { id: "3" },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(401)
                expect(response.body.error).to.equal('Unauthorized')
            })
            cy.reload()
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
        })
    })
})