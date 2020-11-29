from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout, get_user_model
from django.core.serializers.json import DjangoJSONEncoder
from django.db import connection
from django.db import transaction
from django.db.models import Max
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
import json
import math
from wishlist.models import Gift, Group, Invitation, Member

def acceptinvitation(request):
	data = json.loads(request.body)
	success = False
	message = ''
	groupId = data['groupId']
	if request.user.is_authenticated:
		# look up group
		groups = Group.objects.filter(id=groupId)
		# if a group was found
		if groups.count() > 0:
			# delete all invitations for this member/group
			Invitation.objects.filter(group=groups[0], email=request.user.email).delete()
			# add new member to group
			member = Member(group=groups[0], user=request.user)
			member.save()
			success = True
		else:
			message = 'group ' + groupId + ' not found'
	else:
		message='not authenticated'
	responseData = { 'success': success, 'message': message }
	return HttpResponse(json.dumps(responseData,cls=DjangoJSONEncoder), content_type='application/json')

def addgift(request):
	data = json.loads(request.body)
	success = False
	message = ''
	groupId = data['groupId']
	description = data['description']
	giftId = 0
	link = data['link']
	if request.user.is_authenticated:
		# look up group
		groups = Group.objects.filter(id=groupId)
		# if a group was found
		if groups.count() > 0:
			# look up max order for existing gifts
			maxOrder = 0
			existingGifts = Gift.objects.filter(wanted_by=request.user, group=groups[0])
			if (existingGifts.count() > 0):
				maxOrder = existingGifts.aggregate(Max('order'))['order__max']
			# create a gift
			gift = Gift(group=groups[0], description=description, link=link, wanted_by=request.user, order=maxOrder + 1)
			gift.save()
			giftId = gift.id
			success = True
		else:
			message = 'group ' + groupId + ' not found'
	else:
		message='not authenticated'
	responseData = { 'id': giftId, 'success': success, 'message': message }
	return HttpResponse(json.dumps(responseData,cls=DjangoJSONEncoder), content_type='application/json')

def addgroup(request):
	data = json.loads(request.body)
	success = False
	message = ''
	groupId = ''
	groupName = data['name']
	if request.user.is_authenticated:
		# TODO make sure groupName is valid
		group = Group(name=groupName)
		group.save()
		groupId = group.id
		# add creator to group
		member = Member(group=group, user=request.user)
		member.save()
		success = True
	else:
		message='not authenticated'
	responseData = { 'id': groupId, 'success': success, 'message': message }
	return HttpResponse(json.dumps(responseData,cls=DjangoJSONEncoder), content_type='application/json')

def addmember(request):
	data = json.loads(request.body)
	success = False
	message = ''
	groupId = data['groupId']
	memberEmail = data['email']
	if request.user.is_authenticated:
		# look up group
		groups = Group.objects.filter(id=groupId)
		# if a group was found
		if groups.count() > 0:
			# create an invitation
			invitation = Invitation(group=groups[0], email=memberEmail, invited_by=request.user)
			invitation.save()
			success = True
		else:
			message = 'group ' + groupId + ' not found'
	else:
		message='not authenticated'
	responseData = { 'success': success, 'message': message }
	return HttpResponse(json.dumps(responseData,cls=DjangoJSONEncoder), content_type='application/json')

def buygift(request):
	data = json.loads(request.body)
	success = False
	message = ''
	giftId = data['giftId']
	if request.user.is_authenticated:
		# look up gift
		gifts = Gift.objects.filter(id=giftId)
		# if gift was found
		if gifts.count() > 0:
			# update the gift
			gift = gifts[0]
			gift.given_by_id = request.user.id
			gift.save()
			success = True
		else:
			message = 'gift ' + giftId + ' not found'
	else:
		message='not authenticated'
	responseData = { 'id': giftId, 'success': success, 'message': message }
	return HttpResponse(json.dumps(responseData,cls=DjangoJSONEncoder), content_type='application/json')

def deletegift(request):
	data = json.loads(request.body)
	success = False
	message = ''
	giftId = data['giftId']
	if request.user.is_authenticated:
		# look up gift
		gifts = Gift.objects.filter(id=giftId)
		# if gift was found
		if gifts.count() > 0:
			# delete the gift
			gift = gifts[0]
			gift.delete()
			success = True
		else:
			message = 'gift ' + giftId + ' not found'
	else:
		message='not authenticated'
	responseData = { 'id': giftId, 'success': success, 'message': message }
	return HttpResponse(json.dumps(responseData,cls=DjangoJSONEncoder), content_type='application/json')

def getactivegroups(request):
	groups = []
	if request.user.is_authenticated:
		with connection.cursor() as cursor:
			cursor.execute("SELECT * FROM wishlist_activegroupview WHERE user_id = %s ORDER BY name", [request.user.id])
			rows = cursor.fetchall()
			# turn rows into dictionaries so they can be converted to json
			keys = ('group_id','name')
			for row in rows:
				groups.append(dict(zip(keys,row)))
	responseData = { 'groups': groups }
	return HttpResponse(json.dumps(responseData,cls=DjangoJSONEncoder), content_type='application/json')

def getactivemembers(request):
	groupId = int(request.GET.get('groupId'))
	members = []
	if request.user.is_authenticated:
		with connection.cursor() as cursor:
			cursor.execute("SELECT * FROM wishlist_activegroupview WHERE group_id = %s ORDER BY username", [groupId])
			rows = cursor.fetchall()
			# turn rows into dictionaries so they can be converted to json
			keys = ('group_id','name','user_id','username')
			for row in rows:
				members.append(dict(zip(keys,row)))
	responseData = { 'members': members }
	return HttpResponse(json.dumps(responseData,cls=DjangoJSONEncoder), content_type='application/json')

def getgifts(request):
	groupId = int(request.GET.get('groupId'))
	wantedById = int(request.GET.get('memberId'))
	pageNumber = int(request.GET.get('pageNumber', '1'))
	pageSize = int(request.GET.get('pageSize', '10'))
	pageCount = 0
	gifts = []
	if request.user.is_authenticated:
		with connection.cursor() as cursor:
			cursor.execute('SELECT * FROM wishlist_giftview WHERE group_id = %s and wanted_by_id = %s ORDER BY "order"', [groupId, wantedById])
			rows = cursor.fetchall()
			# calculate total number of pages
			rowCount = len(rows)
			pageCount = math.ceil(rowCount/pageSize)
			# make sure requested page is in range
			# special case -1 indicates last page
			if pageNumber == -1 or pageNumber > pageCount:				
				pageNumber = pageCount
			elif pageNumber < 1:
				pageNumber = 1
			# calculate start and end indices
			startIndex = (pageNumber - 1) * pageSize
			endIndex = startIndex + pageSize
			if endIndex > rowCount:
				endIndex = rowCount
			# reduce rows to page we want
			rows = rows[startIndex:endIndex]
			# turn rows into dictionaries so they can be converted to json
			keys = ('id','description','link','order','given_by_id','wanted_by_id','group_id','wanted_by_username','given_by_username', 'html')
			for row in rows:
				gifts.append(dict(zip(keys,row)))
	responseData = { 'pageNumber': pageNumber, 'pageSize': pageSize, 'pageCount': pageCount, 'gifts': gifts }
	return HttpResponse(json.dumps(responseData,cls=DjangoJSONEncoder), content_type='application/json')

def getgift(request):
	giftId = int(request.GET.get('giftId'))
	groupId = 0
	description = ''
	link = ''
	if request.user.is_authenticated:
		# look up gift by id
		gifts = Gift.objects.filter(id=giftId)
		# if a gift was found
		if gifts.count() > 0:
			groupId = gifts[0].group_id
			description = gifts[0].description
			link = gifts[0].link
	responseData = { 'giftId': giftId, 'groupId': groupId, 'description': description, 'link': link }
	return HttpResponse(json.dumps(responseData,cls=DjangoJSONEncoder), content_type='application/json')

def getgroup(request):
	groupId = int(request.GET.get('groupId'))
	groupName = ''
	pageNumber = int(request.GET.get('pageNumber', '1'))
	pageSize = int(request.GET.get('pageSize', '10'))
	pageCount = 0
	members = []
	if request.user.is_authenticated:
		# look up group by id
		groups = Group.objects.filter(id=groupId)
		# if a group was found
		if groups.count() > 0:
			# note the group name
			groupName = groups[0].name
			# look up members
			with connection.cursor() as cursor:
				cursor.execute("SELECT * FROM wishlist_memberview WHERE group_id = %s ORDER BY status, email", [groupId])
				rows = cursor.fetchall()
				# calculate total number of pages
				rowCount = len(rows)
				pageCount = math.ceil(rowCount/pageSize)
				# make sure requested page is in range
				# special case -1 indicates last page
				if pageNumber == -1 or pageNumber > pageCount:				
					pageNumber = pageCount
				elif pageNumber < 1:
					pageNumber = 1
				# calculate start and end indices
				startIndex = (pageNumber - 1) * pageSize
				endIndex = startIndex + pageSize
				if endIndex > rowCount:
					endIndex = rowCount
				# reduce rows to page we want
				rows = rows[startIndex:endIndex]
				# turn rows into dictionaries so they can be converted to json
				keys = ('id','group_id','user_id','email','status')
				for row in rows:
					members.append(dict(zip(keys,row)))
	responseData = { 'groupId': groupId, 'groupName': groupName, 'pageNumber': pageNumber, 'pageSize': pageSize, 'pageCount': pageCount, 'members': members }
	return HttpResponse(json.dumps(responseData,cls=DjangoJSONEncoder), content_type='application/json')

def getgroups(request):
	pageNumber = int(request.GET.get('pageNumber', '1'))
	pageSize = int(request.GET.get('pageSize', '10'))
	pageCount = 0
	groups = []
	if request.user.is_authenticated:
		with connection.cursor() as cursor:
			cursor.execute("SELECT * FROM wishlist_groupview WHERE user_id = %s ORDER BY status, name", [request.user.id])
			rows = cursor.fetchall()
			# calculate total number of pages
			rowCount = len(rows)
			pageCount = math.ceil(rowCount/pageSize)
			# make sure requested page is in range
			# special case -1 indicates last page
			if pageNumber == -1 or pageNumber > pageCount:				
				pageNumber = pageCount
			elif pageNumber < 1:
				pageNumber = 1
			# calculate start and end indices
			startIndex = (pageNumber - 1) * pageSize
			endIndex = startIndex + pageSize
			if endIndex > rowCount:
				endIndex = rowCount
			# reduce rows to page we want
			rows = rows[startIndex:endIndex]
			# turn rows into dictionaries so they can be converted to json
			keys = ('group_id','name','user_id','status')
			for row in rows:
				groups.append(dict(zip(keys,row)))
	responseData = { 'pageNumber': pageNumber, 'pageSize': pageSize, 'pageCount': pageCount, 'groups': groups }
	return HttpResponse(json.dumps(responseData,cls=DjangoJSONEncoder), content_type='application/json')

@ensure_csrf_cookie
def getuser(request):
	if request.user.is_authenticated:
		return JsonResponse({ 'id': request.user.id, 'username': request.user.username })
	else:
		return JsonResponse({ 'id': -1, 'username': '' })

def index(request):
	return render(request, 'wishlist/index.html')

def login(request):
	data = json.loads(request.body)
	user = authenticate(request, username=data['username'], password=data['password'])
	if user is None:
		return JsonResponse({ 'id': -1, 'username': '' })
	else:
		auth_login(request, user)
		return JsonResponse({ 'id': user.id, 'username': user.username })

def logout(request):
	data = json.loads(request.body)
	if request.user.is_authenticated:
		if request.user.id == data['id']:
			auth_logout(request)
			return JsonResponse({ 'success': True })
		else:
			return JsonResponse({ 'success': False, 'message': 'incorrect user id' })
	else:
		return JsonResponse({ 'success': False, 'message': 'user is not logged in' })

def register(request):
	# create dictionary for messages
	messages = {}
	# load request data
	data = json.loads(request.body)
	print(str(data))
	# trim all strings
	for key in data.keys():
		data[key] = data[key].strip()
	# make sure all fields are present
	if data['username'] == '':
		messages['username'] = 'Username is required'
	if data['password'] == '':
		messages['password'] = 'Password is required'
	if data['password'] != data['passwordMatch']:
		messages['passwordMatch'] = 'Passwords must match'
	if data['email'] == '':
		messages['email'] = 'Email is required'
	# if no errors yet
	if len(messages) == 0:
		# use db transaction so name/email won't get taken
		with transaction.atomic():
			# check existing username
			existingUserCount = get_user_model().objects.filter(username = data['username']).count()
			if (existingUserCount > 0):
				messages['username'] = 'Username is not available'
			if len(messages) == 0:
				user = get_user_model().objects.create_user(data['username'], data['email'], data['password'])
				return JsonResponse({ 'success': True, 'user' : { 'id': user.id, 'username': user.username } })
	# create user failed, return error messages
	return JsonResponse({ 'success': False, 'messages': messages })

def ungift(request):
	data = json.loads(request.body)
	success = False
	message = ''
	giftId = data['giftId']
	if request.user.is_authenticated:
		# look up gift
		gifts = Gift.objects.filter(id=giftId)
		# if gift was found
		if gifts.count() > 0:
			# update the gift
			gift = gifts[0]
			gift.given_by_id = None
			gift.save()
			success = True
		else:
			message = 'gift ' + giftId + ' not found'
	else:
		message='not authenticated'
	responseData = { 'id': giftId, 'success': success, 'message': message }
	return HttpResponse(json.dumps(responseData,cls=DjangoJSONEncoder), content_type='application/json')

def updategift(request):
	data = json.loads(request.body)
	success = False
	message = ''
	giftId = data['giftId']
	groupId = data['groupId']
	description = data['description']
	link = data['link']
	if request.user.is_authenticated:
		# look up gift
		gifts = Gift.objects.filter(id=giftId)
		# if gift was found
		if gifts.count() > 0:
			# update the gift
			gift = gifts[0]
			gift.group_id = groupId
			gift.description = description
			gift.link = link
			gift.save()
			success = True
		else:
			message = 'gift ' + giftId + ' not found'
	else:
		message='not authenticated'
	responseData = { 'id': giftId, 'success': success, 'message': message }
	return HttpResponse(json.dumps(responseData,cls=DjangoJSONEncoder), content_type='application/json')
