class CoordinatesOutOfBoundsError extends Error {
    code: number
  
    constructor() {
        super("Coordinates out of bound")
        this.code = 400;
    }
}

export{CoordinatesOutOfBoundsError};