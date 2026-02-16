# Aurora Design Specification

## 1. Introduction
Aurora is designed to be the friendliest programming language for absolute beginners. It reads like casual English, minimizes punctuation clutter, and provides helpful error messages.

## 2. Syntax Overview

### Output
```aurora
say "Hello World!"
```

### Variables
```aurora
let name = "Alice"
let age = 20
let is_happy = true
```

### Input
```aurora
let user_input = ask "What is your name?"
```

### Math & Logic
Standard operators: `+`, `-`, `*`, `/`, `%`
Comparisons: `>`, `<`, `>=`, `<=`, `==`, `!=`
Logic: `and`, `or`, `not`

### Conditionals
```aurora
if age >= 18:
    say "You are an adult."
else:
    say "You are a minor."
end
```

### Loops
**Repeat Loop:**
```aurora
repeat 5 times:
    say "Counting..."
end
```

**While Loop:**
```aurora
let count = 0
while count < 5:
    say count
    let count = count + 1
end
```

### Functions
```aurora
define greet(person):
    say "Hello, " + person + "!"
    return true
end

greet("Bob")
```

### Arrays (Lists)
```aurora
let fruits = ["apple", "banana", "cherry"]
say fruits[0]
push(fruits, "date")
```

### File I/O
```aurora
write("test.txt", "This is a test.")
let content = read("test.txt")
say content
```

### Comments
```aurora
# This is a comment
```

## 3. Architecture
The implementation will be in Python (v3).
1. **Lexer**: Breaks source string into tokens.
2. **Parser**: Constructs a simple AST (Abstract Syntax Tree).
3. **Interpreter**: Traverses the AST and executes nodes.
4. **Transpiler**: Converts AST to Python code for compilation.
