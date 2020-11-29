create view wishlist_groupview
as
select 
wishlist_group.id as group_id, 
wishlist_group.name,
auth_user.id as user_id,
'invited' as status
from wishlist_group
inner join wishlist_invitation on wishlist_group.id = wishlist_invitation.group_id
inner join auth_user on auth_user.email = wishlist_invitation.email
union
select
wishlist_group.id as group_id,
wishlist_group.name,
auth_user.id as user_id,
'member' as status
from wishlist_group
inner join wishlist_member on wishlist_group.id = wishlist_member.group_id
inner join auth_user on auth_user.id = wishlist_member.user_id

