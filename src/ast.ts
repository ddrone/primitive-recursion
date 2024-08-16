export interface ConstNode {
  type: 'const';
  value: number;
}

export interface AddNode {
  type: 'add';
  left: ExprNode;
  right: ExprNode;
}

export type ExprNode = ConstNode | AddNode;

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
