const livereload = require('livereload');
const path = require('path');

const server = livereload.createServer({
  delay: 200,
  exts: ['html', 'css', 'js', 'json', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ts', 'tsx', 'scss']
});

server.watch([path.resolve(__dirname, '../public/client')]);

console.log('[livereload] Watching public/client on port 35729');
