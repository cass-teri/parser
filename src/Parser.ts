import {Result} from "@fmllang/tokenizer";
import {Expr, Container, Identifier, Attribute, Markdown, Select, Radio, Control, Literal, CheckList} from "./Expr"
import {Token} from "@fmllang/tokenizer";
import {TokenType} from "@fmllang/tokenizer";

/*
Grammar:
root -> container
container -> IDENTIFIER ( attributes ) { elements }
attributes -> attribute | attributes
attribute -> IDENTIFIER = STRING | NUMBER | BOOLEAN
elements -> element  | elements
element -> container | control
control -> IDENTIFIER ( attributes )
IDENTIFIER -> [a-zA-Z_][a-zA-Z0-9_]*
*/

export class Parser {

    private readonly tokens: Token[]
    private current: number = 0

    constructor(tokens: Token[]) {
        this.tokens = tokens
    }

    public Parse(): Result<Expr|null, Error|null> {
        let expr = this.root()
        return new Result(expr, null)
    }

    private root() {
        return this.container()
    }

    private container(): Expr | null {
        let identifier = this.identifier()
        if(identifier == null) {
            return null
        }
        let attributes = this.attributes()
        if (attributes == null) {
            this.current--
            // Rollback to the previous token
            return null
        }
        let elements = this.elements()
        if (elements == null) {
            for(const attribute of attributes){
                this.current = this.current - 3
            }
            return null
        }

        let line_number = (this.peek_at_previous()).line
        return new Container(identifier, attributes, elements, line_number)
    }

    private identifier() : Expr | null {
        const line_number = this.peek_at_current().line
        if(this.match(TokenType.IDENTIFIER)) {
            return new Identifier(this.tokens[this.current-1].lexeme, line_number)
        }
        return null
    }

    private attributes() : Expr[] | null{
        if(this.match(TokenType.LEFT_PARENTHESIS)) {
            let attributes = this.attribute()
            if(this.match(TokenType.RIGHT_PARENTHESIS)) {
                return attributes || []
            }
        }
        return null
    }

    private attribute() : Expr[] | null {
        let attributes = []
        let left = this.identifier()
        let equal = this.match(TokenType.EQUAL)
        let right = this.literal()
        if(left == null || right == null) {
            return null
        }

        while (left != null && right != null) {
            let line_number = this.peek_at_previous().line
            attributes.push(new Attribute(left, right, line_number))
            left = this.identifier()
            equal = this.match(TokenType.EQUAL)
            right = this.literal()
        }

        // @ts-ignore
        return attributes
    }

    private elements() : Expr[] | null {
        if(this.match(TokenType.LEFT_BRACE)) {
            let children = this.element()
            this.match(TokenType.RIGHT_BRACE)
            return children
        }
        return null
    }

    private element() : Expr[] | null {
        let result:Expr[] = []

        let identifier = this.identifier()
        if(identifier == null) {
            return null
        }
        let attributes = this.attributes()
        if (attributes == null) {
            return null
        }

        let peeked = this.peek_at_current()
        let elements = this.elements()
        if(this.match(TokenType.MARKDOWN)) {
            let markdown = peeked.literal
            const line_number = this.peek_at_previous().line
            result.push(new Markdown(attributes, markdown, line_number))
        }
        else if(this.peek_at_current().token_type == TokenType.LEFT_BRACKET){
            let children = this.read_list()
            if (children == null) {
                throw new Error("Expected list of children on line " + this.peek_at_current().line)
            }
            let id = identifier as Identifier
            const line_number = this.peek_at_previous().line
            switch (id.name){
                case "select":
                    result.push(new Select(identifier, attributes, children, line_number))
                    break
                case "radio":
                    result.push(new Radio(identifier, attributes, children, line_number))
                    break
                case "checklist":
                    result.push(new CheckList(identifier, attributes, children, line_number))
                    break
                default:
                    result.push(new Select(identifier, attributes, children, line_number))
                    break
            }
        }
        else if (elements == null) {
            //we have a control
            const line_number = this.peek_at_previous().line
            result.push( new Control(identifier, attributes, line_number))
        }
        else {
            const line_number = this.peek_at_previous().line
            result.push(new Container(identifier, attributes, elements, line_number))
        }

        while (true) {
            identifier = this.identifier()
            if(identifier == null) {
                return result
            }
            attributes = this.attributes()
            if (attributes == null) {
                return result
            }

            let peeked = this.peek_at_current()
            elements = this.elements()
            const line_number = this.peek_at_previous().line
            if(peeked.token_type == TokenType.MARKDOWN) {
                this.advance()
                this.advance()
                let markdown = peeked.literal
                result.push(new Markdown(attributes, markdown, line_number))
            }
            else if(this.peek_at_current().token_type == TokenType.LEFT_BRACKET){
                let children = this.read_list()
                if (children == null) {
                    throw new Error("Expected list of children on line " + this.peek_at_current().line)
                }
                let id = identifier as Identifier
                switch (id.name){
                    case "select":
                        result.push(new Select(identifier, attributes, children, line_number))
                        break
                    case "radio":
                        result.push(new Radio(identifier, attributes, children, line_number))
                        break
                    case "checklist":
                        result.push(new CheckList(identifier, attributes, children, line_number))
                        break
                    default:
                        result.push(new Select(identifier, attributes, children, line_number))
                        break
                }
            }
            else if (elements == null) {
                //we have a control
                result.push( new Control(identifier, attributes, line_number))
            }
            else {
                result.push(new Container(identifier, attributes, elements, line_number))
            }
        }

    }

    private match(...token_types: number[]): boolean {
        for(let token_type of token_types) {
            if(this.check(token_type)) {
                this.advance()
                return true
            }
        }
        return false
    }

    private check(token_type: number): boolean {
        if(this.is_at_end()) {
            return false
        }
        let peeked = this.peek_at_current()
        return peeked.token_type == token_type
    }

    private advance() {
        if(!this.is_at_end()) {
            this.current++
        }
    }

    private is_at_end(): boolean {
        const peeked = this.peek_at_current()
        if (peeked == null) {
            return true
        }
        return peeked.token_type == TokenType.EOF
    }

    private peek_at_current(): Token {
        return this.tokens[this.current]
    }

    private peek_at_previous(): Token {
        return this.tokens[this.current - 1]
    }

    private peek_at_next(): Token {
        return this.tokens[this.current + 1]
    }

    private literal() {
        let literal_types = [TokenType.STRING, TokenType.NUMBER, TokenType.TRUE, TokenType.FALSE]

        for(let token_type of literal_types) {
            if(this.check(token_type)) {
                this.advance()
                let previous = this.peek_at_previous()
                let line_number = previous.line
                return new Literal(previous, line_number)
            }
        }

        return null
    }

    private control() : Expr | null {
        let identifier = this.identifier()
        let attributes = this.attributes()
        if(identifier == null || attributes == null) {
            return null
        }
        this.match(TokenType.EOL)
        const line_number = this.peek_at_previous().line
        return new Control(identifier, attributes, line_number)
    }

    private read_list() {
        let items = []
        this.match(TokenType.LEFT_BRACKET)
        while(!this.check(TokenType.RIGHT_BRACKET)) {
            let item = this.literal()
            if(item == null) {
                return null
            }
            items.push(item)
            this.match(TokenType.COMMA)
        }
        this.match(TokenType.RIGHT_BRACKET)
        return items
    }
}