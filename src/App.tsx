import './App.css'
import { add, constExpr, iter, varExpr } from './ast'
import { run } from './compiler'

function App() {
  const program = add(constExpr(20), constExpr(22));

  const multLoop = iter(constExpr(7), constExpr(0), {
    name: 'n',
    body: add(varExpr('n'), constExpr(6))
  });

  return (
    <>
      <ul>
        <li>program = {run(program)}</li>
        <li>multLoop = {run(multLoop)}</li>
      </ul>
    </>
  )
}

export default App
