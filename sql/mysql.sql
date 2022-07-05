drop database if exists store_cti;
create database store_cti;
use store_cti;

create table users  (user_id int auto_increment not null,
                    user_first_name varchar(50) not null,
                    user_last_name varchar(50) not null,
                    user_email varchar(50) not null,
                    user_password varchar(60) not null, /*VARCHAR shloud be set on 60(no more no less) characters because of bcrypt libary!*/
                    user_superuser boolean not null, 
                    user_verified boolean not null,
                    user_created_at timestamp default current_timestamp not null,
                    primary key (user_id));

create table address    (address_id int auto_increment not null,
                        address_street_name varchar(60) not null,
                        address_street_number varchar(40) not null,
                        adress_city varchar(50) not null,
                        adress_postal_code varchar(30) not null,
                        adress_user_first_name varchar(50) not null,
                        address_user_last_name varchar(50) not null,
                        address_user_email varchar(50) not null,
                        address_user_phone_number int(9) not null,
                        primary key(address_id));