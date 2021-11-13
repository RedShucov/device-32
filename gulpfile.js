import pkg          from 'gulp'
import sync         from 'browser-sync'
import gulpSass     from "gulp-sass"
import nodeSass     from "node-sass"
import groupMedia   from 'gulp-group-css-media-queries'
import autoprefixer from 'gulp-autoprefixer'
import rename       from 'gulp-rename'
import imagemin     from 'gulp-imagemin'
import del          from 'del'

const { src, dest, watch, series, parallel } = pkg
const scss = gulpSass(nodeSass)


// HTML
export const html = () => {
  return src('src/*.html')
    .pipe(dest('project/'))
    .pipe(sync.stream())
}


// Styles
export const styles = () => {
  return src('src/scss/style.scss')
    .pipe(scss())
    .pipe(
      groupMedia()
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 5 versions'],
        grid: true,
        cascade: true
      })
    )
    .pipe(dest('project/css'))
    .pipe(
      rename({
        extname: ".min.css"
      })
    )
    .pipe(
      scss({
        outputStyle: 'compressed'
      })
        .on('error', scss.logError)
    )
    .pipe(dest('project/css'))
    .pipe(sync.stream())
}

// JS
export const js = () => {
  return src('src/js/*js')
    .pipe(dest('project/js'))
    .pipe(sync.stream())
}

// Fonts
export const fonts = () => {
  return src('src/fonts/**.woff2')
    .pipe(dest('project/fonts'))
}


// Images
export const images = () => {
  return src('src/*.ico')
    .pipe(dest('project/')),
    src('src/img/**/*')
      .pipe(imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false
            }
          ]
        })
      ], {
        verbose: true
      }
      ))
      .pipe(dest('project/img'))
      .pipe(sync.stream())
}


// Watching
export const watching = () => {
  watch('src/scss/**/*.scss', styles).on('change', sync.reload);
  watch('src/*.html', html).on('change', sync.reload);
  watch('src/js/*js', js).on('change', sync.reload);
}


// Browser-sync
export const server = () => {
  sync.init({
    server: {
      baseDir: "project/"
    },
    port: 3000,
    notify: false,
    browser: "firefox"
  })
}


// ClearDist
export const clearDist = () => {
  return del('project')
}

// Default

export default series(
  clearDist,
  parallel(
    html,
    styles,
    js
  ),
  images,
  fonts,
  parallel(
    watching,
    server
  )
);
