import requests
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


def search(address):
    """
    Return all the legislators you got, based on address.
    """
    lat, lng = get_coordinates(address)

    # These could be done in parallel...somehow?
    url = openstates_t.format(lat=lat, long=lng)
    state_reps = requests.get(url).json()
    url = sunlight_t.format(lat=lat, long=lng)
    federal_reps = requests.get(url).json().get('results')
    return {
        'location': (lat, lng),
        'state': state_reps,
        'federal': federal_reps
    }


@app.route('/')
def index():
    return {
        'endpoints': {
            '/': 'This page.',
            '/search/{address}': "Find all Federal and State representatives for this address."
        }
    }


@app.route('/search/{address}')
def searchview(address):
    try:
        return search(address)
    except:
        raise BadRequestError('Cannot find address: ' + address)
