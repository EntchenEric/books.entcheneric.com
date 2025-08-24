describe("Image proxy", () => {
    beforeEach(() => {
        cy.task('db:seed');
        cy.task('db:dummybook');
    })

    it('should return 200 response', () => {
        cy.request({
            method: 'POST',
            url: '/api/image_proxy?url=http%3A%2F%2Fbooks.google.com%2Fbooks%2Fpublisher%2Fcontent%3Fid%3DnjMyDwAAQBAJ%26printsec%3Dfrontcover%26img%3D1%26zoom%3D2%26edge%3Dcurl%26imgtk%3DAFLRE73vwoEOEQtAIVif62F4HITTUcAoy6pD13eFAUvFWxAeFFyoMFBzeS6-_xqAO6AbdoG_E2Re4iRM_LoQMGjgJPrT-1dUqBLnTbVfEhCKx9CBlcnO_8SCEHFcuV3nPQ5lQCmh3mPb%26source%3Dgbs_api',
            body: { url: "testUser" },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(200)
        })
    })
})