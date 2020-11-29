drop view wishlist_activegroupview;
create view wishlist_activegroupview
as
select
wishlist_group.id as group_id,
wishlist_group.name,
auth_user.id as user_id,
auth_user.username as username
from wishlist_group
inner join wishlist_member on wishlist_group.id = wishlist_member.group_id
inner join auth_user on auth_user.id = wishlist_member.user_id

