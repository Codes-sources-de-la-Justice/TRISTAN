describe('tristan-core: TristanCore component', () => {
  beforeEach(() => cy.visit('/iframe.html?id=tristancore--primary'));
    
    it('should render the component', () => {
      cy.get('h1').should('contain', 'Welcome to TristanCore!');
    });
});
