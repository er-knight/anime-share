import json

minified_database = []

with open('./anime-offline-database.json', 'rb') as f:
    anime_database = json.load(f)

for anime in anime_database['data']:
    anime_id, url = None, None
    for source in anime['sources']:
        if 'myanimelist' in source:
            url = source
            anime_id = int(source.split('/')[-1])
            max_id = max(max_id, anime_id)
    if anime_id:
        minified_database.append({
            'id': anime_id,
            'title': anime['title'],
            'picture': f"{anime['picture'].removesuffix('.jpg')}l.jpg",
            'season': f"{anime['animeSeason']['season'].title()} {anime['animeSeason']['year']}" if (
                anime['animeSeason']['season'] != 'UNDEFINED'
            ) else f"{anime['animeSeason']['year']}",
            'episodes': anime['episodes'],
            'source': url
        })

with open('./minified-anime-database.json', 'w') as f:
    json.dump(minified_database, f, indent=4)
