import fs from "fs"

const fs = require("fs")
const path = require("path")

const productsFilePath =path.join(__dirname, "productos.json")
const cartFilePath =path.join(__dirname, "carrito.json")

const readJSONfile = (filePath)=>{

    try{
        const data= fs.readFileSync(filePath, "utf-8")
        return JSON.parse(data)
    }catch(error){
        console.error(`Error reading file ${filePath} :`, error)
        return []
    }

}
 const writeJSONFile = (filePath, data)=>{
    try{
        fs.writeFileSync(filePath, JSON.stringify(data,null, 2), "utf-8")
    }
catch (error){
    console.error(`Error writing file ${filePath}: `, error);
}
}

module.exports={
    readJSONfile,
    writeJSONFile
}