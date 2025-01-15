// filepath: cypress/integration/auth.spec.js
describe('User Registration', () => {
  beforeEach(() => {
    cy.visit('http://23.20.223.181:8080/register')
  })


    it('should register a new user', () => {
      cy.intercept('POST', `${Cypress.env('API_URL')}/register`).as('registerRequest');


      const generateRandomEmail = () => {
        const timestamp = Date.now(); // Use current timestamp for uniqueness
        return `user${timestamp}@example.com`;
      };
      
      const newEmail = generateRandomEmail();
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