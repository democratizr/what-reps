import requests
from chalice import Chalice, BadRequestError


app = Chalice(app_name='what-reps')
app.debug = True


openstates_t = 'http://openstates.org/api/v1/legislators/geo/?lat={lat}&long={long}'
sunlight_t = 'https://congress.api.sunlightfoundation.com/legislators/locate?latitude={lat}&longitude={long}'
geocoding_t = 'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address={address}&benchmark=9&format=json'


def get_coordinates(address):
    url = geocoding_t.format(address=address)
    x, y = requests.get(url).json().get('result').get('addressMatches')[0].get('coordinates').values()
    return x, y


def search(address):
    """
    Return all the legislators you got, based on address.
    """
    lat, lng = get_coordinates(address)  # 4s
    url = openstates_t.format(lat=lat, long=lng)
    state_reps = requests.get(url).json()  # 1s
    url = sunlight_t.format(lat=lat, long=lng)
    federal_reps = requests.get(url).json().get('results')  # 1s
    return {'state': state_reps, 'federal': federal_reps}


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


# The view function above will return {"hello": "world"}
# whenever you make an HTTP GET request to '/'.
#
# Here are a few more examples:
#
# @app.route('/hello/{name}')
# def hello_name(name):
#    # '/hello/james' -> {"hello": "james"}
#    return {'hello': name}
#
# @app.route('/users', methods=['POST'])
# def create_user():
#     # This is the JSON body the user sent in their POST request.
#     user_as_json = app.json_body
#     # Suppose we had some 'db' object that we used to
#     # read/write from our database.
#     # user_id = db.create_user(user_as_json)
#     return {'user_id': user_id}
#
# See the README documentation for more examples.
#


