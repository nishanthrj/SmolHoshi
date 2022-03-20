from django.shortcuts import render

# Create your views here.
def home(request):
    return render(request, 'home.html')

def search(request):
    return render(request, 'search.html')

def anime(request, mediaId, slug):
    title = slug.replace('-', ' ').title()
    context = {
        'animeId': mediaId,
        'title': title
    }
    return render(request, 'anime.html', context=context)
