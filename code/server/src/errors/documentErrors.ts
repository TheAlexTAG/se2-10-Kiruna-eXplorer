class DocumentNotFoundError extends Error {
    customMessage: string
    customCode: number

    constructor() {
        super();
        this.customMessage = "Document not Found";
        this.customCode = 404;
    }
}

export {DocumentNotFoundError};