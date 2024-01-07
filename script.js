// https://www.30secondsofcode.org/js/s/hash-sha-256/
async function sha256Hash(value) {
    return crypto.subtle.digest(
        'SHA-256', new TextEncoder('utf-8').encode(value)
    ).then((h) => {
        let hexes = [],
            view = new DataView(h);
        for (let i = 0; i < view.byteLength; i += 4)
            hexes.push(('00000000' + view.getUint32(i).toString(16)).slice(-8));
        return hexes.join('');
    });
}

const selected = []
for (let i = 0; i < 100000; i++) {
    selected.push('0')
}

const response = await fetch('./minified-anime-database.json')
const animes = await response.json()

animes.forEach((value, index) => {
    const listItem = document.createElement('span')
    listItem.setAttribute('class', 'list-item')
    listItem.innerText = value.title
    listItem.setAttribute('id', `item-${value.id}`)
    listItem.addEventListener('click', (event) => {
        event.target.classList.add('selected')
        selected[index] = '1'
    })
    list.appendChild(listItem)
})

const searchBar = document.getElementById('search-bar')
searchBar.addEventListener('input', (event) => {
    animes.map(
        (value) => value.title.toLowerCase().includes(event.target.value)
    ).forEach((value, index) => {
        if (value) {
            document.getElementById(`item-${animes[index].id}`).style.display = 'block'
        } else {
            document.getElementById(`item-${animes[index].id}`).style.display = 'none'
        }
    })
})

const shareButton = document.getElementById('share-button')
shareButton.addEventListener('click', async (event) => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(`https://animefolio.io/?hash=${await sha256Hash(selected.join(''))}`)
    }
})
