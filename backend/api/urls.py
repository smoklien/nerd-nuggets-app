from django.urls import path
from . import views

urlpatterns = [
    path('notes/', views.NoteListCreateView.as_view(), name='note_list_create'),
    path('notes/delete/<int:pk>', views.NoteListDeleteView.as_view(), name='note_list_delete'),
    path('search/', views.SearchPublicationView.as_view(), name='search_publications'),
]