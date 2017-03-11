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

type Location = {
  lat: number,
  lng: number
}

const get_location = (address : string) => {
  // Get the location by address, if not given an address
  // attempt to use the geolocation API
  if (address) {
    const url = `http://localhost:8000/location/${address}`;
    return fetch(url).then((response) => { return response.json()});
  } else {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((position) => {
        let {latitude, longitude} = position.coords
        resolve({'lat': latitude, 'lng': longitude})
      })
    })
  }
}

const get_representatives = (location: Location) => {
  let {lat, lng} = location
  const api_host = "http://localhost:8000/"
  const qs = `?lat=${lat}&lng=${lng}`
  const fed_url = `${api_host}fed-reps/${qs}`
  const state_url = `${api_host}state-reps/${qs}`
  let fed_promise = fetch(fed_url)
    .then((response) => { return response.json()})
  let state_promise = fetch(state_url)
    .then((response) => { return response.json()})
  return Promise.all([fed_promise, state_promise])
    .then((values) => {
      let feds = values[0].map(transform_fed);
      let states = values[1].map(transform_state);
      return [feds, states]
    })
}

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {feds: [], states: []}
  }

  onSubmit = (value) => {
    get_location(value)
      .then((location) => {
        return get_representatives(location);
      })
      .then(([feds, states]) => {
        this.setState({feds: feds, states: states})
    });
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
    let address = e.target.firstChild.firstChild.value;
    this.props.onSubmit(address);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <fieldset>
          <input type="text"
            placeholder="Your Address" />
          <div>OR</div>
          <input type="submit" value="Use my location"/>
          <div>We don't store either thing.</div>
        </fieldset>
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
