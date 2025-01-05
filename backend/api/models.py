from django.db import models
from django.contrib.auth.models import User


class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title

class Author(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    #url = models.URLField()
    #name = models.CharField(max_length=255)
    source = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Publication(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    #url = models.URLField()
    #title = models.CharField(max_length=255)
    source = models.CharField(max_length=255)

    def __str__(self):
        return self.title
    
class UserPublication(models.Model): 
    user = models.ForeignKey(User, on_delete=models.CASCADE) 
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE) 
    how = models.CharField(max_length=15)
    added_on = models.DateTimeField(auto_now_add=True) 

    class Meta: 
        unique_together = ('user', 'publication', 'how')

    def __str__(self): 
        return f'{self.user.username} - {self.publication.title}'
    
class UserAuthor(models.Model): 
    user = models.ForeignKey(User, on_delete=models.CASCADE) 
    author = models.ForeignKey(Author, on_delete=models.CASCADE) 
    added_on = models.DateTimeField(auto_now_add=True) 

    class Meta: 
        unique_together = ('user', 'author')

    def __str__(self): 
        return f'{self.user.username} - {self.author.name}'