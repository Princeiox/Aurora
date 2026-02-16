
class Environment {
    constructor(parent = null) {
        this.vars = {};
        this.parent = parent;
    }
    set(name, value) {
        if (this.parent && this.parent.get(name) !== undefined && this.vars[name] === undefined) {
            this.parent.set(name, value);
        } else {
            this.vars[name] = value;
        }
    }
    get(name) {
        if (this.vars[name] !== undefined) return this.vars[name];
        if (this.parent) return this.parent.get(name);
        return undefined;
    }
}

class Instance {
    constructor(cls) {
        this.cls = cls;
        this.fields = {};
    }
}

class Interpreter {
    constructor(outputCallback) {
        this.outputCallback = outputCallback || console.log;
        this.globalEnv = new Environment();
    }

    interpret(statements) {
        let result = null;
        for (let stmt of statements) {
            result = this.visit(stmt, this.globalEnv);
            if (result && result.shouldReturn) return result.value;
        }
        return result;
    }

    visit(node, env) {
        if (!node) return null;

        if (node.type === 'Say') {
            let val = this.visit(node.expr, env);
            this.outputCallback(this.stringify(val));
            return val;
        }
        else if (node.type === 'VarAssign') {
            let val = this.visit(node.value, env);
            env.set(node.name, val);
            return val;
        }
        else if (node.type === 'VarAccess') {
            let val = env.get(node.name);
            if (val === undefined) return null; // Error
            return val;
        }
        else if (node.type === 'Number' || node.type === 'String') {
            return node.value;
        }
        else if (node.type === 'List') {
            return node.elements.map(e => this.visit(e, env));
        }
        else if (node.type === 'BinOp') {
            let l = this.visit(node.left, env);
            let r = this.visit(node.right, env);
            if (node.op === 'PLUS') return l + r;
            if (node.op === 'MINUS') return l - r;
            if (node.op === 'MUL') return l * r;
            if (node.op === 'DIV') return l / r;
            if (node.op === 'GT') return l > r;
            if (node.op === 'LT') return l < r;
            if (node.op === 'EQ') return l === r;
        }
        else if (node.type === 'If') {
            if (this.visit(node.condition, env)) {
                return this.visitBlock(node.body, env);
            } else if (node.elseBody) {
                return this.visitBlock(node.elseBody, env);
            }
        }
        else if (node.type === 'Repeat') {
            let count = this.visit(node.count, env);
            for (let i = 0; i < count; i++) {
                let res = this.visitBlock(node.body, env);
                if (res && res.shouldReturn) return res;
            }
        }
        else if (node.type === 'While') {
            while (this.visit(node.condition, env)) {
                let res = this.visitBlock(node.body, env);
                if (res && res.shouldReturn) return res;
            }
        }
        else if (node.type === 'ClassDef') {
            let cls = { name: node.name, methods: {} };
            for (let m of node.methods) cls.methods[m.name] = m;
            env.set(node.name, cls);
        }
        else if (node.type === 'FuncDef') {
            env.set(node.name, { type: 'func', name: node.name, args: node.args, body: node.body, env: env });
        }
        else if (node.type === 'Return') {
            return { shouldReturn: true, value: this.visit(node.value, env) };
        }
        else if (node.type === 'Call') {
            let func = this.visit(node.func, env); // Could be a function name or a bound method
            let args = node.args.map(a => this.visit(a, env));

            if (!func) {
                // Check built-ins
                if (node.func.type === 'VarAccess') {
                    if (node.func.name === 'push') {
                        args[0].push(args[1]);
                        return null;
                    }
                    if (node.func.name === 'pop') {
                        return args[0].pop();
                    }
                    if (node.func.name === 'len') {
                        return args[0].length;
                    }
                }
                return null;
            }

            // Class Init
            if (func.methods) {
                let instance = new Instance(func);
                if (func.methods['init']) {
                    this.callFunc(func.methods['init'], [instance, ...args], env);
                }
                return instance;
            }

            // Bound Method
            if (func.boundTo) {
                return this.callFunc(func.method, [func.boundTo, ...args], env);
            }

            // Regular Function
            return this.callFunc(func, args, env);
        }
        else if (node.type === 'GetAttr') {
            let obj = this.visit(node.obj, env);
            if (obj instanceof Instance) {
                if (obj.fields[node.attr] !== undefined) return obj.fields[node.attr];
                if (obj.cls.methods[node.attr]) {
                    return { boundTo: obj, method: obj.cls.methods[node.attr] };
                }
            }
            return undefined;
        }
        else if (node.type === 'SetAttr') {
            let obj = this.visit(node.obj, env);
            let val = this.visit(node.value, env);
            if (obj instanceof Instance) {
                obj.fields[node.attr] = val;
                return val;
            }
            return null; // Error
        }
    }

    visitBlock(statements, parentEnv) {
        // Blocks don't create new scope in Python/Aurora unless function
        // But for simplicity in JS, let's keep scope shared or create lightweight scope?
        // Aurora: "if" shares scope. "function" has new scope.
        for (let stmt of statements) {
            let res = this.visit(stmt, parentEnv);
            if (res && res.shouldReturn) return res;
        }
        return null;
    }

    callFunc(funcDef, args, parentEnv) {
        let localEnv = new Environment(parentEnv); // Should be funcDef.env for closures but parentEnv mostly works for simple globals
        for (let i = 0; i < funcDef.args.length; i++) {
            localEnv.set(funcDef.args[i], args[i]);
        }
        // Handle methods 'self' is implicit in args[0] if passed manually

        let res = this.visitBlock(funcDef.body, localEnv);
        if (res && res.shouldReturn) return res.value;
        return null;
    }

    stringify(val) {
        if (Array.isArray(val)) return `[${val.map(v => this.stringify(v)).join(', ')}]`;
        if (val instanceof Instance) return `<${val.cls.name} Instance>`;
        return String(val);
    }
}
