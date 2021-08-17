insert into public.building (city) values ('Dubai');
insert into public.building (city) values ('Montreal');

insert into public.property (building_id, title, property_type, amenities) VALUES (1, 'Unit 1', '1bdr', '{WiFi,Parking}');
insert into public.property (building_id, title, property_type, amenities) VALUES (1, 'Unit 2', '2bdr', '{WiFi,Tennis table}');
insert into public.property (building_id, title, property_type, amenities) VALUES (1, 'Unit 3', '3bdr', '{Garden}');
insert into public.property (building_id, title, property_type, amenities) VALUES (2, 'Unit 4', '1bdr', '{Garden,Pool}');

insert into public.reservation (check_in, check_out, property_id) VALUES ('2021-05-01', '2021-05-10', 1);
insert into public.reservation (check_in, check_out, property_id) VALUES ('2021-06-01', '2021-06-03', 1);
insert into public.reservation (check_in, check_out, property_id) VALUES ('2021-06-02', '2021-06-07', 2);

insert into public.availability (property_id, start_date, end_date, is_blocked) values (1, '2021-07-01', '2021-07-20', true);