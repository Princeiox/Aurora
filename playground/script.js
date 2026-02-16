
document.getElementById('run-btn').addEventListener('click', () => {
    const code = document.getElementById('code-editor').value;
    const outputDiv = document.getElementById('output-console');
    outputDiv.innerHTML = ''; // Clear

    const log = (msg) => {
        outputDiv.innerText += msg + '\n';
    };

    try {
        const lexer = new Lexer(code);
        const tokens = lexer.makeTokens();

        const parser = new Parser(tokens);
        const statements = parser.parse();

        const interpreter = new Interpreter(log);
        interpreter.interpret(statements);
    } catch (e) {
        log("Error: " + e);
        console.error(e);
    }
});
