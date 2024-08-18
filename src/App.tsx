import { ChangeEvent, useState } from 'react';
import './App.css'
import { run } from './compiler'
import { parse } from './gen/parser';

function App() {
  const [isError, setIsError] = useState(false);
  const [result, setResult] = useState('');

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
