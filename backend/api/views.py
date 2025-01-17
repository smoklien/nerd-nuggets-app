from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer, NoteSerializer, PublicationSerializer, UserPublicationSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from . import models
# from threading import Thread
from pyalex import config, Works, Authors, Sources, Institutions, Topics, Publishers, Funders, Concepts

OPEN_ALEX = "https://api.openalex.org/"

def search_first_id(obj, query):
    return obj.search(query).get(per_page=1, page=1)[0]["id"]

# class NoteListCreate(generics.ListCreateAPIView):
#     serializer_class = NoteSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         return models.Note.objects.filter(author=user)

#     def perform_create(self, serializer):
#         if serializer.is_valid():
#             serializer.save(author=self.request.user)
#         else:
#             print(serializer.errors)


# class NoteDelete(generics.DestroyAPIView):
#     serializer_class = NoteSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         return models.Note.objects.filter(author=user)

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class PublicationView(APIView):
    permission_classes = [AllowAny]

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
    # result = []
    # thread = None
    # page = 1

    def __searh_and_prioritize__(self, request):
        config.email = "telegram.bot656@gmail.com"
        # page = request.query_params.get('page', 1)
        query = request.query_params.get('query', '')
        # user_id = self.request.user.pk
        filter = request.query_params.get('filter', '')
        year = request.query_params.get('year', '')

        w = Works()

        if filter:
            filter = search_first_id(Concepts(), filter)
            w.filter(concepts={"id":filter})

        if year:
            w.filter(publication_year=year)

        if query:
            w.search(query).sort(relevance_score="desc")

        # per_page = 60 // len(work_list)
        per_page = 60
        # for work in work_list:
        #     request.session["result"].extend(work.get(per_page=per_page, page=page))
        clear_w = w
        w.select(["title", "id", "doi","publication_year", "authorships", "abstract_inverted_index"] )
        res = w.get(per_page=per_page, page=request.session["page"])
        for entry in res:
            if entry["abstract_inverted_index"]:
                sorted_words = sorted(entry["abstract_inverted_index"].items(), key=lambda x: min(x[1]))
                entry["abstract"] = " ".join(word.rstrip('"') for word, positions in sorted_words)
            else:
                entry["abstract"] = ""
            del entry["abstract_inverted_index"]

            entry["authors"] = {author["author"]["id"]: author["author"]["display_name"] for author in entry["authorships"]}
            del entry["authorships"]
        request.session["result"].extend(res)

        request.session["page"] += 1

    def __prioritize__(self, request):
        pass

    def get(self, request):
        config.email = "telegram.bot656@gmail.com"
        page = int(request.query_params.get('page', 1))
        query = request.query_params.get('query', '')
        user_id = request.query_params.get('user_id', '')
        filter = request.query_params.get('filter', '')

        # if request.session.get("thread", ""):
        #     if request.session["thread"].is_alive():
        #         request.session["thread"].join()

        if page == 1:
            request.session["result"] = []
            request.session["page"] = 1
            self.__searh_and_prioritize__(request)

        res = request.session["result"][:10]
        request.session["result"] = request.session["result"][10:]

        if len(request.session["result"]) < 10:
            # request.session["thread"] = Thread(target=self.__searh_and_prioritize__, args=(request,))
            # request.session["thread"].start()

            # thread = Thread(target=self.__searh_and_prioritize__, args=(request,))
            # thread.start()

            self.__searh_and_prioritize__(request)

        return Response(res)
    
    def post(self, request):
        pub_id = request.data.get('pub_id', '')
        source = request.data.get('source', '')
        how = request.data.get('how', '')

        if not pub_id:
            raise ValidationError("Publication ID is required.")
        
        # Check if the publication exists
        if not models.Publication.objects.filter(id=pub_id).exists():
            publication_serializer = PublicationSerializer(data={"id": pub_id, "source": source})
            if publication_serializer.is_valid():
                publication_serializer.save()
            else:
                return Response(publication_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Check if the UserPublication exists
        if not models.UserPublication.objects.filter(user=self.request.user.pk, publication=pub_id, how=how).exists():
            user_publication_serializer = UserPublicationSerializer(data={"user": self.request.user.pk, "publication": pub_id, "how": how})
            if user_publication_serializer.is_valid():
                user_publication_serializer.save()
            else:
                return Response(user_publication_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Publication and UserPublication saved successfully."}, status=status.HTTP_201_CREATED)
