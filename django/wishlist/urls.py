from django.urls import path, re_path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
	path('acceptinvitation/', views.acceptinvitation, name='acceptinvitation'),
	path('addgift/', views.addgift, name='addgift'),
	path('addgroup/', views.addgroup, name='addgroup'),
	path('addmember/', views.addmember, name='addmember'),
	path('buygift/', views.buygift, name='buygift'),
	path('deletegift/', views.deletegift, name='deletegift'),
	path('getactivegroups/', views.getactivegroups, name='getactivegroups'),
	path('getactivemembers/', views.getactivemembers, name='getactivemembers'),
	path('getgift/', views.getgift, name='getgift'),
	path('getgifts/', views.getgifts, name='getgifts'),
	path('getgroup/', views.getgroup, name='getgroup'),
	path('getgroups/', views.getgroups, name='getgroups'),
	path('getuser/', views.getuser, name='getuser'),
	path('login/', views.login, name='login'),
	path('logout/', views.logout, name='logout'),
	path('register/', views.register, name='register'),
	path('ungift/', views.ungift, name='ungift'),
	path('updategift/', views.updategift, name='updategift'),
	re_path(r'^(?:.*)/?$', views.index)
]
