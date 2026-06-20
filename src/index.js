import http from 'http';
import fs from 'fs/promises';

const server = http.createServer(async (req, res) => {
    if (req.url === '/styles/site.css') {
        const cssContent = await fs.readFile('./src/styles/site.css', 'utf8');
        res.writeHead(200, {'content-type' : 'text/css'});
        res.write(cssContent);
        return res.end()
    }

    if (req.url === '/js/script.js') {
        const jsContent = await fs.readFile('./src/js/script.js', 'utf8');
        res.writeHead(200, {'content-type' : 'text/javascript'});
        res.write(jsContent);
        return res.end()
    }
   
   
    let htmlContent = '';
    res.writeHead(200, { 'Content-Type': 'text/html' });


    switch (req.url) {
        case '/':
            htmlContent = await fs.readFile('./src/views/home/index.html', 'utf8');
            break;
        case '/cats/add-breed':
            htmlContent = await fs.readFile('./src/views/addBreed.html', 'utf8');
            break;
        case '/cats/add-cat':
            htmlContent = await fs.readFile('./src/views/addCat.html', 'utf8');
            break;
        default:
            htmlContent = await fs.readFile('./src/views/notFound.html', 'utf8');
            break;
    }

    res.write(htmlContent);
    res.end();
});

server.listen(5000, () => console.log('Server is listening on http://localhost:5000...'));

