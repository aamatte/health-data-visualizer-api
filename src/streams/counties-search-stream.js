const stream = require('stream');

/*
 * CountiesSearchStream is a transform stream that process and stream each line of a given file
 * that meet the format specified at the README.md file. Specifically, extracts the county with
 * it's corresponding state and fips.
 */
class CountiesSearchStream extends stream.Transform {
  constructor(options = {}) {
    super({
      readableObjectMode: true,
      writableObjectMode: true,
    });
    // Options can have two objects: filter and pagination.
    this.options = options;
    // Headers is the labels/specific data available.
    this.headers = null;
    // Yearly available data
    this.years = null;
    // Counties data starts at index 2
    this.index = -2;
  }

  optionsExists() {
    return this.options.filter || this.options.pagination;
  }

  matchQuery(state, county) {
    if (!this.options.filter) return false;
    const countyQuery = this.options.filter.county ?
      this.options.filter.county.toLowerCase() :
      undefined;
    const stateQuery = this.options.filter.state ?
      this.options.filter.state.toLowerCase() :
      undefined;
    return (countyQuery && county.toLowerCase().includes(countyQuery))
            || (stateQuery && state.toLowerCase().includes(stateQuery));
  }

  inPaginationRange() {
    const { pagination } = this.options;
    return pagination
            && pagination.page * pagination.perPage <= this.index
            && this.index < (pagination.page + 1) * pagination.perPage;
  }

  _transform(chunk, encoding, done) {
    const values = chunk.toString('utf8').split(',').filter(e => e !== '');
    let object = {};
    if (!this.years) {
      this.years = values.filter(v => parseInt(v, 10));
    } else if (!this.headers) {
      this.headers = values;
    } else {
      const state = values[0];
      const fips = values[1];
      const county = values[2];
      // If there is a query, skip the ones that dont match
      if (!this.optionsExists() || this.matchQuery(state, county) || this.inPaginationRange()) {
        object = { state, county, fips };
      }
    }
    if (Object.keys(object).length > 0) {
      this.push(object);
    }
    this.index += 1;
    done();
  }
}

export default CountiesSearchStream;
