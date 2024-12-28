from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer, NoteSerializer, PublicationSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from . import models
from pyalex import config, Works, Authors, Sources, Institutions, Topics, Publishers, Funders
from re import sub


class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return models.Note.objects.filter(author=user)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return models.Note.objects.filter(author=user)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class PublicationList(APIView):
    permission_classes = [AllowAny]

    def searh_and_prioritize(self, request):
        config.email = "telegram.bot656@gmail.com"
        page = request.query_params.get('page', 1)
        search = request.query_params.get('search', '')
        user_id = request.query_params.get('user_id', '')

        if search:

            search_list = sub(r'[^\w\s]', '', search).split()
            for word in search_list:
                pass
                


    def get(self, request):
        config.email = "telegram.bot656@gmail.com"
        page = request.query_params.get('page', 1)
        search = request.query_params.get('search', '')
        user_id = request.query_params.get('user_id', '')
        filter = request.query_params.get('filter', '')
        
        return Response(Works().search("PROTEIN").get(per_page=200, page=page))