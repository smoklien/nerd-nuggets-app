from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer, PublicationSerializer, UserPublicationSerializer, AuthorSerializer, UserAuthorSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from . import models
# from threading import Thread
from pyalex import config, Works, Authors, Sources, Institutions, Topics, Publishers, Funders, Concepts

OPEN_ALEX = "https://api.openalex.org/"
config.email = "telegram.bot656@gmail.com"

def search_first_id(obj, query):
    return obj.search(query).get(per_page=1, page=1)[0]["id"]

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class PublicationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        publication_id = request.query_params.get('pub_id', '')
        source = request.query_params.get('source', '')
        if not publication_id:
            return Response({"error": "No publication id provided"}, status=400)
        if not source:
            return Response({"error": "No source provided"}, status=400)
        self.__update_publication_user_view_model__(request)
        if source == "openalex":
            w = Works()[publication_id]
            fields = ["title", "id", "doi","publication_year", "authorships", "abstract_inverted_index"]
            w = {key: w[key] for key in fields if key in w}
            if w["abstract_inverted_index"]:
                sorted_words = sorted(w["abstract_inverted_index"].items(), key=lambda x: min(x[1]))
                w["abstract"] = " ".join(word.rstrip('"') for word, positions in sorted_words)
            else:
                w["abstract"] = ""
            del w["abstract_inverted_index"]
            w["author"] = {author["author"]["id"]: author["author"]["display_name"] for author in w["authorships"]}
            del w["authorships"]
            return Response(w)
        # return Response(Works()[publication_id])
    
    def post(self, request):
        how = request.data.get('how', '')
        if how in ("sub", "subscribe"):
            return self.__subscribe_on_author__(request)
        elif how in ("unsub", "unsubscribe"):
            return self.__unsubscribe_on_author__(request)
        else:
            return self.__update_publication_user_view_model__(request)  
    
    def __update_publication_user_view_model__(self, request, pub_id=None):
        if not pub_id:
            pub_id = request.query_params.get('pub_id', '')
        source = request.query_params.get('source', 'openalex')
        how = request.data.get('how', 'view')

        if not pub_id:
            raise ValidationError("Publication ID is required.")
        
        # Check if the publication exists
        self.__save_publication__(pub_id, source)

        # Check if the UserPublication exists
        if not models.UserPublication.objects.filter(user=self.request.user.pk, 
                                                     publication=pub_id, 
                                                     how=how).exists():
            user_publication_serializer = UserPublicationSerializer(data=
                                                                    {"user": self.request.user.pk, 
                                                                     "publication": pub_id, 
                                                                     "how": how})
            if user_publication_serializer.is_valid():
                user_publication_serializer.save()
            else:
                return Response(user_publication_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Publication and UserPublication saved successfully."}, status=status.HTTP_201_CREATED)

    def __save_publication__(self, pub_id, source):
        if not models.Publication.objects.filter(id=pub_id).exists():
            publication_serializer = PublicationSerializer(data={"id": pub_id, "source": source})
            if publication_serializer.is_valid():
                publication_serializer.save()
            else:
                return Response(publication_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # work = Works()[pub_id]
        # related_and_referenced = work.get("related", []) + work.get("references", [])

        # if related_and_referenced:
        #     for pub in related_and_referenced:
        #         id=pub["id"].split("/")[-1]
        #         if not models.Publication.objects.filter(id=id).exists():
        #             publication_serializer = PublicationSerializer(data={"id": id, "source": source})
        #             if publication_serializer.is_valid():
        #                 publication_serializer.save()
        #             else:
        #                 return Response(publication_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def __subscribe_on_author__(self, request):
        author_id = request.data.get('author_id', '')
        source = request.query_params.get('source', '')

        if not author_id:
            raise ValidationError("Author ID is required.")

        # Check if the author exists
        if not models.Author.objects.filter(id=author_id).exists():
            author_serializer = AuthorSerializer(data={"id": author_id, "source": source})
            if author_serializer.is_valid():
                author_serializer.save()
            else:
                return Response(author_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Check if the UserAuthor exists
        if not models.UserAuthor.objects.filter(user=self.request.user.pk, author=author_id).exists():
            user_author_serializer = UserAuthorSerializer(data={"user": self.request.user.pk, "author": author_id})
            if user_author_serializer.is_valid():
                user_author_serializer.save()
            else:
                return Response(user_author_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Author and UserAuthor saved successfully."}, status=status.HTTP_201_CREATED)

    def __unsubscribe_on_author__(self, request):
        author_id = request.data.get('author_id', '')

        if not author_id:
            raise ValidationError("Author ID is required.")

        # Check if the UserAuthor exists
        if models.UserAuthor.objects.filter(user=self.request.user.pk, author=author_id).exists():
            models.UserAuthor.objects.filter(user=self.request.user.pk, author=author_id).delete()
            return Response({"message": "UserAuthor deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({"message": "UserAuthor does not exist."}, status=status.HTTP_404_NOT_FOUND)

class PublicationListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        page = int(request.query_params.get('page', 1))
        query = request.query_params.get('query', '')
        filter = request.query_params.get('filter', '')

        # if request.session.get("thread", ""):
        #     if request.session["thread"].is_alive():
        #         request.session["thread"].join()

        # if page == 1:
        #     request.session["result"] = []
        #     request.session["page"] = 1
        #     self.__search_and_filter__(request)

        # res = request.session["result"][:10]
        # request.session["result"] = request.session["result"][10:]

        # if len(request.session["result"]) < 10:
        #     # request.session["thread"] = Thread(target=self.__search_and_filter__, args=(request,))
        #     # request.session["thread"].start()

        #     # thread = Thread(target=self.__search_and_filter__, args=(request,))
        #     # thread.start()

        #     self.__search_and_filter__(request)

        res = self.__search_and_filter__(request)

        return Response(res)

    def __search_and_filter__(self, request):
        page = request.query_params.get('page', 1)
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
        w.select(["title", "id", "doi","publication_year", "type"] )
        res = w.get(per_page=per_page, page=page)
        # for entry in res:
        #     if entry["abstract_inverted_index"]:
        #         sorted_words = sorted(entry["abstract_inverted_index"].items(), key=lambda x: min(x[1]))
        #         entry["abstract"] = " ".join(word.rstrip('"') for word, positions in sorted_words)
        #     else:
        #         entry["abstract"] = ""
        #     del entry["abstract_inverted_index"]

        #     entry["authors"] = {author["author"]["id"]: author["author"]["display_name"] for author in entry["authorships"]}
        #     del entry["authorships"]
        # request.session["result"].extend(res)

        # request.session["page"] += 1

        return res

class PersonalizationView(PublicationView):
    # permission_classes = [AllowAny]


    def get(self, request):
        # request.session["works"] = []

        #works = request.session.get("works", [])

        if not works:
            request.session["works"] = []
        if len(works) < 15:
            self.__get_works__(request)
            # self.__prioritize__(request)

        works = request.session.get("works", [])
        work = works.pop(0)
        request.session["works"] = works

        fields = ["title", "id", "doi","publication_year", "authorships", "abstract_inverted_index"]
        work = {key: work[key] for key in fields if key in work}
        if work["abstract_inverted_index"]:
            sorted_words = sorted(work["abstract_inverted_index"].items(), key=lambda x: min(x[1]))
            work["abstract"] = " ".join(word.rstrip('"') for word, positions in sorted_words)
        else:
            work["abstract"] = ""
        del work["abstract_inverted_index"]
        work["author"] = {author["author"]["id"]: author["author"]["display_name"] for author in w["authorships"]}
        del work["authorships"]

        self.__update_publication_user_view_model__(request, pub_id=work["id"].split("/")[-1])

        # request.session["works"] = [{"id":"W1775749144"}]
        
        return Response({"work":work, "len":len(works)})
        
    def __get_works__(self, request):
        works = request.session.get("works", [])
        works.extend(Works().filter(language="en|ua|uk|ukr").sample(20).get())
        request.session["works"] = works

    def __prioritize__(self, request):
        works = request.session["works"]
        temp = []
        related = self.__get_related_to_user__()
        for index, work in enumerate(works):
            score = float(work.get("score", 200))/2
            if score < 50:
                continue

            score = self.__update_score__(work, score, related)
            
            if score < 50:
                continue

            work["score"] = score
            temp.append(work)

        temp = sorted(temp, key=lambda x: x["score"], reverse=True)
        request.session["works"] = temp


    def __is_in_db__(self, work):
        return models.Publication.objects.filter(id=work["id"].split("/")[-1]).exists()

    def __update_score__(self, work, score, related):
        # if not self.__is_in_db__(work):
        #     return score
        
        work_id = work["id"].split("/")[-1]
        user_id = self.request.user.pk

        if work_id in related["viewed"]:
            return 0

        if work_id in related["liked_re"]:
            score *= 2
        if work_id in related["disliked_re"]:
            score *= 0.5
        if work_id in related["saved_re"]:
            score *= 2.2
        if work_id in related["viewed_re"]:
            score *= 1.1
        if work_id in related["author_re"]:
            score *= 3
        
        return score

    def __get_related_to_user__(self):
        user_id = self.request.user.pk

        liked = models.UserPublication.objects.filter(user=user_id, how="like").values_list("publication", flat=True)
        disliked = models.UserPublication.objects.filter(user=user_id, how="dislike").values_list("publication", flat=True)
        saved = models.UserPublication.objects.filter(user=user_id, how="save").values_list("publication", flat=True)
        viewed = models.UserPublication.objects.filter(user=user_id, how="view").values_list("publication", flat=True)
        print(viewed)

        liked_re, disliked_re, saved_re, viewed_re, author_re = {}, {}, {}, {}, {}

        for id in liked:
            w = Works()[id]
            liked_re.update({i.split("/")[-1] for i in w.get("related_works", []) + w.get("referenced_works", [])})
        print(1)
        
        for id in disliked:
            w = Works()[id]
            disliked_re.update({i.split("/")[-1] for i in w.get("related_works", []) + w.get("referenced_works", [])})
        print(2)
        for id in saved:
            w = Works()[id]
            saved_re.update({i.split("/")[-1] for i in w.get("related_works", []) + w.get("referenced_works", [])})
        print(3)
        for id in viewed:    
            w = Works()[id]
            viewed_re.update({i.split("/")[-1] for i in w.get("related_works", []) + w.get("referenced_works", [])})
            print(w.get("related_works", []) + w.get("referenced_works", []))
        print(4)

        # authors = models.UserAuthor.objects.filter(user=user_id).values_list("author", flat=True)
        # for a in authors:
        #     works_for_author = Works()
        #     works_for_author.filter(author={"id": a})
        #     works_for_author = works_for_author.get()
        #     author_re.update({w["id"].split("/")[-1] for w in works_for_author})

        return {"liked_re": liked_re,
                "disliked_re": disliked_re, 
                "saved_re": saved_re, 
                "viewed_re": viewed_re, 
                "viewed": viewed,
                "author_re": author_re}

class SavedView(PublicationListView):
    # permission_classes = [AllowAny]

    def get(self, request):
        user_id = self.request.user.pk
        saved = models.UserPublication.objects.filter(user=user_id, how="save").values_list("publication", flat=True)
        print(saved)
        works = []
        for id in saved:
            w = Works()[id]
            fields = ["title", "id", "doi","publication_year", "authorships", "abstract_inverted_index"]
            w = {key: w[key] for key in fields if key in w}
            if w["abstract_inverted_index"]:
                sorted_words = sorted(w["abstract_inverted_index"].items(), key=lambda x: min(x[1]))
                w["abstract"] = " ".join(word.rstrip('"') for word, positions in sorted_words)
            else:
                w["abstract"] = ""
            del w["abstract_inverted_index"]
            w["author"] = {author["author"]["id"]: author["author"]["display_name"] for author in w["authorships"]}
            del w["authorships"]
            works.append(w)
        return Response(works)






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