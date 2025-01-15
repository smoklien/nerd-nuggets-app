from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer, NoteSerializer, PublicationSerializer, UserPublicationSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from . import models
from pyalex import config, Works, Authors, Sources, Institutions, Topics, Publishers, Funders
from re import sub

OPEN_ALEX = "https://api.openalex.org/"

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


class PublicationView(APIView):
    # permission_classes = [AllowAny]

    def get(self, request):
        publication_id = request.query_params.get('pub_id', '')
        if not publication_id:
            return Response({"error": "No publication id provided"}, status=400)
        self.update_publication_user_view_model(request)
        return Response(Works()[publication_id])
    
    def update_publication_user_view_model(self, request):
        if not models.Publication.objects.filter(id=request.query_params.get('pub_id', '')).exists():
            publication_serializer = PublicationSerializer( data=
                                                           {"id": request.query_params.get('pub_id', ''),
                                                            "source": request.query_params.get('source', '')}
                                                          )
            if publication_serializer.is_valid():
                publication_serializer.save()
            else:
                pass

        if not models.UserPublication.objects.filter(
                                                     user=self.request.user.pk,
                                                     publication=request.query_params.get('pub_id', ''),
                                                     how=request.query_params.get('how', '')
                                                     ).exists():
            user_publication_serializer = UserPublicationSerializer(data=
                                                                   {"user": self.request.user.pk,
                                                                    "publication": request.query_params.get('pub_id', ''),
                                                                    "how": request.query_params.get('how', '')}
                                                                  )
            if user_publication_serializer.is_valid():
                user_publication_serializer.save()
            else:
                pass

class PublicationList(APIView):
    permission_classes = [AllowAny]
    result = []

    def __searh_and_prioritize__(self, request):
        config.email = "telegram.bot656@gmail.com"
        page = request.query_params.get('page', 1)
        search = request.query_params.get('search', '')
        user_id = self.request.user.pk
        filter = request.query_params.get('filter', {})

        w = Works()

        if filter:
            for key, value in filter:
                w = w.filter(**{key: value})
        work_list = [w]

        if search:
            work_list = []
            work_list.append(w.search(search).sort(relevance_score="desc"))
            search_list = sub(r'[^\w\s]', '', search).split()
            for word in search_list:
                work_list.append(w.search(word).sort(relevance_score="desc"))

        per_page = 60 / len(work_list)
        for work in work_list:
            self.result.extend(work.get(per_page=per_page, page=page))
            # self.result.update(work.get(per_page=num, page=page))

    def __prioritize__(self, request):
        pass

    def get(self, request):
        config.email = "telegram.bot656@gmail.com"
        page = request.query_params.get('page', 1)
        search = request.query_params.get('search', '')
        user_id = request.query_params.get('user_id', '')
        filter = request.query_params.get('filter', '')

        if page == 1:
            self.result = []
            self.__searh_and_prioritize__(request)

        res = self.result[:10]
        self.result = self.result[10:]

        if len(self.result) < 10:
            self.__searh_and_prioritize__(request)
        
        return res
    