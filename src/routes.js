import { Router } from 'express';
import fs from 'fs';
import concat from 'concat-stream';
import byline from 'byline';
import CountiesDataStream from './streams/counties-data-stream';
import CountiesSearchStream from './streams/counties-search-stream';

const processQueries = (req, res, next) => {
  let options = {};
  const query = req.query;
  if (query.page && query.perPage) {
    options.pagination = { page: parseInt(query.page), perPage: parseInt(query.perPage) };
  }
  if (query.state || query.county) {
    options.filter = { state: query.state, county: query.county };
  }
  req.options = options;
  next();
};

const routes = Router();

/**
 * GET home page
 */
routes.get('/', (req, res) => {
  res.render('index', { title: 'Health data visualizer' });
});

routes.get('/counties', processQueries, (req, res) => {
  const stream = byline(fs.createReadStream(__dirname + '/../public/files/diabetes-incidence.csv'));
  stream.pipe(new CountiesSearchStream(req.options)).pipe(concat(data => {
    res.json(data);
  }));
});


routes.get('/diabetes-prevalence', processQueries, (req, res) => {
  const stream = byline(fs.createReadStream(__dirname + '/../public/files/diabetes-prevalence.csv'));
  stream.pipe(new CountiesDataStream(req.options)).pipe(concat(data => {
    data = { years: data[0].years, labels: data[1].labels, data: data.slice(2) };
    res.json(data);
  }));
});

routes.get('/diabetes-incidence', processQueries, (req, res) => {
  const stream = byline(fs.createReadStream(__dirname + '/../public/files/diabetes-incidence.csv'));
  stream.pipe(new CountiesDataStream(req.options)).pipe(concat(data => {
    data = { years: data[0].years, labels: data[1].labels, data: data.slice(2) };
    res.json(data);
  }));
});

routes.get('/obesity-prevalence', processQueries, (req, res) => {
  const stream = byline(fs.createReadStream(__dirname + '/../public/files/obesity-prevalence.csv'));
  stream.pipe(new CountiesDataStream(req.options)).pipe(concat(data => {
    data = { years: data[0].years, labels: data[1].labels, data: data.slice(2) };
    res.json(data);
  }));
});

routes.get('/physical-inactivity', processQueries, (req, res) => {
  const stream = byline(fs.createReadStream(__dirname + '/../public/files/obesity-prevalence.csv'));
  stream.pipe(new CountiesDataStream(req.options)).pipe(concat(data => {
    data = { years: data[0].years, labels: data[1].labels, data: data.slice(2) };
    res.json(data);
  }));
});


export default routes;
