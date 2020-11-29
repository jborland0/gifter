from django.conf import settings
from django.db import models

class Group(models.Model):
	name = models.CharField(max_length=63)

class Invitation(models.Model):
	group = models.ForeignKey(Group, on_delete = models.CASCADE)
	email = models.CharField(max_length=255)
	invited_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete = models.CASCADE)

class Member(models.Model):
	group = models.ForeignKey(Group, on_delete = models.CASCADE)
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete = models.CASCADE)
