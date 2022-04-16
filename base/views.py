import json
from django.shortcuts import render
from .models import AnimeRecommendation, MangaRecommendation

# Create your views here.


def home(request):
    return render(request, 'search.html')


def anime(request, mediaFormat, mediaId, slug):
    recommended_anime = json.dumps(AnimeRecommendation.objects.get(id=mediaId).data)
    context = {
        'mediaId': mediaId,
        'mediaType': 'anime',
        'recommended': recommended_anime
    }
    return render(request, 'media.html', context=context)


def manga(request, mediaFormat, mediaId, slug):
    recommended_manga = json.dumps(MangaRecommendation.objects.get(id=mediaId).data)


    context = {
        'mediaId': mediaId,
        'mediaType': 'manga',
        'recommended': recommended_manga
    }
    return render(request, 'media.html', context=context)
