// actions.js
// available SEO actions and metrics
const Config = require('./config.json');
const request = require('request');
const json2csv = require('json2csv');
const async = require('async');

var CURR_SHEET = [];
var fields = ['domain', 'DA', 'PA', 'emails'];
module.exports = function(Mozscape) {
	module.getDomain = function(domain, done) {
		if (Config.moz.useMoz) {
			var moz = new Mozscape(Config.moz.accessId, Config.moz.secretKey);
			moz.urlMetrics(domain, ['domain_authority', 'page_authority'], function(err, res) {
				/*
					Need more metrics? Grab more from https://github.com/chbrown/mozscape/blob/master/index.js, under variable URL_METRICS_FLAGS
				*/
			    if (err) {
			        console.log(err);
			        done(false);
			    }
			    console.log(res);
			    module.qualifyDomain(domain, {pa: res.upa, da: res.pda}, done);
			});
		} else {
			done(false);
		}
	}
	module.getContacts = function(domain, details, done) {
		request({method: 'GET', url: 'https://api.hunter.io/v2/domain-search?domain=' + domain + '&api_key=' + Config.hunter.apiKey, json: true}, function(e, r, b) {
			if (e) console.error(e);
			console.log(JSON.stringify(b))
			if (b.data) {
				if (b.data.emails.length > 0) {
					var emails = [];
					async.each(b.data.emails, function(email, nextEmail) {
						if (email.confidence >= Config.hunter.minConfidence) {
							if (email.first_name && email.last_name) {
								emails.push(email);
								nextEmail();
							} else {
								if (Config.hunter.allowNoNames) {
									emails.push(email);
									nextEmail();
								} else {
									nextEmail();
								}
							}
						} else {
							nextEmail();
						}
					}, function(err) {
						if (err) console.error(err);
						module.addToCRM(domain, details, emails, done);
					});
				} else {
					done(false);
				}
			} else {
				done(false);
			}
		});
	}
	module.qualifyDomain = function(domain, details, done) {
		if (!isNaN(parseFloat(details.da)) && !isNaN(parseFloat(details.da))) {
			if (parseFloat(details.da) >= Config.domains.minDA && parseFloat(details.da) <= Config.domains.maxDA && parseFloat(details.pa) >= Config.domains.minPA && parseFloat(details.pa) <= Config.domains.maxPA) {
				module.getContacts(domain, details, done);
			} else {
				done(false);
			}
		} else {
			done(false);
		}
	}
	module.addToCRM = function(domain, details, contacts, done) {
		console.log('Call to add to CRM')
		var obj = {domain: domain, DA: details.da, PA: details.pa};
		for (var i = 0; i < contacts.length; i++) {
			obj['email' + (parseInt(i)+1) + '_email'] = contacts[i]['value'];
			fields.push('email' + (parseInt(i)+1) + '_email');
			obj['email' + (parseInt(i)+1) + '_firstName'] = contacts[i]['first_name'];
			fields.push('email' + (parseInt(i)+1) + '_firstName')
			obj['email' + (parseInt(i)+1) + '_lastName'] = contacts[i]['last_name'];
			fields.push('email' + (parseInt(i)+1) + '_lastName')
			obj['email' + (parseInt(i)+1) + '_phoneNumber'] = contacts[i]['phone_number'];
			fields.push('email' + (parseInt(i)+1) + '_phoneNumber')
		}
		CURR_SHEET.push({domain: domain, DA: details.da, PA: details.pa, emails: contacts});
		done(true);
	}
	module.storeCSV = function() {
		json2csv({data: CURR_SHEET, fields: fields}, function(err, csv) {
			if (err) console.error(err);
			fs.writeFile(Config.outputPath, csv, function(err2) {
				if (err2) console.error(err2);
				console.log('[Output file saved: ' + Config.outputPath + ']');
			});
		});
	}
	return module;
}