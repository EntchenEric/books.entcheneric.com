import { login } from "../helper.cy";

describe("update book route", () => {
    beforeEach(() => {
        cy.task('db:seed');
        cy.task('db:dummybook');
    })

    afterEach(() => {
        cy.task('db:teardown')
    })

    it('should find Book', () => {
        login();
        cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
    })

    it('should update Book', () => {
        cy.session('update book session', () => {
            login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
            cy.request({
                method: 'POST',
                url: '/api/update_book',
                body: { id: "1" },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200)
            })
        })
    })

    it('should wishlist Book', () => {
        cy.session('wishlist book session', () => {
            login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
            cy.request({
                method: 'POST',
                url: '/api/update_book',
                body: { id: "1", wishlisted: true },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200)
            })
            cy.reload()
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist').contains("Wunschliste")
        })
    })

    it('should set page Progress', () => {
        cy.session('set page Progress session', () => {
            login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
            cy.request({
                method: 'POST',
                url: '/api/update_book',
                body: { id: "1", progress: 7 },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200)
            })
            cy.reload()
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist').contains("7")
        })
    })

    it('should be unauthorized if not logged in', () => {
        cy.session('not logged in session', () => {
            cy.visit('/testUser')
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
            cy.request({
                method: 'POST',
                url: '/api/update_book',
                body: { id: "2" },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(401)
                expect(response.body.error).to.equal('Unauthorized')
            })
        })
    })

    it('should return 404 if Book not found', () => {
        cy.session('no book found session', () => {
            login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
            cy.request({
                method: 'POST',
                url: '/api/update_book',
                body: { id: "187" },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(404)
                expect(response.body.error).to.equal('Book not found')
            })
        })
    })

    it('should return 401 if not Book owner', () => {
        cy.task('db:dummybook3');
        cy.session('not book owner session', () => {
            login();
            cy.get('#AddedBooks').find('div[data-slot="dialog-trigger"]').should('exist')
            cy.request({
                method: 'POST',
                url: '/api/update_book',
                body: { id: "3" },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(401)
                expect(response.body.error).to.equal('Unauthorized')
            })
        })
    })
})