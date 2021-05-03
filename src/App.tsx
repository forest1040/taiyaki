import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import './App.global.css';
import Board from './components/Board';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Board} />
        <Route path="/board" component={Board} />
        <Redirect to="/" />
      </Switch>
    </Router>
  );
};

export default App;
