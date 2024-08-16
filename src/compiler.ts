import binaryen from "binaryen";
import { ExprNode } from "./ast";

function compile(root: ExprNode): Uint8Array {
  const m = new binaryen.Module();

  function go(expr: ExprNode): binaryen.ExpressionRef {
    switch (expr.type) {
      case 'const':
        return m.i32.const(expr.value);

      case 'add':
        return m.i32.add(
          go(expr.left),
          go(expr.right)
        );
    }
  }

  m.addFunction('main', binaryen.createType([]), binaryen.i32, [], go(root));
  m.addFunctionExport('main', 'main');

  return m.emitBinary();
}

export function run(root: ExprNode): number {
  const code = compile(root);
  const wasm = new WebAssembly.Module(code);
  const instance = new WebAssembly.Instance(wasm, {});
  return instance.exports.main();
}
