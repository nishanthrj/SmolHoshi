import numpy as np
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel


def recommend(media_id, media_format, media_type):
    if media_type == "anime":
        df1 = pd.read_csv('.\\base\\static\\csv\\anime.csv', delimiter='|')
        df2 = pd.read_csv('.\\base\\static\\csv\\anime_stats.csv', delimiter='|')
        df2['malId']=df2['malId'].astype(str)
        df = pd.merge(df1, df2, how="left", on='malId')
    else:
        df1 = pd.read_csv('.\\base\\static\\csv\\manga.csv', delimiter='|')
        df2 = pd.read_csv('.\\base\\static\\csv\\manga_stats.csv', delimiter='|')
        df = pd.merge(df1, df2, how="left", on='malId')

    df = df[df['type'] == media_format]
    df['tempId'] = range(len(df))

    df['genre'] = df['genre'].fillna('')
    df['genre'].str.lower()

    tfidf = TfidfVectorizer(analyzer='word',
                            ngram_range=(1, 2),
                            min_df=0,
                            stop_words='english',
                            lowercase=True)
    tfidf_matrix = tfidf.fit_transform(df['genre'])

    cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

    indices = pd.Series(df['tempId'].to_list(), index=df['id'])

    idx = indices[media_id]
    sim_score = list(enumerate(cosine_sim[idx]))
    sim_score = sorted(sim_score, key=lambda x: x[1], reverse=True)
    sim_score = sim_score[1:100]
    anime_indices = [i[0] for i in sim_score]

    recdf = df[
        ['id', 'title', 'slug', 'poster', 'score', 'malScore', 'popularity', 'type']
    ].iloc[anime_indices]


    if media_type == "anime":
        recdf = recdf[(recdf['malScore'] >= 7.0) &
                    (recdf['popularity'] >= 30000) &
                    (recdf['id'] != media_id)]
        results = recdf.sort_values('popularity', ascending=False)[:12]
    else:
        recdf = recdf = recdf[(recdf['score'] >= 7.0)]
        results = recdf.sort_values('score', ascending=False)[:12]
    return results.apply(lambda x: x.to_json(), axis=1).tolist()
