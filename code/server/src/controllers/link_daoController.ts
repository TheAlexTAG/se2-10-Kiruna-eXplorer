import { LinkDocument } from '../components/link_doc';
import { LinkDocumentDAO } from '../dao/link_docDAO';
import { DocumentsError, LinkError } from '../errors/link_docError';

/* Sanitize input */
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

class LinkDocumentController{
    private dao: LinkDocumentDAO;

    constructor(){
        this.dao= new LinkDocumentDAO();
    }

    async creatLink(firstDoc: number, other: {id: number,relationship: string}[]): Promise<boolean>{
        const value: LinkDocument[]= [];
        for(let doc of other){
            const secondDoc= +DOMPurify.sanitize(doc.id);
            const relationship= DOMPurify.sanitize(doc.relationship);

            if(firstDoc=== secondDoc || !await this.dao.checkDocuments(firstDoc, secondDoc)){
                throw new DocumentsError(); 
            }
            if(await this.dao.getLink(firstDoc,secondDoc)){
                throw new LinkError();
            }

            value.push(new LinkDocument(firstDoc,secondDoc,relationship));
        }

        return await this.dao.insertLink(value);
    } 
}

export {LinkDocumentController};