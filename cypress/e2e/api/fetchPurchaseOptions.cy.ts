describe("fetch purchase options route", () => {
    beforeEach(() => {
        cy.task('db:seed');
        cy.task('db:dummybook');
    })

    it('should get 200 response Book', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:3000/api/fetch_purchase_options',
            body: { bookId: "187" },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(200)
        })
    })

    it('should not find Book', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:3000/api/fetch_purchase_options',
            body: { bookId: "187" },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(404)
            expect(response.body.error).to.equal('Book not found')
        })
    })
})