import { BrowserRouter } from 'react-router-dom';
import Display from './display/Display';
import GlobalStyle from './styles/Globalstyle';

function App() {
  return (
   <BrowserRouter>
      <GlobalStyle/>
      <Display/>
    </BrowserRouter>
  );
}

export default App;
