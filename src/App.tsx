import { ChangeEvent, useState } from 'react';
import './App.css'
import { add, constExpr, ExprNode, iter, varExpr } from './ast'
import { run } from './compiler'
import { parse } from './gen/parser';

function App() {
  const program = add(constExpr(20), constExpr(22));

  const [isError, setIsError] = useState(false);
  const [result, setResult] = useState('');

  const multLoop = iter(constExpr(7), constExpr(0), {
    name: 'n',
    body: add(varExpr('n'), constExpr(6))
  });

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;

    try {
      const tree = parse(value);
      const result = run(tree);
      setResult(`${result}`);
      console.log(result);
      setIsError(false);
    }
    catch (e) {
      setResult((e as Error).message);
      setIsError(true);
    }
  }

  return (
    <>
      <textarea onChange={handleChange}></textarea>
      <ul>
        <li>program = {run(program)}</li>
        <li>multLoop = {run(multLoop)}</li>
        <li>
          <span style={{color: isError ? 'red' : 'black'}}>
            {result}
          </span>
        </li>
      </ul>
    </>
  )
}

export default App
