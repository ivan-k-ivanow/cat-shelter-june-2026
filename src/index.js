import http from 'http';
import fs from 'fs/promises';
import { addCat, readCats, getCatById, editCat } from './catService.js';
import { addBreed, readBreeds, getBreedByName } from './breedService.js';



const server = http.createServer(async (req, res) => {

    if (req.method === 'POST' && req.url === '/cats/add-cat') {
        const bodyformData = await readBodyFormData(req);

        const newCat = {
            name: bodyformData.get('name'),
            description: bodyformData.get('description'),
            imageUrl: bodyformData.get('imageUrl'),
            breed: bodyformData.get('breed')
        }

        addCat(newCat);

        return res.writeHead(302, { 'Location': '/' }).end();
    };

    if (req.method === 'POST' && req.url === '/cats/add-breed') {
        const bodyformData = await readBodyFormData(req);

        const breedName = bodyformData.get('breed');
        addBreed(breedName);

        res.writeHead(302, { 'Location': '/' });
        return res.end();
    };

    if (req.method === 'POST' && req.url.startsWith('/cats/edit-cat/')) {
        const catId = req.url.split('/').pop();
        const editedCat = await readBodyFormData(req);

        editCat(catId, {
            name: editedCat.get('name'),
            description: editedCat.get('description'),
            imageUrl: editedCat.get('imageUrl'),
            breed: editedCat.get('breed')
        });

        res.writeHead(302, { 'Location': '/' });
        return res.end();
    };

    // GET Requests
    if (req.url === '/styles/site.css') {
        const cssContent = await fs.readFile('./src/styles/site.css', 'utf8');
        res.writeHead(200, { 'content-type': 'text/css' });
        res.write(cssContent);
        return res.end()
    }

    if (req.url === '/js/script.js') {
        const jsContent = await fs.readFile('./src/js/script.js', 'utf8');
        res.writeHead(200, { 'content-type': 'text/javascript' });
        res.write(jsContent);
        return res.end()
    }


    let htmlContent = '';
    res.writeHead(200, { 'Content-Type': 'text/html' });

    if (req.url === '/') {
        htmlContent = await renderHomePage();
    } else if (req.url === '/cats/add-breed') {
        htmlContent = await fs.readFile('./src/views/addBreed.html', 'utf8');
    } else if (req.url === '/cats/add-cat') {
        htmlContent = await renderAddCatPage();
    } else if (req.url.startsWith('/cats/edit-cat/')) {
        const catId = req.url.split('/').pop();
        htmlContent = await renderEditCatPage(catId);
    } else if (req.url.startsWith('/cats/new-home/')) {
        const catId = req.url.split('/').pop();
        htmlContent = await renderNewHomePage(catId);
    } else {
        htmlContent = await renderNotFoundPage();
    }

    res.write(htmlContent);
    res.end();
});

async function renderHomePage() {
    let htmlContent = await fs.readFile('./src/views/home/index.html', 'utf8');

    const catTemplate = (cat) => `
                <li>
                    <img src="${cat.imageUrl}" alt="${cat.name}">
                    <h3>${cat.name}</h3>
                    <p><span>Breed: </span>${cat.breed}</p>
                    <p><span>Description: </span>${cat.description}</p>
                    <ul class="buttons">
                        <li class="btn edit"><a href="/cats/edit-cat/${cat.id}">Change Info</a></li>
                        <li class="btn delete"><a href="/cats/new-home/${cat.id}">New Home</a></li>
                    </ul>
                </li>`;

    const cats = readCats();
    const catsContent = `<ul>${cats.map(cat => catTemplate(cat)).join('\n')}</ul>`;

    let result = htmlContent.replace('{{cats}}', catsContent);

    return result;
}

async function renderNotFoundPage() {
    return fs.readFile('./src/views/notFound.html', 'utf8');
}

async function renderAddCatPage() {
    const htmlContent = await fs.readFile('./src/views/addCat.html', 'utf8');

    const result = htmlContent.replace('{{breedOptions}}', renderBreedOptions());
    return result;
}

async function renderEditCatPage(catId) {
    const cat = getCatById(catId);

    if (!cat) {
        return await renderNotFoundPage();
    }

    const htmlContent = await fs.readFile('./src/views/editCat.html', 'utf8');

    const result = htmlContent
        .replace('{{name}}', cat.name)
        .replace('{{description}}', cat.description)
        .replace('{{imageUrl}}', cat.imageUrl)
        .replace('{{breedOptions}}', renderBreedOptions(cat.breed));

    return result;
}

async function renderNewHomePage(catId) {
    const cat = getCatById(catId);
    const breed = getBreedByName(cat.breed);

    if (!cat) {
        return await renderNotFoundPage();
    }

    const htmlContent = await fs.readFile('./src/views/catShelter.html', 'utf8');

    const result = htmlContent
        .replaceAll('{{name}}', cat.name)
        .replace('{{description}}', cat.description)
        .replace('{{imageUrl}}', cat.imageUrl)
        .replace('{{breedId}}', breed.id)
        .replace('{{breedName}}', breed.name)

    return result;
}

function renderBreedOptions(selectedBreedId) {
    const breeds = readBreeds();

    return breeds.map(breed => `<option value="${breed.id}"${breed.name === selectedBreedId ? ' selected' : ''}>${breed.name}</option>`).join('\n');
}

function readBodyFormData(req) {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            const formData = new URLSearchParams(body);
            resolve(formData);
        });
    });
}


server.listen(5000, () => console.log('Server is listening on http://localhost:5000...'));