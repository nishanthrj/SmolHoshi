import json
from django.shortcuts import render
from . import recommend

# Create your views here.
def home(request):
    return render(request, 'search.html')


def anime(request, mediaFormat, mediaId, slug):
    recommended_anime = json.dumps(recommend.recommend(int(mediaId), mediaFormat, "anime"))
    context = {
        'mediaId': mediaId,
        'mediaType': 'anime',
        'recommended': recommended_anime
    }
    return render(request, 'media.html', context=context)

def manga(request, mediaFormat, mediaId, slug):
    recommended_manga = json.dumps(recommend.recommend(int(mediaId), mediaFormat, "manga"))
    
    context = {
        'mediaId': mediaId,
        'mediaType': 'manga',
        'recommended': recommended_manga
    }
    return render(request, 'media.html', context=context)
