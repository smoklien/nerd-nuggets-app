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
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Publication(models.Model):
    title = models.CharField(max_length=255)
    publication_date = models.DateField()
    authors = models.ManyToManyField(Author, related_name="publications")
    description = models.TextField()
    category = models.CharField(max_length=100)

    def __str__(self):
        return self.title