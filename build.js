
/*
|--------------------------------------------------------------------------
| Build Script
|--------------------------------------------------------------------------
|
| Metalsmith plugins and configs needed to generate the site.
|
*/

'use strict';

const Metalsmith  = require('metalsmith');
const condition   = require('metalsmith-if');
const branch      = require('metalsmith-branch');
const collections = require('metalsmith-collections');
const define      = require('metalsmith-define');
const drafts      = require('metalsmith-drafts');
const markdown    = require('metalsmith-markdown');
const pagetitles  = require('metalsmith-page-titles');
const date        = require('metalsmith-build-date');
const layouts     = require('metalsmith-layouts');
const inPlace     = require('metalsmith-in-place');
const postcss     = require('metalsmith-postcss');
const webpack     = require('metalsmith-webpack');
const webpackCore = require('webpack');
const fingerprint = require('metalsmith-fingerprint');
const rename      = require('metalsmith-rename');
const htmlMin     = require('metalsmith-html-minifier');
const gzip        = require('metalsmith-gzip');
const url         = require('./plugins/url');
const sources     = require('./plugins/sources');
const Handlebars  = require('handlebars');
const bs          = require('browser-sync').create();
const fs          = require('fs');
const argv        = require('yargs').argv;

// Config

let config = {
    env:        argv.watch ? 'dev' : 'prod',
    watch:      argv.watch,
    sourcemaps: argv.sourcemaps ? true : argv.watch,
};

// PostCSS Plugins

let postcssPlugins = [
    require('postcss-import')({
        path: 'src/assets/css'
    }),
    require('postcss-nested'),
    require('postcss-mixins'),
    require('postcss-simple-vars'),
    require('postcss-assets')({
        basePath: 'src/',
        loadPaths: ['assets/'],
        cachebuster: true
    }),
    require('postcss-short'),
    require('rucksack-css'),
    require('postcss-cssnext'),
    require('postcss-font-magician'),
    require('lost'),
    require('cssnano')({
        autoprefixer: false,
    }),
];

// Webpack Plugins

let webpackPlugins = [new webpackCore.optimize.UglifyJsPlugin()];

// Handlebars Helpers

Handlebars.registerHelper('eq', function (a, b) {
	let next = arguments[arguments.length - 1];
	return (a === b) ? next.fn(this) : next.inverse(this);
});

Handlebars.registerHelper('ne', function (a, b) {
    let next = arguments[arguments.length - 1];
    return (a !== b) ? next.fn(this) : next.inverse(this);
});

// Metalsmith Pipeline

let build = callback => {

    Metalsmith(__dirname)

        // Metadata
        .metadata(JSON.parse(fs.readFileSync('metadata.json', 'utf8')))

        // PostCSS
        .use(postcss(
            postcssPlugins,
            {
                map: config.sourcemaps,
            }
        ))

        // webpack
        .use(webpack({
            entry: [
                'babel-polyfill',
                './src/assets/js/site.js',
            ],
            output: {
                path: '/assets/js',
                filename: 'site.js',
            },
            resolve: {
                root: [__dirname+'/node_modules'],
            },
            module: {
                loaders: [
                    {
                        // Babel
                        loader: 'babel',
                        test: /\.jsx?$/,
                        include: [
                            __dirname+'/src/assets/js',
                        ],
                        exclude: [
                            __dirname+'/node_modules',
                        ],
                        query: {
                            plugins: ['transform-runtime'],
                            presets: ['es2015'],
                        },
                    }
                ]
            },
            plugins: webpackPlugins,
            devtool: config.sourcemaps ? '#inline-source-map' : null,
        }))

        // Sources
        .use(sources({
            pattern: [
                'assets/css/site.css',
                'assets/js/site.js',
            ]
        }))

        // Revision (cachebuster)
        .use(fingerprint({
            pattern: [
                'assets/js/site.js',
                'assets/svg/**/*',
                'assets/images/**/*',
                'assets/videos/**/*',
            ]
        }))

        // Page Titles
        .use(pagetitles({
            separator: ' | ',
        }))

        // Build Date
        .use(date())

        // Collections
        .use(collections({
            articles: {
                pattern: 'blog/**/*.md',
                sortBy: 'date',
                reverse: true,
            }
        }))

        // Add URL metadata to files
        .use(url([
            [/\.md$/, ""],
        ]))

        // Handlebars
        .use(branch('**/*.hbs')
            .use(layouts({
                engine:    'handlebars',
                partials:  'partials',
                directory: 'layouts',
                default:   'layout.hbs',
            }))
            .use(inPlace({
                engine:   'handlebars',
                partials: 'partials',
            }))
        )

        // Articles
        .use(branch('blog/**/*.md')
            .use(drafts())
            .use(markdown())
            .use(layouts({
                engine:    'handlebars',
                partials:  'partials',
                directory: 'layouts',
                default:   'layout.hbs',
            }))
            .use(inPlace({
                engine:   'handlebars',
                partials: 'partials',
            }))
        )

        .use(rename([
            [/\.hbs$/, '.html'],
        ]))

        // Minify HTML
        .use(condition(config.env == 'prod', htmlMin()))

        // Gzip Compression
        .use(condition(config.env == 'prod', gzip()))

        // Build
        .build(error => {
            if (error) throw error;
            if (callback) callback(error);
        });
};

if (!config.watch) build();

// Browsersync
if (config.watch) {

    let rebuild = () => {
        if (!bs.paused) {
            bs.pause();
            build(() => {
                bs.resume();
                bs.reload();
            });
        }
    };

    build(() => {

        bs.watch([
            'src/**/*.md',
            'src/**/*.hbs',
            'src/assets/css/**/*.css',
            'src/assets/js/**/*.js',
            'layouts/**/*.hbs',
            'partials/**/*.hbs',
        ], {
            ignoreInitial: true,
        }).on('all', rebuild);

        bs.init({
            server: {
                baseDir: 'build',
                // Pretty URLs
                middleware: (req, res, next) => {
                    if (req.url.length > 1 && req.url.indexOf('.') === -1) {
                        req.url += '.html';
                    }
                    next();
                },
            },
            https: true,
            notify: false,
        });

    });

}
