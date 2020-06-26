import logo from './logo.svg';
import './App.css';
import React, { Component } from 'react';
import { MoviesData, renderMovieTitle } from './stopss.js';
import Autocomplete from 'react-autocomplete';

class App extends Component {

  state = { val: '' };
  

  render() {
    return (
      <div className="autocomplete-wrapper">
        <h3>Search for a bus stop number</h3>
        <Autocomplete
          value={this.state.val}
          items={MoviesData()}
          getItemValue={item => item.id}
          shouldItemRender={renderMovieTitle}
          renderMenu={item => (
            <div className="dropdown">
              {item}
            </div>
          )}
          renderItem={(item, isHighlighted) =>
            <div className={`item ${isHighlighted ? 'selected-item' : ''}`}>
              {item.id}
            </div>
          }
          onChange={(event, val) => this.setState({ val })}
          onSelect={val => this.setState({ val })}
        />
      </div>
      
    );
  }
}

export default App;
