export {  Select, Expr, Identifier, Literal, Markdown, Radio, Visitor, Control, Attribute, Container, CheckList} from "./Expr"
export {Parser} from "./Parser"


// import {Tokenizer} from "@fmllang/tokenizer";
// import {Parser} from "./Parser";
// import fs from "fs"
//
//
// let fml = fs.readFileSync("assets/FORM0001.fml" ).toString()
//
// let tokenizer = new Tokenizer(fml)
// let token = tokenizer.Tokenize()
// if(token.error) {
//     console.log(token.error)
// }
// // @ts-ignore
// let parser = new Parser(token.value)
// let result = parser.Parse()
// if(result.error) {
//     console.log(result.error)
// }
//
// console.log(result.value)
//
//
//
//
