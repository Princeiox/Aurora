
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.idx = -1;
        this.advance();
    }
    advance() {
        this.idx++;
        this.currentTok = this.idx < this.tokens.length ? this.tokens[this.idx] : this.tokens[this.tokens.length - 1];
        return this.currentTok;
    }
    peek() {
        if (this.idx + 1 < this.tokens.length) return this.tokens[this.idx + 1];
        return this.tokens[this.tokens.length - 1];
    }
    parse() {
        let statements = [];
        while (this.currentTok.type !== TT_EOF) {
            // console.log("Current Token:", this.currentTok);
            if (this.currentTok.type === TT_NEWLINE) {
                this.advance();
                continue;
            }
            // End of block handling
            if (this.currentTok.value === 'end' || this.currentTok.value === 'else') break;

            let stmt = this.statement();
            if (stmt) {
                statements.push(stmt);
            } else {
                throw new Error(`Syntax Error: Unexpected token '${this.currentTok.value || this.currentTok.type}' at line ${this.currentTok.line}`);
            }
        }
        return statements;
    }

    statement() {
        if (this.currentTok.type === TT_KEYWORD && this.currentTok.value === 'say') {
            this.advance();
            return { type: 'Say', expr: this.expr() };
        } else if (this.currentTok.value === 'let') {
            this.advance();
            let varName = this.currentTok.value;
            this.advance(); // name
            if (this.currentTok.type === TT_ASSIGN) {
                this.advance(); // =
                return { type: 'VarAssign', name: varName, value: this.expr() };
            }
        } else if (this.currentTok.value === 'class') {
            return this.class_def();
        } else if (this.currentTok.value === 'define') {
            return this.func_def();
        } else if (this.currentTok.value === 'if') {
            return this.if_stmt();
        } else if (this.currentTok.value === 'while') {
            return this.while_stmt();
        } else if (this.currentTok.value === 'repeat') {
            return this.repeat_stmt();
        } else if (this.currentTok.value === 'return') {
            this.advance();
            return { type: 'Return', value: this.expr() };
        }

        // Expression statement (e.g. function call c.inc())
        let expr = this.expr();
        return expr;
    }

    class_def() {
        this.advance(); // class
        let name = this.currentTok.value;
        this.advance(); // name
        if (this.currentTok.type === TT_COLON) this.advance();
        if (this.currentTok.type === TT_NEWLINE) this.advance();

        let methods = [];
        while (this.currentTok.value !== 'end' && this.currentTok.type !== TT_EOF) {
            if (this.currentTok.type === TT_NEWLINE) {
                this.advance();
                continue;
            }
            if (this.currentTok.value === 'define') {
                methods.push(this.func_def());
            } else {
                this.advance(); // skip unknown inside class
            }
        }
        this.advance(); // end
        return { type: 'ClassDef', name, methods };
    }

    func_def() {
        this.advance(); // define
        let name = this.currentTok.value;
        this.advance(); // name
        this.advance(); // (
        let args = [];
        if (this.currentTok.type !== TT_RPAREN) {
            args.push(this.currentTok.value);
            this.advance();
            while (this.currentTok.type === TT_COMMA) {
                this.advance();
                args.push(this.currentTok.value);
                this.advance();
            }
        }
        this.advance(); // )
        if (this.currentTok.type === TT_COLON) this.advance();
        if (this.currentTok.type === TT_NEWLINE) this.advance();

        let body = this.parse();
        this.advance(); // end
        return { type: 'FuncDef', name, args, body };
    }

    if_stmt() {
        this.advance(); // if
        let cond = this.expr();
        if (this.currentTok.type === TT_COLON) this.advance();
        if (this.currentTok.type === TT_NEWLINE) this.advance();

        let body = this.parse();
        let elseBody = null;
        if (this.currentTok.value === 'else') {
            this.advance();
            if (this.currentTok.type === TT_COLON) this.advance();
            if (this.currentTok.type === TT_NEWLINE) this.advance();
            elseBody = this.parse();
        }
        this.advance(); // end
        return { type: 'If', condition: cond, body, elseBody };
    }

    while_stmt() {
        this.advance(); // while
        let cond = this.expr();
        if (this.currentTok.type === TT_COLON) this.advance();
        if (this.currentTok.type === TT_NEWLINE) this.advance();
        let body = this.parse();
        this.advance(); // end
        return { type: 'While', condition: cond, body };
    }

    repeat_stmt() {
        this.advance(); // repeat
        let count = this.expr();
        this.advance(); // times
        if (this.currentTok.type === TT_COLON) this.advance();
        if (this.currentTok.type === TT_NEWLINE) this.advance();
        let body = this.parse();
        this.advance(); // end
        return { type: 'Repeat', count, body };
    }

    expr() {
        // Assignment logic: target = value
        // or just binary ops
        // We peek to see if it's an assignment?
        // Or we parse left, check for '=', then parse right.

        let left = this.bin_op(this.term.bind(this), [TT_PLUS, TT_MINUS, TT_GT, TT_LT, TT_EQ]);

        if (this.currentTok.type === TT_ASSIGN) {
            this.advance();
            let right = this.expr();
            // Check if left is valid assignment target
            if (left.type === 'VarAccess') {
                return { type: 'VarAssign', name: left.name, value: right };
            }
            if (left.type === 'GetAttr') {
                // We need a specific SetAttr node or reuse VarAssign with extra field?
                // Interpreter handles VarAssign? No, interpreter needs SetAttr logic.
                // Let's call it 'SetAttr'
                return { type: 'SetAttr', obj: left.obj, attr: left.attr, value: right };
            }
            throw new Error("Invalid assignment target");
        }

        return left;
    }

    term() {
        return this.bin_op(this.call.bind(this), [TT_MUL, TT_DIV]);
    }

    bin_op(func_a, ops) {
        let left = func_a();
        while (ops.includes(this.currentTok.type)) {
            let op = this.currentTok;
            this.advance();
            let right = func_a();
            left = { type: 'BinOp', left, op: op.type, right };
        }
        return left;
    }

    call() {
        let atom = this.atom();
        while (true) {
            if (this.currentTok.type === TT_LPAREN) {
                this.advance();
                let args = [];
                if (this.currentTok.type !== TT_RPAREN) {
                    args.push(this.expr());
                    while (this.currentTok.type === TT_COMMA) {
                        this.advance();
                        args.push(this.expr());
                    }
                }
                this.advance(); // )
                atom = { type: 'Call', func: atom, args };
            } else if (this.currentTok.type === TT_DOT) {
                this.advance();
                let attr = this.currentTok.value;
                this.advance();
                atom = { type: 'GetAttr', obj: atom, attr };
            } else if (this.currentTok.type === TT_LBRACKET) {
                // Index access? Not implemented in basic tutorial but good to have
                break; // TODO
            } else {
                break;
            }
        }
        return atom;
    }

    atom() {
        let tok = this.currentTok;
        if (tok.type === TT_NUMBER) {
            this.advance();
            return { type: 'Number', value: tok.value };
        }
        if (tok.type === TT_STRING) {
            this.advance();
            return { type: 'String', value: tok.value };
        }
        if (tok.type === TT_IDENTIFIER) {
            this.advance();
            return { type: 'VarAccess', name: tok.value };
        }
        if (tok.type === TT_LBRACKET) {
            return this.list_expr();
        }
        if (tok.type === TT_LPAREN) {
            this.advance();
            let expr = this.expr();
            if (this.currentTok.type === TT_RPAREN) this.advance();
            else throw new Error(`Syntax Error: Expected ')' at line ${this.currentTok.line}`);
            return expr;
        }

        // Return null if nothing matched, so statement() can handle or fail
        return null;
    }

    list_expr() {
        this.advance(); // [
        let elements = [];
        if (this.currentTok.type !== TT_RBRACKET) {
            elements.push(this.expr());
            while (this.currentTok.type === TT_COMMA) {
                this.advance();
                elements.push(this.expr());
            }
        }
        this.advance(); // ]
        return { type: 'List', elements };
    }
}
