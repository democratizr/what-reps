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

type Representative = {
  name: string,
  title: string,
  email: string,
  phone: string
}

const transform_fed = (data): Representative => {
  return {
    name: `${data.first_name} ${data.last_name} (${data.party})`,
    title: `Federal ${data.chamber} ${data.district || ''}`,
    email: `${data.oc_email}`,
    phone: `Phone: ${data.phone}`
  }
}

const transform_state = (data): Representative => {
  return {
    name: `${data.full_name} (${data.party[0]})`,
    title: `State ${data.district}`,
    email: `${data.email}`,
    phone: `Phone: ${data.office_phone || 'Unavailable'}`
  }
}

const get_representatives = (address: string) => {
  const url = `http://localhost:8000/search/${address}`
  return fetch(url)
    .then((response) => { return response.json()})
    .then((data) => {
      let feds = data.federal.map(transform_fed);
      let states = data.state.map(transform_state);
      return [feds, states]
    });
}

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {feds: [], states: []}
  }

  onSubmit = (value) => {
    let request = get_representatives(value)
    request.then(([feds, states]) => {
      this.setState({feds: feds, states: states})
    })
  }

  render() {
    return (
      <div>
        <SearchForm onSubmit={this.onSubmit} />
        <SearchResults feds={this.state.feds}
                       states={this.state.states} />
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
    const {feds, states} = this.props
    return (
      <div>
        <SearchSection name='Federal' data={feds} />
        <SearchSection name='State' data={states} />
      </div>
    )
  }
}

class SearchSection extends Component {
  render() {
    const {name, data} = this.props
    if (data.length > 0) {
      return (
          <section>
            <h3>{name}</h3>
            <ResultList data={data}/>
          </section>
        )
    } else { return null; }
  }
}

class ResultList extends Component {
  render() {
    return (
      <ul className="result-list">
      {this.props.data.map((result, index) =>
        <SearchResult key={index} result={result} />
      )}
      </ul>
    )
  }
}

class EmailLink extends Component {
  render() {
    let email = this.props.email;
    if (email !== "undefined") {
      let href = `mailto:${email}`
      return (
        <a href={href}>Email</a>
      )
    }
    return (
      <div>No email listed</div>
    )
  }
}

class SearchResult extends Component {
  render() {
    let {name, title, phone, email} = this.props.result;
    let mailto = <EmailLink email={email} />;
    return (
      <li className="search-result">
        <ResultField value={name} />
        <ResultField value={title} />
        <ResultField value={phone} />
        <ResultField value={mailto} />
      </li>
    )
  }
}

class ResultField extends Component {
  render() {
    let value = this.props.value;
    return (
      <div className="result-field">{value}</div>
    )
  }
}

export default App;
