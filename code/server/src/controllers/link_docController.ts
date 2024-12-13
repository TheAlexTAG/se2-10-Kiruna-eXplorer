import { LinkDocument, Relationship } from '../components/link_doc';
import { LinkDocumentDAO } from '../dao/link_docDAO';
import { DocumentsError, LinkError, LinkNotFoundError } from '../errors/link_docError';

/* Sanitize input */
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

class LinkDocumentController{
    private readonly dao: LinkDocumentDAO;

    constructor(){
        this.dao= new LinkDocumentDAO();
    }

    private async checkDocuments(firstDoc: number, secondDoc: number): Promise<void>{
        if(firstDoc=== secondDoc || !await this.dao.checkDocuments(firstDoc, secondDoc)){
            throw new DocumentsError(); 
        }
    } 

    private async checkLink(firstDoc: number, secondDoc: number, relationship: Relationship): Promise<void>{
        if(await this.dao.checkLink(firstDoc,secondDoc, relationship)){
            throw new LinkError();
        }
    }

    async createLink(firstDoc: number, other: {id: string,relationship: string[]}[]): Promise<boolean>{
        const value: (number | Relationship)[][]= [];
        
        for(let doc of other){
            const secondDoc: number= +DOMPurify.sanitize(doc.id);
            /*if(firstDoc=== secondDoc || !await this.dao.checkDocuments(firstDoc, secondDoc)){
                throw new DocumentsError(); 
            }*/
            await this.checkDocuments(firstDoc,secondDoc);

            for(let rel of doc.relationship){
                const relationship: Relationship= DOMPurify.sanitize(rel) as Relationship;

                /*if(await this.dao.getLink(firstDoc,secondDoc, relationship)){
                    throw new LinkError();
                }*/
                await this.checkLink(firstDoc,secondDoc, relationship);
                firstDoc< secondDoc ? value.push([firstDoc,secondDoc,relationship]) : value.push([secondDoc,firstDoc,relationship]);
            }
        }
        return await this.dao.insertLink(value);
    } 

    async modifyLink(id: number, firstDoc: number, secondDoc: number, relationship: string): Promise<LinkDocument>{
        if(!await this.dao.getLink(id)){
            throw new LinkNotFoundError();
        }
        await this.checkDocuments(firstDoc,secondDoc);
        const rel= relationship as Relationship;
        await this.checkLink(firstDoc,secondDoc,rel);

        const value: LinkDocument= firstDoc> secondDoc ? new LinkDocument(id,secondDoc,firstDoc,rel) : new LinkDocument(id,firstDoc,secondDoc,rel);
        return await this.dao.modifyLink(value);
    } 
}

export {LinkDocumentController};