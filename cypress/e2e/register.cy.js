// filepath: cypress/integration/auth.spec.js
describe('User Registration', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/register')
  })


    it('should register a new user', () => {
      cy.intercept('POST', `${Cypress.env('API_URL')}/register`).as('registerRequest');

      const newEmail = "cypress@example.com";
      const newFirstName = "Cypress";
      const newLastName = "Cypress";
      const newPassword = "password123";

      cy.get('.row .col-md-6 .input-box .input-text-block input[name="email"]').type(newEmail);
      cy.get('input[name="firstName"]').type(newFirstName);
      cy.get('input[name="lastName"]').type(newLastName);
      cy.get('input[name="password"]').type(newPassword);
  
      cy.get('.d-flex .input-btn[type="submit"]').click();

      cy.url().should('include', '/dashboard');
      // cy.contains('Registration successful');
    });
  });