describe("Search books", () => {
    beforeEach(() => {
        cy.task('db:seed');
        cy.task('db:dummybook');
    })

    it('should return 200 response', () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:3000/api/search_books',
            body: { 
                userId: "2",
                query: "book"
             },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(200)
        })
    })
})