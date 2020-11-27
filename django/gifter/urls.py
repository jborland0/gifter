from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('wishlist/', include('wishlist.urls')),
    path('admin/', admin.site.urls),
]
