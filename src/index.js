import http from 'http';
import fs from 'fs/promises';
import cats from './cats.js';
import { addBreed, readBreeds } from './breedService.js';

const server = http.createServer(async (req, res) => {
    console.log(readBreeds());

    if (req.method === 'POST' && req.url === '/cats/add-breed') {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', async () => {
            const formData = new URLSearchParams(body);
            const breedName = formData.get('breed');
            addBreed(breedName);
        });

        //Redirect to home page after adding the breed
        res.writeHead(302, { 'Location': '/' });
        return res.end();
    }

    // GET Requests
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
            htmlContent = await renderHomePage();
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

async function renderHomePage() {
    let htmlContent = await fs.readFile('./src/views/home/index.html', 'utf8');

    const catTemplate = (cat) => `
                <li>
                    <img src="${cat.imageUrl}" alt="${cat.name}">
                    <h3>${cat.name}</h3>
                    <p><span>Breed: </span>${cat.breed}</p>
                    <p><span>Description: </span>${cat.description}</p>
                    <ul class="buttons">
                        <li class="btn edit"><a href="">Change Info</a></li>
                        <li class="btn delete"><a href="">New Home</a></li>
                    </ul>
                </li>`;

    const catsContent = `<ul>${cats.map(cat => catTemplate(cat)).join('\n')}</ul>`;

    let result = htmlContent.replace('{{cats}}', catsContent);

    return result;
}