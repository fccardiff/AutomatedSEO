// app.js
const fs = require('fs');
const async = require('async');
const parse = require('csv-parse');
const psl = require('psl');
const Mozscape = require('mozscape').Mozscape;
const request = require('request');
const { Parser } = require('json2csv');

const Config = require('./config.json');
const DomainActions = require('./actions.js')(Mozscape);

if ((Config.moz.useMoz) && Config.hunter.useHunter) {
	fs.readdir(Config.path, function(err, files) {
		if (err) console.error(err);
		var csvs = [];
		var uniqueDomains = [];
		var uniqueDomainsAndPages = {};
		for (var file in files) {
			var eachFile = files[file];
			var extension = eachFile.split('.').pop();
			if (extension == 'csv') {
				csvs.push(eachFile);
			}
		}
		async.eachSeries(csvs, function(csv, nextCSV) {
			fs.readFile(Config.path + csv, function(err3, data) {
				if (err3) console.error(err3);
				parse(data, {trim: true, skip_empty_lines: true, columns: true}, function(err4, csvLines) {
					if (err4) console.error(err4);
					async.each(csvLines, function(line, nextLine) {
						if (line[Config.column]) {
							var parsed = psl.parse(line[Config.column].replace('https://', '').replace('http://', '').split('/')[0]);
							var url = parsed.domain;
							if (parsed.subdomain) {
								url = parsed.subdomain + '.' + parsed.domain;
							}
							if (uniqueDomains.indexOf(url) < 0) {
								uniqueDomains.push(url);
								uniqueDomainsAndPages[url] = [line[Config.column]];
								nextLine();
							} else {
								uniqueDomainsAndPages[url].push(line[Config.column])
								nextLine();
							}
						} else {
							nextLine();
						}
					}, function(err5) {
						if (err5) console.error(err5);
						nextCSV();
					});
				});
			});
		}, function(err2) {
			if (err2) console.error(err2);
			console.log('[Found ' + uniqueDomains.length + ' unique URLs. Beginning filtration...]');
			var qualifiedDomains = [];
			var qualifiedDomainsWithInfo = {};
			async.eachSeries(uniqueDomains, function(eachDomain, nextDomain) {
				DomainActions.getDomain(eachDomain, function(details) {
					nextDomain();
				});
			}, function(err6) {
				if (err6) console.error(err6);
				DomainActions.storeCSV();
				console.log('[All done. Check outputs for details.]');
			});
		});
	});
} else {
	console.error('The Moz API needs to be enabled, as well as Hunter.io API to run this script.');
}