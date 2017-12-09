import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import concat from 'concat-stream';
import byline from 'byline';
import CountiesDataStream from './streams/counties-data-stream';
import CountiesSearchStream from './streams/counties-search-stream';

const DATA_FILES_DIRECTORY = path.join(__dirname, '../public/files/');

const processQueries = (req, res, next) => {
  const options = {};
  const { state, county, page, perPage } = req.query;
  if (page && perPage) {
    options.pagination = { page: parseInt(page, 10), perPage: parseInt(perPage, 10) };
  }
  if (state || county) {
    options.filter = { state, county };
  }
  req.options = options;
  next();
};

const routes = Router();

/**
 * GET home page
 */
routes.get('/', (req, res) => {
  res.render('public/index');
});

const availableFiles = fs.readdirSync(DATA_FILES_DIRECTORY);

// Return counties that match the query
routes.get('/counties', processQueries, (req, res) => {
  if (!availableFiles || availableFiles.length === 0) {
    res.status(404).json({ message: 'No data available' });
  } else {
    const filePath = path.resolve(__dirname, DATA_FILES_DIRECTORY, availableFiles[0]);
    const stream = byline(fs.createReadStream(filePath));
    stream.pipe(new CountiesSearchStream(req.options)).pipe(concat(data => res.json(data)));
  }
});

routes.get('/available-data', (req, res) => {
  const availableData = availableFiles.map((file, index) => {
    const route = file.split('.')[0];
    const name = file.split('.')[0].replace('-', ' ');
    return ({
      key: index,
      path: route,
      name: `${name.charAt(0).toUpperCase()}${name.slice(1)}`, // Capitalize string
    });
  });
  res.json(availableData);
});

// Generate routes dynamically according to the available files.
availableFiles.forEach((file) => {
  const [route] = file.split('.');
  // Return counties data that match the query
  routes.get(`/${route}`, processQueries, (req, res) => {
    const stream = byline(fs.createReadStream(path.resolve(__dirname, DATA_FILES_DIRECTORY, file)));
    stream.pipe(new CountiesDataStream(req.options)).pipe(concat((data) => {
      const responseData = { years: data[0].years, labels: data[1].labels, data: data.slice(2) };
      res.json(responseData);
    }));
  });
});

export default routes;
