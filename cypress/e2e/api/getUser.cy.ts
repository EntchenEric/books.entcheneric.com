describe("fetch purchase options route", () => {
    beforeEach(() => {
        cy.task('db:seed');
        cy.task('db:dummybook');
    })

    it('should get 200 response Book', () => {
        cy.request({
            method: 'POST',
            url: '/api/get_user',
            body: { url: "testUser" },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(200)
        })
    })

    it('should not find Book', () => {
        cy.request({
            method: 'POST',
            url: '/api/get_user',
            body: { id: "thisUsershouldnotexist" },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(404)
            expect(response.body.error).to.equal('No user found')
        })
    })
})