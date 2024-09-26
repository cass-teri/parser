
    export abstract class Expr{ 
        abstract accept<R>(visitor: Visitor<R>): R

    }
export interface Visitor<R>{visitAttributeExpr(attribute: Attribute): R
visitControlExpr(control: Control): R
visitIdentifierExpr(identifier: Identifier): R
visitContainerExpr(container: Container): R
visitLiteralExpr(literal: Literal): R
visitMarkdownExprExpr(markdownexpr: MarkdownExpr): R
visitSelectExpr(select: Select): R
visitRadioExpr(radio: Radio): R
}

        export class Attribute extends Expr{
            public left: Expr
public right: Expr
public line_number: number
            constructor( left: Expr, right: Expr, line_number: number){
                super();
                this.left = left;
this.right = right;
this.line_number = line_number;
}
accept<R>(visitor: Visitor<R>): R {
            return visitor.visitAttributeExpr(this)
        }
}

        export class Control extends Expr{
            public identifier: Expr
public attributes: Expr[]
public line_number: number
            constructor( identifier: Expr , attributes: Expr[], line_number: number){
                super();
                this.identifier = identifier;
this.attributes = attributes;
this.line_number = line_number;
}
accept<R>(visitor: Visitor<R>): R {
            return visitor.visitControlExpr(this)
        }
}

        export class Identifier extends Expr{
            public name: string
public line_number: number
            constructor( name: string, line_number: number){
                super();
                this.name = name;
this.line_number = line_number;
}
accept<R>(visitor: Visitor<R>): R {
            return visitor.visitIdentifierExpr(this)
        }
}

        export class Container extends Expr{
            public identifier: Expr
public attributes: Expr[]
public children: Expr[]
public line_number: number
            constructor( identifier: Expr, attributes: Expr[], children: Expr[], line_number: number){
                super();
                this.identifier = identifier;
this.attributes = attributes;
this.children = children;
this.line_number = line_number;
}
accept<R>(visitor: Visitor<R>): R {
            return visitor.visitContainerExpr(this)
        }
}

        export class Literal extends Expr{
            public value: any
public line_number: number
            constructor( value: any, line_number: number){
                super();
                this.value = value;
this.line_number = line_number;
}
accept<R>(visitor: Visitor<R>): R {
            return visitor.visitLiteralExpr(this)
        }
}

        export class MarkdownExpr extends Expr{
            public attributes: Expr[]
public value: string
public line_number: number
            constructor( attributes: Expr[], value: string, line_number: number){
                super();
                this.attributes = attributes;
this.value = value;
this.line_number = line_number;
}
accept<R>(visitor: Visitor<R>): R {
            return visitor.visitMarkdownExprExpr(this)
        }
}

        export class Select extends Expr{
            public identifier: Expr
public attributes: Expr[]
public children: Literal[]
public line_number: number
            constructor( identifier: Expr, attributes: Expr[], children: Literal[], line_number: number){
                super();
                this.identifier = identifier;
this.attributes = attributes;
this.children = children;
this.line_number = line_number;
}
accept<R>(visitor: Visitor<R>): R {
            return visitor.visitSelectExpr(this)
        }
}

        export class Radio extends Expr{
            public identifier: Expr
public attributes: Expr[]
public children: Literal[]
public line_number: number
            constructor( identifier: Expr, attributes: Expr[], children: Literal[], line_number: number){
                super();
                this.identifier = identifier;
this.attributes = attributes;
this.children = children;
this.line_number = line_number;
}
accept<R>(visitor: Visitor<R>): R {
            return visitor.visitRadioExpr(this)
        }
}
