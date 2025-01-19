from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note, Author, Publication, UserPublication, UserAuthor

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwards = {'password': {'write_only': True}}
        
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'user', 'title', 'content', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
        
    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.content = validated_data.get('content', instance.content)
        instance.save()
        return instance
    
    def create(self, validated_data):
        user = validated_data['user']
        note = Note.objects.create(user=user, **validated_data)
        return note
    
class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'

class PublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publication
        fields = '__all__'

class UserPublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPublication
        fields = ['user', 'publication', 'how']

class UserAuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAuthor
        fields = ['user', 'author']