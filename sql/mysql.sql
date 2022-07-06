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

create table product_category   (product_category_id int auto_increment not null,
                                product_category_name varchar(50) not null,
                                product_category_description text not null,
                                primary key(product_category_id));

create table products   (product_id int auto_increment not null,
                        product_name varchar(50) not null,
                        product_description text not null,
                        product_price decimal(11,2) unsigned not null,
                        product_amount int unsigned not null,
                        product_artist varchar(100) not null,
                        product_release_date date not null,
                        product_image_path varchar(150) not null,
                        product_route varchar(150) unique not null,
                        product_category_id int not null,
                        primary key(product_id),
                        foreign key(product_category_id) references product_category(product_category_id));

#inserts

insert into product_category(product_category_name, product_category_description) 
values  ('painting', 'Painting is the practice of applying paint, pigment, color or other medium to a solid surface (called the "matrix" or "support"). The medium is commonly applied to the base with a brush, but other implements, such as knives, sponges, and airbrushes, can be used.'), 
        ('sculpture', 'Sculpture is the branch of the visual arts that operates in three dimensions. Sculpture is the three-dimensional art work which is physically presented in the dimensions of height, width and depth. It is one of the plastic arts. Durable sculptural processes originally used carving (the removal of material) and modelling (the addition of material, as clay), in stone, metal, ceramics, wood and other materials but, since Modernism, there has been an almost complete freedom of materials and process. A wide variety of materials may be worked by removal such as carving, assembled by welding or modelling, or moulded or cast.'), 
        ('literature', 'Literature broadly is any collection of written work, but it is also used more narrowly for writings specifically considered to be an art form, especially prose fiction, drama, and poetry. In recent centuries, the definition has expanded to include oral literature, much of which has been transcribed. Literature is a method of recording, preserving, and transmitting knowledge and entertainment, and can also have a social, psychological, spiritual, or political role.');

insert into products(product_name, product_description, product_price, product_amount, product_artist, product_release_date, product_image_path, product_route, product_category_id)
values  ('Mona Lisa', 'It should come as no surprise that the most famous painting in the world is that mysterious woman with the enigmatic smile. But that''s one of the few certainties about this work of art. The sitter in the painting is thought to be Lisa Gherardini, the wife of Florence merchant Francesco del Giocondo, but experts aren''t sure. It did represent an innovation in art -- the painting is the earliest known Italian portrait to focus so closely on the sitter in a half-length portrait, according to the Louvre, where it was first installed in 1804.Did you know? Before the 20th century, historians say the "Mona Lisa" was little known outside art circles. But in 1911, an ex-Louvre employee pilfered the portrait and hid it for two years. That theft helped cement the painting''s place in popular culture ever since and exposed millions to Renaissance art.', 15000000, 1, 'Leonardo da Vinci', '1519-05-17', '', 'mona-lisa', 1),
        ('The Last Supper', 'Leonardo, the original "Renaissance Man," is the only artist to appear on this list twice. Painted in an era when religious imagery was still a dominant artistic theme, "The Last Supper" depicts the last time Jesus broke bread with his disciples before his crucifixion. The painting is actually a huge fresco -- 4.6 meters (15 feet) high and 8.8 meters (28.9 feet) wide, which makes for a memorable viewing. Did you know? The fresco has survived two wartime threats -- Napoleon''s troops used the wall of the refectory on which the fresco was painted as target practice. It also was exposed to the air for several years when bombing during World War II destroyed the roof of the Dominican convent of Santa Maria delle Grazie in Milan.', 13000000, 1, 'Leonardo da Vinci', '1498-12-12', '', 'the-last-supper', 1),
        ('The Scream', 'This is the most recent painting on this list, and it depicts the German aerial bombing of the town of Guernica in the Basque region during the Spanish Civil War. The painting has that distinctive Picasso style, and its unflinching examination of the horrors of war made it an essential part of 20th century culture and history. Did you know? "Guernica" was moved to the Metropolitan Museum of Modern Art in New York during World War II for safekeeping. Picasso requested that the stay be extended until democracy returned to Spain. It finally went back to Madrid in 1981, six years after the death of longtime Spanish dictator Gen. Francisco Franco.', 14000000, 1, 'Pablo Picasso', '1937-03-13', '', 'the-scream', 1),
        ('Girl With a Pearl Earring', 'This intriguing favorite often gets compared with the "Mona Lisa." Besides the stylistic differences, technically "Girl With a Pearl Earring" isn''t even a portrait, but a "tronie" -- a Dutch word for a painting of an imaginary figure with exaggerated features. The oil on canvas masterpiece is brilliant in its simplicity. The girl -- wearing a blue and gold turban and an oversized pearl earring -- is the entire focus with only a dark backdrop behind her. Did you know? While the Mauritshuis underwent a renovation from 2012 to 2014, "Girl With a Pearl Earring" went on tour in the United States, Italy and Japan. It drew huge crowds, further bolstering its status as one of the world''s most famous works of art.', 16000000, 1, 'Johannes Vermeer', '1665-05-09', '', 'girl-with-a-pearl-earing', 1),
        ('David', 'One of the most iconic works in all of art history, Michelangelo''s David had its origins in a larger project to decorate the buttresses of Florence''s great cathedral, the Duomo, with a group of figures taken from the Old Testament. The David was one, and was actually begun in 1464 by Agostino di Duccio. Over the next two years, Agostino managed to rough out part of the huge block of marble hewn from the famous quarry in Carrara before stopping in 1466. (No one knows why.) Another artist picked up the slack, but he, too, only worked on it briefly. The marble remained untouched for the next 25 years, until Michelangelo resumed carving it in 1501. He was 26 at the time. When finished, the David weighed six tons, meaning it couldn''t be hoisted to the cathedral''s roof. Instead, it was put on display just outside to the entrance to the Palazzo Vecchio, Florence''s town hall. The figure, one of the purest distillations of the High Renaissance style, was immediately embraced by the Florentine public as a symbol of the city-state''s own resistance against the powers arrayed against it. In 1873, the David was moved to Accademia Gallery, and a replica was installed in its original location.', 25000000, 1, 'Michelangelo', '1504-03-11', '', 'david', 2),
        ('Bible', 'The Bible is a collection of religious texts or scriptures sacred in Christianity, Judaism, Samaritanism, and many other religions. The Bible is an anthology—a compilation of texts of a variety of forms—originally written in Hebrew, Aramaic, and Koine Greek. These texts include instructions, stories, poetry, and prophecies, among other genres. The collection of materials that are accepted as part of the Bible by a particular religious tradition or community is called a biblical canon. Believers in the Bible generally consider it to be a product of divine inspiration, while understanding what that means and interpreting the text in differing, various ways.', 1000000, 1, 'Jesus Christ', '1000-12-29', '', 'bible', 3);
