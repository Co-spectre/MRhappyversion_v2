describe('MR Happy Website', () => {
  it('should load the homepage', () => {
    cy.visit('/');
    cy.contains('MR Happy').should('be.visible');
  });
});
