import React from 'react';
import Todos from './components/Todos';
import Users from './components/Users';

function App() {
  return (
    <div>
      <h1>GraphQL Client with React</h1>
      <Todos />
      <Users />
    </div>
  );
}

export default App;
