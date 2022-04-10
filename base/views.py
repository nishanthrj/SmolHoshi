import json
from django.shortcuts import render
from . import recommend

# Create your views here.
def home(request):
    return render(request, 'search.html')


def anime(request, animeType, animeId, slug):
    recommended_anime = json.dumps(recommend.recommend(int(animeId), animeType))
    context = {
        'mediaId': animeId,
        'mediaType': 'anime',
        'recommended': recommended_anime
    }
    return render(request, 'media.html', context=context)

def manga(request, mangaType, mangaId, slug):
    context = {
        'mediaId': mangaId,
        'mediaType': 'manga',
    }
    return render(request, 'media.html', context=context)
