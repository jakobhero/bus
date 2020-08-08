delete
FROM stops
WHERE stop_id NOT IN
    (select (cast(stoppoint_id as varchar))
		   from stop_route_match)