drop database if exists store_cti;
create database store_cti;
use store_cti;

create table users	(user_id int auto_increment not null,
                    user_first_name varchar(50) not null,
                    user_last_name varchar(50) not null,
                    user_email varchar(50) not null,
                    user_password varchar(60) not null, /*VARCHAR should be set on 60(no more no less) characters because of bcrypt library !*/
                    user_superuser boolean not null, 
                    user_verified boolean not null,
                    user_created_at timestamp default current_timestamp not null,
                    primary key (user_id));

create table address    (address_id int auto_increment not null,
                        address_street_name varchar(60) not null,
                        address_street_number varchar(40) not null,
                        address_city varchar(50) not null,
                        address_postal_code varchar(30) not null,
                        address_user_first_name varchar(50) not null,
                        address_user_last_name varchar(50) not null,
                        address_user_email varchar(50) not null,
                        address_user_phone_number int(9) not null,
                        user_id int not null,
                        shipping_option_id int not null,
                        primary key(address_id),
                        foreign key(user_id) references users(user_id));

create table product_category   (product_category_id int auto_increment not null,
                                product_category_name varchar(50) not null,
                                product_category_description text not null,
                                product_category_route varchar(150) unique not null,
                                product_category_image_path varchar(150) not null,
                                primary key(product_category_id));

create table products   (product_id int auto_increment not null,
                        product_name varchar(50) not null,
                        product_description text not null,
                        product_price decimal(11,2) unsigned not null,
                        product_amount int unsigned not null,
                        product_artist varchar(100) not null,
                        product_release_date date not null,
                        product_route varchar(150) unique not null,
                        product_image_path varchar(150) not null,
                        product_category_id int not null,
                        primary key(product_id),
                        foreign key(product_category_id) references product_category(product_category_id));

create table favourites (favourite_product_id int not null,
                        favourite_user_id int,
                        foreign key(favourite_product_id) references products(product_id),
                        foreign key(favourite_user_id) references users(user_id));

create table shipping_options (shipping_option_id int auto_increment not null,
                              shipping_option_name varchar(100) unique not null,
                              shipping_option_price decimal(5,2) unsigned not null,
                              primary key(shipping_option_id));

create table orders (order_id int auto_increment not null,
                    user_id int not null,
                    order_shipping_address_id int not null,
                    shipping_option_id int not null,
                    order_date date not null,
                    order_shipped_date date,
                    order_status varchar(60) not null,
                    primary key(order_id),
                    foreign key(shipping_option_id) references shipping_options(shipping_option_id));

create table order_details  (order_id int not null,
                            product_id int not null,
                            order_details_ordered_quantity int not null,
                            foreign key(product_id) references products(product_id),
                            foreign key(order_id) references orders(order_id));

create table payment_methods (payment_method_id int auto_increment not null,
                              payment_method_name varchar(100) unique not null,
                              primary key(payment_method_id));

create table payments (payment_id int auto_increment not null,
                      payment_method_id int not null,
                      payment_amount decimal(12,2) not null,
                      order_id int not null,
                      primary key(payment_id),
                      foreign key(payment_method_id) references payment_methods(payment_method_id),
                      foreign key(order_id) references orders(order_id));

#inserts

insert into product_category(product_category_name, product_category_description, product_category_route, product_category_image_path)
values  ('painting', 'Painting is the practice of applying paint, pigment, color or other medium to a solid surface (called the "matrix" or "support"). The medium is commonly applied to the base with a brush, but other implements, such as knives, sponges, and airbrushes, can be used.', 'painting', '/images/store/product-categories/painting.jpg'),
        ('graphics', 'Graphics are visual images or designs on some surface, such as a wall, canvas, screen, paper, or stone, to inform, illustrate, or entertain. In contemporary usage, it includes a pictorial representation of data, as in design and manufacture, in typesetting and the graphic arts, and in educational and recreational software. Images that are generated by a computer are called computer graphics.', 'graphics', '/images/store/product-categories/graphics.jpg'),
        ('photography', 'Photography is the art, application, and practice of creating durable images by recording light, either electronically by means of an image sensor, or chemically by means of a light-sensitive material such as photographic film. It is employed in many fields of science, manufacturing (e.g., photolithography), and business, as well as its more direct uses for art, film and video production, recreational purposes, hobby, and mass communication.', 'photography', '/images/store/product-categories/photography.jpg');

insert into products(product_name, product_description, product_price, product_amount, product_artist, product_release_date, product_image_path, product_route, product_category_id)
values  ('Mona Lisa', 'It should come as no surprise that the most famous painting in the world is that mysterious woman with the enigmatic smile. But that''s one of the few certainties about this work of art. The sitter in the painting is thought to be Lisa Gherardini, the wife of Florence merchant Francesco del Giocondo, but experts aren''t sure. It did represent an innovation in art -- the painting is the earliest known Italian portrait to focus so closely on the sitter in a half-length portrait, according to the Louvre, where it was first installed in 1804.Did you know? Before the 20th century, historians say the "Mona Lisa" was little known outside art circles. But in 1911, an ex-Louvre employee pilfered the portrait and hid it for two years. That theft helped cement the painting''s place in popular culture ever since and exposed millions to Renaissance art.', 15000, 1, 'Leonardo da Vinci', '1519-05-17', '/images/store/products/monalisa.jpg', 'mona-lisa', 1),
        ('The Scream', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus a ipsum ex. Nam mattis hendrerit erat a varius. Morbi tincidunt at massa sit amet placerat. Vestibulum consequat justo metus, eu laoreet elit hendrerit nec. Aenean ornare congue velit, in dignissim massa. Ut ligula lectus, porttitor in ante ac, placerat vulputate justo. Phasellus rutrum magna vitae aliquam ultrices. Phasellus blandit accumsan ipsum, ac malesuada libero venenatis eget. Donec porta sem in sapien molestie sodales. Phasellus quam nulla, pulvinar vitae elit a, elementum laoreet lacus. Aenean ac luctus lacus, non congue neque. Integer tristique venenatis purus eu semper. Donec ante augue, consectetur quis tincidunt in, blandit ut lorem. In pulvinar nisl in luctus convallis', 13000, 1, 'Leonardo da Vinci', '1498-12-12', '/images/store/products/thescream.jpg', 'the-scream', 1),
        ('Girl With a Pearl Earring', 'This intriguing favorite often gets compared with the "Mona Lisa." Besides the stylistic differences, technically "Girl With a Pearl Earring" isn''t even a portrait, but a "tronie" -- a Dutch word for a painting of an imaginary figure with exaggerated features. The oil on canvas masterpiece is brilliant in its simplicity. The girl -- wearing a blue and gold turban and an oversized pearl earring -- is the entire focus with only a dark backdrop behind her. Did you know? While the Mauritshuis underwent a renovation from 2012 to 2014, "Girl With a Pearl Earring" went on tour in the United States, Italy and Japan. It drew huge crowds, further bolstering its status as one of the world''s most famous works of art.', 16000, 1, 'Johannes Vermeer', '1665-05-09', '/images/store/products/grilwithapearlearing.jpg', 'girl-with-a-pearl-earing', 1),
        ('Neon Girl', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus a ipsum ex. Nam mattis hendrerit erat a varius. Morbi tincidunt at massa sit amet placerat. Vestibulum consequat justo metus, eu laoreet elit hendrerit nec. Aenean ornare congue velit, in dignissim massa. Ut ligula lectus, porttitor in ante ac, placerat vulputate justo. Phasellus rutrum magna vitae aliquam ultrices. Phasellus blandit accumsan ipsum, ac malesuada libero venenatis eget. Donec porta sem in sapien molestie sodales. Phasellus quam nulla, pulvinar vitae elit a, elementum laoreet lacus. Aenean ac luctus lacus, non congue neque. Integer tristique venenatis purus eu semper. Donec ante augue, consectetur quis tincidunt in, blandit ut lorem. In pulvinar nisl in luctus convallis', 3400, 1, 'Michelangelo', '2022-03-11', '/images/store/products/neongirl.jpg', 'neon-girl', 2),
        ('Purple Dye', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus a ipsum ex. Nam mattis hendrerit erat a varius. Morbi tincidunt at massa sit amet placerat. Vestibulum consequat justo metus, eu laoreet elit hendrerit nec. Aenean ornare congue velit, in dignissim massa. Ut ligula lectus, porttitor in ante ac, placerat vulputate justo. Phasellus rutrum magna vitae aliquam ultrices. Phasellus blandit accumsan ipsum, ac malesuada libero venenatis eget. Donec porta sem in sapien molestie sodales. Phasellus quam nulla, pulvinar vitae elit a, elementum laoreet lacus. Aenean ac luctus lacus, non congue neque. Integer tristique venenatis purus eu semper. Donec ante augue, consectetur quis tincidunt in, blandit ut lorem. In pulvinar nisl in luctus convallis', 1500, 1, 'Jan Matejko', '2021-12-29', '/images/store/products/purpledye.jpg', 'purple-dye', 2),
        ('Berlin Graffiti', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus a ipsum ex. Nam mattis hendrerit erat a varius. Morbi tincidunt at massa sit amet placerat. Vestibulum consequat justo metus, eu laoreet elit hendrerit nec. Aenean ornare congue velit, in dignissim massa. Ut ligula lectus, porttitor in ante ac, placerat vulputate justo. Phasellus rutrum magna vitae aliquam ultrices. Phasellus blandit accumsan ipsum, ac malesuada libero venenatis eget. Donec porta sem in sapien molestie sodales. Phasellus quam nulla, pulvinar vitae elit a, elementum laoreet lacus. Aenean ac luctus lacus, non congue neque. Integer tristique venenatis purus eu semper. Donec ante augue, consectetur quis tincidunt in, blandit ut lorem. In pulvinar nisl in luctus convallis', 2500, 1, 'Jesus Christ', '2022-01-20', '/images/store/products/berlingraffiti.jpg', 'berlin-graffiti', 2),
        ('Owl', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus a ipsum ex. Nam mattis hendrerit erat a varius. Morbi tincidunt at massa sit amet placerat. Vestibulum consequat justo metus, eu laoreet elit hendrerit nec. Aenean ornare congue velit, in dignissim massa. Ut ligula lectus, porttitor in ante ac, placerat vulputate justo. Phasellus rutrum magna vitae aliquam ultrices. Phasellus blandit accumsan ipsum, ac malesuada libero venenatis eget. Donec porta sem in sapien molestie sodales. Phasellus quam nulla, pulvinar vitae elit a, elementum laoreet lacus. Aenean ac luctus lacus, non congue neque. Integer tristique venenatis purus eu semper. Donec ante augue, consectetur quis tincidunt in, blandit ut lorem. In pulvinar nisl in luctus convallis', 4000, 1, 'Jan Hryb', '2022-05-09', '/images/store/products/owl.jpg', 'owl', 3),
        ('Glass', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus a ipsum ex. Nam mattis hendrerit erat a varius. Morbi tincidunt at massa sit amet placerat. Vestibulum consequat justo metus, eu laoreet elit hendrerit nec. Aenean ornare congue velit, in dignissim massa. Ut ligula lectus, porttitor in ante ac, placerat vulputate justo. Phasellus rutrum magna vitae aliquam ultrices. Phasellus blandit accumsan ipsum, ac malesuada libero venenatis eget. Donec porta sem in sapien molestie sodales. Phasellus quam nulla, pulvinar vitae elit a, elementum laoreet lacus. Aenean ac luctus lacus, non congue neque. Integer tristique venenatis purus eu semper. Donec ante augue, consectetur quis tincidunt in, blandit ut lorem. In pulvinar nisl in luctus convallis', 3000, 1, 'Jan Hryb', '2022-07-07', '/images/store/products/glass.jpg', 'glass', 3),
        ('Lights', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus a ipsum ex. Nam mattis hendrerit erat a varius. Morbi tincidunt at massa sit amet placerat. Vestibulum consequat justo metus, eu laoreet elit hendrerit nec. Aenean ornare congue velit, in dignissim massa. Ut ligula lectus, porttitor in ante ac, placerat vulputate justo. Phasellus rutrum magna vitae aliquam ultrices. Phasellus blandit accumsan ipsum, ac malesuada libero venenatis eget. Donec porta sem in sapien molestie sodales. Phasellus quam nulla, pulvinar vitae elit a, elementum laoreet lacus. Aenean ac luctus lacus, non congue neque. Integer tristique venenatis purus eu semper. Donec ante augue, consectetur quis tincidunt in, blandit ut lorem. In pulvinar nisl in luctus convallis', 2500, 1, 'Jan Hryb', '2022-04-30', '/images/store/products/lights.jpg', 'lights', 3);

insert into shipping_options(shipping_option_name, shipping_option_price)
values ('DHL', 15.00), ('InPost', 13.00), ('FedEx', 15.00), ('UPS', 16.00);

insert into payment_methods(payment_method_name)
values ('BLIK'), ('ING'), ('PKO'), ('MBANK');
