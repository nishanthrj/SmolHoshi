import requests
import csv
import time
import json


def fetch_genres() -> None:
    """
    Fetches all the genres and stores it in a JSON file.
    """
    current_page = "https://kitsu.io/api/edge/categories?page[limit]=20"
    genres = {}

    with open('genres.json', 'w') as file:
        while True:
            time.sleep(1)
            res = requests.get(current_page).json()
            data = res['data']
            print(f'Fetching: {current_page}')

            for g in data:
                genres[g['id']] = g['attributes']['title']

            if not res['links'].get('next'):
                break

            current_page = res['links']['next']

        json.dump(genres, file, indent=5)


def get_genres(media_genres: list) -> str:
    """
    Returns the genre names of the media.

    Args:
        media_genres (list): Genre id's of the media.

    Returns:
        str: Genre names of the media.
    """
    genre_str = ""

    for mg in media_genres:
        genre_str += genres[mg['id']] + ' '

    return genre_str


def fetch_media_data(media_type: str) -> None:
    """
    Fetches all the media data and writes it to a csv file.
    
     Args:
        media_type (str): Type of media (Anime or Manga).
    """
    current_page = f"https://kitsu.io/api/edge/{media_type}?page[limit]=20&include=categories,mappings"

    with open(f'.\\dataset\\{media_type}.csv', 'w', encoding='utf8', newline='') as file:
        field_names = ['id', 'malId', 'title', 'slug', 'poster', 'score', 'type', 'status', 'genre', 'synopsis']
        writer = csv.DictWriter(file, delimiter='|', fieldnames=field_names)
        writer.writeheader()

        while True:
            time.sleep(1)
            res = requests.get(current_page).json()
            data = res['data']
            print(f'Fetching: {current_page}')

            for media in data:
                media_data = {
                    'id': media['id'],
                    'malId': None,
                    'title': media['attributes'].get('canonicalTitle'),
                    'slug': media['attributes'].get('slug'),
                    'poster': media['attributes'].get('posterImage').get('large') if media['attributes'].get('posterImage') else None,
                    'score': media['attributes'].get('averageRating'),
                    'synopsis': media['attributes'].get('synopsis'),
                    'type': media['attributes'].get('subtype'),
                    'status': media['attributes'].get('status'),
                    'genre': get_genres(media['relationships']['categories'].get('data'))}

                if media_data['synopsis']:
                    media_data['synopsis'] = media_data['synopsis'].replace('\n', ' ')

                # Finding MAL ID of the media.
                for i in media['relationships']['mappings']['data']:
                    for x in res['included']:
                        if x['id'] == i['id'] and x['attributes'].get('externalId') and "myanimelist" in x['attributes'].get('externalSite'):
                            media_data['malId'] = x['attributes'].get('externalId')

                writer.writerow(media_data)

            if not res['links'].get('next'): return

            current_page = res['links']['next']


def fetch_MAL_data(media_type: str) -> None:
    """
    Fetches MAL data for all the media and writes it to a csv file.
    
     Args:
        media_type (str): Type of media (Anime or Manga).
    """
    page = 1

    with open(f'.\\dataset\\{media_type}_stats.csv', 'w', encoding='utf8', newline='') as file:
        field_names = ['malId','malScore', 'popularity', 'favorites']
        writer = csv.DictWriter(file, delimiter='|', fieldnames=field_names)
        writer.writeheader()

        while True:
            time.sleep(1)
            current_page = f"https://api.jikan.moe/v4/{media_type}?page={page}"
            res = requests.get(current_page).json()
            data = res['data']
            print(f'Fetching: {current_page}')

            for media in data:
                media_data = {
                    'malId': media['mal_id'],
                    'malScore': media['score'], 
                    'popularity': media['members'], 
                    'favorites': media['favorites']
                    }
                
                writer.writerow(media_data)

            if not res['pagination'].get('has_next_page'): return

            page += 1



if __name__ == '__main__':
    with open('genres.json', 'r') as file:
        genres = json.load(file)

    # fetch_genres()
    fetch_media_data("anime")
    fetch_media_data("manga")
    fetch_MAL_data("anime")
    fetch_MAL_data("manga")
