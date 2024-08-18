Expression
  = head:Term tail:(Plus Term)* {
      return tail.reduce(function(result, element) {
        return {type: 'add', left: result, right: element[1]};
      }, head);
    }

Term
  = Loop count:Factor LCurly Zero To zero:Expression Step iterVar:Var To iterBody:Expression RCurly {
      return {
        type: 'iter',
        count,
        zero,
        iterVar,
        iterBody
      }
    }
  / head:Factor { return head; }

Factor
  = LB expr:Expression RB { return expr; }
  / c:Integer { return { type: 'const', value: c }; }
  / n:Var { return { type: 'var', name: n }; }

Integer "integer"
  = _ [0-9]+ { return parseInt(text(), 10); }

_ "whitespace"
  = [ \t\n\r]*

Var "variable"
  = _ v:[a-zA-Z]+ { return v.join(''); }

LB "left bracket"
  = _ "("

RB "right bracket"
  = _ ")"

Plus "plus"
  = _ "+"

Loop "loop"
  = _ "loop"

Zero "zero"
  = _ "zero"

Step "step"
  = _ "step"

LCurly "left curly brace"
  = _ "{"

RCurly "right curly brace"
  = _ "}"

To "arrow"
  = _ "=>"
