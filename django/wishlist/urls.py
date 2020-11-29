from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
	path('acceptinvitation/', views.acceptinvitation, name='acceptinvitation'),
	path('addgroup/', views.addgroup, name='addgroup'),
	path('addmember/', views.addmember, name='addmember'),
	path('getgroup/', views.getgroup, name='getgroup'),
	path('getuser/', views.getuser, name='getuser'),
	path('gifts/', views.gifts, name='gifts'),
	path('groups/', views.groups, name='groups'),
	path('login/', views.login, name='login'),
	path('logout/', views.logout, name='logout'),
	path('register/', views.register, name='register')
]
