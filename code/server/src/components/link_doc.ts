/**
 * Represents a link in the database
*/
class LinkDocument {
  firstDoc: number; 
  secondDoc: number;
  relationship: Relationship;

  /**
   * Creates a new instance of the LinkDocument class.
   * @param firstDoc ID of the first document 
   * @param secondDoc ID of the second document 
   * @param relationship type of link between the documents
  */
   
  constructor(firstDoc: number, secondDoc: number, relationship: Relationship) {
    this.firstDoc = firstDoc;
    this.secondDoc = secondDoc;
    this.relationship= relationship;
  }
}

enum Relationship{
  DIRECT= 'Direct consequence', 
  COLLATERAL= 'Collateral consequence', 
  PROJECTION='Projection', 
  UPDATE= 'Update'
}

export {LinkDocument, Relationship};