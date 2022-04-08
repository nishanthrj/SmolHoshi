import json
from django.shortcuts import render
from . import recommend

# Create your views here.
def home(request):
    return render(request, 'home.html')

def search(request):
    return render(request, 'search.html')

def anime(request, animeType, animeId, slug):
    title = slug.replace('-', ' ').title()
    recommended_anime = json.dumps(recommend.recommend(int(animeId), animeType))
    context = {
        'mediaId': animeId,
        'mediaType': 'anime',
        'title': title,
        'recommended': recommended_anime
    }
    return render(request, 'media.html', context=context)

def manga(request, mangaType, mangaId, slug):
    title = slug.replace('-', ' ').title()
    context = {
        'mediaId': mangaId,
        'mediaType': 'manga',
        'title': title
    }
    return render(request, 'media.html', context=context)
