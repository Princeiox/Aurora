
const TT_KEYWORD = 'KEYWORD', TT_IDENTIFIER = 'IDENTIFIER', TT_STRING = 'STRING', TT_NUMBER = 'NUMBER';
const TT_LBRACKET = 'LBRACKET', TT_RBRACKET = 'RBRACKET', TT_DOT = 'DOT';
const TT_PLUS = 'PLUS', TT_MINUS = 'MINUS', TT_MUL = 'MUL', TT_DIV = 'DIV';
const TT_LPAREN = 'LPAREN', TT_RPAREN = 'RPAREN', TT_COLON = 'COLON';
const TT_COMMA = 'COMMA', TT_ASSIGN = 'ASSIGN', TT_NEWLINE = 'NEWLINE', TT_EOF = 'EOF';
const TT_EQ = 'EQ', TT_GT = 'GT', TT_LT = 'LT';

const KEYWORDS = ['say', 'let', 'if', 'else', 'end', 'repeat', 'times', 'while', 'define', 'return', 'class', 'import'];

class Token {
    constructor(type, value = null, line = 0) {
        this.type = type;
        this.value = value;
        this.line = line;
    }
}

class Lexer {
    constructor(text) {
        this.text = text;
        this.pos = 0;
        this.line = 1;
        this.currentChar = this.text.length > 0 ? this.text[0] : null;
    }

    advance() {
        if (this.currentChar === '\n') this.line++;
        this.pos++;
        this.currentChar = this.pos < this.text.length ? this.text[this.pos] : null;
    }

    makeTokens() {
        let tokens = [];
        while (this.currentChar !== null) {
            if ([' ', '\t', '\r'].includes(this.currentChar)) {
                this.advance();
            } else if (this.currentChar === '\n') {
                tokens.push(new Token(TT_NEWLINE, null, this.line));
                this.advance();
            } else if (this.currentChar === '#') {
                while (this.currentChar !== null && this.currentChar !== '\n') this.advance();
            } else if (/[0-9]/.test(this.currentChar)) {
                tokens.push(this.makeNumber());
            } else if (/[a-zA-Z_]/.test(this.currentChar)) {
                tokens.push(this.makeIdentifier());
            } else if (this.currentChar === '"') {
                tokens.push(this.makeString());
            } else if (this.currentChar === '+') {
                tokens.push(new Token(TT_PLUS, '+', this.line)); this.advance();
            } else if (this.currentChar === '-') {
                tokens.push(new Token(TT_MINUS, '-', this.line)); this.advance();
            } else if (this.currentChar === '*') {
                tokens.push(new Token(TT_MUL, '*', this.line)); this.advance();
            } else if (this.currentChar === '/') {
                tokens.push(new Token(TT_DIV, '/', this.line)); this.advance();
            } else if (this.currentChar === '(') {
                tokens.push(new Token(TT_LPAREN, '(', this.line)); this.advance();
            } else if (this.currentChar === ')') {
                tokens.push(new Token(TT_RPAREN, ')', this.line)); this.advance();
            } else if (this.currentChar === ':') {
                tokens.push(new Token(TT_COLON, ':', this.line)); this.advance();
            } else if (this.currentChar === '[') {
                tokens.push(new Token(TT_LBRACKET, '[', this.line)); this.advance();
            } else if (this.currentChar === ']') {
                tokens.push(new Token(TT_RBRACKET, ']', this.line)); this.advance();
            } else if (this.currentChar === ',') {
                tokens.push(new Token(TT_COMMA, ',', this.line)); this.advance();
            } else if (this.currentChar === '.') {
                tokens.push(new Token(TT_DOT, '.', this.line)); this.advance();
            } else if (this.currentChar === '=') {
                // Check ==
                this.advance();
                if (this.currentChar === '=') {
                    tokens.push(new Token(TT_EQ, '==', this.line)); this.advance();
                } else {
                    tokens.push(new Token(TT_ASSIGN, '=', this.line));
                }
            } else if (this.currentChar === '>') {
                tokens.push(new Token(TT_GT, '>', this.line)); this.advance();
            } else if (this.currentChar === '<') {
                tokens.push(new Token(TT_LT, '<', this.line)); this.advance();
            } else {
                this.advance(); // Skip unknown
            }
        }
        tokens.push(new Token(TT_EOF, null, this.line));
        return tokens;
    }

    makeNumber() {
        let numStr = '';
        while (this.currentChar !== null && /[0-9.]/.test(this.currentChar)) {
            numStr += this.currentChar;
            this.advance();
        }
        return new Token(TT_NUMBER, parseFloat(numStr), this.line);
    }

    makeIdentifier() {
        let idStr = '';
        while (this.currentChar !== null && /[a-zA-Z0-9_]/.test(this.currentChar)) {
            idStr += this.currentChar;
            this.advance();
        }
        return new Token(KEYWORDS.includes(idStr) ? TT_KEYWORD : TT_IDENTIFIER, idStr, this.line);
    }

    makeString() {
        let str = '';
        this.advance();
        while (this.currentChar !== null && this.currentChar !== '"') {
            str += this.currentChar;
            this.advance();
        }
        this.advance();
        return new Token(TT_STRING, str, this.line);
    }
}
