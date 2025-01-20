from django.urls import path
from . import views

urlpatterns = [
    # path('notes/', views.NoteListCreate.as_view(), name='note_list_create'),
    # path('notes/delete/<int:pk>', views.NoteDelete.as_view(), name='note_list_delete'),
    path('search/', views.PublicationListView.as_view(), name='search_publications'),
    path('pub/', views.PublicationView.as_view(), name='publication'),
    path('rec/', views.PersonalizationView.as_view(), name='recommendations'),
    path('saved/', views.SavedView.as_view(), name='saved'),
]