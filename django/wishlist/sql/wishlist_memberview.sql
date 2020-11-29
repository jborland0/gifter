use gifter;
drop view wishlist_memberview;
create view wishlist_memberview
as
select 
wishlist_invitation.id,
wishlist_group.id as group_id, 
auth_user.id as user_id,
wishlist_invitation.email,
'invited' as status
from wishlist_group
inner join wishlist_invitation on wishlist_group.id = wishlist_invitation.group_id
left join auth_user on auth_user.email = wishlist_invitation.email
union
select
wishlist_member.id,
wishlist_group.id as group_id,
auth_user.id as user_id,
auth_user.email,
'member' as status
from wishlist_group
inner join wishlist_member on wishlist_group.id = wishlist_member.group_id
inner join auth_user on auth_user.id = wishlist_member.user_id
