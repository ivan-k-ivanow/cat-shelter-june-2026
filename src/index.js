import http from 'http';


const server = http.createServer((req, res) => {
    res.write('hello, world!\n');

    res.end();
});

server.listen(5000, () => console.log('Server is listening on http://localhost:5000...'));

