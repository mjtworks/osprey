(function() {
  var DefaultParameters, ErrorHandler, Osprey, OspreyBase, OspreyRouter, Validation, express, fs, path, url, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  express = require('express');

  path = require('path');

  Validation = require('./middlewares/validation');

  DefaultParameters = require('./middlewares/default-parameters');

  ErrorHandler = require('./middlewares/error-handler');

  OspreyRouter = require('./middlewares/router');

  OspreyBase = require('./osprey-base');

  fs = require('fs');

  url = require('url');

  Osprey = (function(_super) {
    __extends(Osprey, _super);

    function Osprey() {
      this.registerConsole = __bind(this.registerConsole, this);
      this.register = __bind(this.register, this);
      _ref = Osprey.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Osprey.prototype.register = function(uriTemplateReader, resources) {
      var middlewares;
      middlewares = [];
      middlewares.push(DefaultParameters);
      if (this.settings.enableValidations) {
        middlewares.push(Validation);
      }
      middlewares.push(OspreyRouter);
      middlewares.push(ErrorHandler);
      return this.registerMiddlewares(middlewares, this.apiPath, this.context, this.settings, resources, uriTemplateReader, this.logger);
    };

    Osprey.prototype.registerConsole = function() {
      var host, port;
      if (this.settings.enableConsole) {
        port = this.context.settings.port || 3000;
        host = "http://localhost:" + port + "/";
        this.settings.consolePath = this.apiPath + this.settings.consolePath;
        this.context.get(this.settings.consolePath, this.consoleHandler(this.apiPath, this.settings.consolePath, host));
        this.context.get(url.resolve(this.settings.consolePath, 'index.html'), this.consoleHandler(this.apiPath, this.settings.consolePath, port));
        this.context.use(this.settings.consolePath, express["static"](path.join(__dirname, 'assets/console')));
        this.context.get(this.apiPath, this.ramlHandler(this.apiPath, this.settings.ramlFile, host));
        this.context.use(this.apiPath, express["static"](path.dirname(this.settings.ramlFile)));
        return this.logger.info("Osprey::APIConsole has been initialized successfully listening at " + this.settings.consolePath);
      }
    };

    Osprey.prototype.consoleHandler = function(apiPath, consolePath, host) {
      return function(req, res) {
        var filePath;
        filePath = path.join(__dirname, '/assets/console/index.html');
        return fs.readFile(filePath, function(err, data) {
          data = data.toString().replace(/apiPath/gi, url.resolve(host, apiPath));
          data = data.toString().replace(/resourcesPath/gi, url.resolve(host, consolePath));
          res.set('Content-Type', 'text/html');
          return res.send(data);
        });
      };
    };

    Osprey.prototype.ramlHandler = function(apiPath, ramlPath, host) {
      return function(req, res) {
        if (req.accepts('application/raml+yaml') != null) {
          return fs.readFile(ramlPath, function(err, data) {
            data = data.toString().replace(/^baseUri:.*$/gmi, "baseUri: " + (url.resolve(host, apiPath)));
            return res.send(data);
          });
        } else {
          return res.send(406);
        }
      };
    };

    Osprey.prototype.describe = function(descriptor) {
      descriptor(this);
      return this;
    };

    return Osprey;

  })(OspreyBase);

  module.exports = Osprey;

}).call(this);
