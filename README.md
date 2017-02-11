## What this is

A simple app that retrieves all of the US representatives (State and Federal) for a given address, so that they can be easily contacted by their constituents.

[Currently hosted here](https://r7vgn9v3cc.execute-api.us-west-1.amazonaws.com/dev/), please be nice.

## Why

There are a limited number of existing services that do this, but they often lack local or federal officials.

Those that do tend not to have a UX focused on communicating with those representatives, and to not have similar future goals.

(incidentally, if we are mistaken in this please drop us a line this is hardly the time to be duplicating work)

## Next

- [ ] A nice clean UX focused on communication with representatives
- [ ] Include data on other offices where possible
    - [ ] City council members
    - [ ] Elected judges
    - [ ] Elected sheriff/law enforcement officials
    - [ ] City mayors
- [ ] Offices/locations for each representative


## Contributing

Happily accepting pull requests for any of the above features, and happy to look at feature requests in issues.

## Deployment

Currently using [chalice](https://github.com/awslabs/chalice) to push up the basic API as an AWS Lambda microservice. Frontend is likely going to be a dumb script for a static site hosted on S3.