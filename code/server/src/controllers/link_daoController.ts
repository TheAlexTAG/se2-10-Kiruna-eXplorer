import { LinkDocument } from '../components/link_doc';
import { LinkDocumentDAO } from '../dao/link_docDAO';
import { DocumentsError } from '../errors';

class LinkDocumentController{
    private dao: LinkDocumentDAO;

    constructor(){
        this.dao= new LinkDocumentDAO();
    }

    async creatLink(firstDoc: number, secondDoc: number, relationship: string): Promise<LinkDocument>{
        if(firstDoc=== secondDoc || !await this.dao.checkDocuments(firstDoc, secondDoc) || await this.dao.getLink(firstDoc,secondDoc)){
            throw new DocumentsError(); 
        }
        return await this.dao.insertLink(firstDoc,secondDoc,relationship);
    } 
}

export {LinkDocumentController};