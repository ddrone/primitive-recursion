export interface ConstNode {
  type: 'const';
  value: number;
}

export interface AddNode {
  type: 'add';
  left: ExprNode;
  right: ExprNode;
}

export interface VarNode {
  type: 'var';
  name: string;
}

export interface IterNode {
  type: 'iter';
  count: ExprNode;
  zero: ExprNode;
  iterVar: string;
  iterBody: ExprNode;
}

export type ExprNode = ConstNode | AddNode | VarNode | IterNode;

export function constExpr(n: number): ConstNode {
  return {
    type: 'const',
    value: n
  }
}

export function add(l: ExprNode, r: ExprNode): AddNode {
  return {
    type: 'add',
    left: l,
    right: r
  }
}

export function varExpr(n: string): VarNode {
  return {
    type: 'var',
    name: n
  }
}

export function iter(count: ExprNode, zero: ExprNode, iter: {name: string, body: ExprNode}): IterNode {
  return {
    type: 'iter',
    count,
    zero,
    iterVar: iter.name,
    iterBody: iter.body
  }
}
