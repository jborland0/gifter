from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
	path('getuser/', views.getuser, name='getuser'),
	path('gifts/', views.ledger, name='gifts'),
	path('login/', views.login, name='login'),
	path('logout/', views.logout, name='logout'),
	path('register/', views.register, name='register')
]
