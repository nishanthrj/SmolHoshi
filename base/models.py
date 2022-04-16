from djongo import models

# Create your models here.

class Media(models.Model):
    id = models.IntegerField(primary_key=True)
    title = models.CharField(max_length=200)
    slug = models.CharField(max_length=200)
    type = models.CharField(max_length=25)
    poster = models.CharField(max_length=200)
    
    class Meta:
        managed = False
    
class AnimeRecommendation(models.Model):
    id = models.IntegerField(primary_key=True)
    data = models.ArrayField(model_container=Media)
    objects = models.DjongoManager()
    
    class Meta:
        db_table = "anime_recommendation"
        
        
class MangaRecommendation(models.Model):
    id = models.IntegerField(primary_key=True)
    data = models.ArrayField(model_container=Media)
    objects = models.DjongoManager()
    
    class Meta:
        db_table = "manga_recommendation"
