const stream = require('stream');

/*
 * CountiesDataStream is a transform stream that process and stream each line of a given file
 * that meet the format specified at the README.md file. Specifically, extracts yearly data,
 * data available (labels), and county specific data.
 */
class CountiesDataStream extends stream.Transform {
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

  getDataByYear(state, county, fips, values) {
    const object = { county, state, fips };
    for (let i = 0; i < this.years.length; i += 1) {
      // First 3 values are county identification data, after that are county indicators
      // Slice specific year values and asign them to the corresponding year
      object[this.years[i]] =
        values.slice((i * this.headers.length) + 3, ((i + 1) * this.headers.length) + 3);
    }
    return object;
  }

  optionsExists() {
    return this.options.filter || this.options.pagination;
  }

  matchQuery(state, county) {
    if (!this.options.filter) return false;
    if (this.options.filter.county && this.options.filter.state) {
      // Query county and state
      return (this.options.filter.county === county && this.options.filter.state === state);
    } else if (this.options.filter.county) {
      // Query only county
      return this.options.filter.county === county;
    } else if (this.options.filter.state) {
      // Query only state
      return this.options.filter.state === state;
    }
    return false;
  }

  inPaginationRange() {
    const { pagination } = this.options;
    return pagination
            && pagination.page * pagination.perPage < this.index
            && (pagination.page + 1) * pagination.perPage > this.index;
  }

  _transform(chunk, encoding, done) {
    const values = chunk.toString('utf8').split(',').filter(e => e !== '');
    let object = {};
    if (!this.years) {
      this.years = values.filter(v => parseInt(v, 10));
      object = { years: this.years };
    } else if (!this.headers) {
      // Delete repeated ones
      const labels = values.filter((elem, pos) => values.indexOf(elem) === pos).slice(3);
      object = { labels };
      this.headers = labels;
    } else {
      const state = values[0];
      const fips = values[1];
      const county = values[2];
      // If there is a query, skip the ones that dont match
      if (!this.optionsExists() || this.matchQuery(state, county) || this.inPaginationRange()) {
        object = this.getDataByYear(state, county, fips, values);
      }
    }
    if (Object.keys(object).length > 0) {
      this.push(object);
    }
    this.index += 1;
    done();
  }
}

export default CountiesDataStream;
