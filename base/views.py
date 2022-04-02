from django.shortcuts import render

# Create your views here.
def home(request):
    return render(request, 'home.html')

def search(request):
    return render(request, 'search.html')

def anime(request, animeId, slug):
    title = slug.replace('-', ' ').title()
    context = {
        'mediaId': animeId,
        'mediaType': 'anime',
        'title': title
    }
    return render(request, 'media.html', context=context)

def manga(request, mangaId, slug):
    title = slug.replace('-', ' ').title()
    context = {
        'mediaId': mangaId,
        'mediaType': 'manga',
        'title': title
    }
    return render(request, 'media.html', context=context)
