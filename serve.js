Bun.serve({
  port: 3000,
  routes: {
    '/index.html': new Response(await Bun.file('./index.html').bytes(), {
      headers: {
        'Content-Type': 'text/html'
      }
    }),
    '/src/index.js': new Response(await Bun.file('./src/index.js').bytes(), {
      headers: {
        'Content-Type': 'application/javascript'
      }
    }),
    '/favicon.ico': new Response(await Bun.file('./favicon.ico').bytes(), {
      headers: {
        'Content-Type': 'image/x-icon'
      }
    })
  }
});

console.log('Bun.serve started! Point your browser to http://localhost:3000.');
