from django.shortcuts import render
from django.contrib.auth.models import User
from .serializers import UserSerializer, NoteSerializer, PublicationSerializer
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, Publication

from rest_framework.views import APIView
from rest_framework.response import Response

class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(user=user).order_by('created_at')
        
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(user=self.request.user)
        else:
            print(serializer.errors)
        
    
class NoteListDeleteView(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self, request):
        user = self.request.user
        return Note.objects.filter(user=user)
    
    def perform_destroy(self, instance):
        instance.delete()
        

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
    
class SearchPublicationView(APIView):
    def get(self, request):
        query = request.GET.get('query', '')
        category = request.GET.get('category', '')
        year = request.GET.get('year', '')
        
        publications = Publication.objects.all()
        
        if query:
            publications = publications.filter(title__icontains=query)
            
        if category:
            publications = publication.filter(category_iexact=category)
            
        if year:
            publications = publications.filter(year=year)
            
        serializer = PublicationSerializer(publications, many=True)
        
        return Response({'publications': serializer.data}, status=status.HTTP_200_OK)
                                                      