import process from "process";
import fs from "fs";
import path from "path";

let cla = process.argv.slice(2);

if(cla.length == 0){
    console.log("Usage: tsx genast.ts [fml file]")
    process.exit(1)
}

let output_dir = cla[0];
defineAst(output_dir, "Expr", [
    "Attribute -> left: Expr, right: Expr, line_number: number",
    "Control -> identifier: Expr , attributes: Expr[], line_number: number",
    "Identifier -> name: string, line_number: number",
    "Container -> identifier: Expr, attributes: Expr[], children: Expr[], line_number: number",
    "Literal -> value: any, line_number: number",
    "MarkdownExpr -> attributes: Expr[], value: string, line_number: number",
    "Select -> identifier: Expr, attributes: Expr[], children: Literal[], line_number: number",
    "Radio -> identifier: Expr, attributes: Expr[], children: Literal[], line_number: number"
]);


function defineAst(output_dir: string, parent: string, definitions: string[]) {

    let file = `
    export abstract class ${parent}{ 
        abstract accept<R>(visitor: Visitor<R>): R\n
    }`

    file = defineVisitor(file, parent, definitions);

    for(let definition of definitions) {
        let [class_name, fields] = definition.split("->");
        let field_list = fields.trim().split(",").map(field => {
            let [name, type] = field.split(":");
            return `public ${name.trim()}: ${type.trim()}`;
        }).join("\n");
        file += `
        export class ${class_name.trim()} extends ${parent}{
            ${field_list}
            constructor(${fields}){
                super();
                ${fields.split(", ").map(field => {
            let [name, _] = field.split(": ");
            return `this.${name.trim()} = ${name.trim()};`
        }).join("\n")}\n}\n`

        file += `accept<R>(visitor: Visitor<R>): R {
            return visitor.visit${class_name.trim()}${parent.trim()}(this)
        }\n}\n`
    }

    let output_path = path.resolve(path.join(output_dir, parent + ".ts"));

    fs.writeFileSync(output_path, file);

}


function defineVisitor(file: string, parent: string, definitions: string[]) {
    file += "\nexport interface Visitor<R>{"

    for(let definition of definitions){
        let type_name = definition.split("->")[0].trim();
        file += `visit${type_name}${parent}(${type_name.toLowerCase()}: ${type_name}): R\n`
    }

    file += "}\n"
    return file
}
