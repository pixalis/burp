var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    jade = require('gulp-jade'),
    stylus = require('gulp-stylus'),
    nib = require('nib'),
    jeet = require('jeet'),
    rupture = require('rupture'),
    imagemin = require('gulp-imagemin'),
    browserSync = require('browser-sync'),
    plumber = require('gulp-plumber'),
    pleeease = require('gulp-pleeease'),
    sourcemaps = require('gulp-sourcemaps'),
    csscomb = require('gulp-csscomb'),
    concat = require('gulp-concat'),
    path = {},
    dev;

var jsPlugins = [
    'src/js/plugins/jquery.hoverIntent.js'
];

function setPaths () {
    path = {
        src: './src/',
        build: './build/',
        dist: './dist/'
    };

    path.dest = (dev) ? path.build : path.dist;

    path.js = {
        watch: path.src + 'js/*.js',
        src: path.src + 'js/*.js',
        dest: path.dest + 'js/'
    };

    path.jsPlugins = {
        watch: path.src + 'js/plugins/*.js',
        src: path.src + 'js//plugins/*.js',
        dest: path.dest + 'js/plugins/'
    };

    path.css = {
        watch: path.src + 'css/**/*.styl',
        src: path.src + 'css/style.styl',
        dest: path.dest + 'css/'
    };

    path.html = {
        watch: path.src + 'html/**/*.jade',
        src: path.src + 'html/*.jade',
        dest: path.dest
    };

    path.img = {
        watch: path.src + 'img/**/*',
        src: path.src + 'img/**/*',
        dest: path.dest + 'img/'
    };
}

gulp.task('html', function () {
    gulp.src(path.html.src)
        .pipe(plumber())
        .pipe(jade({
            pretty: dev
        }))
        .pipe(gulp.dest(path.html.dest));
});

gulp.task('css', function() {
    return gulp.src(path.css.src)
        .pipe(plumber())
        .pipe(stylus({
            use: [nib(), jeet(), rupture()],
            errors: true,
            sourcemap: {
                inline: true,
                sourceRoot: '.',
                basePath: path.css.dest
            }
        }))
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(pleeease({
            minifier: false,
            sourcemaps: true
        }))
        //.pipe(csscomb())
        .pipe(sourcemaps.write('./', {
            includeContent: false,
            sourceRoot: '.'
        }))
        .pipe(gulp.dest(path.css.dest));
});

gulp.task('js', function () {
    if (dev) {
        gulp.src(path.js.src)
            .pipe(plumber())
            .pipe(jshint())
            .pipe(jshint.reporter('default'))
            .pipe(gulp.dest(path.js.dest));
    } else {
        gulp.src(path.js.src)
            .pipe(uglify())
            .pipe(gulp.dest(path.js.dest));
    }
});

gulp.task('jsPlugins', function () {
    if (dev) {
        gulp.src(jsPlugins)
            .pipe(plumber())
            .pipe(concat('pixali-plugins.js'))
            .pipe(gulp.dest(path.jsPlugins.dest));
    } else {
        gulp.src(jsPlugins)
            .pipe(concat('pixali-plugins.js'))
            .pipe(uglify())
            .pipe(gulp.dest(path.jsPlugins.dest));
    }
});

gulp.task('img', function () {
	gulp.src(path.img.src)
		.pipe(imagemin())
		.pipe(gulp.dest(path.img.dest));
});

gulp.task('copy', function () {
	var files = [
		path.src + '*',
		path.src + 'img/**',
		path.src + 'font/**',
		path.src + 'dependencies/**',
		'!' + path.src + 'html',
		'!' + path.src + 'css',
		'!' + path.src + 'js'
	];

	gulp.src(files, {base: path.src})
		.pipe(gulp.dest(path.dest));
});

gulp.task('browser-sync', function () {
    browserSync.init([
        path.html.dest + '*.html',
        path.css.dest + '*.css',
        path.js.dest + '*.js',
        path.img.dest + '**/*'
    ], {
        server: {
            baseDir: path.dest
        },
        notify: false
    });
});

gulp.task('watch', function () {
    gulp.watch([path.html.watch], ['html']);
    gulp.watch([path.css.watch], ['css']);
    gulp.watch([path.js.watch], ['js']);
    gulp.watch([path.img.watch], ['img']);
    gulp.watch([path.jsPlugins.watch], ['jsPlugins']);
});

gulp.task('setBuild', function () {
    dev = true;
    setPaths();
});
gulp.task('setDist', function () {
    dev = false;
    setPaths();
});
gulp.task('run', ['html', 'css', 'js', 'jsPlugins', 'img', 'copy']);
gulp.task('build', ['setBuild', 'run']);
gulp.task('dist', ['setDist', 'run']);
gulp.task('default', ['build', 'browser-sync', 'watch']);
