
# 🏗 Aurora Internals

This document explains the architecture of the Aurora implementation.

## 1. The Pipeline

Source Code `.aurora` -> **Lexer** -> Tokens -> **Parser** -> AST -> **Interpreter** / **Transpiler**

## 2. Components

### Lexer (`source/aurora/tokenizer.py`)
The Lexer takes raw text and breaks it into `Token` objects.
- Handles comments (`#`)
- Groups digits into Numbers
- Groups quotes into Strings
- Identifies Keywords (`if`, `say`, etc.)

### Parser (`source/aurora/parser.py`)
The Parser uses a **Recursive Descent** strategy.
- **AST Nodes**: Structure classes like `BinOpNode`, `IfNode`.
- **Precedence**: Handles order of operations (PEMDAS) via nested grammar methods (`expr` calls `term` calls `factor`).
- **Error Handling**: Tracks line numbers to report syntax errors accurately.

### Interpreter (`source/aurora/interpreter.py`)
The Interpreter traverses the AST using the **Visitor Pattern**.
- **Context**: Maintains `SymbolTable` scopes (global vs function local).
- **Execution**: Evaluates nodes recursively.
- **Runtime Errors**: Catches division by zero, undefined variables.

### Transpiler (`source/aurora/compiler.py`)
Converts the Aurora AST directly into Python source code.
- Maps Aurora constructs to Python equivalents (e.g., `repeat N times` -> `for _ in range(N)`).

## 3. Key Challenges & Solutions

**Challenge**: Handling nested control flow (loops inside ifs).
**Solution**: The `Parser` recursively calls `statements()` which allows any statement inside any block.

**Challenge**: Variable Scope.
**Solution**: `Context` and `SymbolTable` classes allow child scopes to access parent scopes, but not vice-versa.
