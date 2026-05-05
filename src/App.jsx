import { BrowserRouter } from 'react-router-dom';
import EnrutadorPrincipal from './core/router/EnrutadorPrincipal';

function App() {
  return (
    <BrowserRouter>
      <EnrutadorPrincipal />
    </BrowserRouter>
  );
}

export default App;
