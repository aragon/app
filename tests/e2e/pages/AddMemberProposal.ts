export default class AddMemberProposal {
  addMemberProposal() {
    // Clicks Create proposal on DAO Dashboard
    cy.get('button').contains('Members').click();
    cy.get('button').contains('Manage members').click();
    cy.get('textarea[placeholder="0x…"]').type(
      '0xeF32DC2B02bFA082F11aa6f57154f4079FFE9Bbc'
    );
    cy.get('button').contains('Next').click();
    cy.get('button').contains('Next').click();
    cy.get('input[name="proposalTitle"]').type('Add member');
    cy.get('textarea[name="proposalSummary"]').type('Add member to the DAO');
    cy.get('button').contains('Next').click();
    cy.get('button').contains('Publish proposal').click();
    // Approve the tx from the modal
    cy.get('button')
      .contains('Create proposal now')
      .parent()
      .should('not.be.disabled')
      .click();
    // Brings up the MetaMask tx window and clicks confirm
    cy.confirmMetamaskTransaction();
    cy.switchToCypressWindow();
    // Waits till the tx completes by checking the state of the primary button the tx modal and continues to Proposal page
    cy.wait(10000);
    cy.get('button').contains('Open your proposal').click();
    cy.wait(10000);
    cy.get('button').contains('Approve only').click();
    cy.get('button').contains('Approve').click({force: true});
    // Brings up the MetaMask tx window and clicks confirm
    cy.confirmMetamaskTransaction();
    cy.wait(10000);
    cy.switchToCypressWindow();
    cy.wait(10000);
  }
}
