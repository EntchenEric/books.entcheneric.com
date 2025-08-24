import { login } from "../helper.cy";

describe("update user route", () => {
    beforeEach(() => {
        cy.task('db:seed');
    })

    it('should update user Information', () => {
        cy.session('find book session', () => {
            login();
            cy.request({
                method: 'POST',
                url: '/api/update_user',
                body: {
                    title: "testTitle",
                    description: "testDescription"
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200)
            })
            cy.reload()
            cy.contains('testTitle')
            cy.contains('testDescription')
        })
    })

    it('should return 401 if not logged in', () => {
        cy.request({
            method: 'POST',
            url: '/api/update_book',
            body: {
                title: "testTitle",
                description: "testDescription"
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(401)
        })
    })
})