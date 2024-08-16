import binaryen from "binaryen";
import { ExprNode } from "./ast";

class VarMap {
  map: Map<string, number> = new Map();
  next = 0;

  ensure(v: string): number {
    let result = this.map.get(v);
    if (result === undefined) {
      result = this.next++;
      this.map.set(v, result);
    }

    return result;
  }

  contains(v: string): boolean {
    return this.map.has(v);
  }

  get(v: string): number {
    const result = this.map.get(v);
    if (result === undefined) {
      throw new Error(`Internal error: unbound variable ${v}`);
    }

    return result;
  }
}

class FreshGen {
  prefix: string;
  next = 0;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  get(): string {
    return `${this.prefix}${this.next++}`;
  }
}

function compile(root: ExprNode): Uint8Array {
  const vars = new VarMap();
  function pretraverse(expr: ExprNode) {
    switch (expr.type) {
      case 'const':
        break;

      case 'var':
        if (!vars.contains(expr.name)) {
          throw new Error(`Unbound variable ${expr.name}!`);
        }
        break;

      case 'add':
        pretraverse(expr.left);
        pretraverse(expr.right);
        break;

      case 'iter':
        pretraverse(expr.count);
        pretraverse(expr.zero);
        // This approach does not handle the bound variables nicely at all
        // TODO: fix it
        vars.ensure(expr.iterVar);
        pretraverse(expr.iterBody);
    }
  }

  pretraverse(root);

  const m = new binaryen.Module();
  const stats = {
    loops: 0
  }

  function loopIndex(loop: number): number {
    return vars.next + 2 * loop;
  }

  function loopBound(loop: number): number {
    return vars.next + 2 * loop + 1;
  }

  const labels = new FreshGen('l');

  function go(loop: number, expr: ExprNode): binaryen.ExpressionRef {
    switch (expr.type) {
      case 'const':
        return m.i32.const(expr.value);

      case 'add':
        return m.i32.add(
          go(loop, expr.left),
          go(loop, expr.right)
        );

      case 'var':
        return m.local.get(
          vars.get(expr.name),
          binaryen.i32
        );

      case 'iter': {
        stats.loops = Math.max(stats.loops, loop + 1);
        const loopLabel = labels.get();
        const blockLabel = labels.get();
        return m.block(null, [
          // Compute the amount of loop iterations needs to be done
          m.local.set(loopBound(loop), go(loop, expr.count)),

          // Initialize current loop index to 0
          m.local.set(loopIndex(loop), m.i32.const(0)),

          // Compute the first iteration of the loop, the case for zero
          m.local.set(vars.get(expr.iterVar), go(loop + 1, expr.zero)),

          m.loop(loopLabel, m.block(blockLabel, [
            m.br_if(blockLabel, m.i32.ge_u(
              m.local.get(loopIndex(loop), binaryen.i32),
              m.local.get(loopBound(loop), binaryen.i32))),

            m.local.set(vars.get(expr.iterVar), go(loop + 1, expr.iterBody)),
            m.local.set(loopIndex(loop), m.i32.add(m.local.get(loopIndex(loop), binaryen.i32), m.i32.const(1))),
            m.br(loopLabel),
          ])),

          m.local.get(vars.get(expr.iterVar), binaryen.i32)
        ]);
      }
    }
  }

  const body = go(0, root);

  const locals = [];
  const localsCount = vars.next + stats.loops * 2;
  for (let i = 0; i < localsCount; i++) {
    locals.push(binaryen.i32)
  }

  m.addFunction('main', binaryen.createType([]), binaryen.i32, locals, body);
  m.addFunctionExport('main', 'main');

  return m.emitBinary();
}

export function run(root: ExprNode): number {
  const code = compile(root);
  const wasm = new WebAssembly.Module(code);
  const instance = new WebAssembly.Instance(wasm, {});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (instance.exports.main as any)();
}
