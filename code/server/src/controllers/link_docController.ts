import { Relationship } from '../components/link_doc';
import { LinkDocumentDAO } from '../dao/link_docDAO';
import { DocumentsError, LinkError } from '../errors/link_docError';

/* Sanitize input */
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

class LinkDocumentController{
    private dao: LinkDocumentDAO;

    constructor(){
        this.dao= new LinkDocumentDAO();
    }

    async createLink(firstDoc: number, other: {id: string,relationship: string[]}[]): Promise<boolean>{
        const value: (number | Relationship)[][]= [];
        
        for(let doc of other){
            const secondDoc: number= +DOMPurify.sanitize(doc.id);
            if(firstDoc=== secondDoc || !await this.dao.checkDocuments(firstDoc, secondDoc)){
                throw new DocumentsError(); 
            }

            for(let rel of doc.relationship){
                const relationship: Relationship= DOMPurify.sanitize(rel) as Relationship;

                if(await this.dao.getLink(firstDoc,secondDoc, relationship)){
                    throw new LinkError();
                }
                firstDoc< secondDoc ? value.push([firstDoc,secondDoc,relationship]) : value.push([secondDoc,firstDoc,relationship]);
            }
        }
        return await this.dao.insertLink(value);
    } 
}

export {LinkDocumentController};