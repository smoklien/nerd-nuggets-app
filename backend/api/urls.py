from django.urls import path
from . import views

urlpatterns = [
    # path('notes/', views.NoteListCreate.as_view(), name='note_list_create'),
    # path('notes/delete/<int:pk>', views.NoteDelete.as_view(), name='note_list_delete'),
    path('search/', views.PublicationList.as_view(), name='search_publications'),
    path('pub/', views.PublicationView.as_view(), name='publication'),
]