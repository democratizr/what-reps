import requests
from urllib import unquote_plus

from chalice import Chalice, BadRequestError


app = Chalice(app_name='what-reps')
app.debug = True


openstates_t = 'http://openstates.org/api/v1/legislators/geo/?lat={lat}&long={long}'
sunlight_t = 'https://congress.api.sunlightfoundation.com/legislators/locate?latitude={lat}&longitude={long}'
geocoding = 'https://maps.googleapis.com/maps/api/geocode/json'


def get_coordinates(address):
    params = {'sensor': 'false', 'address': address}
    r = requests.get(geocoding, params=params)
    results = r.json().get('results')
    location = results[0]['geometry']['location']
    return location['lat'], location['lng']


def feds(lat, lng):
    url = sunlight_t.format(lat=lat, long=lng)
    federal_reps = requests.get(url).json().get('results')
    return federal_reps


def state_reps(lat, lng):
    url = openstates_t.format(lat=lat, long=lng)
    state_reps = requests.get(url).json()
    return state_reps


def search(address):
    """
    Return all the legislators you got, based on address.
    """
    address = unquote_plus(address)
    lat, lng = get_coordinates(address)

    # These could be done in parallel...somehow?
    s_reps = state_reps(lat, lng)
    federal_reps = feds(lat, lng)
    return {
        'location': (lat, lng),
        'state': s_reps,
        'federal': federal_reps
    }


@app.route('/')
def index():
    return {
        'endpoints': {
            '/': 'This page.',
            '/state-reps/?lat={lat}&?lng={lng}': 'Just the state representatives',
            '/fed-reps/?lat={lat}&?lng={lng}': 'Just the federal representatives',
            '/location/{address}'
            '/search/{address}': "Find all Federal and State representatives for this address."
        }
    }


@app.route('/search/{address}', cors=True)
def searchview(address):
    try:
        return search(address)
    except:
        raise BadRequestError('Cannot find address: ' + address)


@app.route('/location/{address}', cors=True)
def locationview(address):
    try:
        lat, lng = get_coordinates(address)
        return {'lat': lat, 'lng': lng}
    except:
        raise BadRequestError('Cannot find address: ' + address)

@app.route('/fed-reps/', cors=True)
def fedview():
    params = app.current_request.query_params
    lat = params.get('lat')
    lng = params.get('lng')
    return feds(lat, lng)


@app.route('/state-reps/', cors=True)
def fedview():
    params = app.current_request.query_params
    lat = params.get('lat')
    lng = params.get('lng')
    return state_reps(lat, lng)
