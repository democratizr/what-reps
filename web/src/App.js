/* @flow */
import React, { Component } from 'react';
import './App.css';


class App extends Component {
  render() {
    return (
      <div className="App">
        <div>
          <h1>Democratizr</h1>
          <h2>Find Your Representatives</h2>
        </div>
        <Search />
      </div>
    );
  }
}

type Representative = {name: string}

const fed_to_rep = (fed) => {
  return {name: fed.first_name + ' ' + fed.last_name}
}

const state_to_rep = (state) => {
  return {name: state.full_name}
}

const get_representatives = (address: string) => {
  const url = `http://localhost:8000/search/${address}`
  return fetch(url)
    .then((response) => { return response.json()})
    .then((data) => {
      let feds = data.federal.map(fed_to_rep);
      let state = data.state.map(state_to_rep);
      return feds.concat(state);
    });
}

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {results: []}
  }

  onSubmit = (value) => {
    let request = get_representatives(value)
    request.then((results: Representative[]) => {
      this.setState({results: results})
    })
  }

  render() {
    return (
      <div>
        <SearchForm onSubmit={this.onSubmit} />
        <SearchResults results={this.state.results} />
      </div>
    )
  }
}

class SearchForm extends Component {

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.onSubmit(e.target.firstChild.value);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text"
               placeholder="Your Address" />
      </form>
    )
  }
}

class SearchResults extends Component {

  render() {
    const results : Representative[] = this.props.results
    return (
      <ul>
      {results.map((result, index) =>
        <SearchResult key={index} result={result} />
      )}
       </ul>
    )
  }
}

class SearchResult extends Component {
  render() {
    return (
      <li> {this.props.result.name} </li>
    )
  }
}

export default App;
