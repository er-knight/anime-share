import json
import sqlite3

with open('./anime-offline-database.json', 'rb') as f:
    data = json.load(f)['data']

with sqlite3.connect('./backend/anime.db') as connection:
    
    cursor = connection.cursor()

    cursor.execute(
        '''
        DROP TABLE IF EXISTS animes
        '''
    )

    cursor.execute(
        '''
        CREATE TABLE IF NOT EXISTS animes (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            episodes INTEGER NOT NULL,
            status TEXT NOT NULL,
            season TEXT,
            image_url TEXT NOT NULL,
            ranking INTEGER NOT NULL,
            rating REAL NOT NULL
        )
        '''
    )
    
    for anime in data:
        anime_id = None
        for source in anime['sources']:
            if 'myanimelist' in source:
                anime_id = int(source.split('/')[-1])
        if anime_id:
            anime_season = None
            if anime['animeSeason']['season'].lower() != 'undefined' and anime['animeSeason']['year'] != None:
                anime_season = f"{anime['animeSeason']['season'].title()} {anime['animeSeason']['year']}"
            elif anime['animeSeason']['season'].lower() == 'undefined' and anime['animeSeason']['year'] != None:
                anime_season = f"{anime['animeSeason']['year']}"
                
            cursor.execute(
                '''
                INSERT INTO animes (id, title, type, episodes, status, season, image_url, ranking, rating)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    anime_id, 
                    anime['title'], 
                    anime['type'] if anime['type'] in ('TV', 'OVA', 'ONA') else anime['type'].title(), 
                    anime['episodes'], 
                    anime['status'].title(),
                    anime_season, 
                    anime['picture'], 
                    0, 
                    0.0
                )
            )
