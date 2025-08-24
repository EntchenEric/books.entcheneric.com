import { login } from "./helper.cy";

describe("Login", () => {
    beforeEach(() => {
        cy.task('db:seed');
    })

    it('should display Login correctly', () => {
        cy.visit('/testUser')
        cy.get('#LoginButton').click()
        cy.get('input[name="name"]')
        cy.get('input[name="password"]')
        cy.get('button[type="submit"]')
    })

    it('should handle login', () => {
        cy.session('User session', () => {
            login();
        })
    })

    it('should handle invalid credentials', () => {
        cy.visit('/testUser')
        cy.get('#LoginButton').click()
        cy.get('input[name="name"]').type("invalidUser")
        cy.get('input[name="password"]').type("invalidPassword")
        cy.get('button[type="submit"]').click()
        cy.get('div[role="alert"]').contains("Das Passwort ist ungültig")
    })
})

describe("Password", () => {
    beforeEach(() => {
        cy.task('db:seed');
    })

    it('should handle short password', () => {
        cy.visit('/testUser')
        cy.get('#LoginButton').click()
        cy.get('input[name="name"]').type("invalidUser")
        cy.get('input[name="password"]').type("a")
        cy.get('button[type="submit"]').click()
        cy.get('input[name="password"]')
            .should('have.attr', 'aria-invalid', 'true');
        cy.get('p[data-slot="form-message"]').contains("mindestens 8")
    })

    it('should handle long password', () => {
        cy.visit('/testUser')
        cy.get('#LoginButton').click()
        cy.get('input[name="name"]').type("invalidUser")
        cy.get('input[name="password"]').type('a'.repeat(128))
        cy.get('button[type="submit"]').click()
        cy.get('input[name="password"]')
            .should('have.attr', 'aria-invalid', 'true');
        cy.get('p[data-slot="form-message"]').contains("maximal 64")
    })

    it('should handle no password', () => {
        cy.visit('/testUser')
        cy.get('#LoginButton').click()
        cy.get('input[name="name"]').type("invalidUser")
        cy.get('button[type="submit"]').click()
        cy.get('input[name="password"]')
            .should('have.attr', 'aria-invalid', 'true');
        cy.get('p[data-slot="form-message"]').contains("mindestens 8")
    })
})

describe("Name", () => {
    beforeEach(() => {
        cy.task('db:seed');
    })

    it('should handle short name', () => {
        cy.visit('/testUser')
        cy.get('#LoginButton').click()
        cy.get('input[name="name"]').type("a")
        cy.get('input[name="password"]').type("invalidPassword")
        cy.get('button[type="submit"]').click()
        cy.get('input[name="name"]')
            .should('have.attr', 'aria-invalid', 'true');
        cy.get('p[data-slot="form-message"]').contains("mindestens 2")
    })

    it('should handle long name', () => {
        cy.visit('/testUser')
        cy.get('#LoginButton').click()
        cy.get('input[name="name"]').type('a'.repeat(128))
        cy.get('input[name="password"]').type('invalidPassword')
        cy.get('button[type="submit"]').click()
        cy.get('input[name="name"]')
            .should('have.attr', 'aria-invalid', 'true');
        cy.get('p[data-slot="form-message"]').contains("nicht länger als 64")
    })

    it('should handle invalid name', () => {
        cy.visit('/testUser')
        cy.get('#LoginButton').click()
        cy.get('input[name="name"]').type("b%///\\\\\//2929.::,,,;;,,;;***++*##+*")
        cy.get('input[name="password"]').type('invalidPassword')
        cy.get('button[type="submit"]').click()
        cy.get('input[name="name"]')
            .should('have.attr', 'aria-invalid', 'true');
        cy.get('p[data-slot="form-message"]').contains("ungültige Zeichen")
    })

    it('should handle register name', () => {
        cy.visit('/testUser')
        cy.get('#LoginButton').click()
        cy.get('input[name="name"]').type("register")
        cy.get('input[name="password"]').type('invalidPassword')
        cy.get('button[type="submit"]').click()
        cy.get('input[name="name"]')
            .should('have.attr', 'aria-invalid', 'true');
        cy.get('p[data-slot="form-message"]').contains('nicht "register"')
    })
})