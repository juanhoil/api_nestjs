import * as path from "path";
import * as fs from 'fs';
export const unlinkOne = (fileName: string, isPublic: boolean | undefined): boolean => {
    let file = ''
    if (isPublic) {
        file = path.resolve(`uploads/temp/${fileName}`)
    } else {
        file = path.resolve(`uploads/${isPublic ? 'public' : 'private'}/${fileName}`)
    }
    try {        
        let exist: boolean = fs.existsSync(file)        
        if (!exist) return true
        fs.unlinkSync(file)
        return true
    } catch (error) {
        return false
    }
} 