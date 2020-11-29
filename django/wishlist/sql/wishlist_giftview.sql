drop view wishlist_giftview;
create view wishlist_giftview
as
select
wishlist_gift.*,
wanted_by_user.username as wanted_by_username,
given_by_user.username as given_by_username,
CONCAT('<a href="', wishlist_gift.link, '">', wishlist_gift.description, '</a>') as html
from wishlist_gift
inner join wishlist_group on wishlist_gift.group_id = wishlist_group.id
inner join auth_user wanted_by_user on wishlist_gift.wanted_by_id = wanted_by_user.id
left join auth_user given_by_user on wishlist_gift.given_by_id = given_by_user.id