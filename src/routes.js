import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import concat from 'concat-stream';
import byline from 'byline';
import CountiesDataStream from './streams/counties-data-stream';
import CountiesSearchStream from './streams/counties-search-stream';

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
  res.render('index', { title: 'Health data visualizer' });
});

routes.get('/counties', processQueries, (req, res) => {
  const stream = byline(fs.createReadStream(path.join(__dirname, '../public/files/diabetes-incidence.csv')));
  stream.pipe(new CountiesSearchStream(req.options)).pipe(concat(data => res.json(data)));
});


routes.get('/diabetes-prevalence', processQueries, (req, res) => {
  const stream = byline(fs.createReadStream(path.join(__dirname, '..../public/files/diabetes-prevalence.csv')));
  stream.pipe(new CountiesDataStream(req.options)).pipe(concat((data) => {
    const responseData = { years: data[0].years, labels: data[1].labels, data: data.slice(2) };
    res.json(responseData);
  }));
});

routes.get('/diabetes-incidence', processQueries, (req, res) => {
  const stream = byline(fs.createReadStream(path.join(__dirname, '../public/files/diabetes-incidence.csv')));
  stream.pipe(new CountiesDataStream(req.options)).pipe(concat((data) => {
    const responseData = { years: data[0].years, labels: data[1].labels, data: data.slice(2) };
    res.json(responseData);
  }));
});

routes.get('/obesity-prevalence', processQueries, (req, res) => {
  const stream = byline(fs.createReadStream(path.join(__dirname, '../public/files/obesity-prevalence.csv')));
  stream.pipe(new CountiesDataStream(req.options)).pipe(concat((data) => {
    const responseData = { years: data[0].years, labels: data[1].labels, data: data.slice(2) };
    res.json(responseData);
  }));
});

routes.get('/physical-inactivity', processQueries, (req, res) => {
  const stream = byline(fs.createReadStream(path.join(__dirname, '../public/files/obesity-prevalence.csv')));
  stream.pipe(new CountiesDataStream(req.options)).pipe(concat((data) => {
    const responseData = { years: data[0].years, labels: data[1].labels, data: data.slice(2) };
    res.json(responseData);
  }));
});


export default routes;
