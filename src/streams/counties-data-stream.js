const stream = require('stream');

class CountiesDataStream extends stream.Transform {

  constructor(options = {}) {
    super({
      readableObjectMode : true,
      writableObjectMode: true,
    });
    this.options = options;
    this.headers = null;
    this.years = null;
    this.index = 0;
  }

  getDataByYear(state, county, values) {
    const labelsCount = {};
    const object = { county, state };
    
    // Iterate over all the values
    for (let i = 3; i < values.length; i++) {
      // Determine the year index based on the label count
      labelsCount[this.headers[i]] = labelsCount[this.headers[i]] !== undefined ? labelsCount[this.headers[i]] + 1 : 0;
      const yearIndex = labelsCount[this.headers[i]];
      // Init the year object if necessary
      if (!object[this.years[yearIndex]]) {
        object[this.years[yearIndex]] = [];           
      }
      // Add the data to the corresponding year
      object[this.years[yearIndex]].push(values[i]);
    }
    return object;
  }

  optionsExists() {
    return this.options.filter || this.options.pagination;      
  }

  matchQuery(state, county) {
    return this.options.filter 
            && (this.options.filter.county === county || this.options.filter.state === state);
  }

  inPaginationRange() {    
    const pagination = this.options.pagination;
    return pagination 
            && pagination.page * pagination.perPage < this.index
            && (pagination.page + 1) * pagination.perPage > this.index;
  }

  _transform(chunk, encoding, done) {
    this.index += 1;
    const values = chunk.toString('utf8').split(',').filter(e => e !== '');
    let object = {};
    if (!this.years) {
      this.years = values.filter(v => parseInt(v));
      object = { years: this.years };
    } else if (!this.headers) {
      // Delete repeated ones
      const labels = values.filter((elem, pos) => values.indexOf(elem) == pos); 
      object = { labels };
      this.headers = values;
    } else {
      const state = values[0];      
      const county = values[2];
      // If there is a query, skip the ones that dont match
      if (!this.optionsExists() || this.matchQuery(state, county) || this.inPaginationRange()) {
        object = this.getDataByYear(state, county, values);
      }
    } 
    if (Object.keys(object).length > 0) {
      this.push(object);      
    }    
    done();
  }
}

export default CountiesDataStream;