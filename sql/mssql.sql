create database cti_project_1;

create table test   (test_id int not null identity(1,1),
				    test_name varchar(50) not null,
                    test_desc varchar(500) not null,
                    primary key(test_id));

insert into test(test_name, test_desc) VALUES ('name1', 'desc1'), ('name2', 'desc2');