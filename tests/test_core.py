
import unittest
import sys
import os

# Ensure source is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../source')))

from aurora.interpreter import Interpreter, Context, SymbolTable
from aurora.tokenizer import Lexer
from aurora.parser import Parser

class TestAurora(unittest.TestCase):
    def setUp(self):
        self.interpreter = Interpreter()
        self.context = Context('<test>')
        self.context.symbol_table = SymbolTable()

    def run_code(self, text):
        lexer = Lexer(text)
        tokens = lexer.make_tokens()
        parser = Parser(tokens)
        ast = parser.parse()
        if ast.error: return None, ast.error
        res = self.interpreter.visit(ast.node, self.context)
        
        value = res.value
        if isinstance(value, list):
            value = value[-1] if value else None
            
        return value, res.error

    def test_math(self):
        val, err = self.run_code("1 + 2")
        self.assertEqual(val.value, 3)
        self.assertIsNone(err)

    def test_var_assign(self):
        val, err = self.run_code("let x = 10")
        self.assertEqual(val.value, 10)
        
        val, err = self.run_code("x")
        self.assertEqual(val.value, 10)

if __name__ == '__main__':
    unittest.main()
