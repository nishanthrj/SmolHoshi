from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('anime/<mediaFormat>/<mediaId>/<slug>/', views.anime, name='anime'),
    path('manga/<mediaFormat>/<mediaId>/<slug>/', views.manga, name='manga')
]
