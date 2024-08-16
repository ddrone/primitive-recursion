import './App.css'
import { add, constExpr } from './ast'
import { run } from './compiler'

function App() {
  const program = add(constExpr(20), constExpr(22));

  return (
    <>
      {run(program)}
    </>
  )
}

export default App
