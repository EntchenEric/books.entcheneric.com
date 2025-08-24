describe("update user route", () => {
    beforeEach(() => {
        cy.task('db:seed');
    })

    it('should handle login', () => {
        cy.session('User session', () => {
            cy.visit('http://localhost:3000/testUser')
            cy.get('#LoginButton').click()
            cy.get('input[name="name"]').type("TestUser")
            cy.get('input[name="password"]').type("TestPassword")
            cy.get('button[type="submit"]').click()
            cy.get('#LogoutButton')
        })
    })

    it('should update user Information', () => {
        cy.session('find book session', () => {
            cy.visit('http://localhost:3000/testUser')
            cy.get('#LoginButton').click()
            cy.get('input[name="name"]').type("TestUser")
            cy.get('input[name="password"]').type("TestPassword")
            cy.get('button[type="submit"]').click()
            cy.get('#LogoutButton')
            cy.request({
                method: 'POST',
                url: 'http://localhost:3000/api/update_user',
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
            url: 'http://localhost:3000/api/update_book',
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