/*jshint node: true */
'use strict';


module.exports = function (make) {


	var path = require('path'),
		pkg = require('./package.json'),

		$ = make.fQuery,

		root = path.resolve(__dirname),
		src = path.join(root, 'src'),
		build = path.join(root, 'build');


	make.version('>=0.10.0');
	make.defaults('release');


	make.before(function () {

		var moment = make.moment();

		make.env = {
			pkg: pkg,
			stamp: moment.format('YYYY-MM-DD HH:mm:ss')
		};

		$.info({ method: 'before', message: pkg.version + ' ' + make.env.stamp });
	});


	make.target('check-version', [], 'add git info to dev builds').async(function (done, fail) {

		if (!/\+$/.test(pkg.version)) {
			done();
			return;
		}

		$.git(root, function (err, result) {

			pkg.version += result.buildSuffix;
			$.info({ method: 'check-version', message: 'version set to ' + pkg.version });
			done();
		});
	});


	make.target('clean', [], 'delete build folder').sync(function () {

		$.DELETE(build);
	});


	make.target('lint', [], 'lint all JavaScript files with JSHint').sync(function () {

		var options = {
				// Enforcing Options
				bitwise: true,
				curly: true,
				eqeqeq: true,
				forin: true,
				latedef: true,
				newcap: true,
				noempty: true,
				plusplus: true,
				trailing: true,
				undef: true,

				// Environments
				browser: true
			},
			global = {
				'jQuery': true
			};

		$(src + ': *.js').log(-3)
			.jshint(options, global);
	});


	make.target('build', ['check-version'], 'build all updated files').sync(function () {

		$(src + ': *.js')
			.handlebars(make.env)
			.WRITE($.map.p(src, build).s('.js', '-' + pkg.version + '.js'))
			.uglifyjs()
			.WRITE($.map.p(src, build).s('.js', '-' + pkg.version + '.min.js'));

		$(src + ': demo/*.less, test/*.less')
			.less()
			.handlebars(make.env)
			.WRITE($.map.p(src, build).s('.less', '.css'));

		$(src + ': **, ! *.js, ! **/*.less')
			.handlebars(make.env)
			.WRITE($.map.p(src, build));

		$(root + ': README*, LICENSE*')
			.handlebars(make.env)
			.WRITE($.map.p(root, build));
	});


	make.target('release', ['clean', 'build'], 'create a zipball').async(function (done, fail) {

		$(build + ': **').shzip({
			target: path.join(build, pkg.name + '-' + pkg.version + '.zip'),
			dir: build,
			callback: done
		});
	});
};
