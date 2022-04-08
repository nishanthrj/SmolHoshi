from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('search/', views.search, name='search'),
    path('anime/<animeType>/<animeId>/<slug>/', views.anime, name='anime'),
    path('manga/<mangaType>/<mangaId>/<slug>/', views.manga, name='manga')
]
