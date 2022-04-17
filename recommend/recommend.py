import pandas as pd
import pymongo
from decouple import config

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel


# Connecting to the database
client = pymongo.MongoClient(config("HOST"))
db = client['hoshi']


def save_recommendations(media_id: int, data: list[dict], media_type: str) -> None:
    """
    Saves the recommendations to the database.

    Args:
        media_id (int): ID of the current media.
        data (list[dict]): Recommended media
        media_type (str): Type of media (Anime or Manga)
    """
    if media_type == "anime":
        cluster = db['anime_recommendation']
    else:
        cluster = db['manga_recommendation']
        
    content = {
        'id': media_id,
        'data': data
    }
    cluster.insert_one(content)  
    

def find_recommendations(media_format: str, media_type: str) -> None:
    """
    Finds recommended shows for all the media.

    Args:
        media_format (str): Format of the media.
        media_type (str): Type of media (Anime or Manga).
    """
    
    # Importing and merging media and media stats dataset.
    if media_type == "anime":
        df1 = pd.read_csv('.\\recommend\\dataset\\anime.csv', delimiter='|')
        df2 = pd.read_csv('.\\recommend\\dataset\\anime_stats.csv', delimiter='|')
        df2['malId']=df2['malId'].astype(str)
        df = pd.merge(df1, df2, how="left", on='malId')
    else:
        df1 = pd.read_csv('.\\recommend\\dataset\\manga.csv', delimiter='|')
        df2 = pd.read_csv('.\\recommend\\dataset\\manga_stats.csv', delimiter='|')
        df = pd.merge(df1, df2, how="left", on='malId')


    df.drop_duplicates(subset='id', inplace=True)
    # Select only media of same format to reduce memory usage.
    df = df[df['type'] == media_format]
    # Generate new indices for the filtered dataframe.
    df['tempId'] = range(len(df))

    df['genre'] = df['genre'].fillna('')
    df['genre'].str.lower()

    # Compute Term Frequency-Inverse Document Frequency (TF-IDF) vectors
    # ngram_range is set to (1, 2) since there are genres with two consecutive words
    # min_df is set to 0 to avoid ignoring terms
    tfidf = TfidfVectorizer(analyzer='word',
                            ngram_range=(1, 2),
                            min_df=0,
                            stop_words='english',
                            lowercase=True)
    tfidf_matrix = tfidf.fit_transform(df['genre'])


    # Compute cosine similarity score to make recommendation.
    # Since we already have TF-IDF Vector
    # calculating the dot product will give the cosine similarity scores.
    cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

    # Construct a reverse map of tempId and original media id.
    indices = pd.Series(df['tempId'].to_list(), index=df['id'])
    
    for media_id in df['id']:
        idx = indices[media_id]
        # Get the pairwise similarity scores of all the media with current media.
        sim_score = list(enumerate(cosine_sim[idx]))
        # Sort based on similarity scores.
        sim_score = sorted(sim_score, key=lambda x: x[1], reverse=True)
        # Get the scores of top 100 media since we'll further filter it down.
        sim_score = sim_score[1:100]
        media_indices = [i[0] for i in sim_score]

        # Grab the recommended shows
        recdf = df[
            ['id', 'title', 'slug', 'poster', 'score', 'malScore', 'popularity', 'type']
        ].iloc[media_indices]


        if media_type == "anime":
            # Filter by MALscores and popularity of the media.
            recdf = recdf[(recdf['malScore'] >= 7.0) &
                        (recdf['popularity'] >= 30000) &
                        (recdf['id'] != media_id)]
            # Select the top 12 anime
            results = recdf.sort_values('popularity', ascending=False)[:12]
        else:
            # Filter only by scores since MAL data is quite unreliable in manga.
            recdf = recdf = recdf[(recdf['score'] >= 7.0)]
            # Select the top 12 manga
            results = recdf.sort_values('score', ascending=False)[:12]
        
        # Remove unnecessary columns from the results
        results = results[['id','title','slug','type','poster']]
        
        # Save the results to the database
        # Convert all the rows into dict to store them.
        save_recommendations(media_id, results.apply(lambda x: x.to_dict(), axis=1).tolist(), media_type) 
        
        print(f"{media_format} {media_id} added.")
        


def main() -> None:
    anime_formats = ['TV', 'movie', 'special', 'OVA', 'ONA']
    manga_formats = ['manga', 'novel', 'manhwa', 'manhua', 'doujin', 'oneshot', 'oel']
    
    for x in anime_formats:
        find_recommendations(x,'anime')
        
    for x in manga_formats:
        find_recommendations(x,'manga')

if __name__ == '__main__':
    main()
